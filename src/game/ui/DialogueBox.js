import Phaser from 'phaser';

const DEFAULT_NAME_COLOR = '#facc15';
const DEFAULT_TEXT_COLOR = '#f8fafc';

function toColor(value, fallback = '#111827') {
  return Phaser.Display.Color.HexStringToColor(value || fallback).color;
}

export class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.lines = [];
    this.index = 0;
    this.visibleCharacters = 0;
    this.elapsed = 0;
    this.charactersPerSecond = 38;
    this.onComplete = null;
    this.isOpen = false;
    this.isTyping = false;

    const width = scene.scale.width;
    const height = scene.scale.height;
    this.margin = 8;
    this.panelHeight = Math.min(72, Math.max(58, Math.floor(height * 0.34)));
    this.panelWidth = width - this.margin * 2;
    this.panelY = height - this.margin - this.panelHeight / 2;
    this.portraitSize = Math.min(34, this.panelHeight - 20);

    this.panel = scene.add.rectangle(
      width / 2,
      this.panelY,
      this.panelWidth,
      this.panelHeight,
      0x111827,
      0.96
    ).setScrollFactor(0).setStrokeStyle(2, 0xf8fafc).setDepth(1000).setVisible(false);

    this.namePlate = scene.add.rectangle(
      this.margin + 39,
      height - this.margin - this.panelHeight - 5,
      62,
      14,
      0x020617,
      0.98
    ).setScrollFactor(0).setStrokeStyle(1, 0xf8fafc).setDepth(1001).setVisible(false);

    this.nameText = scene.add.text(this.margin + 10, height - this.margin - this.panelHeight - 10, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: DEFAULT_NAME_COLOR
    }).setScrollFactor(0).setDepth(1002).setVisible(false);

    this.portrait = scene.add.container(this.margin + 10 + this.portraitSize / 2, this.panelY);
    this.portrait.setScrollFactor(0).setDepth(1002).setVisible(false);

    this.lineText = scene.add.text(this.margin + this.portraitSize + 18, height - this.margin - this.panelHeight + 15, '', {
      fontFamily: 'monospace',
      fontSize: width < 220 ? '7px' : '8px',
      color: DEFAULT_TEXT_COLOR,
      lineSpacing: 3,
      wordWrap: { width: this.panelWidth - this.portraitSize - 30 }
    }).setScrollFactor(0).setDepth(1002).setVisible(false);

    this.hintText = scene.add.text(width - this.margin - 8, height - this.margin - 13, 'SPACE / ENTER', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#cbd5e1'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1002).setVisible(false);
  }

  open({ name, lines, onComplete, nameColor, textColor, portrait }) {
    this.lines = Array.isArray(lines) ? lines : [];
    this.index = 0;
    this.onComplete = onComplete;
    this.nameText.setText(name || '???');
    this.nameText.setColor(nameColor || DEFAULT_NAME_COLOR);
    this.lineText.setColor(textColor || DEFAULT_TEXT_COLOR);
    this.drawPortrait(portrait, nameColor);
    this.isOpen = true;
    this.setVisible(true);
    this.startLine();
  }

  update(_, delta) {
    if (!this.isOpen || !this.isTyping) {
      return;
    }

    this.elapsed += delta;
    const nextVisibleCount = Math.floor((this.elapsed / 1000) * this.charactersPerSecond);

    if (nextVisibleCount !== this.visibleCharacters) {
      this.visibleCharacters = nextVisibleCount;
      this.renderLine();
    }

    if (this.visibleCharacters >= this.currentLine.length) {
      this.finishTyping();
    }
  }

  advance() {
    if (this.isTyping) {
      this.finishTyping();
      return;
    }

    this.index += 1;

    if (this.index >= this.lines.length) {
      this.close();
      return;
    }

    this.startLine();
  }

  close() {
    this.setVisible(false);
    this.isOpen = false;
    this.isTyping = false;
    this.onComplete?.();
  }

  startLine() {
    this.currentLine = this.lines[this.index] || '';
    this.visibleCharacters = 0;
    this.elapsed = 0;
    this.isTyping = this.currentLine.length > 0;
    this.renderLine();
  }

  finishTyping() {
    this.visibleCharacters = this.currentLine.length;
    this.isTyping = false;
    this.renderLine();
  }

  renderLine() {
    this.lineText.setText(this.currentLine.slice(0, this.visibleCharacters));
  }

  drawPortrait(portrait = {}, fallbackColor = DEFAULT_NAME_COLOR) {
    this.portrait.removeAll(true);

    const bgColor = toColor(portrait.backgroundColor, '#020617');
    const shirtColor = toColor(portrait.shirtColor || fallbackColor, fallbackColor);
    const faceColor = toColor(portrait.faceColor, '#fde68a');
    const hairColor = toColor(portrait.hairColor, '#111827');
    const size = this.portraitSize;

    this.portrait.add(this.scene.add.rectangle(0, 0, size, size, bgColor).setStrokeStyle(1, 0xf8fafc));
    this.portrait.add(this.scene.add.rectangle(0, 7, Math.floor(size * 0.58), Math.floor(size * 0.38), shirtColor));
    this.portrait.add(this.scene.add.rectangle(0, -5, Math.floor(size * 0.42), Math.floor(size * 0.38), faceColor));
    this.portrait.add(this.scene.add.rectangle(0, -12, Math.floor(size * 0.48), 5, hairColor));
    this.portrait.add(this.scene.add.rectangle(-4, -6, 1, 1, 0x020617));
    this.portrait.add(this.scene.add.rectangle(4, -6, 1, 1, 0x020617));
  }

  setVisible(visible) {
    this.panel.setVisible(visible);
    this.namePlate.setVisible(visible);
    this.nameText.setVisible(visible);
    this.portrait.setVisible(visible);
    this.lineText.setVisible(visible);
    this.hintText.setVisible(visible);
  }
}
