class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGame");
        this.my = {sprite: {}};

        // design variables
        this.oceanSpeed = 0.02; // pixels per ms
        this.playerSpeed = 0.1; // pixels per ms
        this.cooldownLength = 500; // ms

        this.playerX = 160;
        this.playerY = 248;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.spritesheet("monochrome-pirates", "sprites/tilemap_packed.png", {frameWidth: 16, frameHeight: 16});
        this.load.image("ocean-background", "sprites/oceanBG.png");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Tates Shmup</h2>';
    }

    create() {
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");

        // create player sprites (dinghy + character)
        this.my.sprite.dinghyLeft = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 100);
        this.my.sprite.dinghyRight = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 101);
        this.my.sprite.dinghyLeft.setOrigin(1, 0);
        this.my.sprite.dinghyRight.setOrigin(0, 0);
        this.my.sprite.player = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 125);
        
        // key assignments
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // cooldown timer
        this.cooldownTimer = 0;
    }

    spawnPlayerBullet(x, y) {
        console.log("launch bullet");
        //TODO:
    }
    
    update(time, delta) {
        // scroll the ocean
        let oceanScrollDelta = delta * this.oceanSpeed;
        // scroll background
        this.my.sprite.oceanBG.tilePositionY -= oceanScrollDelta;
        
        // movement input
        if (this.leftKey.isDown) {
            this.playerX -= delta * this.playerSpeed;
            // flip dinghy, change origins so the two tiles switch places
            this.my.sprite.dinghyLeft.flipX = true;
            this.my.sprite.dinghyRight.flipX = true;
            this.my.sprite.dinghyLeft.setOrigin(0, 0);
            this.my.sprite.dinghyRight.setOrigin(1, 0);
        }
        if (this.rightKey.isDown) {
            this.playerX += delta * this.playerSpeed;
            // return dinghy sprites to normal
            this.my.sprite.dinghyLeft.flipX = false;
            this.my.sprite.dinghyRight.flipX = false;
            this.my.sprite.dinghyLeft.setOrigin(1, 0);
            this.my.sprite.dinghyRight.setOrigin(0, 0);
        }

        // stop player from going off screen
        let maxX = game.config.width - this.my.sprite.dinghyRight.displayWidth;
        let minX = this.my.sprite.dinghyRight.displayWidth;
        if (this.playerX > maxX) this.playerX = maxX;
        if (this.playerX < minX) this.playerX = minX;

        // update sprite position
        this.my.sprite.dinghyLeft.x = this.playerX;
        this.my.sprite.dinghyRight.x = this.playerX;
        this.my.sprite.player.x = this.playerX;

        // shoot input
        this.cooldownTimer += delta;
        if (this.shootKey.isDown) {
            if (this.cooldownTimer > this.cooldownLength) {
                this.spawnPlayerBullet(this.playerX, this.playerY);
                this.cooldownTimer = 0;
            }
        }
    }
}