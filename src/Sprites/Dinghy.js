class Dinghy {
    static textureL = "monochrome-pirates";
    static frameL = 100;
    static textureR = "monochrome-pirates";
    static frameR = 101;

    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        this.player = null;
        this.followingPlayer = true;

        this.spriteL = scene.add.sprite(0, y, Dinghy.textureL, Dinghy.frameL);
        this.spriteR = scene.add.sprite(0, y, Dinghy.textureR, Dinghy.frameR);
        
        this.spriteL.x = x - this.spriteL.displayWidth/2;
        this.spriteR.x = x + this.spriteR.displayWidth/2;
    }

    followPlayer(player) {
        this.player = player;
        this.followingPlayer = true;
    }

    destroy() {
        this.spriteL.destroy();
        this.spriteR.destroy();
    }

    update() {
        if (this.followingPlayer && this.player) {
            // set sprite positions based on which direction the player is facing
            if (this.player.facingRight) {
                this.spriteL.x = this.player.x - this.spriteL.displayWidth/2;
                this.spriteR.x = this.player.x + this.spriteR.displayWidth/2;
                this.spriteL.flipX = false;
                this.spriteR.flipX = false;
            }
            else {
                this.spriteL.x = this.player.x + this.spriteL.displayWidth/2;
                this.spriteR.x = this.player.x - this.spriteR.displayWidth/2;
                this.spriteL.flipX = true;
                this.spriteR.flipX = true;
            }
        }
    }
}