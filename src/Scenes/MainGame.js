class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGame");
        this.my = {sprite: {}};

        this.oceanSpeed = 0.04; // pixels per tick

        this.playerX = 160;
        this.playerY = 264;
    }

    preload() {
        this.load.setPath("./assets/");

        this.load.spritesheet("monochrome-pirates", "kenney_monochrome-pirates/Dot\ Matrix/Tilemap/tilemap_packed.png", {frameWidth: 16, frameHeight: 16});
        this.load.image("ocean-background", "kenney_monochrome-pirates/Tiled/oceanBG.png");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Tates Shmup</h2>';
    }

    create() {
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");

        this.my.sprite.dinghyLeft = this.add.sprite(this.playerX-8, this.playerY+8, "monochrome-pirates", 100);
        this.my.sprite.dinghyRight = this.add.sprite(this.playerX+8, this.playerY+8, "monochrome-pirates", 101);
        this.my.sprite.player = this.add.sprite(this.playerX, this.playerY, "monochrome-pirates", 125);
    }

    update(time, delta) {
        // scroll the ocean
        let oceanScrollDelta = delta * this.oceanSpeed;
        // scroll background
        this.my.sprite.oceanBG.tilePositionY -= oceanScrollDelta;
        
    }
}