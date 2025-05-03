class Projectile extends Phaser.GameObjects.Sprite {
    /**
     * radius is the radius of the collision circle
     */
    constructor(scene, x, y, texture, frame, rx, ry = rx) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        
        this.rx = rx;
        this.ry = ry;

        // components of velocity, pixels per ms
        this.dx = 0;
        this.dy = 0;
    }

    /**
     * Set speed and angle of the projectile's movement. Angle is in degrees, clockwise from the x-axis. 0 is to the right, 90 is down, etc
     */
    setVelocity(speed, angle) {
        angle = angle * (Math.PI/180); // convert to radians
        this.dx = speed * Math.cos(angle);
        this.dy = speed * Math.sin(angle); // negated because screen y axis is different than math axis
    }

    update(time, delta, timescale) {
        this.x += delta * timescale * this.dx;
        this.y += delta * timescale * this.dy;
    }
}