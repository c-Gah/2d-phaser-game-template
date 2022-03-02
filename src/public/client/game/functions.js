import { handleMovement } from './playerFunctions.js';
import { Player } from '../../shared/player.js';

export function loadSprites() {
    const [game] = arguments;

    game.load.spritesheet('dude', './client/assets/dude.png', {
        frameWidth: 32,
        frameHeight: 48
    })
    game.load.spritesheet('dudeClicked', './client/assets/dudeClicked.png', {
        frameWidth: 32,
        frameHeight: 48
    })
}

export function setupScene() {
    const [game, SI] = arguments;

    //This variable holds the sprite information for every character including this clients.
    game.players = {};

    game.cursors = game.input.keyboard.createCursorKeys()

    setupGeckos(game, SI);
}

export function gameUpdate() {
    const [game, SI, clientVault] = arguments;

    handleMovement(game, SI, clientVault);
    handleSnapshot(game, SI);
}

function setupGeckos() {
    const [game, SI] = arguments;

    game.channel = geckos();
    game.channel.onConnect(error => {
        if (error) {
            console.error(error.message)
            return
        } else {
            console.log('You are connected! : ' + game.channel.id)
        }
    });

    game.channel.on('snapshot', snapshot => {
        SI.snapshot.add(snapshot);
    })

    game.channel.on('hit', entity => {
        console.log('You just hit');
    })

    game.input.on('pointerdown', function (pointer) {
        console.log("scene click");
    });
}

function handleSnapshot() {
    const [game, SI] = arguments;

    const snapshot = SI.calcInterpolation('x y') // interpolated
    // const snapshot = SI.vault.get() // latest
    if (snapshot) {
        let serverPlayers = {};

        const { state } = snapshot
        state.forEach(s => {
            const { id, x, y, velocityX, velocityY } = s

            //Get a list of all current connected players
            serverPlayers[id] = true;


            // update player
            if (id in game.players) {
                // do not update our own player (if we use clientPrediction and serverReconciliation)
                // comment this out to disable client side prediction
                if (id === game.channel.id) {
                    return
                }

                const player = game.players[id];

                player.x = x
                player.y = y
                player.setVelocityX(velocityX);
                player.setVelocityY(velocityY);
            } else {
                createPlayer(game, id, x, SI);
            }
        })

        removeDisconnectedPlayers(game, serverPlayers);
    }
}

function createPlayer() {
    const [game, id, x, SI] = arguments;

    //Create Player
    const player = new Player(game, x, 200, "dude");

    player.setInteractive();
    let thisChannel = game.channel;
    player.on('pointerdown', function (pointer) {
        this.setTint(0xff0000);
        this.setTexture("dudeClicked");

        console.log("shoot");

        thisChannel.emit(
            'shoot',
            { x: this.x, y: this.y, time: SI.serverTime },
            { reliable: true }
        )

    });

    game.players[id] = player;
}

function removeDisconnectedPlayers(game, serverPlayers) {
    //Players must be removed when the client has extra records. Don't remove players using a disconnect command
    // It can be exploited by other users
    Object.keys(game.players).forEach(clientPlayerId => {
        if (clientPlayerId in serverPlayers == false) {
            game.players[clientPlayerId].destroy();
            delete game.players[clientPlayerId];
        }
    });
}