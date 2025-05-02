class Level extends Phaser.Scene {
    constructor() {
        super("level");

        this.my = {sprite: {}};
        // bullet array
        this.my.playerProjectiles = [];
        this.my.enemyProjectiles = [];
        
        // design variables
        this.oceanScrollSpeed = 0.02; // pixels per ms
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
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);

        // create ocean
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");
        
        // create UI at the bottom of the screen
        this.my.UImap = this.make.tilemap({key: "ui-map"});
        this.my.UItiles = this.my.UImap.addTilesetImage("monochrome-pirates", "monochrome-pirates");
        this.my.UIlayer = this.my.UImap.createLayer("Base", this.my.UItiles, 0, 256);

        // create player sprite
        this.my.sprite.player = new Player(this, 160, 232, "monochrome-pirates", 125, this.leftKey, this.rightKey, this.spaceKey, this.playerMovementSpeed);
        this.my.sprite.player.depth = 5;
        this.my.sprite.dinghy = new Dinghy(this, this.my.sprite.player.x, this.my.sprite.player.y + this.my.sprite.player.displayHeight/2);
        this.my.sprite.dinghy.depth = 1;
        this.my.sprite.dinghy.followPlayer(this.my.sprite.player);

        // create extra dinghies
        this.my.extraDinghies = [];
        for (let x = 32; x <= 128; x += 32) {
            this.my.extraDinghies.push(new Dinghy(this, x, game.config.height - 8));
        }
    }

    // when player shoots them, and become invisible when off screen. only visible bullets move/collide
    spawnPlayerBullet() {
        let bullet = new Projectile(this, this.my.sprite.player.x, this.my.sprite.player.y, "cannonball", null);
        bullet.depth = 4;
        bullet.setVelocity(this.playerBulletMovementSpeed, 90);
        this.my.playerProjectiles.push(bullet);
    }

    damagePlayer() {
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
        //     this.damagePlayer();
        //     let fish = this.add.sprite(8, 8, "monochrome-pirates", 119);
        //     this.my.playerProjectiles.push({sprite: fish, dx: 0.141421, dy: 0.141421, playerTime: false});
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
    }
}