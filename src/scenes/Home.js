export class Home extends Phaser.Scene {

    constructor() {
        super('Home');
    }

    preload() {
        //this.load.image('background', 'assets/bg.png');
    }

    create() {
        this.add.text(640, 600, "Use AD to move left and right", { fontSize: '25px', color: '#fff' }).setOrigin(0.5);
        this.add.text(640, 635, "Press spacebar to shoot", { fontSize: '25px', color: '#fff' }).setOrigin(0.5);

        // Title
        this.add.text(640, 250, 'Cosmic Outlaw', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        //Text Button
        const startText = this.add.text(640, 400, 'START GAME', {
            fontSize: '36px',
            color: '#0080ff',
            fontStyle: 'bold',
            
            backgroundColor: '#00000055',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        startText.setInteractive({ useHandCursor: true }); // makes it clickable and shows a hand cursor

        startText.on('pointerover', () => {
            startText.setStyle({ color: '#e380f7ff' }); // hover effect
        });

        startText.on('pointerout', () => {
            startText.setStyle({ color: '#0080ff' }); // reset color
        });

        startText.on('pointerdown', () => {
            this.scene.start('Start'); // go to the main game
        });

    }


}