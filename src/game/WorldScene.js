import Phaser from 'phaser';
import { DialogueBox } from './ui/DialogueBox.js';

const TILE_SIZE = 16;
const FALLBACK_COLOR = '#111827';
const DEFAULT_CAMERA_ZOOM = 2.35;
const MIN_CAMERA_ZOOM = 1.35;
const MAX_CAMERA_ZOOM = 2.8;
const MIN_PROP_SCALE_MULTIPLIER = 0.75;
const MAX_PROP_SCALE_MULTIPLIER = 1.15;
const MIN_CHARACTER_SCALE = 0.85;
const MAX_CHARACTER_SCALE = 1.15;
const CAMERA_LERP = 0.12;
const PUB_TILEMAP_DEBUG = true;

const PROP_ASSET_PACKS = {
  pub: [
    'floor_wood.png',
    'wall_back_plain.png',
    'wall_corner_inner.png',
    'bar_counter_straight.png',
    'bar_counter_corner.png',
    'table_round.png',
    'table_square_with_beer.png',
    'stool.png',
    'chair_side_left.png',
    'bottle_shelf.png',
    'barrel.png',
    'keg_tap.png',
    'fireplace.png',
    'pub_sign.png',
    'lamp_hanging.png',
    'rug_rect_red.png',
    'plant.png',
    'door_double.png',
    'window_square.png'
  ],
  'outside-route': [
    'grass_light.png',
    'grass_dark.png',
    'sand_path_tile.png',
    'sand_path_corner_large.png',
    'dirt_path_vertical.png',
    'pavement_tiles.png',
    'route_sign_201.png',
    'lamp_post.png',
    'wooden_signpost.png',
    'notice_board.png',
    'wooden_fence_section.png',
    'bush_large.png',
    'pine_tree.png',
    'small_tree.png',
    'hedge_long.png',
    'flower_bush_white.png',
    'round_bush.png',
    'large_rock.png',
    'bench.png',
    'red_mailbox.png',
    'window_flowerbox.png',
    'arched_doorway.png',
    'brick_wall.png'
  ]
};

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

