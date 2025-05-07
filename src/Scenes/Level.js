let stats = {};
let GAME_ACTIVE = 0;
let GAME_OVER = 1;
let GAME_WIN = 2;

class Level extends Phaser.Scene {
    constructor() {
        super("level");
        this.statsInit();
        this.gameInit();
    }

    statsInit() {
        stats = {
            mermaidsKilled: 0,
            pointsPerMermaid: 50,
            pirateCratesKilled: 0,
            pointsPerPirateCrate: 150,
            bonusPoints: 0,
            score: 0
        };
    }

    gameInit() {
        this.my = {};
        this.my.sprite = {};
        this.my.ui = {};

        this.my.enemies = [];
        this.my.playerProjectiles = [];
        this.my.enemyProjectiles = [];
        
        // design variables
        this.defaultOceanScrollSpeed = 0.015
        this.oceanScrollSpeed = this.defaultOceanScrollSpeed; // pixels per ms
        this.playerMovementSpeed = 0.1; // pixels per ms
        this.playerBulletMovementSpeed = 0.2;

        // start next wave timer
        this.startNextWaveTimer = 0;
        this.startNextWaveTimerLength = 2000; // ms to wait before starting next wave

        this.playerTime = 1; // 1 is full speed, 0 is paused
        this.enemyTime = 1;
        this.currentWaveIndex = 0;

        this.gameState = GAME_ACTIVE;
    }
    
    preload() {
        this.load.json('wave-data', './src/WaveData.json');

        this.load.setPath("./assets/");
        
        this.load.spritesheet("monochrome-pirates", "sprites/tilemap_packed.png", {frameWidth: 16, frameHeight: 16});
        this.load.image("cannonball", "sprites/cannonball.png");
        
        this.load.image("ocean-background", "sprites/oceanBG.png");
        this.load.tilemapTiledJSON("ui-map", "tilemaps/life_score_ui.tmj");

        this.load.bitmapFont('mini-square-mono', 'fonts/Kenney-Mini-Square-Mono.png', 'fonts/Kenney-Mini-Square-Mono.xml');

        this.load.audio('water-ambience', 'audio/seaStormAmbience.wav');
        this.load.audio('retro-click', 'audio/retro-click.wav');
        this.load.audio('player-damage', 'audio/playerDamage.wav');
        this.load.audio('enemy-damage', 'audio/enemyDamage.wav');
        this.load.audio('player-shoot', 'audio/playerShoot.wav');
        this.load.audio('enemy-shoot', 'audio/enemyShoot.wav');
        
        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Tates Shmup</h2><body>Arrow keys to move, space to shoot, R to restart</body>';
    }
    
    create() {
        // key assignments
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // create ocean
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");
        
        // create UI at the bottom of the screen
        this.my.ui.map = this.make.tilemap({key: "ui-map"});
        this.my.ui.tiles = this.my.ui.map.addTilesetImage("monochrome-pirates", "monochrome-pirates");
        this.my.ui.layer = this.my.ui.map.createLayer("Base", this.my.ui.tiles, 0, 256);
        this.my.ui.layer.depth = 6;

        this.my.ui.scoreText = this.add.bitmapText(240, 272-8, 'mini-square-mono', '7654');
        this.my.ui.scoreText.depth = 7;
        this.my.ui.scoreText.fontSize = 24;
        this.my.ui.scoreText.letterSpacing = 0;

        this.my.ui.winLoseText = this.add.bitmapText(160+3, 72-9, 'mini-square-mono', 'GAME OVER');
        this.my.ui.winLoseText.setOrigin(0.5, 0.5).setCenterAlign();
        this.my.ui.winLoseText.depth = 7;
        this.my.ui.winLoseText.fontSize = 48;
        this.my.ui.winLoseText.letterSpacing = 0;
        this.my.ui.winLoseText.maxWidth = 200;
        this.my.ui.winLoseText.visible = false;
        
        this.my.ui.scoreResultText = this.add.bitmapText(160+1, 144-8, 'mini-square-mono', 'SCORE: 0000');
        this.my.ui.scoreResultText.setOrigin(0.5, 0).setCenterAlign();
        this.my.ui.scoreResultText.depth = 7;
        this.my.ui.scoreResultText.fontSize = 24;
        this.my.ui.scoreResultText.letterSpacing = 0;
        this.my.ui.scoreResultText.maxWidth = 200;
        this.my.ui.scoreResultText.visible = false;

        // create player sprite
        this.my.sprite.player = new Player(this, 160, 232, this.playerMovementSpeed, this.leftKey, this.rightKey, this.spaceKey);
        this.my.sprite.player.depth = 4;
        this.my.sprite.dinghy = new Dinghy(this, this.my.sprite.player.x, this.my.sprite.player.y + this.my.sprite.player.displayHeight/2);
        this.my.sprite.dinghy.depth = 1;
        this.my.sprite.dinghy.followPlayer(this.my.sprite.player);

        // create extra dinghies
        this.my.extraDinghies = [];
        for (let x = 32; x <= 128; x += 32) {
            let dinghy = new Dinghy(this, x, game.config.height - 8);
            dinghy.depth = 6;
            this.my.extraDinghies.push(dinghy);
        }

        // load first wave
        this.waveData = this.cache.json.get('wave-data');
        this.loadWave(this.currentWaveIndex);

        // start ocean ambience
        this.my.seaStormAmbience = this.sound.add('water-ambience', {loop: true, volume: 0.2, mute: true});
        this.my.seaStormAmbience.play();

        this.input.keyboard.on('keydown-I', () => {
            this.my.seaStormAmbience.setMute(!this.my.seaStormAmbience.mute);
        });
    }

