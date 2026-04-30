import Phaser from 'phaser';
import './style.css';
import './ui/menuOverlay.css';
import './ui/runtimeOverlay.css';
import './ui/runDecisionOverlay.css';
import './ui/codexOverlay.css';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'app',
  width: 960,
  height: 640,
  backgroundColor: '#07090f',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene],
};

new Phaser.Game(config);
