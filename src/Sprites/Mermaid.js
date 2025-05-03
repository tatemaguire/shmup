class Mermaid extends Enemy {
    static texture = "monochrome-pirates";
    static frame = 124;

    constructor(scene, x, y) {
        // design variables
        let rx = 8;
        let ry = 8;
        let maxHealth = 10;

        super(scene, x, y, Mermaid.texture, Mermaid.frame, rx, ry, maxHealth);
    }

    update(time, delta, timescale) {
        super.update(time, delta, timescale);
        // mermaid movement
        this.y += 0.05;
    }
}