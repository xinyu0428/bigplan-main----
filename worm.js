class Worm {
    constructor(wormMesh, world, showBoundary, initialEnergy) {
        this.wormMesh = wormMesh;
        this.world = world;
        this.showBoundary = showBoundary;
        this.wormMesh.showBoundingBox = false;
        this.eatCooldown = 0; // 冷却时间属性，初始化为0
        this.energy = initialEnergy; // 初始能量
    }

    get Name() {
        return this.wormMesh.name;
    }

    Move() {
        if (this.energy <= 0) {
            return; // 如果能量不足，则停止移动
        }

        this.wormMesh.rotation.y += Math.random() * Math.PI / 4 - Math.PI / 8;

        const wormLen = 8;
        var speed = this.world.WormSpeed;
        const vx = wormLen * Math.cos(this.wormMesh.rotation.y);
        const vz = wormLen * Math.sin(this.wormMesh.rotation.y);

        var v = new BABYLON.Vector3(-vx, 0, vz);
        this.wormMesh.position.addInPlace(v.scale(speed));

        const boundary = this.world.WorldSize / 2 - wormLen;

        if (this.wormMesh.position.x > boundary) {
            this.wormMesh.position.x = boundary;
        }

        if (this.wormMesh.position.x < -boundary) {
            this.wormMesh.position.x = -boundary;
        }

        if (this.wormMesh.position.z > boundary) {
            this.wormMesh.position.z = boundary;
        }

        if (this.wormMesh.position.z < -boundary) {
            this.wormMesh.position.z = -boundary;
        }

        this.energy -= this.world.energyConsumptionForMovement; // 移动时消耗能量
    }

    _checkCollision(position) {
        const nextBoundingBox = new BABYLON.BoundingBox(
            position.subtract(this.wormMesh.scaling.scale(0.5)),
            position.add(this.wormMesh.scaling.scale(0.5))
        );

        var i = this.world.worms.length;
        while (i--) {
            const otherWorm = this.world.worms[i];
            if (otherWorm !== this) {
                const otherBoundingBox = otherWorm.wormMesh.getBoundingInfo().boundingBox;
                if (BABYLON.BoundingBox.Intersects(nextBoundingBox, otherBoundingBox)) {
                    return otherWorm;
                }
            }
        }
        return null;
    }

    Eat() {
        if (this.eatCooldown > 0) {
            this.eatCooldown--;
            return;
        }

        const wormBoundingBox = this.wormMesh.getBoundingInfo().boundingBox;

        var i = this.world.grasses.length;
        while (i--) {
            const grass = this.world.grasses[i];
            const grassBoundingBox = grass.grassMesh.getBoundingInfo().boundingBox;
            const intersects = BABYLON.BoundingBox.Intersects(wormBoundingBox, grassBoundingBox);

            if (intersects) {
                if (grass.grassMesh.name.startsWith("grassDense")) {
                    this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                } else if (grass.grassMesh.name.startsWith("grassFlower")) {
                    this.world.CreateSingleGrass(grass.grassMesh.position.x, grass.grassMesh.position.z, grass.grassMesh.rotation.y);
                }
                grass.grassMesh.dispose();
                this.world.grasses.splice(i, 1);

                this.world.grassRespawnFrames.push({
                    x: grass.grassMesh.position.x,
                    z: grass.grassMesh.position.z,
                    frame: this.world.frameCounter + this.world.respawnFrames
                });

                this.energy += this.world.energyGainFromGrass; // 吃草时获得能量
                this.eatCooldown = 50; // 设置冷却时间为50帧
            }
        }
    }

    Attack() {
        const collidedWorm = this._checkCollision(this.wormMesh.position);
        if (collidedWorm) {
            // 随机选择一只虫子死亡
            const wormToDie = Math.random() < 0.5 ? this : collidedWorm;

            // 删除死亡的虫子
            wormToDie.wormMesh.dispose();
            const index = this.world.worms.indexOf(wormToDie);
            if (index > -1) {
                this.world.worms.splice(index, 1);
            }
        }
    }

    Think() {}

    Probe() {}
}
