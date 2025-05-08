class Mermaid extends Enemy {
    static texture = "monochrome-pirates";
    static frame = 124;
    static fishTexture = "monochrome-pirates";
    static fishFrame = 119;

    constructor(scene, x, y) {
        // design variables
        let rx = 8;
        let ry = 8;
        let maxHealth = 5;
        
        super(scene, x, y, Mermaid.texture, Mermaid.frame, rx, ry, maxHealth);
        
        this.fishMovementSpeed = 0.1; // pixels per ms
        
        // random cooldown range
        this.maxCooldown = 6000; // ms
        this.minCooldown = 3000; // ms
        this.cooldownLength = this.#getNewCooldownLength() - 1500; // adjusted for first shots
        
        this.cooldownTimer = 0;

        // design variables for path
        this.horizontalMovementRange = 16; // pixels
        this.horizontalMovementSpeed = 0.002; // no particular unit
        
        // pathing for x movement
        this.x -= this.horizontalMovementRange/2; // to center the mermaid's path
        this.path = new Phaser.Curves.Spline([0, 0, this.horizontalMovementRange, 0]);
        this.t = 0; // mermaid starts in the center
        this.oldPathX = 0;
    }

    #getNewCooldownLength() {
        return Math.floor(Math.random() * (this.maxCooldown-this.minCooldown) + this.minCooldown);
    }

    kill() {
        stats.mermaidsKilled++;
        super.kill();
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        super.update(time, delta, timescale, oceanScrollSpeed);

        // mermaid horizontal movement
        this.t += delta * timescale * this.horizontalMovementSpeed;
        let sineT = (Math.sin(this.t - Math.PI/2) + 1) / 2;
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

            let shootDetune = (Math.random() * 200) - 100; // -100 to 100
            let shootVolume = (Math.random() * 0.5) + 1.5; // 1.5 to 2
            this.scene.sound.play('mermaid-shoot', {detune: shootDetune, volume: shootVolume});

            // launch fish!
            let fish = new Projectile(this.scene, this.x, this.y+this.ry, Mermaid.fishTexture, Mermaid.fishFrame, 4);
            fish.setVelocity(this.fishMovementSpeed, angleToPlayer);
            fish.flipX = fish.dx < 0; // flip x if moving to the left
            this.scene.addEnemyProjectile(fish);
        }
    }
}