    loadWave(waveIndex) {
        let wave = this.waveData[waveIndex];
        this.oceanScrollSpeed = this.defaultOceanScrollSpeed * this.waveData[waveIndex].oceanSpeed;
        for (let pos of wave.mermaids) {
            this.spawnMermaid(8 + pos[0] * 16, 8 + pos[1] * 16);
        }
        for (let pos of wave.pirateCrates) {
            this.spawnPirateCrate(8 + pos[0] * 16, 8 + pos[1] * 16);
        }
    }

    spawnMermaid(x, y) {
        let mermaid = new Mermaid(this, x, y);
        mermaid.depth = 2;
        this.my.enemies.push(mermaid);
    }

    spawnPirateCrate(x, y) {
        let pirateCrate = new PirateCrate(this, x, y);
        pirateCrate.depth = 2;
        pirateCrate.crate.depth = 1;
        this.my.enemies.push(pirateCrate);
    }

    spawnPlayerBullet() {
        let shootDetune = (Math.random() * 200) - 100; // -100 to 100
        let shootVolume = (Math.random() * 0.5) + 0.2; // 0.2 to 0.7
        this.sound.play('player-shoot', {detune: shootDetune, volume: shootVolume});
        

        let bullet = new Projectile(this, this.my.sprite.player.x, this.my.sprite.player.y, "cannonball", null, 4);
        bullet.depth = 5;
        bullet.flipY = true;
        bullet.setVelocity(this.playerBulletMovementSpeed, -Math.PI/2);
        this.my.playerProjectiles.push(bullet);
    }

    addEnemyProjectile(projectile) {
        let shootDetune = (Math.random() * 200) - 100; // -100 to 100
        let shootVolume = (Math.random() * 0.5) + 0.2; // 0.2 to 0.7
        this.sound.play('enemy-shoot', {detune: shootDetune, volume: shootVolume});

        projectile.depth = 3;
        this.my.enemyProjectiles.push(projectile);
    }

    getPlayerPosition() {
        return {x: this.my.sprite.player.x, y: this.my.sprite.player.y};
    }

    damagePlayer() {
        if (this.my.sprite.player.isInvincible) return;

        this.sound.play('player-damage');
        this.my.sprite.player.startRecovery();

        if (this.my.extraDinghies.length === 0) {
            this.gameOver();
            return;
        }
        else {
            this.my.extraDinghies.pop().destroy();
        }
    }

    updateScore() {
        stats.score = stats.mermaidsKilled*stats.pointsPerMermaid + stats.pirateCratesKilled*stats.pointsPerPirateCrate + stats.bonusPoints;
        this.my.ui.scoreText.setText(('0000' + stats.score).slice(-4));
    }

    gameWin() {
        if (this.gameState === GAME_WIN) return;

        // destroy enemy projectiles
        for (let p of this.my.enemyProjectiles) {
            p.destroy();
        }
        this.my.enemyProjectiles = [];

        this.my.ui.scoreText.visible = false;

        this.my.ui.winLoseText.setText('YOU WIN');
        this.my.ui.winLoseText.visible = true;

        let extraLives = this.my.extraDinghies.length;
        stats.bonusPoints += extraLives*100;
        this.updateScore();
        let txt = 'LIVES:' + ('    ' + extraLives).slice(-4) + 
                 ' BONUS:' + ('    ' + extraLives*100).slice(-4) +
                 ' SCORE:' + ('    ' + stats.score).slice(-4);
        this.my.ui.scoreResultText.setText(txt);
        this.my.ui.scoreResultText.visible = true;

        this.oceanScrollSpeed = this.defaultOceanScrollSpeed;

        this.gameState = GAME_WIN;
    }

    gameOver() {
        if (this.gameState === GAME_OVER) return;

        this.my.ui.winLoseText.setText('GAME OVER');
        this.my.ui.winLoseText.visible = true;

        this.my.ui.scoreResultText.setText('PRESS R TO RESTART');
        this.my.ui.scoreResultText.visible = true;

        this.playerTime = 0;
        this.enemyTime = 0;

        this.gameState = GAME_OVER;
    }
    
