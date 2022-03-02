import { loadSprites, setupScene, gameUpdate } from './game/functions.js';

const { SnapshotInterpolation } = Snap;
const SI = new SnapshotInterpolation(30) // the server's fps is 30
const clientVault = new Snap.Vault();

export function startPhaserGame() {
    const config = {
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 1280,
            height: 720
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 500 }
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update,
        }
    }

    new Phaser.Game(config);
}


function preload() {
    loadSprites(this);
}

function create() {
    setupScene(this, SI);
}

function update() {
    gameUpdate(this, SI, clientVault);
}

startPhaserGame();