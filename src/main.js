import Phaser from 'phaser';
import { BootScene } from './game/BootScene.js';
import { MenuScene } from './game/MenuScene.js';
import { WorldScene } from './game/WorldScene.js';
import './style.css';

const FRAME_PRESETS = {
  landscape: {
    width: 320,
    height: 180,
    label: 'Use 9:16 Canvas'
  },
  portrait: {
    width: 180,
    height: 320,
    label: 'Use Landscape Canvas'
  }
};

const params = new URLSearchParams(window.location.search);
const savedFrame = window.localStorage.getItem('pixel-rpg-frame');
const initialFrame = params.get('frame') === 'portrait' || savedFrame === 'portrait'
  ? 'portrait'
  : 'landscape';
const frame = FRAME_PRESETS[initialFrame];

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: frame.width,
  height: frame.height,
  backgroundColor: '#111827',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, MenuScene, WorldScene]
};

const game = new Phaser.Game(config);
const debugUi = document.querySelector('#debug-ui');
const recordingOverlay = document.querySelector('#recording-overlay');
const overlayScene = document.querySelector('#overlay-scene');
const overlayLocation = document.querySelector('#overlay-location');
const startReset = document.querySelector('#start-reset');
const toggleFrame = document.querySelector('#toggle-frame');
const toggleTitle = document.querySelector('#toggle-title');
const hideDebug = document.querySelector('#hide-debug');
const helpButton = document.querySelector('#help-button');
const controlsScreen = document.querySelector('#controls-screen');
const closeControls = document.querySelector('#close-controls');

toggleFrame.textContent = frame.label;

const overlayVisible = window.localStorage.getItem('pixel-rpg-overlay-visible') !== 'false';
setOverlayVisible(overlayVisible);

function setOverlayVisible(visible) {
  debugUi.hidden = !visible;
  recordingOverlay.hidden = !visible;
  window.localStorage.setItem('pixel-rpg-overlay-visible', String(visible));
}

function openControls() {
  controlsScreen.hidden = false;
}

function closeControlsScreen() {
  controlsScreen.hidden = true;
}

startReset.addEventListener('click', () => {
  game.events.emit('recording:reset-scene');
});

toggleFrame.addEventListener('click', () => {
  const nextFrame = initialFrame === 'portrait' ? 'landscape' : 'portrait';
  window.localStorage.setItem('pixel-rpg-frame', nextFrame);
  window.location.search = `?frame=${nextFrame}`;
});

toggleTitle.addEventListener('click', () => {
  game.events.emit('recording:toggle-title-card');
});

hideDebug.addEventListener('click', () => {
  setOverlayVisible(false);
});

helpButton.addEventListener('click', openControls);
closeControls.addEventListener('click', closeControlsScreen);
controlsScreen.addEventListener('click', (event) => {
  if (event.target === controlsScreen) {
    closeControlsScreen();
  }
});

game.events.on('recording:scene-meta', ({ sceneTitle, locationName }) => {
  overlayScene.textContent = sceneTitle || 'Untitled Scene';
  overlayLocation.textContent = locationName || 'Unknown Location';
});

game.events.on('recording:menu-opened', () => {
  overlayScene.textContent = 'Scene Select';
  overlayLocation.textContent = 'Menu';
});

window.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  if (event.key.toLowerCase() === 'r') {
    game.events.emit('recording:reset-scene');
  }

  if (event.key.toLowerCase() === 't') {
    game.events.emit('recording:toggle-title-card');
  }

  if (event.key.toLowerCase() === 'h') {
    setOverlayVisible(debugUi.hidden);
  }

  if (event.key.toLowerCase() === 'f') {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
    openControls();
  }

  if (event.key === 'Escape') {
    closeControlsScreen();
  }
});
