class Player extends Phaser.GameObjects.Sprite {
    static texture = "monochrome-pirates";
    static frame = 125;

    constructor(scene, x, y, playerMovementSpeed, leftKey, rightKey, shootKey) {
        super(scene, x, y, Player.texture, Player.frame);
        scene.add.existing(this);

        this.leftKey = leftKey;
        this.rightKey = rightKey;
        this.shootKey = shootKey;
        
        // movement design variables
        this.playerMovementSpeed = playerMovementSpeed;
        
        // collision design variables
        this.movementCollisionRadius = 16; // radius of box that collides with edge of screen
        this.rx = 0.5 * (this.displayWidth/2); // x radius of box for bullet collision
        this.ry = 0.5 * (this.displayHeight/2); // y radius of box for bullet collision
        
        // shooting design variables
        this.cooldownLength = 200; // ms
        
        // other
        this.facingRight = true;
        this.cooldownTimer = 0;

        // recovery invincibility count down
        // when this is set to a number, player has invincibility until it counts down to zero
        this.invincibilityCountdown = 0;
        this.invincibilityLength = 1000;

        this.isInvincible = false;
        this.canShoot = true;
    }

    startRecovery() {
        this.invincibilityCountdown = this.invincibilityLength;
    }
    
    update(time, delta, timescale = 1) {
        // invincibility during recovery
        if (this.invincibilityCountdown > 0) {
            this.invincibilityCountdown -= delta;

            this.isInvincible = true;
            this.canShoot = false;
            this.rotation += 0.012 * delta;
        }
        else {
            this.invincibilityCountdown = 0;
            
            this.isInvincible = false;
            this.canShoot = true;
            this.rotation = 0;
        }

        // if player time paused, don't do movement or shooting
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

        this.cooldownTimer += delta * timescale;
        if (this.canShoot && this.shootKey.isDown && this.cooldownTimer > this.cooldownLength) {
            this.scene.spawnPlayerBullet();
            this.cooldownTimer = 0;
        }
    }
}