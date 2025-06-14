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
        let maxHealth = 15; // divisible by 3, important for shooting timing

        super(scene, x, y, PirateCrate.pirateTexture, PirateCrate.pirateFrame, rx, ry, maxHealth);

        this.crate = this.scene.add.sprite(x, y+8, PirateCrate.crateTexture, PirateCrate.crateFrame);

        // design variables
        this.playerDetectionRadius = 10; // pixel distance from player to start shooting
        this.bulletMovementSpeed = 0.15; // pixels per ms

        // variables for shooting behavior 1 - line of sight timer
        this.cooldownLength = 1000;
        this.cooldownTimer = 0;
        this.isPaused = false; // to track if we should shoot bullets in takeDamage(). necessary because we don't have access to timescale
    }

    takeDamage(damageAmount) {
        // shooting behavior 2 - shoots once after taking 3 damage
        if (this.canShoot && !this.isPaused && this.cooldownTimer > this.cooldownLength) {
            this.cooldownTimer = 0;

            let shootDetune = (Math.random() * 200) - 100; // -100 to 100
            let shootVolume = (Math.random() * 0.5) + 2; // 0.2 to 0.7
            this.scene.sound.play('pirate-crate-shoot', {detune: shootDetune, volume: shootVolume});

            let bullet = new Dart(this.scene, this.x, this.y+this.ry, PirateCrate.bulletTexture, PirateCrate.bulletFrame, 4);
            bullet.depth = 3;
            bullet.setVelocity(this.bulletMovementSpeed, Math.PI/2);
            this.scene.addEnemyProjectile(bullet);
        }

        super.takeDamage(damageAmount);
    }

    kill() {
        stats.pirateCratesKilled++;
        super.kill();
    }

    destroy() {
        this.crate.destroy();
        super.destroy();
    }

    update(time, delta, timescale, oceanScrollSpeed) {
        super.update(time, delta, timescale, 1.25 * oceanScrollSpeed);

        // crate updates to pirate
        this.crate.y = this.y+8;

        this.isPaused = timescale === 0;

        this.cooldownTimer += delta * timescale;
        // shooting behavior 1 - when player is in sight for 1 second
        // let playerPosition = this.scene.getPlayerPosition();
        // if (this.canShoot && Math.abs(playerPosition.x - this.x) < this.playerDetectionRadius) {
        //     // only increase timer when player is in the line of sight
        //     this.cooldownTimer += delta * timescale;
        //     if (this.cooldownTimer > this.cooldownLength) {
        //         this.cooldownTimer = 0;

        //         let bullet = new Dart(this.scene, this.x, this.y+this.ry, PirateCrate.bulletTexture, PirateCrate.bulletFrame, 4);
        //         bullet.depth = 3;
        //         bullet.setVelocity(this.bulletMovementSpeed, Math.PI/2);
        //         this.scene.addEnemyProjectile(bullet);
        //     }
        // }
    }
}