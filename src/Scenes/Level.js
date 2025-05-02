class Level extends Phaser.Scene {
    constructor() {
        super("level");

        this.my = {sprite: {}};
        // bullet array
        this.my.projectiles = [];
        
        // design variables
        this.oceanScrollSpeed = 0.02; // pixels per ms
        this.playerMovementSpeed = 0.1; // pixels per ms
        this.playerBulletMovementSpeed = 0.2; // pixels per ms
        this.cooldownLength = 200; // ms
        this.cooldownTimer = 0;
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

        // create player sprites
        this.my.sprite.player = new Player(this, 160, 232, "monochrome-pirates", 125, this.leftKey, this.rightKey, this.spaceKey, this.playerMovementSpeed);
        this.my.sprite.player.depth = 4;
        this.my.sprite.dinghyLeft = this.add.sprite(this.my.sprite.player.x, this.my.sprite.player.y, "monochrome-pirates", 100);
        this.my.sprite.dinghyRight = this.add.sprite(this.my.sprite.player.x, this.my.sprite.player.y, "monochrome-pirates", 101);
        this.my.sprite.dinghyLeft.setOrigin(1, 0);
        this.my.sprite.dinghyRight.setOrigin(0, 0);

        // create extra dinghies
        this.my.extraLives = []; // this array holds 5 items, which are arrays of length 2, for each half
        for (let x = 32; x <= 128; x += 32) {
            let left = this.add.sprite(x, 272, "monochrome-pirates", 100);
            let right = this.add.sprite(x, 272, "monochrome-pirates", 101);
            left.setOrigin(1, 0);
            right.setOrigin(0, 0);
            this.my.extraLives.push([left, right]);
        }
    }

    // when player shoots them, and become invisible when off screen. only visible bullets move/collide
    spawnPlayerBullet() {
        let bullet = this.add.sprite(this.my.sprite.player.x, this.my.sprite.player.y - this.my.sprite.player.displayHeight/2, "cannonball");
        this.my.projectiles.push({sprite: bullet, dx: 0, dy: -this.playerBulletMovementSpeed, playerTime: true});
    }

    damagePlayer() {
        if (this.my.extraLives.length === 0) {
            this.gameOver();
            return;
        }
        else {
            console.log("yeeeouch!!");
            let extraDinghy = this.my.extraLives.pop();
            extraDinghy[0].destroy();
            extraDinghy[1].destroy();
        }
    }

    gameOver() {
        console.log("GAME OVER!!!!!!!!!");
    }
    
    update(time, delta) {
        // debug counter
        // this.debugCounter += this.enemyTime;
        // if (this.debugCounter % 120 === 0) {
        //     let fish = this.add.sprite(8, 8, "monochrome-pirates", 119);
        //     this.my.projectiles.push({sprite: fish, dx: 0.141421, dy: 0.141421, playerTime: false});
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
        
        this.my.sprite.player.update(time, delta, this.playerTime);
        // TODO: update dinghy position to the player

        // projectile movement
        let itemIndex = 0;
        for (let item of this.my.projectiles) {
            // move projectile
            if (item.playerTime) {
                item.sprite.x += delta * this.playerTime * item.dx;
                item.sprite.y += delta * this.playerTime * item.dy;
            }
            else {
                item.sprite.x += delta * this.enemyTime * item.dx;
                item.sprite.y += delta * this.enemyTime * item.dy;
            }
            // if it's off screen, destroy it
            if (item.sprite.x < -(item.sprite.displayWidth / 2) ||
                    item.sprite.x > game.config.width + (item.sprite.displayWidth / 2) ||
                    item.sprite.y < -(item.sprite.displayHeight / 2) ||
                    item.sprite.y > game.config.height + (item.sprite.displayHeight / 2)) {
                item.sprite.destroy();
                this.my.projectiles.splice(itemIndex, 1);
                itemIndex--;
            }
            itemIndex++;
        }

        // shoot input
        this.cooldownTimer += delta * this.playerTime;
        if (this.spaceKey.isDown) {
            if (this.cooldownTimer > this.cooldownLength) {
                this.spawnPlayerBullet();
                this.cooldownTimer = 0;
            }
        }
    }
}