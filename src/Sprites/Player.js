class Player {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerMovementSpeed) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.playerMovementSpeed = playerMovementSpeed;

        this.characterSprite = scene.add.sprite(x, y, texture, frame);
        this.dinghyLeftSprite = null;
        this.dinghyRightSprite = null;

        // set some size constants to reference
        this.dinghyRadius = 16;
        this.rx = 16;
        this.ry = 16;
    }

    /**
     * Sets the player instance's references to these dinghy sprites, and destroys the old dinghy sprites
     */
    swapToNewDinghy(dinghyLeftSprite, dinghyRightSprite) {
        if (this.dinghyLeftSprite) this.dinghyLeftSprite.destroy();
        if (this.dinghyRightSprite) this.dinghyRightSprite.destroy();

        this.dinghyLeftSprite = dinghyLeftSprite;
        this.dinghyRightSprite = dinghyRightSprite;

        //TODO: set dinghy xy to match player. or the other way around idk
    }

    takeDamage() {
    }



    update(time, delta, timescale = 1) {
        if (timescale === 0) return;

        // movement
        if (this.leftKey.isDown) {
            this.x -= delta * timescale * this.playerMovementSpeed;
            if (this.x < this.dinghyRadius) {
                this.x = this.dinghyRadius;
            }
        }
        if (this.rightKey.isDown) {
            this.x += delta * timescale * this.playerMovementSpeed;
            if (this.x > game.config.width - this.dinghyRadius) {
                this.x = game.config.width - this.dinghyRadius;
            }
        }
        this.characterSprite.x = this.x;
        this.characterSprite.y = this.y;
    }
}

class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, playerSpeed) {
        super(scene, x, y, texture, frame);

        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.playerSpeed = playerSpeed;

        this.facingRight = true;

        scene.add.existing(this);
        return this;
    }

    damagePlayer() {
    }

    update(time, delta, timescale) {
        delta = delta * timescale;
        if (delta === 0) return; // this happens when scene.playerTime is 0

        // player movement
        if (this.leftKey.isDown && !this.rightKey.isDown) {
            this.x -= delta * this.playerSpeed;
            this.facingRight = false;
        }
        if (this.rightKey.isDown && !this.leftKey.isDown) {
            this.x += delta * this.playerSpeed;
            this.facingRight = true;
        }

        // stop player from going off screen
        // let maxX = game.config.width - this.my.sprite.dinghyRight.displayWidth;
        // let minX = this.my.sprite.dinghyRight.displayWidth;
        // if (this.playerX > maxX) this.playerX = maxX;
        // if (this.playerX < minX) this.playerX = minX;
    }
}