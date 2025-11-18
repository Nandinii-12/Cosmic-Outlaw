import { Start } from './scenes/Start.js';
import { Home } from './scenes/Home.js';
import { endPage } from './scenes/endPage.js';

const config = {
    type: Phaser.AUTO,
    title: 'Cosmic Outlaw',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    physics: {default: "arcade"},
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Home,
        Start,
        endPage
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            