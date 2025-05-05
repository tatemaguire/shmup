class PirateCrate extends Enemy {
    static pirateTexture = "monochrome-pirates";
    static pirateFrame = 126;
    static crateTexture = "monochrome-pirates";
    static crateFrame = 93;
    static bulletTexture = "monochrome-pirates";
    static bulletFrame = 105; // dart: 105, beam: 82

    constructor(scene, x, y) {
        // design variables
        let rx = 8;
        let ry = 8;
        let maxHealth = 20;

        super(scene, x, y, PirateCrate.pirateTexture, PirateCrate.pirateFrame, rx, ry, maxHealth);

        this.crate = this.scene.add.sprite(x, y+8, PirateCrate.crateTexture, PirateCrate.crateFrame);

        // design variables
        this.playerDetectionRadius = 10; // pixel distance from player to start shooting
        this.bulletMovementSpeed = 0.15; // pixels per ms

        this.cooldownLength = 1000;
        this.cooldownTimer = 0;
    }

    kill() {
        stats.pirateCratesKilled++;
        this.crate.destroy();
        super.kill();
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        super.update(time, delta, timescale, oceanScrollSpeed);

        // crate updates to pirate
        this.crate.y = this.y+8;

        // shooting
        let playerPosition = this.scene.getPlayerPosition();
        if (this.canShoot && Math.abs(playerPosition.x - this.x) < this.playerDetectionRadius) {
            // only increase timer when player is in the line of sight
            this.cooldownTimer += delta * timescale;
            if (this.cooldownTimer > this.cooldownLength) {
                this.cooldownTimer = 0;

                let bullet = new Dart(this.scene, this.x, this.y+this.ry, PirateCrate.bulletTexture, PirateCrate.bulletFrame, 4);
                bullet.depth = 3;
                bullet.setVelocity(this.bulletMovementSpeed, Math.PI/2);
                this.scene.addEnemyProjectile(bullet);
            }
        }
    }
}