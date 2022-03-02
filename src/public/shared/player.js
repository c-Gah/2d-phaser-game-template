export class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, texture = '') {
		super(scene, x, y, texture);

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setSize(32, 48);
		this.setCollideWorldBounds(true);
	}
}