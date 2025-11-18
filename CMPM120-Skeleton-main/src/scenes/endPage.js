export class endPage extends Phaser.Scene {
    constructor() {
        super('End');
    }

    init(data) {
        this.result = data.result; // 'win' or 'lose'
        this.score = data.score || 0;
        this.level = data.level;
    }

    create() {
        this.add.text(640, 220, this.result.toUpperCase(), { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
        this.add.text(640, 300, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
        this.add.text(640, 380, `Level: ${this.level}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

        //Text Button
        const replayText = this.add.text(640, 460, 'Replay', {
            fontSize: '36px',
            color: '#0080ff',
            fontStyle: 'bold',
            
            backgroundColor: '#00000055',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        replayText.setInteractive({ useHandCursor: true }); // makes it clickable and shows a hand cursor

        replayText.on('pointerover', () => {
            replayText.setStyle({ color: '#e380f7ff' }); // hover effect
        });

        replayText.on('pointerout', () => {
            replayText.setStyle({ color: '#0080ff' }); // reset color
        });

        replayText.on('pointerdown', () => {
            this.scene.start('Home'); // go to the main game
        });
    }
}
