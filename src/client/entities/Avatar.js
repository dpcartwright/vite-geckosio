export default class Avatar extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
      let { scene, x, y, frame, serverMode } = data

      if (serverMode) {
      super(scene.matter.world, x, y, '')
      } else {
        super(scene.matter.world, x, y, frame)
      }

      scene.add.existing(this)
      
      const { Body, Bodies } = Phaser.Physics.Matter.Matter
      const avatarCollider = Bodies.circle(this.x, this.y, 32, { isSensor: false, label: 'avatarCollider' })
      const avatarTestSensor = Bodies.circle(this.x, this.y, 32, { isSensor: true, label: 'avatarTestSensor' })
      const compoundBody = Body.create({
          parts: [avatarCollider, avatarTestSensor],
          frictionAir: 0.9,
      })
      this.setExistingBody(compoundBody)
      this.setFixedRotation()
      this.createTouchCollisions(avatarCollider)
      this.createTestCollisions(avatarTestSensor)

      //this.body.setSize(64, 64)
    }

    createTouchCollisions(avatarCollider) {
      /*     
      this.scene.matterCollision.addOnCollideStart({
          objectA: [playerSensor],
          callback: other => {
              if (other.bodyB.isSensor) return;
              this.touching.push(other.gameObjectB);
              console.log(this.touching.length, other.gameObjectB.name);
          },
          context: this.scene,
      });
      this.scene.matterCollision.addOnCollideEnd({
          objectA: [playerSensor],
          callback: other => {
              this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
              console.log(this.touching.length);
          },
          context: this.scene,
      });
      */
    }

    
    createTestCollisions(avatarTestSensor) {
      /*     
      this.scene.matterCollision.addOnCollideStart({
          objectA: [playerSensor],
          callback: other => {
              if (other.bodyB.isSensor) return;
              this.touching.push(other.gameObjectB);
              console.log(this.touching.length, other.gameObjectB.name);
          },
          context: this.scene,
      });
      this.scene.matterCollision.addOnCollideEnd({
          objectA: [playerSensor],
          callback: other => {
              this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
              console.log(this.touching.length);
          },
          context: this.scene,
      });
      */
    }
  }