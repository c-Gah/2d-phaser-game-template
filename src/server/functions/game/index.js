import '@geckos.io/phaser-on-nodejs';
import Phaser from 'phaser';

import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation';
import geckos from '@geckos.io/server';

import { setupScene, updateScene } from './functions.js'

// initialize the library
const SI = new SnapshotInterpolation();

/* GECKOs */
const geckosio = geckos();
geckosio.listen();

export function startPhaserGame() {
    let config = {
        type: Phaser.HEADLESS,
        width: 1280,
        height: 720,
        banner: false,
        audio: false,
        scene: {
            create: create,
            update: update,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 500 }
            }
        }
    }

    new Phaser.Game(config);
}

function create() {
    this.physics.world.setBounds(0, 0, 1280, 720);

    setupScene(this, geckosio, SI);
}

function update() {
    updateScene(this, SI);
}