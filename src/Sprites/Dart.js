class Dart extends Projectile {
    constructor(scene, x, y, texture, frame, rx, ry = rx) {
        super(scene, x, y, texture, frame, rx, ry);

        this.dartFlipTimer = 0;
        this.dartFlipLength = 70; // ms
    }

    update(time, delta, timescale) {
        super.update(time, delta, timescale);

        this.dartFlipTimer += delta * timescale;
        if (this.dartFlipTimer > this.dartFlipLength) {
            this.dartFlipTimer = 0;
            this.flipX = !this.flipX;
        }
    }
}