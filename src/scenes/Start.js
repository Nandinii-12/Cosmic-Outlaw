export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/starrySky.jpg');
        this.load.image('green enemy', 'assets/green_enemy.png');
        this.load.image('blue enemy', 'assets/blue_enemy.png');
        this.load.image('pink enemy', 'assets/pink_enemy.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('projectile', 'assets/projectile.png');
        this.load.image('blueBullet', 'assets/blueBullet.png');
        this.load.audio('alienDie', 'assets/alienDie.ogg');
        this.load.audio('alienShoot', 'assets/alienShoot.ogg');
        this.load.audio('gunShoot', 'assets/gunShoot.ogg');

    }

    create() {
        // --- Setup ---
        this.level = 1; // start at level 1
        this.background = this.add.sprite(640, 320, 'background').setScale(1.6);
        this.levelTransition = false;

        //Sounds
        this.alienDie = this.sound.add('alienDie');
        this.alienShoot = this.sound.add('alienShoot');
        this.gunShoot = this.sound.add('gunShoot');

        // Player
        this.player = this.physics.add.sprite(640, 620, 'player').setScale(0.65);
        this.player.speed = 300;
        this.player.score = 0;
        this.player.lives = 10;

        // Text
        this.scoreText = this.add.text(20, 20, `Score: ${this.player.score}`, { fontSize: '24px', fill: '#ffffff' });
        this.livesText = this.add.text(20, 50, `Lives: ${this.player.lives}`, { fontSize: '24px', fill: '#ffffff' });
        this.levelText = this.add.text(1100, 20, `Level: ${this.level}`, { fontSize: '24px', fill: '#ffffff' });

        // Input
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Groups
        this.bullets = this.physics.add.group({ defaultKey: 'projectile', maxSize: 20 });
        this.enemyBullets = this.physics.add.group({ maxSize: 40 });

        // Create first wave
        this.enemies = [];
        this.createWave(this.level);

        // Enemy shooting timer
        this.time.addEvent({
            delay: 1500,
            callback: this.enemyShoot,
            callbackScope: this,
            loop: true
        });

        // Collisions
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerCollision, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.handlePlayerCollision, null, this);
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHitEnemy, null, this);
    }

    createWave(level) {
        const topRowY = 200;
        const bottomRowY = 320;

        // Base setup (level 1)
        let topEnemies = ['green enemy', 'blue enemy', 'pink enemy'];
        let bottomEnemies = ['pink enemy', 'blue enemy', 'green enemy'];

        // Add extra enemies depending on level
        if (level >= 2) { // +2 pink
            topEnemies.push('pink enemy');
            bottomEnemies.push('pink enemy');
        }
        if (level >= 3) { // +2 blue
            topEnemies.push('blue enemy');
            bottomEnemies.push('blue enemy');
        }
        if (level >= 4) { // +2 green
            topEnemies.push('green enemy');
            bottomEnemies.push('green enemy');
        }

        // Create top enemies (move right)
        for (let i = 0; i < topEnemies.length; i++) {
            const enemy = this.physics.add.sprite(200 + i * 150, topRowY, topEnemies[i]).setScale(0.65);
            enemy.speed = 100;
            enemy.direction = 1;
            enemy.isAttacking = false;
            enemy.hasHitPlayer = false;
            this.enemies.push(enemy);
        }

        // Create bottom enemies (move left)
        for (let i = 0; i < bottomEnemies.length; i++) {
            const enemy = this.physics.add.sprite(1000 - i * 150, bottomRowY, bottomEnemies[i]).setScale(0.65);
            enemy.speed = 100;
            enemy.direction = -1;
            enemy.isAttacking = false;
            enemy.hasHitPlayer = false;
            this.enemies.push(enemy);
        }

        //Re-enable collisions for new enemies
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerCollision, null, this);

    }

    update(time, delta) {
        const dt = delta / 1000;

        // --- Player movement ---
        if (!this.player.isFrozen) {
            if (this.left.isDown) this.player.x -= this.player.speed * dt;
            else if (this.right.isDown) this.player.x += this.player.speed * dt;
            else this.player.setVelocityX(0);
        } else this.player.setVelocityX(0);

        // --- Shooting ---
        if (Phaser.Input.Keyboard.JustDown(this.space)) this.shootBullet();

        // --- Move player bullets ---
        this.bullets.children.each(bullet => {
            if (bullet.active) {
                bullet.y -= 600 * dt;
                if (bullet.y < -50) bullet.disableBody(true, true);
            }
        });

        // --- Enemy movement ---
        this.enemies.forEach(enemy => {
            if (!enemy.active || enemy.isAttacking || enemy.isFrozen) return;
            enemy.x += enemy.speed * dt * enemy.direction;
            if (enemy.direction === 1 && enemy.x > 1380) enemy.x = -100;
            if (enemy.direction === -1 && enemy.x < -100) enemy.x = 1380;
        });

        // --- Enemy bullets movement ---
        this.enemyBullets.children.each(bullet => {
            if (bullet.active && !bullet.isFrozen) {
                bullet.y += 250 * dt;
                if (bullet.y > 800) bullet.disableBody(true, true);
            }
        });

        // --- Green alien random attack ---
        if (Phaser.Math.Between(0, 1000) < 3) {
            const greens = this.enemies.filter(e => e.active && e.texture.key === 'green enemy' && !e.isAttacking);
            if (greens.length > 0) {
                const g = Phaser.Utils.Array.GetRandom(greens);
                g.isAttacking = true;
                this.physics.moveToObject(g, this.player, 200);
            }
        }

        // --- Handle off-screen green enemies ---
        this.enemies.forEach(e => {
            if (e.texture.key === 'green enemy' && e.isAttacking && e.active && e.y > this.scale.height + 50) {
                e.disableBody(true, true);
                e.isAttacking = false;
                e.hasHitPlayer = false;
            }
        });

        // --- Lose Condition ---
        if (this.player.lives <= 0) {
            this.scene.start('End', { result: 'lose', score: this.player.score, level: this.level });
        }

        // --- Check if all enemies cleared ---
        if (!this.levelTransition && this.enemies.every(e => !e.active)) {
            if (this.level < 4) this.nextLevel();
            else this.scene.start('End', { result: 'win', score: this.player.score, level: this.level });
        }
    }

    nextLevel() {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
        this.levelTransition = true; // prevent win check

        // Clear old enemies + bullets
        this.enemies = [];
        this.enemyBullets.clear(true, true);
        this.bullets.clear(true, true);

        // Reset player position
        this.player.x = 640;
        this.player.y = 620;

        // Show transition message
        const readyText = this.add.text(640, 360, `Level ${this.level} — Get Ready!`, {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Delay before next wave
        this.time.delayedCall(2000, () => {
            readyText.destroy();
            this.createWave(this.level);
            this.levelTransition = false; // resume win check
            this.player.isFrozen = false;
        });
        this.player.isFrozen = true;
    }

 
    shootBullet() {
        const bullet = this.bullets.get();
        if (bullet) {
            bullet.enableBody(true, this.player.x, this.player.y - 50, true, true);
            bullet.setScale(1.2);
            bullet.body.setVelocityY(-600);
            bullet.body.setAllowGravity(false);
        }
        this.gunShoot.play();
    }

    enemyShoot() {
        const shooters = this.enemies.filter(e => e.active && e.texture.key === 'blue enemy');
        if (shooters.length === 0) return;
        const shooter = Phaser.Utils.Array.GetRandom(shooters);
        const bullet = this.enemyBullets.get(0, 0, 'blueBullet');
        if (bullet) {
            bullet.enableBody(true, shooter.x, shooter.y + 30, true, true);
            bullet.setScale(0.8);
            bullet.body.setVelocityY(300);
            bullet.body.setAllowGravity(false);
        }
        this.alienShoot.play();
    }

    handlePlayerCollision(player, obj) {
        if (!player.isFrozen) {
            player.setTint(0xff0000);
            player.isFrozen = true;

            this.time.delayedCall(500, () => {
                if (player.active) {
                    player.clearTint();
                    player.isFrozen = false;
                }
            });

            if (obj.texture.key === 'green enemy' && !obj.hasHitPlayer) {
                player.lives -= 2;
                obj.hasHitPlayer = true;
                obj.disableBody(true, true);
            } else if (obj.texture.key === 'blueBullet') {
                player.lives -= 1;
                obj.destroy();
            }

            this.alienDie.play();
            this.livesText.setText(`Lives: ${this.player.lives}`);
        }
    }

    handleBulletHitEnemy(bullet, enemy) {
        enemy.disableBody(true, true);
        bullet.disableBody(true, true);
        this.player.score += 1;
        this.scoreText.setText(`Score: ${this.player.score}`);
        this.alienDie.play();
    }
}
