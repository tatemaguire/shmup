class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, shootKey, playerMovementSpeed) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);

        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.shootKey = shootKey;
        this.playerMovementSpeed = playerMovementSpeed;

        this.facingRight = true;

        // collision design variables
        this.movementCollisionRadius = 16; // radius of box that collides with edge of screen
        this.rx = this.displayWidth/2; // x radius of box for bullet collision
        this.ry = this.displayHeight/2; // y radius of box for bullet collision
    }
    
    update(time, delta, timescale = 1) {
        if (timescale === 0) return;

        if (this.leftKey.isDown && !this.rightKey.isDown) {
            this.x -= delta * timescale * this.playerMovementSpeed;
            if (this.x < this.movementCollisionRadius) {
                this.x = this.movementCollisionRadius;
            }
            this.facingRight = false;
        }
        if (this.rightKey.isDown && !this.leftKey.isDown) {
            this.x += delta * timescale * this.playerMovementSpeed;
            if (this.x > game.config.width - this.movementCollisionRadius) {
                this.x = game.config.width - this.movementCollisionRadius;
            }
            this.facingRight = true;
        }

        if (this.shootKey.isDown) {
            this.scene.spawnPlayerBullet();
        }

    }
}