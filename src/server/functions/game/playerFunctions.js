import { addLatencyAndPackagesLoss, collisionDetection } from '../../../public/shared/util.js';

export function processMovement(movement, game, channel) {
    //TODO Remove for productions. only for testing
    addLatencyAndPackagesLoss(() => {
        const { left, right, up, down } = movement
        const speed = 160
        const jump = 330

        const player = game.players[channel.id];

        if (!player) return;

        if (left) {
            player.setVelocityX(-speed);
        } else if (right) {
            player.setVelocityX(speed);
        } else {
            player.setVelocityX(0);
        }

        if (up)
            if (player.body.touching.down || player.body.onFloor())
                player.setVelocityY(-jump)
    })
}

export function processShot(data, SI, channel) {
    const { x, y, time } = data;

    // get the two closest snapshot to the date
    const shots = SI.vault.get(time);
    if (!shots) return;

    // interpolate between both snapshots
    const shot = SI.interpolate(shots.older, shots.newer, time, 'x y');
    if (!shot) return;

    // check for a collision
    shot.state.forEach(entity => {
        if (
            collisionDetection(
                { x: entity.x, y: entity.y, width: 40, height: 60 },
                // make the pointer 10px by 10px
                { x: x - 5, y: y - 5, width: 10, height: 10 }
            )
        ) {
            channel.emit('hit', entity, { reliable: true })
        }
    })
}