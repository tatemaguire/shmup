class Mermaid extends Enemy {
    static texture = "monochrome-pirates";
    static frame = 124;
    static fishTexture = "monochrome-pirates";
    static fishFrame = 119;

    constructor(scene, x, y) {
        // design variables
        let rx = 8;
        let ry = 8;
        let maxHealth = 10;

        super(scene, x, y, Mermaid.texture, Mermaid.frame, rx, ry, maxHealth);

        this.fishMovementSpeed = 0.1; // pixels per ms

        // first random cooldown
        this.maxCooldown = 5000; // ms
        this.minCooldown = 1; // ms
        this.cooldownLength = this.#getNewCooldownLength();

        // the rest of the random cooldowns
        this.maxCooldown = 10000;
        this.minCooldown = 2000;

        this.cooldownTimer = 0;
    }

    #getNewCooldownLength() {
        return Math.floor(Math.random() * (this.maxCooldown-this.minCooldown) + this.minCooldown);
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        super.update(time, delta, timescale);
        // mermaid movement
        this.y += delta * timescale * (oceanScrollSpeed/2);

        // fish throwing
        this.cooldownTimer += delta * timescale;
        if (this.cooldownTimer > this.cooldownLength) {
            // reset cooldown
            this.cooldownTimer = 0;
            this.cooldownLength = this.#getNewCooldownLength();

            // calculate angle to player TODO: why can the player sit on the side of the screen and be fine?
            let playerPosition = this.scene.getPlayerPosition();
            let angleToPlayer = Math.atan2(playerPosition.y - this.y+this.ry, playerPosition.x - this.x);

            // launch fish!
            let fish = new Projectile(this.scene, this.x, this.y+this.ry, Mermaid.fishTexture, Mermaid.fishFrame, 4);
            fish.setVelocity(this.fishMovementSpeed, angleToPlayer);
            fish.rotation = angleToPlayer;
            // fish.flipX = fish.dx < 0; // flip x if moving to the left
            this.scene.addEnemyProjectile(fish);
        }
    }
}