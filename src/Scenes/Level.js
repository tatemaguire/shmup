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
        
        this.playerX = 160;
        this.playerY = 232;
        
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
        // create ocean
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");
        
        // create UI at the bottom of the screen
        this.my.UImap = this.make.tilemap({key: "ui-map"});
        this.my.UItiles = this.my.UImap.addTilesetImage("monochrome-pirates", "monochrome-pirates");
        this.my.UIlayer = this.my.UImap.createLayer("Base", this.my.UItiles, 0, 256);

        // create player sprites (dinghy + character)
        this.my.sprite.dinghyLeft = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 100);
        this.my.sprite.dinghyRight = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 101);
        this.my.sprite.dinghyLeft.setOrigin(1, 0);
        this.my.sprite.dinghyRight.setOrigin(0, 0);
        // this.my.sprite.player = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 125);

        // create extra dinghies
        this.my.extraLives = []; // this array holds 5 items, which are arrays of length 2, for each half
        for (let x = 32; x <= 128; x += 32) {
            let left = this.add.sprite(x, 272, "monochrome-pirates", 100);
            let right = this.add.sprite(x, 272, "monochrome-pirates", 101);
            left.setOrigin(1, 0);
            right.setOrigin(0, 0);
            this.my.extraLives.push([left, right]);
        }

        // key assignments
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        // this.oKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);

        this.my.player = new Player(this, this.playerX, this.playerY, "monochrome-pirates", 125,
                                this.leftKey, this.rightKey, this.playerMovementSpeed);
    }

    // when player shoots them, and become invisible when off screen. only visible bullets move/collide
    spawnPlayerBullet() {
        let bullet = this.add.sprite(this.playerX, this.playerY - this.my.sprite.player.displayHeight/2, "cannonball");
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
        this.playerTime = 0;
        this.enemyTime = 0;
    }
    
    update(time, delta) {
        // debug counter
        // this.debugCounter += this.enemyTime;
        // if (this.debugCounter % 120 === 0) {
        //     this.damagePlayer();
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
        
        // movement input
        // if (this.leftKey.isDown && !this.rightKey.isDown) {
        //     this.playerX -= delta * this.playerTime * this.playerMovementSpeed;
        //     // flip dinghy, change origins so the two tiles switch places
        //     this.my.sprite.dinghyLeft.flipX = true;
        //     this.my.sprite.dinghyRight.flipX = true;
        //     this.my.sprite.dinghyLeft.setOrigin(0, 0);
        //     this.my.sprite.dinghyRight.setOrigin(1, 0);
        // }
        // if (this.rightKey.isDown && !this.leftKey.isDown) {
        //     this.playerX += delta * this.playerTime * this.playerMovementSpeed;
        //     // return dinghy sprites to normal
        //     this.my.sprite.dinghyLeft.flipX = false;
        //     this.my.sprite.dinghyRight.flipX = false;
        //     this.my.sprite.dinghyLeft.setOrigin(1, 0);
        //     this.my.sprite.dinghyRight.setOrigin(0, 0);
        // }

        // stop player from going off screen
        // let maxX = game.config.width - this.my.sprite.dinghyRight.displayWidth;
        // let minX = this.my.sprite.dinghyRight.displayWidth;
        // if (this.playerX > maxX) this.playerX = maxX;
        // if (this.playerX < minX) this.playerX = minX;

        this.my.player.update(time, delta, this.playerTime);

        // update sprite position
        this.my.sprite.dinghyLeft.x = this.my.player.x;
        this.my.sprite.dinghyRight.x = this.my.player.y;
        // this.my.sprite.player.x = this.playerX;

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