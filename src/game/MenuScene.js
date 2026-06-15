import Phaser from 'phaser';

const PANEL_COLOR = 0x111827;
const BORDER_COLOR = 0xf8fafc;
const HIGHLIGHT_COLOR = 0xfacc15;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.manifest = this.registry.get('scene-manifest') || {};
    this.scenes = (this.manifest.scenes || [])
      .map((entry) => ({
        ...entry,
        data: this.cache.json.get(`scene:${entry.id}`) || {}
      }))
      .filter((entry) => entry.id);
    this.selectedIndex = Math.max(0, this.scenes.findIndex((entry) => entry.id === this.manifest.startScene));

    this.cameras.main.setBackgroundColor('#0f172a');
    this.createPanel();
    this.createInput();
    this.render();
    this.game.events.emit('recording:menu-opened');
  }

  createPanel() {
    const width = this.scale.width;
    const height = this.scale.height;
    const margin = 10;

    this.add.rectangle(width / 2, height / 2, width - margin * 2, height - margin * 2, PANEL_COLOR, 0.96)
      .setStrokeStyle(2, BORDER_COLOR);

    this.add.text(width / 2, margin + 14, 'Scene Select', {
      fontFamily: 'monospace',
      fontSize: width < 220 ? '13px' : '16px',
      color: '#f8fafc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - margin - 20, '↑↓ choose  ·  Space/Enter start', {
      fontFamily: 'monospace',
      fontSize: width < 220 ? '6px' : '8px',
      color: '#cbd5e1'
    }).setOrigin(0.5);

    this.sceneTexts = [];
    this.detailText = this.add.text(margin + 12, height - margin - 62, '', {
      fontFamily: 'monospace',
      fontSize: width < 220 ? '7px' : '8px',
      color: '#e5e7eb',
      wordWrap: { width: width - margin * 4 }
    });
  }

  createInput() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up) || Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.moveSelection(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.down) || Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.moveSelection(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
      this.startSelectedScene();
    }
  }

  moveSelection(direction) {
    if (this.scenes.length === 0) {
      return;
    }

    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.scenes.length);
    this.render();
  }

  render() {
    this.sceneTexts.forEach((text) => text.destroy());
    this.sceneTexts = [];

    const width = this.scale.width;
    const startY = 46;
    const rowHeight = width < 220 ? 28 : 32;

    this.scenes.forEach((entry, index) => {
      const selected = index === this.selectedIndex;
      const y = startY + index * rowHeight;
      const sceneTitle = entry.data.title || entry.id;
      const location = entry.data.startingLocation || 'unknown';

      if (selected) {
        this.sceneTexts.push(this.add.rectangle(width / 2, y + 8, width - 34, rowHeight - 6, 0x334155, 0.9)
          .setStrokeStyle(1, HIGHLIGHT_COLOR));
      }

      this.sceneTexts.push(this.add.text(24, y, `${selected ? '▶' : ' '} ${sceneTitle}`, {
        fontFamily: 'monospace',
        fontSize: width < 220 ? '8px' : '10px',
        color: selected ? '#fde68a' : '#f8fafc'
      }));

      this.sceneTexts.push(this.add.text(35, y + 12, `Start: ${location}`, {
        fontFamily: 'monospace',
        fontSize: width < 220 ? '6px' : '7px',
        color: '#cbd5e1'
      }));
    });

    const selectedScene = this.scenes[this.selectedIndex]?.data;
    const assetStatus = selectedScene ? this.getAssetStatus(selectedScene) : 'Assets: Unknown';
    this.detailText.setText(`${selectedScene?.description || 'No description yet.'}\n${assetStatus}`);
  }

  startSelectedScene() {
    const selected = this.scenes[this.selectedIndex];
    if (!selected) {
      return;
    }

    this.scene.start('WorldScene', {
      sceneId: selected.id
    });
  }

  getAssetStatus(scene) {
    const customAssets = [];
    const placeholderAssets = [];

    (scene.participatingCharacters || []).forEach((entry) => {
      const character = this.cache.json.get(`character:${entry.character}`) || {};
      const hasCustomSprite = Boolean(character.sprite?.path);
      const hasCustomPortrait = Boolean(character.portrait?.path);

      if (hasCustomSprite || hasCustomPortrait) {
        customAssets.push(entry.character);
      } else {
        placeholderAssets.push(entry.character);
      }
    });

    [scene.startingLocation, scene.destinationLocation].filter(Boolean).forEach((locationId) => {
      const location = this.cache.json.get(`location:${locationId}`) || {};
      const hasCustomAudio = Boolean(location.musicPath || location.ambiencePath);

      if (hasCustomAudio) {
        customAssets.push(locationId);
      } else {
        placeholderAssets.push(locationId);
      }
    });

    if (scene.revealSoundPath || scene.transitionSoundPath) {
      customAssets.push(scene.id);
    } else {
      placeholderAssets.push(scene.id);
    }

    if (customAssets.length === 0) {
      return 'Assets: Placeholder';
    }

    if (placeholderAssets.length === 0) {
      return 'Assets: Custom';
    }

    return 'Assets: Mixed placeholder/custom';
  }
}