    update(time, delta) {
        // debug counter
        // this.debugCounter += this.enemyTime;
        // if (this.debugCounter % 120 === 0) {
        //     let fish = new Projectile(this, 0, 0, "monochrome-pirates", 119, 6);
        //     fish.depth = 2;
        //     fish.setVelocity(0.1, Math.PI/4);
        //     this.my.enemyProjectiles.push(fish);
        // }

        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            // if (this.playerTime === 1) this.playerTime = 0;
            // else if (this.playerTime === 0) this.playerTime = 1;
            for (let enemy of this.my.enemies) {
                enemy.kill();
            }
            this.my.enemies = [];
        }

        if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
            if (this.enemyTime === 1) this.enemyTime = 0;
            else if (this.enemyTime === 0) this.enemyTime = 1;
        }

        // resets the game
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start('level');
            this.statsInit();
            this.gameInit();
            return;
        }

        // scroll the ocean background
        this.my.sprite.oceanBG.tilePositionY -= delta * this.enemyTime * this.oceanScrollSpeed;
        
        // update player
        this.my.sprite.player.update(time, delta, this.playerTime);
        this.my.sprite.dinghy.update();

        // update enemies
        for (let enemy of this.my.enemies) {
            enemy.update(time, delta, this.enemyTime, this.oceanScrollSpeed);
        }

        // update player projectiles
        for (let i = 0; i < this.my.playerProjectiles.length; i++) {
            let p = this.my.playerProjectiles[i];
            p.update(time, delta, this.playerTime);
            // if off screen, destroy
            if (p.x < -(p.displayWidth/2) ||
                    p.x > game.config.width + (p.displayWidth/2) ||
                    p.y < -(p.displayHeight/2) ||
                    p.y > game.config.height + (p.displayHeight/2)) {
                p.destroy();
                this.my.playerProjectiles.splice(i, 1);
                i--; // for loop removal
            }
        }

        // update enemy projectiles
        for (let i = 0; i < this.my.enemyProjectiles.length; i++) {
            let p = this.my.enemyProjectiles[i];
            p.update(time, delta, this.enemyTime);
            // if off screen, destroy
            if (p.x < -(p.displayWidth/2) ||
                    p.x > game.config.width + (p.displayWidth/2) ||
                    p.y < -(p.displayHeight/2) ||
                    p.y > game.config.height + (p.displayHeight/2)) {
                p.destroy();
                this.my.enemyProjectiles.splice(i, 1);
                i--; // for loop removal
            }
        }

        // check playerProjectile collision with enemy
        for (let i = 0; i < this.my.enemies.length; i++) {
            let enemy = this.my.enemies[i];
            let enemyDamage = 0;
            for (let j = 0; j < this.my.playerProjectiles.length; j++) {
                let p = this.my.playerProjectiles[j];
                if (Math.abs(enemy.x - p.x) < enemy.rx + p.rx && Math.abs(enemy.y - p.y) < enemy.ry + p.ry) {
                    enemyDamage++;
                    this.sound.play('enemy-damage');
                    p.destroy();
                    this.my.playerProjectiles.splice(j, 1);
                    j--; // for loop removal
                }
            }
            if (!enemyDamage) continue; // skip the following code if the enemy doesn't take damage
            enemy.takeDamage(enemyDamage);
            if (enemy.isDead) {
                this.sound.play('retro-click');
                this.my.enemies.splice(i, 1);
                i--; // for loop removal
            }
        }

        // check enemyProjectile collision with player
        let playerHit = false;
        for (let i = 0; i < this.my.enemyProjectiles.length; i++) {
            let p = this.my.enemyProjectiles[i];
            let player = this.my.sprite.player;
            if (Math.abs(player.x - p.x) < player.rx + p.rx && Math.abs(player.y - p.y) < player.ry + p.ry) {
                playerHit = true;
                p.destroy();
                this.my.enemyProjectiles.splice(i, 1);
                i--; // for loop removal
            }
        }

        // check enemy collision with player's horizontal
        // also deactive enemy attacks within two tiles of player y
        for (let i = 0; i < this.my.enemies.length; i++) {
            let enemy = this.my.enemies[i];
            let player = this.my.sprite.player;
            if (enemy.canShoot && Math.abs(player.y - enemy.y) < 48) enemy.canShoot = false; 
            if (Math.abs(player.y - enemy.y) < player.ry + enemy.ry) {
                playerHit = true;
                enemy.destroy();
                this.my.enemies.splice(i, 1);
                i--;
            }
        }
        if (playerHit) this.damagePlayer(); // player can only be damaged once per frame

        if (this.gameState === GAME_ACTIVE) this.updateScore();

        // move to next wave if all enemies are dead
        if (this.my.enemies.length === 0) {
            if (this.currentWaveIndex === this.waveData.length - 1) {
                this.gameWin();
            }
            else {
                // increment timer, this will go until next wave is loaded
                this.startNextWaveTimer += delta * this.enemyTime;
            }
        }

        // load next wave when timer is up
        if (this.startNextWaveTimer > this.startNextWaveTimerLength) {
            this.currentWaveIndex++;
            this.loadWave(this.currentWaveIndex);
            this.startNextWaveTimer = 0;
        }
    }
}