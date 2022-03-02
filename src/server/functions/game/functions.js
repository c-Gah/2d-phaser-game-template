import { Player } from '../../../public/shared/player.js';
import { processMovement, processShot } from './playerFunctions.js';

export function setupScene() {
    const [game, geckosio, SI] = arguments;

    game.tick = 0;
    game.players = {};
    game.playerChannels = {};

    // This is the main line of communication between the server and player actions
    setupGeckos(game, geckosio, SI);
}

export function updateScene() {
    const [game, SI] = arguments;

    sendSnapshot(game, SI);
}

function sendSnapshot(game, SI) {
    game.tick++

    // only send the update to the client at 30 FPS (save bandwidth)
    if (game.tick % 2 !== 0) return

    // get an array of all dudes
    const players = [];

    let playerKeys = Object.keys(game.players);

    for (var i = 0; i < playerKeys.length; i++) {
        const player = game.players[playerKeys[i]];
        players.push({ id: playerKeys[i], x: player.x, y: player.y, velocityX: player.body.velocity.x, velocityY: player.body.velocity.y })
    }

    const snapshot = SI.snapshot.create(players);
    SI.vault.add(snapshot);

    // send all dudes to all players
    Object.values(game.playerChannels).forEach(channel => {
        channel.emit('snapshot', snapshot)
    })
}

function setupGeckos(game, geckosio, SI) {
    geckosio.onConnection(channel => {
        const x = Math.random() * 1200 + 40
        const player = new Player(game, x, 200)

        game.players[channel.id] = player;
        game.playerChannels[channel.id] = channel;

        channel.onDisconnect(reason => {
            console.log("player disconnected: " + reason);
            delete game.players[channel.id];
        })

        channel.on('movement', movement => {
            processMovement(movement, game, channel);
        })

        channel.on('shoot', data => {
            processShot(data, SI, channel);
        })
    })
}