function clampSetting(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Phaser.Math.Clamp(value, min, max);
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

  preload() {
    const scene = this.cache.json.get(`scene:${this.sceneId}`);
    const locationId = this.currentLocationId || scene?.startingLocation;
    const location = this.cache.json.get(`location:${locationId}`);
    const tilemap = location?.tilemap;

    this.preloadLocationPropAssets(locationId, location);

    if (location?.useTilemap !== true || !tilemap?.mapPath || !tilemap?.tilesetPath) {
      return;
    }

    const mapKey = this.getTilemapCacheKey(locationId);
    const tilesetKey = this.getTilesetCacheKey(locationId);
    const tileWidth = tilemap.tileWidth || TILE_SIZE;
    const tileHeight = tilemap.tileHeight || TILE_SIZE;

    this.logPubTilemapDebug('preload:queue', {
      locationId,
      mapPath: tilemap.mapPath,
      tilesetPath: tilemap.tilesetPath,
      tileWidth,
      tileHeight
    });

    this.load.on('filecomplete', (key, type) => {
      if (key === mapKey || key === tilesetKey) {
        this.logPubTilemapDebug('preload:filecomplete', { key, type });
      }
    });

    this.load.on('loaderror', (file) => {
      if (file?.key === mapKey || file?.key === tilesetKey) {
        this.logPubTilemapDebug('preload:loaderror', {
          key: file.key,
          type: file.type,
          url: file.url,
          src: file.src
        });
      }
    });

    this.load.once('complete', () => {
      this.logPubTilemapDebug('preload:complete', {
        mapJsonLoaded: Boolean(this.cache.json.get(mapKey)),
        tilesetImageLoaded: this.textures.exists(tilesetKey),
        tileset: this.getTilesetDebugInfo(tilesetKey)
      });
    });

    this.load.json(mapKey, tilemap.mapPath);
    this.load.spritesheet(tilesetKey, tilemap.tilesetPath, {
      frameWidth: tileWidth,
      frameHeight: tileHeight,
      margin: tilemap.margin || 0,
      spacing: tilemap.spacing || 0
    });
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

  preloadLocationPropAssets(locationId, location) {
    const pack = this.getLocationPropAssetPack(locationId, location);
    const assets = PROP_ASSET_PACKS[pack];

    if (!assets) {
      return;
    }

    assets.forEach((assetName) => {
      const key = this.getPropAssetKey(pack, assetName);
      if (!this.textures.exists(key)) {
        this.load.image(key, `/assets/props/${pack}/${assetName}`);
      }
    });
  }

  getLocationPropAssetPack(locationId, location = this.locationData) {
    return location?.propAssetPack || locationId;
  }

  getPropAssetKey(pack, assetName) {
    return `${pack}-prop:${assetName.replace(/\.png$/i, '')}`;
  }

  buildLocation() {
    this.ground = this.add.graphics();
    this.blockers = this.physics.add.staticGroup();
    this.doors = this.physics.add.staticGroup();

    const tilemap = this.getLoadedTilemap();
    if (tilemap) {
      this.buildTilemapLocation(tilemap);
    } else {
      this.buildGeneratedLocation();
    }

    asArray(this.locationData.exits)
      .filter((exit) => this.isExitEnabled(exit))
      .forEach((exit) => this.createExit(exit));
  }

  buildGeneratedLocation() {
    const { map } = this.locationData;
    const width = map.tiles[0].length * TILE_SIZE;
    const height = map.tiles.length * TILE_SIZE;

    map.tiles.forEach((row, y) => {
      [...row].forEach((tile, x) => {
        const worldX = x * TILE_SIZE;
        const worldY = y * TILE_SIZE;
        const def = map.legend[tile] || map.legend['.'];

        this.ground.fillStyle(toColor(def.color), 1);
        this.ground.fillRect(worldX, worldY, TILE_SIZE, TILE_SIZE);

        this.drawTileTexture(worldX, worldY, def, x, y);

        if (def.decoration === 'water') {
          this.ground.fillStyle(0x60a5fa, 0.45);
          this.ground.fillRect(worldX + 2, worldY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        if (def.blocked) {
          this.createMapBlocker(worldX, worldY, TILE_SIZE, TILE_SIZE);
        }
      });
    });

    asArray(this.locationData.props).forEach((prop) => this.createProp(prop));
    this.mapPixelWidth = width;
    this.mapPixelHeight = height;
    this.physics.world.setBounds(0, 0, width, height);

    this.logPubTilemapDebug('fallback:generated-renderer-used', {
      reason: this.locationData.useTilemap === true
        ? 'Tilemap JSON or tileset texture was unavailable at render time.'
        : 'Location useTilemap flag is false.',
      mapPath: this.locationData.tilemap?.mapPath,
      tilesetPath: this.locationData.tilemap?.tilesetPath,
      useTilemap: this.locationData.useTilemap === true
    });
  }

  buildTilemapLocation(tilemap) {
    const tileSize = tilemap.tileSize || TILE_SIZE;
    const layers = asArray(tilemap.layers);
    const firstLayer = layers.find((layer) => Array.isArray(layer.rows));
    const width = tilemap.width || firstLayer?.rows?.[0]?.length || this.locationData.map.tiles[0].length;
    const height = tilemap.height || firstLayer?.rows?.length || this.locationData.map.tiles.length;
    const textureKey = this.getTilesetCacheKey(this.currentLocationId);
    const collisionTiles = new Set(asArray(tilemap.collisionLegend));
    const tileDebug = this.collectTileDebugStats(tilemap);
    const tilesetDebug = this.getTilesetDebugInfo(textureKey);
    let renderedTiles = 0;

    this.logPubTilemapDebug('render:start', {
      mapPath: this.locationData.tilemap?.mapPath,
      tilesetPath: this.locationData.tilemap?.tilesetPath,
      mapJsonLoaded: true,
      tilesetImageLoaded: this.textures.exists(textureKey),
      tileWidth: this.locationData.tilemap?.tileWidth || tileSize,
      tileHeight: this.locationData.tilemap?.tileHeight || tileSize,
      tileset: tilesetDebug,
      mapWidthTiles: width,
      mapHeightTiles: height,
      layerCount: layers.length,
      objectCount: asArray(tilemap.objects).length,
      uniqueTileSymbols: tileDebug.uniqueTileSymbols,
      uniqueFrameIds: tileDebug.uniqueFrameIds,
      maxFrameIdUsed: tileDebug.maxFrameIdUsed,
      first20TileIds: tileDebug.first20TileIds
    });

    layers.forEach((layer, layerIndex) => {
      asArray(layer.rows).forEach((row, y) => {
        [...row].forEach((tile, x) => {
          const frame = tilemap.legend?.[tile] ?? -1;
          const worldX = x * tileSize;
          const worldY = y * tileSize;

          if (frame >= 0) {
            renderedTiles += 1;
            this.add.image(worldX + tileSize / 2, worldY + tileSize / 2, textureKey, frame)
              .setOrigin(0.5)
              .setDepth(layer.depth ?? layerIndex);
          }

          if (layer.collides || collisionTiles.has(tile)) {
            this.createMapBlocker(worldX, worldY, tileSize, tileSize);
          }
        });
      });
    });

    this.mapPixelWidth = width * tileSize;
    this.mapPixelHeight = height * tileSize;
    this.physics.world.setBounds(0, 0, this.mapPixelWidth, this.mapPixelHeight);

    this.logPubTilemapDebug('render:complete', {
      renderedTiles,
      layerCount: layers.length,
      mapBoundsPixels: {
        width: this.mapPixelWidth,
        height: this.mapPixelHeight
      },
      tilesetFrameTotal: tilesetDebug?.frameTotal ?? null,
      frameRangeLooksValid: !tilesetDebug || tileDebug.maxFrameIdUsed < tilesetDebug.frameTotal
    });

    this.drawPubTilemapDebugOverlay(tilemap, { width, height, tileSize });
  }

  getLoadedTilemap() {
    const config = this.locationData.tilemap;
    const mapKey = this.getTilemapCacheKey(this.currentLocationId);
    const tilesetKey = this.getTilesetCacheKey(this.currentLocationId);
    const tilemap = this.cache.json.get(mapKey);
    const mapJsonLoaded = Boolean(tilemap);
    const tilesetImageLoaded = this.textures.exists(tilesetKey);

    this.logPubTilemapDebug('render:availability', {
      mapPath: config?.mapPath,
      tilesetPath: config?.tilesetPath,
      mapJsonLoaded,
      tilesetImageLoaded,
      tileWidth: config?.tileWidth || TILE_SIZE,
      tileHeight: config?.tileHeight || TILE_SIZE,
      tileset: tilesetImageLoaded ? this.getTilesetDebugInfo(tilesetKey) : null,
      useTilemap: this.locationData.useTilemap === true
    });

    if (this.locationData.useTilemap !== true || !config?.mapPath || !config?.tilesetPath || !tilemap || !tilesetImageLoaded) {
      return null;
    }

    return tilemap;
  }

  getTilemapCacheKey(locationId) {
    return `tilemap:${locationId}`;
  }

  getTilesetCacheKey(locationId) {
    return `tileset:${locationId}`;
  }

  getTilesetDebugInfo(textureKey) {
    if (!this.textures.exists(textureKey)) {
      return null;
    }

    const texture = this.textures.get(textureKey);
    const source = texture.getSourceImage();
    const frameNames = texture.getFrameNames().filter((frameName) => frameName !== '__BASE');

    return {
      textureKey,
      imageWidth: source?.width ?? null,
      imageHeight: source?.height ?? null,
      frameTotal: frameNames.length,
      firstFrameNames: frameNames.slice(0, 12)
    };
  }

  collectTileDebugStats(tilemap) {
    const symbols = [];
    const frameIds = [];

    asArray(tilemap.layers).forEach((layer) => {
      asArray(layer.rows).forEach((row) => {
        [...row].forEach((symbol) => {
          const frame = tilemap.legend?.[symbol] ?? -1;
          symbols.push(symbol);
          if (frame >= 0) {
            frameIds.push(frame);
          }
        });
      });
    });

    return {
      uniqueTileSymbols: [...new Set(symbols)],
      uniqueFrameIds: [...new Set(frameIds)],
      maxFrameIdUsed: frameIds.length > 0 ? Math.max(...frameIds) : -1,
      first20TileIds: frameIds.slice(0, 20)
    };
  }

  drawPubTilemapDebugOverlay(tilemap, { width, height, tileSize }) {
    if (!PUB_TILEMAP_DEBUG || this.currentLocationId !== 'pub') {
      return;
    }

    const debug = this.add.graphics().setDepth(700);
    const pixelWidth = width * tileSize;
    const pixelHeight = height * tileSize;

    debug.lineStyle(1, 0xffffff, 0.18);
    for (let x = 0; x <= pixelWidth; x += tileSize) {
      debug.lineBetween(x, 0, x, pixelHeight);
    }
    for (let y = 0; y <= pixelHeight; y += tileSize) {
      debug.lineBetween(0, y, pixelWidth, y);
    }

    debug.lineStyle(2, 0x38bdf8, 0.95);
    debug.strokeRect(0, 0, pixelWidth, pixelHeight);

    const spawn = this.getSpawnPoint(this.spawnPoint || this.locationData.playerSpawnPoint || 'default');
    debug.lineStyle(2, 0x22c55e, 1);
    debug.strokeRect(spawn.x * tileSize + 1, spawn.y * tileSize + 1, tileSize - 2, tileSize - 2);
    this.add.text(spawn.x * tileSize + tileSize / 2, spawn.y * tileSize - 2, 'SPAWN', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#bbf7d0',
      backgroundColor: '#14532d'
    }).setOrigin(0.5, 1).setDepth(701);

    const doorTiles = [];
    asArray(tilemap.layers).forEach((layer) => {
      asArray(layer.rows).forEach((row, y) => {
        [...row].forEach((tile, x) => {
          if (tile === 'D') {
            doorTiles.push({ x, y });
          }
        });
      });
    });

    doorTiles.forEach((door) => {
      debug.lineStyle(2, 0xfacc15, 1);
      debug.strokeRect(door.x * tileSize + 2, door.y * tileSize + 2, tileSize - 4, tileSize - 4);
      this.add.text(door.x * tileSize + tileSize / 2, door.y * tileSize + tileSize + 2, 'DOOR', {
        fontFamily: 'monospace',
        fontSize: '5px',
        color: '#fef3c7',
        backgroundColor: '#713f12'
      }).setOrigin(0.5, 0).setDepth(701);
    });
  }

  logPubTilemapDebug(label, payload) {
    if (!PUB_TILEMAP_DEBUG || this.currentLocationId !== 'pub') {
      return;
    }

    console.info(`[PubTilemapDebug] ${label}`, payload);
  }

  createMapBlocker(worldX, worldY, width, height) {
    const blocker = this.add.rectangle(worldX + width / 2, worldY + height / 2, width, height, 0x000000, 0);
    this.physics.add.existing(blocker, true);
    this.blockers.add(blocker);
  }

  drawTileTexture(worldX, worldY, def, tileX, tileY) {
    if (def.texture === 'pub-floor') {
      const lineColor = toColor(def.lineColor || '#7c2d12');
      const highlightColor = toColor(def.highlightColor || '#a16207');

      this.ground.fillStyle(highlightColor, (tileX + tileY) % 2 === 0 ? 0.12 : 0.06);
      this.ground.fillRect(worldX + 1, worldY + 1, TILE_SIZE - 2, 2);
      this.ground.lineStyle(1, lineColor, 0.35);
      this.ground.lineBetween(worldX, worldY + 7, worldX + TILE_SIZE, worldY + 7);
      this.ground.lineStyle(1, lineColor, 0.2);
      this.ground.lineBetween(worldX + 8, worldY, worldX + 8, worldY + TILE_SIZE);
      return;
    }

    if (def.texture === 'pub-wall') {
      const lineColor = toColor(def.lineColor || '#111827');
      const highlightColor = toColor(def.highlightColor || '#78350f');

      this.ground.fillStyle(highlightColor, 0.18);
      this.ground.fillRect(worldX + 2, worldY + 2, TILE_SIZE - 4, 2);
      this.ground.lineStyle(1, lineColor, 0.25);
      this.ground.lineBetween(worldX, worldY + 8, worldX + TILE_SIZE, worldY + 8);
    }
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

    if (prop.asset) {
      this.createAssetProp(x, y, prop);
      return;
    }

    this.createFallbackProp(x, y, prop);
  }

  createAssetProp(x, y, prop) {
    const pack = prop.assetPack || this.getLocationPropAssetPack(this.currentLocationId);
    const key = this.getPropAssetKey(pack, prop.asset);
    const propScale = this.getPropRenderScale(prop);

    if (!this.textures.exists(key)) {
      this.createFallbackProp(x, y, prop);
      return;
    }

    const image = this.add.image(x, y, key)
      .setOrigin(prop.originX ?? 0.5, prop.originY ?? 0.5)
      .setDepth(prop.depth ?? 0);

    if (typeof prop.alpha === 'number') {
      image.setAlpha(prop.alpha);
    }

    if (typeof prop.width === 'number' && typeof prop.height === 'number') {
      image.setDisplaySize(prop.width * propScale, prop.height * propScale);
    } else if (typeof prop.scale === 'number') {
      image.setScale(prop.scale * propScale);
    } else if (propScale !== 1) {
      image.setScale(propScale);
    }

    if (prop.flipX) {
      image.setFlipX(true);
    }

    if (prop.flipY) {
      image.setFlipY(true);
    }
  }

  createFallbackProp(x, y, prop) {
    const fallbackProp = {
      ...prop,
      asset: null,
      kind: prop.fallbackKind || prop.kind
    };

    if (fallbackProp.kind === 'beer') {
      this.createBeerProp(x, y, fallbackProp);
      return;
    }

    if (fallbackProp.kind === 'table') {
      this.createTableProp(x, y, fallbackProp);
      return;
    }

    if (fallbackProp.kind === 'bar') {
      this.createBarProp(x, y, fallbackProp);
      return;
    }

    if (fallbackProp.kind === 'door') {
      this.createDoorProp(x, y, fallbackProp);
      return;
    }

    this.createGeneratedShapeProp(x, y, fallbackProp);
  }

  createGeneratedShapeProp(x, y, prop) {
    const propScale = this.getPropRenderScale(prop);
    const width = (prop.width || 8) * propScale;
    const height = (prop.height || 8) * propScale;
    const sprite = this.add.rectangle(x, y, width, height, toColor(prop.color || '#ffffff'));
    sprite.setDepth(prop.depth ?? 0);
    sprite.setStrokeStyle(1, toColor(prop.outline || '#111827'));

    if (typeof prop.alpha === 'number') {
      sprite.setAlpha(prop.alpha);
    }

    if (prop.label) {
      this.add.text(x, y + height / 2 + 2, prop.label, {
        fontFamily: 'monospace',
        fontSize: '4px',
        color: prop.labelColor || '#111827'
      }).setOrigin(0.5, 0).setDepth((prop.depth ?? 0) + 1);
    }
  }

  createBeerProp(x, y, prop) {
    const mug = this.add.container(x, y);
    const glassColor = toColor(prop.color || '#f59e0b');
    const foamColor = toColor('#fef3c7');
    const outlineColor = toColor(prop.outline || '#78350f');

    mug.add(this.add.rectangle(0, 1, 4, 6, glassColor).setStrokeStyle(1, outlineColor));
    mug.add(this.add.rectangle(0, -3, 5, 2, foamColor));
    mug.add(this.add.rectangle(3, 1, 2, 4, 0x000000, 0).setStrokeStyle(1, foamColor));
    mug.add(this.add.rectangle(-1, 1, 1, 4, 0xfde68a, 0.55));
    mug.setDepth(prop.depth ?? 0);
    mug.setScale(this.getPropRenderScale(prop));
  }

  createTableProp(x, y, prop) {
    const table = this.add.container(x, y);
    const topColor = toColor(prop.color || '#451a03');
    const outlineColor = toColor(prop.outline || '#facc15');
    const width = prop.width || 18;
    const height = prop.height || 12;

    table.add(this.add.rectangle(0, 0, width, height, topColor).setStrokeStyle(1, outlineColor));
    table.add(this.add.rectangle(-width / 4, -height / 4, 3, 2, 0xf59e0b).setStrokeStyle(1, 0x78350f));
    table.add(this.add.rectangle(width / 4, height / 4, 3, 2, 0xf59e0b).setStrokeStyle(1, 0x78350f));
    table.setDepth(prop.depth ?? 0);
    table.setScale(this.getPropRenderScale(prop));
  }

  createBarProp(x, y, prop) {
    const bar = this.add.container(x, y);
    const barColor = toColor(prop.color || '#78350f');
    const outlineColor = toColor(prop.outline || '#422006');
    const width = prop.width || 76;
    const height = prop.height || 8;

    bar.add(this.add.rectangle(0, 0, width, height, barColor).setStrokeStyle(1, outlineColor));
    bar.add(this.add.rectangle(0, -height / 2 + 1, width, 2, 0xfacc15, 0.55));
    [-28, -16, -4, 8, 20, 32].forEach((offset) => {
      if (Math.abs(offset) < width / 2 - 3) {
        bar.add(this.add.rectangle(offset, 1, 3, 5, 0xf59e0b).setStrokeStyle(1, 0x78350f));
      }
    });
    bar.setDepth(prop.depth ?? 0);
    bar.setScale(this.getPropRenderScale(prop));
  }

  createDoorProp(x, y, prop) {
    const door = this.add.container(x, y);
    const doorColor = toColor(prop.color || '#facc15');
    const outlineColor = toColor(prop.outline || '#713f12');

    door.add(this.add.rectangle(0, 0, prop.width || 8, prop.height || 11, doorColor).setStrokeStyle(1, outlineColor));
    door.add(this.add.rectangle(2, 1, 1, 1, 0x713f12));
    door.setDepth(prop.depth ?? 0);
    door.setScale(this.getPropRenderScale(prop));
  }

  createPlayer() {
    const spawn = this.getSpawnPoint(this.spawnPoint || this.locationData.playerSpawnPoint || 'default');
    const characterScale = this.getCharacterScale();
    this.player = this.add.container(spawn.x * TILE_SIZE + 8, spawn.y * TILE_SIZE + 8);
    this.physics.add.existing(this.player);
    this.player.setScale(characterScale);
    this.player.body.setSize(7 * characterScale, 7 * characterScale);
    this.player.body.setOffset(-3.5 * characterScale, -1 * characterScale);
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
    const characterScale = this.getCharacterScale();

    this.characterData.forEach((character, actorId) => {
      const spawn = this.locationData.npcSpawnPoints?.[character.spawnPoint];
      if (!spawn) {
        if (this.currentLocationId === this.sceneData.destinationLocation) {
          return;
        }

        this.warnContent(`Skipped character "${actorId}" because spawn point "${character.spawnPoint}" is missing in location "${this.currentLocationId}".`);
        return;
      }

      const npc = this.add.container(spawn.x * TILE_SIZE + 8, spawn.y * TILE_SIZE + 8);
      this.physics.add.existing(npc);
      npc.actorId = actorId;
      npc.name = character.name;
      npc.setScale(characterScale);
      npc.body.setSize(7 * characterScale, 7 * characterScale);
      npc.body.setOffset(-3.5 * characterScale, -1 * characterScale);
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
    const mapWidth = this.mapPixelWidth || this.locationData.map.tiles[0].length * TILE_SIZE;
    const mapHeight = this.mapPixelHeight || this.locationData.map.tiles.length * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setZoom(this.getCameraZoom());
    this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);
  }

  getCameraZoom() {
    const requestedZoom = this.locationData.cameraZoom ?? this.sceneData.camera?.zoom;
    return clampSetting(requestedZoom, MIN_CAMERA_ZOOM, MAX_CAMERA_ZOOM, DEFAULT_CAMERA_ZOOM);
  }

  getPropScaleMultiplier() {
    return clampSetting(this.locationData.propScaleMultiplier, MIN_PROP_SCALE_MULTIPLIER, MAX_PROP_SCALE_MULTIPLIER, 1);
  }

  getPropRenderScale(prop = {}) {
    const propScale = clampSetting(prop.scaleMultiplier, MIN_PROP_SCALE_MULTIPLIER, MAX_PROP_SCALE_MULTIPLIER, 1);
    return this.getPropScaleMultiplier() * propScale;
  }

  getCharacterScale() {
    return clampSetting(this.locationData.playerScale, MIN_CHARACTER_SCALE, MAX_CHARACTER_SCALE, 1);
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
          zoom: DEFAULT_CAMERA_ZOOM
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
      useTilemap: false,
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
    container.add(this.add.rectangle(0, -3, 5, 4, toColor(faceColor)));
    container.add(this.add.rectangle(0, 1, 6, 6, toColor(shirtColor)));
    container.add(this.add.rectangle(-2, 5, 2, 3, toColor('#1f2937')));
    container.add(this.add.rectangle(2, 5, 2, 3, toColor('#1f2937')));
    container.add(this.add.rectangle(-1, -4, 1, 1, toColor('#111827')));
    container.add(this.add.rectangle(1, -4, 1, 1, toColor('#111827')));
  }
}
