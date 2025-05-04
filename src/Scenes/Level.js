class Level extends Phaser.Scene {
    constructor() {
        super("level");

        this.my = {};
        this.my.sprite = {};

        this.my.enemies = [];
        this.my.playerProjectiles = [];
        this.my.enemyProjectiles = [];
        
        // design variables
        this.oceanScrollSpeed = 0.01; // pixels per ms
        this.playerMovementSpeed = 0.1; // pixels per ms
        this.playerBulletMovementSpeed = 0.2;

        this.playerTime = 1; // 1 is full speed, 0 is paused
        this.enemyTime = 1;
        
        this.debugCounter = 0;
    }
    
    preload() {
        this.load.setPath("./assets/");
        
        this.load.spritesheet("monochrome-pirates", "sprites/tilemap_packed.png", {frameWidth: 16, frameHeight: 16});
        this.load.image("cannonball", "sprites/cannonball.png");
        
        this.load.image("ocean-background", "sprites/oceanBG.png");
        this.load.tilemapTiledJSON("ui-map", "tilemaps/life_score_ui.tmj");
        
        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Tates Shmup</h2>';
    }
    
    create() {
        // key assignments
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        // this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);

        // create ocean
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");
        
        // create UI at the bottom of the screen
        this.my.UImap = this.make.tilemap({key: "ui-map"});
        this.my.UItiles = this.my.UImap.addTilesetImage("monochrome-pirates", "monochrome-pirates");
        this.my.UIlayer = this.my.UImap.createLayer("Base", this.my.UItiles, 0, 256);
        this.my.UIlayer.depth = 6;

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

        // debug enemy
        // let debugEnemy = new Enemy(this, game.config.width/2, 20, "monochrome-pirates", 124, 8, 8, 10);
        // debugEnemy.depth = 3;
        // this.my.enemies.push(debugEnemy);
        for (let x = 64; x <= game.config.width - 64; x += 32) {
            this.spawnMermaid(x, 32);
        }
    }

    spawnMermaid(x, y) {
        let mermaid = new Mermaid(this, x, y);
        mermaid.depth = 2;
        this.my.enemies.push(mermaid);
    }

    spawnPlayerBullet() {
        let bullet = new Projectile(this, this.my.sprite.player.x, this.my.sprite.player.y, "cannonball", null, 4);
        bullet.depth = 5;
        bullet.flipY = true;
        bullet.setVelocity(this.playerBulletMovementSpeed, -Math.PI/2);
        this.my.playerProjectiles.push(bullet);
    }

    addEnemyProjectile(projectile) {
        projectile.depth = 3;
        this.my.enemyProjectiles.push(projectile);
    }

    getPlayerPosition() {
        return {x: this.my.sprite.player.x, y: this.my.sprite.player.y};
    }

    damagePlayer() {
        if (this.my.sprite.player.isInvincible) return;

        if (this.my.extraDinghies.length === 0) {
            this.gameOver();
            return;
        }
        else {
            console.log("yeeeouch!!");
            this.my.extraDinghies.pop().destroy();
        }
    }

    gameOver() {
        console.log("GAME OVER!!!!!!!!!");
        this.playerTime = 0;
        this.enemyTime = 0;
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

        // if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
        //     if (this.playerTime === 1) this.playerTime = 0;
        //     else if (this.playerTime === 0) this.playerTime = 1;
        // }

        // if (Phaser.Input.Keyboard.JustDown(this.oKey)) {
        //     if (this.enemyTime === 1) this.enemyTime = 0;
        //     else if (this.enemyTime === 0) this.enemyTime = 1;
        // }

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
                    p.destroy();
                    this.my.playerProjectiles.splice(j, 1);
                    j--; // for loop removal
                }
            }
            if (!enemyDamage) continue; // skip the following code if the enemy doesn't take damage
            enemy.takeDamage(enemyDamage);
            if (enemy.isDead) {
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
            if (enemy.canShoot && Math.abs(player.y - enemy.y) < 64) enemy.canShoot = false; 
            if (Math.abs(player.y - enemy.y) < player.ry + enemy.ry) {
                playerHit = true;
                enemy.kill();
                this.my.enemies.splice(i, 1);
                i--;
            }
        }
        if (playerHit) this.damagePlayer(); // player can only be damaged once per frame
    }
}