import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.json('scene-manifest', '/scenes/manifest.json');
  }

  create() {
    const manifest = this.cache.json.get('scene-manifest') || {};

    this.queueContent(manifest.scenes, 'scene');
    this.queueContent(manifest.characters, 'character');
    this.queueContent(manifest.locations, 'location');

    this.load.once('complete', () => {
      this.registry.set('scene-manifest', manifest);
      this.scene.start('MenuScene');
    });

    this.load.start();
  }

  queueContent(entries = [], type) {
    if (!Array.isArray(entries)) {
      console.warn(`Expected manifest.${type}s to be an array.`);
      return;
    }

    entries.filter((entry) => entry?.id && entry?.file).forEach((entry) => {
      this.load.json(`${type}:${entry.id}`, entry.file);
    });
  }
}
