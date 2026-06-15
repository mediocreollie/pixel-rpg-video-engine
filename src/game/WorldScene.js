import Phaser from 'phaser';
import { DialogueBox } from './ui/DialogueBox.js';

const TILE_SIZE = 16;
const FALLBACK_COLOR = '#111827';
const CAMERA_ZOOM = 3;
const CAMERA_LERP = 0.12;
const FALLBACK_LOCATION = {
  id: 'fallback',
  mapName: 'Missing Location',
  background: '#111827',
  playerSpawnPoint: 'default',
  playerSpawns: {
    default: { x: 2, y: 2 }
  },
  npcSpawnPoints: {},
  map: {
    legend: {
      '.': { color: '#475569' },
      '#': { color: '#020617', blocked: true }
    },
    tiles: [
      '########',
      '#......#',
      '#......#',
      '#......#',
      '########'
    ]
  },
  exits: [],
  props: [
    {
      x: 3,
      y: 2,
      width: 38,
      height: 12,
      color: '#facc15',
      outline: '#713f12',
      label: 'MISSING'
    }
  ]
};

function toColor(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    value = FALLBACK_COLOR;
  }

  return Phaser.Display.Color.HexStringToColor(value).color;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  init(data) {
    this.sceneId = data.sceneId || 'pub';
    this.currentLocationId = data.locationId || null;
    this.spawnPoint = data.spawnPoint || null;
    this.scriptedActors = [];
  }

  create() {
    this.contentErrors = [];
    this.sceneData = this.getSceneData(this.sceneId);
    this.currentLocationId ||= this.sceneData.startingLocation;
    this.locationData = this.getLocationData(this.currentLocationId);
    this.characterData = this.getCharacterData();
    this.validateSceneLinks();

    this.cameras.main.setBackgroundColor(this.locationData.background || '#111827');
    this.buildLocation();
    this.createPlayer();
    this.createNpcs();
    this.createDialogue();
    this.createTitleCard();
    this.createInput();
    this.createCamera();
    this.createRecordingEvents();
    this.emitSceneMeta();

    if (this.currentLocationId === this.sceneData.destinationLocation) {
      this.showPunchlineReveal();
    }

    this.showContentWarnings();
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.scene.start('MenuScene');
      return;
    }

    this.movePlayer();
    this.updateScriptedActors();
    this.dialogueBox.update(time, delta);

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) || Phaser.Input.Keyboard.JustDown(this.keys.confirm)) {
      this.tryInteract();
    }
  }

  buildLocation() {
    const { map } = this.locationData;
    const width = map.tiles[0].length * TILE_SIZE;
    const height = map.tiles.length * TILE_SIZE;

    this.ground = this.add.graphics();
    this.blockers = this.physics.add.staticGroup();
    this.doors = this.physics.add.staticGroup();

    map.tiles.forEach((row, y) => {
      [...row].forEach((tile, x) => {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const def = map.legend[tile] || map.legend['.'];

        this.ground.fillStyle(toColor(def.color), 1);
        this.ground.fillRect(worldX, worldY, TILE_SIZE, TILE_SIZE);

        if (def.decoration === 'water') {
          this.ground.fillStyle(0x60a5fa, 0.45);
          this.ground.fillRect(worldX + 2, worldY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        if (def.blocked) {
          const blocker = this.add.rectangle(worldX + 8, worldY + 8, TILE_SIZE, TILE_SIZE, 0x000000, 0);
          this.physics.add.existing(blocker, true);
          this.blockers.add(blocker);
        }
      });
    });

    asArray(this.locationData.props).forEach((prop) => this.createProp(prop));
    asArray(this.locationData.exits)
      .filter((exit) => this.isExitEnabled(exit))
      .forEach((exit) => this.createExit(exit));

    this.physics.world.setBounds(0, 0, width, height);
  }

  isExitEnabled(exit) {
    if (this.currentLocationId === this.sceneData.destinationLocation) {
      return false;
    }

    return !this.sceneData.destinationLocation || exit.targetLocation === this.sceneData.destinationLocation;
  }

  createExit(exit) {
    if (typeof exit?.x !== 'number' || typeof exit?.y !== 'number' || !exit.targetLocation) {
      this.warnContent('Skipped an exit because it is missing x, y, or targetLocation.');
      return;
    }

    const door = this.add.rectangle(
      exit.x * TILE_SIZE + 8,
      exit.y * TILE_SIZE + 8,
      exit.width || TILE_SIZE,
      exit.height || TILE_SIZE,
      toColor(exit.color || '#facc15'),
      exit.alpha ?? 0.35
    );
    door.targetLocation = exit.targetLocation;
    door.spawnPoint = exit.spawnPoint || 'default';
    this.physics.add.existing(door, true);
    this.doors.add(door);
  }

  createProp(prop) {
    if (typeof prop?.x !== 'number' || typeof prop?.y !== 'number') {
      this.warnContent('Skipped a prop because it is missing x/y coordinates.');
      return;
    }

    const x = prop.x * TILE_SIZE + TILE_SIZE / 2;
    const y = prop.y * TILE_SIZE + TILE_SIZE / 2;

    if (prop.kind === 'beer') {
      this.createBeerProp(x, y, prop);
      return;
    }

    if (prop.kind === 'table') {
      this.createTableProp(x, y, prop);
      return;
    }

    if (prop.kind === 'bar') {
      this.createBarProp(x, y, prop);
      return;
    }

    if (prop.kind === 'door') {
      this.createDoorProp(x, y, prop);
      return;
    }

    const sprite = this.add.rectangle(x, y, prop.width || 12, prop.height || 12, toColor(prop.color || '#ffffff'));
    sprite.setStrokeStyle(1, toColor(prop.outline || '#111827'));

    if (prop.label) {
      this.add.text(x, y + 10, prop.label, {
        fontFamily: 'monospace',
        fontSize: '5px',
        color: prop.labelColor || '#111827'
      }).setOrigin(0.5, 0);
    }
  }

  createBeerProp(x, y, prop) {
    const mug = this.add.container(x, y);
    const glassColor = toColor(prop.color || '#f59e0b');
    const foamColor = toColor('#fef3c7');
    const outlineColor = toColor(prop.outline || '#78350f');

    mug.add(this.add.rectangle(0, 2, 8, 10, glassColor).setStrokeStyle(1, outlineColor));
    mug.add(this.add.rectangle(0, -4, 9, 3, foamColor));
    mug.add(this.add.rectangle(5, 2, 3, 6, 0x000000, 0).setStrokeStyle(1, foamColor));
    mug.add(this.add.rectangle(-2, 2, 1, 7, 0xfde68a, 0.65));
  }

  createTableProp(x, y, prop) {
    const table = this.add.container(x, y);
    const topColor = toColor(prop.color || '#451a03');
    const outlineColor = toColor(prop.outline || '#facc15');

    table.add(this.add.rectangle(0, 0, prop.width || 30, prop.height || 18, topColor).setStrokeStyle(1, outlineColor));
    table.add(this.add.rectangle(-9, -7, 6, 4, 0xf59e0b).setStrokeStyle(1, 0x78350f));
    table.add(this.add.rectangle(8, 6, 6, 4, 0xf59e0b).setStrokeStyle(1, 0x78350f));
  }

  createBarProp(x, y, prop) {
    const bar = this.add.container(x, y);
    const barColor = toColor(prop.color || '#78350f');
    const outlineColor = toColor(prop.outline || '#422006');

    bar.add(this.add.rectangle(0, 0, prop.width || 108, prop.height || 14, barColor).setStrokeStyle(1, outlineColor));
    bar.add(this.add.rectangle(0, -5, prop.width || 108, 3, 0xfacc15, 0.75));
    [-36, -20, -4, 12, 28, 44].forEach((offset) => {
      bar.add(this.add.rectangle(offset, 1, 5, 8, 0xf59e0b).setStrokeStyle(1, 0x78350f));
    });
  }

  createDoorProp(x, y, prop) {
    const door = this.add.container(x, y);
    const doorColor = toColor(prop.color || '#facc15');
    const outlineColor = toColor(prop.outline || '#713f12');

    door.add(this.add.rectangle(0, 0, prop.width || 12, prop.height || 15, doorColor).setStrokeStyle(1, outlineColor));
    door.add(this.add.rectangle(3, 1, 2, 2, 0x713f12));
  }

  createPlayer() {
    const spawn = this.getSpawnPoint(this.spawnPoint || this.locationData.playerSpawnPoint || 'default');
    this.player = this.add.container(spawn.x * TILE_SIZE + 8, spawn.y * TILE_SIZE + 8);
    this.physics.add.existing(this.player);
    this.player.body.setSize(10, 10);
    this.player.body.setOffset(-5, -1);
    this.player.setData('speed', this.sceneData.playerSpeed || 72);
    this.drawPixelPerson(this.player, '#3b82f6', '#f8fafc');

    this.physics.add.collider(this.player, this.blockers);
    this.physics.add.overlap(this.player, this.doors, (_player, door) => {
      this.scene.restart({
        sceneId: this.sceneId,
        locationId: door.targetLocation,
        spawnPoint: door.spawnPoint
      });
    });
  }

  getSpawnPoint(name) {
    return this.locationData.playerSpawns?.[name] || this.locationData.playerSpawns?.default || { x: 2, y: 2 };
  }

  createNpcs() {
    this.npcs = this.physics.add.group();

    this.characterData.forEach((character, actorId) => {
      const spawn = this.locationData.npcSpawnPoints?.[character.spawnPoint];
      if (!spawn) {
        this.warnContent(`Skipped character "${actorId}" because spawn point "${character.spawnPoint}" is missing in location "${this.currentLocationId}".`);
        return;
      }

      const npc = this.add.container(spawn.x * TILE_SIZE + 8, spawn.y * TILE_SIZE + 8);
      this.physics.add.existing(npc);
      npc.actorId = actorId;
      npc.name = character.name;
      npc.body.setSize(10, 10);
      npc.body.setOffset(-5, -1);
      npc.setData('speed', character.movementSpeed || 46);
      this.drawPixelPerson(npc, character.sprite?.shirtColor || '#ef4444', character.sprite?.faceColor || '#fde68a');

      this.npcs.add(npc);
      this.physics.add.collider(npc, this.blockers);
    });
  }

  createDialogue() {
    this.dialogueBox = new DialogueBox(this);
  }

  createTitleCard() {
    const titleCard = this.sceneData.titleCard;
    this.titleCardVisible = (titleCard?.showOnStart ?? false) && this.currentLocationId === this.sceneData.startingLocation;
    this.titleCardTimer = null;

    this.titleOverlay = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      toColor(titleCard?.background || '#111827'),
      titleCard?.alpha ?? 0.88
    ).setScrollFactor(0).setDepth(900).setVisible(this.titleCardVisible);

    this.titleText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 18, titleCard?.title || this.sceneData.title || '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: titleCard?.color || '#f8fafc',
      align: 'center',
      wordWrap: { width: this.scale.width - 28 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setVisible(this.titleCardVisible);

    this.subtitleText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 18, titleCard?.subtitle || '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: titleCard?.subtitleColor || '#cbd5e1',
      align: 'center',
      wordWrap: { width: this.scale.width - 28 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setVisible(this.titleCardVisible);

    if (this.titleCardVisible && titleCard?.duration) {
      this.scheduleTitleCardHide(titleCard.duration);
    }
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.SPACE,
      confirm: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });
  }

  createRecordingEvents() {
    this.game.events.off('recording:reset-scene');
    this.game.events.off('recording:toggle-title-card');

    this.recordingResetHandler = () => {
      this.scene.restart({ sceneId: this.sceneId });
    };
    this.recordingTitleHandler = () => {
      this.replayTitleCard();
    };

    this.game.events.on('recording:reset-scene', this.recordingResetHandler);
    this.game.events.on('recording:toggle-title-card', this.recordingTitleHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('recording:reset-scene', this.recordingResetHandler);
      this.game.events.off('recording:toggle-title-card', this.recordingTitleHandler);
    });
  }

  createCamera() {
    const mapWidth = this.locationData.map.tiles[0].length * TILE_SIZE;
    const mapHeight = this.locationData.map.tiles.length * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
  }

  movePlayer() {
    if (this.dialogueBox.isOpen || this.titleCardVisible) {
      this.player.body.setVelocity(0);
      return;
    }

    const speed = this.player.getData('speed');
    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown;
    const down = this.cursors.down.isDown || this.keys.down.isDown;

    this.player.body.setVelocity((right - left) * speed, (down - up) * speed);
    this.player.body.velocity.normalize().scale(speed);
  }

  tryInteract() {
    if (this.dialogueBox.isOpen) {
      this.dialogueBox.advance();
      return;
    }

    if (this.titleCardVisible) {
      this.setTitleCardVisible(false);
      return;
    }

    const npc = this.findNearbyNpc();
    if (!npc) {
      return;
    }

    const character = this.characterData.get(npc.actorId);
    const dialogue = asArray(this.sceneData.dialogueSequence).filter((line) => line.speaker === npc.actorId);
    if (dialogue.length === 0) {
      this.warnContent(`No dialogue found for actor "${npc.actorId}".`);
      return;
    }

    this.dialogueBox.open({
      name: npc.name,
      lines: dialogue.map((line) => line.text),
      onComplete: () => this.startScriptedMovementsFor(npc.actorId),
      nameColor: character?.dialogueColor,
      portrait: character?.portrait || character?.sprite
    });
  }

  startScriptedMovementsFor(actorId) {
    asArray(this.sceneData.scriptedMovements)
      .filter((movement) => movement.actor === actorId && movement.trigger === 'afterDialogue')
      .forEach((movement) => {
        const actor = this.npcs.getChildren().find((npc) => npc.actorId === actorId);
        if (!actor) {
          return;
        }

        actor.path = asArray(movement.path).map((point) => ({
          x: point.x * TILE_SIZE + 8,
          y: point.y * TILE_SIZE + 8
        })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
        actor.pathIndex = 0;
        if (actor.path.length > 0) {
          this.scriptedActors.push(actor);
        }
      });
  }

  findNearbyNpc() {
    return this.npcs.getChildren().find((npc) => Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      npc.x,
      npc.y
    ) < 22);
  }

  updateScriptedActors() {
    this.scriptedActors = this.scriptedActors.filter((actor) => {
      const target = actor.path?.[actor.pathIndex];
      if (!target) {
        actor.body.setVelocity(0);
        return false;
      }

      const distance = Phaser.Math.Distance.Between(actor.x, actor.y, target.x, target.y);
      if (distance < 2) {
        actor.pathIndex += 1;
        return true;
      }

      const speed = actor.getData('speed');
      const angle = Phaser.Math.Angle.Between(actor.x, actor.y, target.x, target.y);
      actor.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      return true;
    });
  }

  showPunchlineReveal() {
    const reveal = this.sceneData.punchlineReveal;
    if (!reveal?.text) {
      return;
    }

    this.add.text(this.scale.width / 2, 24, reveal.text, {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: reveal.color || '#fef3c7',
      align: 'center',
      wordWrap: { width: this.scale.width - 32 }
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(850);
  }

  getSceneData(sceneId) {
    const scene = this.cache.json.get(`scene:${sceneId}`);
    if (!scene) {
      this.warnContent(`Scene "${sceneId}" is missing. Loaded a fallback scene instead.`);
      return {
        id: sceneId,
        title: 'Missing Scene',
        startingLocation: 'fallback',
        destinationLocation: 'fallback',
        participatingCharacters: [],
        dialogueSequence: [],
        scriptedMovements: [],
        punchlineReveal: {
          text: 'Missing scene data.'
        },
        camera: {
          zoom: 3
        }
      };
    }

    this.validateRequiredFields(scene, ['id', 'title', 'startingLocation'], `scene:${sceneId}`);

    return {
      participatingCharacters: [],
      dialogueSequence: [],
      scriptedMovements: [],
      camera: {},
      ...scene
    };
  }

  getLocationData(locationId) {
    const location = this.cache.json.get(`location:${locationId}`);
    if (!location) {
      this.warnContent(`Location "${locationId}" is missing. Loaded a fallback map instead.`);
      return FALLBACK_LOCATION;
    }

    this.validateRequiredFields(location, ['id', 'mapName', 'map'], `location:${locationId}`);
    if (!location.map?.legend || !Array.isArray(location.map?.tiles) || location.map.tiles.length === 0) {
      this.warnContent(`Location "${locationId}" has an invalid map. Loaded a fallback map instead.`);
      return FALLBACK_LOCATION;
    }

    return {
      exits: [],
      props: [],
      npcSpawnPoints: {},
      playerSpawns: { default: { x: 2, y: 2 } },
      ...location
    };
  }

  getCharacterData() {
    const characters = new Map();

    // Scene actor IDs are per-video roles that point to reusable character files.
    asArray(this.sceneData.participatingCharacters).forEach((entry) => {
      if (!entry?.id || !entry?.character) {
        this.warnContent('Skipped a participating character because it is missing id or character.');
        return;
      }

      const character = this.cache.json.get(`character:${entry.character}`);
      if (!character) {
        this.warnContent(`Character "${entry.character}" is missing. Actor "${entry.id}" will not spawn.`);
        return;
      }

      this.validateRequiredFields(character, ['id', 'name', 'sprite'], `character:${entry.character}`);
      characters.set(entry.id, {
        movementSpeed: 46,
        dialogueColor: '#facc15',
        emotes: {},
        ...character,
        ...entry
      });
    });

    return characters;
  }

  validateSceneLinks() {
    if (!this.cache.json.get(`location:${this.sceneData.startingLocation}`) && this.sceneData.startingLocation !== 'fallback') {
      this.warnContent(`Scene "${this.sceneId}" references missing starting location "${this.sceneData.startingLocation}".`);
    }

    if (this.sceneData.destinationLocation && !this.cache.json.get(`location:${this.sceneData.destinationLocation}`)) {
      this.warnContent(`Scene "${this.sceneId}" references missing destination location "${this.sceneData.destinationLocation}".`);
    }

    asArray(this.sceneData.dialogueSequence).forEach((line) => {
      if (!line?.speaker || typeof line.text !== 'string') {
        this.warnContent(`Scene "${this.sceneId}" contains an invalid dialogue line.`);
      } else if (!this.characterData.has(line.speaker)) {
        this.warnContent(`Dialogue references unknown actor "${line.speaker}".`);
      }
    });

    asArray(this.sceneData.scriptedMovements).forEach((movement) => {
      if (!movement?.actor || !Array.isArray(movement.path)) {
        this.warnContent(`Scene "${this.sceneId}" contains an invalid scripted movement.`);
      } else if (!this.characterData.has(movement.actor)) {
        this.warnContent(`Movement references unknown actor "${movement.actor}".`);
      }
    });
  }

  validateRequiredFields(source, fields, label) {
    fields.forEach((field) => {
      if (source[field] === undefined || source[field] === null || source[field] === '') {
        this.warnContent(`${label} is missing required field "${field}".`);
      }
    });
  }

  warnContent(message) {
    console.warn(message);
    this.contentErrors.push(message);
  }

  showContentWarnings() {
    if (this.contentErrors.length === 0) {
      return;
    }

    this.add.text(8, 8, `Content warnings: ${this.contentErrors.length}`, {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#facc15'
    }).setScrollFactor(0).setDepth(1002);
  }

  setTitleCardVisible(visible) {
    this.titleCardVisible = visible;
    this.titleOverlay.setVisible(visible);
    this.titleText.setVisible(visible);
    this.subtitleText.setVisible(visible);

    if (!visible && this.titleCardTimer) {
      this.titleCardTimer.remove(false);
      this.titleCardTimer = null;
    }
  }

  replayTitleCard() {
    if (!this.sceneData.titleCard) {
      return;
    }

    this.setTitleCardVisible(true);
    if (this.sceneData.titleCard.duration) {
      this.scheduleTitleCardHide(this.sceneData.titleCard.duration);
    }
  }

  scheduleTitleCardHide(duration) {
    if (this.titleCardTimer) {
      this.titleCardTimer.remove(false);
    }

    this.titleCardTimer = this.time.delayedCall(duration, () => {
      this.setTitleCardVisible(false);
    });
  }

  emitSceneMeta() {
    this.game.events.emit('recording:scene-meta', {
      sceneTitle: this.sceneData.title || this.sceneId,
      locationName: this.locationData.mapName || this.currentLocationId
    });
  }

  drawPixelPerson(container, shirtColor, faceColor) {
    container.add(this.add.rectangle(0, -5, 8, 7, toColor(faceColor)));
    container.add(this.add.rectangle(0, 2, 10, 10, toColor(shirtColor)));
    container.add(this.add.rectangle(-3, 8, 3, 4, toColor('#1f2937')));
    container.add(this.add.rectangle(3, 8, 3, 4, toColor('#1f2937')));
    container.add(this.add.rectangle(-2, -6, 1, 1, toColor('#111827')));
    container.add(this.add.rectangle(2, -6, 1, 1, toColor('#111827')));
  }
}
