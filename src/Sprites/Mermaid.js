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
        this.maxCooldown = 3000; // ms
        this.minCooldown = 1; // ms
        this.cooldownLength = this.#getNewCooldownLength();
        
        // the rest of the random cooldowns
        this.maxCooldown = 10000;
        this.minCooldown = 2000;
        
        this.cooldownTimer = 0;

        // design variables for path
        this.horizontalMovementRange = 16; // pixels
        this.horizontalMovementSpeed = 0.002; // no particular unit
        
        // pathing for x movement
        this.path = new Phaser.Curves.Spline([0, 0, this.horizontalMovementRange, 0]);
        this.t = 0;
        this.oldPathX = 0;
    }

    #getNewCooldownLength() {
        return Math.floor(Math.random() * (this.maxCooldown-this.minCooldown) + this.minCooldown);
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        super.update(time, delta, timescale);
        // mermaid movement
        this.y += delta * timescale * (oceanScrollSpeed/2);

        this.t += delta * timescale * this.horizontalMovementSpeed;
        let sineT = (Math.sin(this.t) + 1) / 2;
        let newPathX = this.path.getPoint(sineT).x;
        this.x += newPathX - this.oldPathX; // add the delta x
        this.oldPathX = newPathX;

        // fish throwing
        this.cooldownTimer += delta * timescale;
        if (this.canShoot && this.cooldownTimer > this.cooldownLength) {
            // reset cooldown
            this.cooldownTimer = 0;
            this.cooldownLength = this.#getNewCooldownLength();

            // calculate angle to player
            let playerPosition = this.scene.getPlayerPosition();
            let angleToPlayer = Math.atan2(playerPosition.y - (this.y+this.ry), playerPosition.x - this.x);

            // launch fish!
            let fish = new Projectile(this.scene, this.x, this.y+this.ry, Mermaid.fishTexture, Mermaid.fishFrame, 4);
            fish.setVelocity(this.fishMovementSpeed, angleToPlayer);
            fish.flipX = fish.dx < 0; // flip x if moving to the left
            this.scene.addEnemyProjectile(fish);
        }
    }
}