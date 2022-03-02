function clientPrediction(game, SI, movement, clientVault) {
    const speed = 160
    const jump = 330

    let player = game.players[game.channel.id];

    if (!player) return;

    if (movement.left) {
        player.setVelocityX(-speed);
    } else if (movement.right) {
        player.setVelocityX(speed);
    } else {
        player.setVelocityX(0);
    }

    if (movement.up) {
        if (player.body.touching.down || player.body.onFloor()) {
            player.setVelocityY(-jump);
        }
    }

    clientVault.add(
        SI.snapshot.create([{ id: game.channel.id, x: player.x, y: player.y }])
    )
}

function serverReconciliation(game, SI, clientVault, isMoving = false) {
    try {
        let player = game.players[game.channel.id];

        // get the latest snapshot from the server
        const serverSnapshot = SI.vault.get()
        if (serverSnapshot) {
            // get the closest player snapshot that matches the server snapshot time
            const clientSnapshot = clientVault.get(serverSnapshot.time, true)

            if (clientSnapshot) {
                // get the current player position on the server
                const serverPos = serverSnapshot.state.filter(s => s.id === game.channel.id)[0]

                // calculate the offset between server and client
                const offsetX = clientSnapshot.state[0].x - serverPos.x
                const offsetY = clientSnapshot.state[0].y - serverPos.y

                // we correct the position faster if the player moves
                const correction = isMoving ? 60 : 180

                // apply a step by step correction of the player's position
                player.x -= offsetX / correction
                player.y -= offsetY / correction
            }
        }
    } catch (e) {
        console.log("Error: " + e)
    }
}

export function handleMovement() {
    const [game, SI, clientVault] = arguments;

    const movement = {
        left: game.cursors.left.isDown,
        right: game.cursors.right.isDown,
        up: game.cursors.up.isDown,
        down: game.cursors.down.isDown
    }

    game.channel.emit('movement', movement)

    clientPrediction(game, SI, movement, clientVault);

    serverReconciliation(game, SI, clientVault, false);
}