class MainGame extends Phaser.Scene {
    constructor() {
        super("mainGame");
        this.my = {sprite: {}};
    }

    preload() {
        this.load.setPath("./assets/");

        // this.load.image("monochrome-pirates", "kenney_monochrome-pirates/Dot\ Matrix/Tilemap/tilemap_packed.png");
        // this.load.tilemapTiledJSON("ocean-background", "kenney_monochrome-pirates/Tiled/oceanBG.tmj");

        this.load.image("ocean-background", "kenney_monochrome-pirates/Tiled/oceanBG.png");

        // update instruction text
        document.getElementById('description').innerHTML = '<h2>Tates Shmup</h2>';
    }

    create() {
        this.counter = 0;
        this.oceanSpeed = 1; // pixels per 60th of a second
        
        this.my.sprite.oceanBG = this.add.tileSprite(160, 144, 320, 288, "ocean-background");
    }

    update() {
        this.counter++;
        // scroll the ocean BG
        let BGscroll = Math.floor(this.counter * this.oceanSpeed)
        this.my.sprite.oceanBG.tilePositionY = -BGscroll;
        if (BGscroll === 256) this.counter = 0; // reset counter so we can be infinite
    }
}