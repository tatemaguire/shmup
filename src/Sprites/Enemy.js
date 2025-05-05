class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, rx, ry, maxHealth) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);

        this.rx = rx;
        this.ry = ry;
        this.maxHealth = maxHealth;
        this.health = maxHealth;

        this.isDead = false;
        this.canShoot = true;

        // design variables
        this.damagedAnimationSpeed = 0.01; // amt of alpha added back per ms
    }

    /**
     * Inflict damage on the enemy, if health reaches 0, then destroys itself and becomes dead
     * @param {Number} damageAmount 
     */
    takeDamage(damageAmount) {
        this.alpha = 0;
        this.health -= damageAmount;
        if (this.health <= 0) {
            this.kill();
        }
    }

    kill() {
        this.destroy();
        this.isDead = true;
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        // every enemy scrolls at half ocean speed
        this.y += delta * timescale * (oceanScrollSpeed/2);

        // damage recovery animation
        if (this.alpha < 1) {
            this.alpha += delta * timescale * this.damagedAnimationSpeed;
            if (this.alpha > 1) {
                this.alpha = 1;
            }
        }
    }
}