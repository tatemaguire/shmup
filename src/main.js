// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"


// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 320,
    height: 288,
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        zoom: (window.innerHeight * 0.75) / 288
    },
    scene: [Level]
}

const game = new Phaser.Game(config);