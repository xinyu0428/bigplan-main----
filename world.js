class World {
    constructor(worldSize, miniMapCanvas, trendChart) {
        this.WorldSize = worldSize;
        this.WormSpeed = 0.05;
        this.scene = null;
        this.wormTemplate = null;
        this.wormIndex = 0;
        this.groundY = 0.5;
        this.wormMovementEnabled = true;

        this.grassTemplate0 = null;
        this.grassTemplate1 = null;
        this.grassTemplate2 = null;
        this.groundY0 = -6;
        this.grassIndex = 0;

        this.worms = [];
        this.grasses = [];
        this.grassRespawnFrames = [];
        this.respawnFrames = 300;

        this.singleGrassCount = [];
        this.denseGrassCount = [];
        this.flowerGrassCount = [];
        this.wormCount = [];

        this.miniMapCanvas = miniMapCanvas;
        this.miniMapContext = miniMapCanvas.getContext("2d");
        this.miniMapWidth = this.miniMapCanvas.width;
        this.miniMapHeight = this.miniMapCanvas.height;

        this.miniMapScale = this.miniMapWidth / this.WorldSize;

        this.trendChart = trendChart;
        this.trendChartContext = this.trendChart.getContext("2d");

        this.frameCounter = 0;
        this.growInterval = 100;

        // 添加能量属性
        this.energyGainFromGrass = 100;
        this.energyConsumptionForMovement = 10;
        this.initialWormEnergy = 1000;
        this.initialGrassEnergy = 1000;
         // 添加 GUI 元素的引用
         this.energyGainInput = document.getElementById("energyGain");
         this.energyConsumptionInput = document.getElementById("energyConsumption");
         this.initialWormEnergyInput = document.getElementById("initialWormEnergy");
         this.initialGrassEnergyInput = document.getElementById("initialGrassEnergy");
         this.confirmButton = document.getElementById("confirmButton");
 
         // 绑定确认按钮事件
         this.confirmButton.addEventListener("click", () => {
             this.updateEnergySettings();
         });
     }
     
     updateEnergySettings() {
        this.energyGainFromGrass = parseFloat(this.energyGainInput.value);
        this.energyConsumptionForMovement = parseFloat(this.energyConsumptionInput.value);
        this.initialWormEnergy = parseFloat(this.initialWormEnergyInput.value);
        this.initialGrassEnergy = parseFloat(this.initialGrassEnergyInput.value);
    }
 
    LoadWormModel(wormModelURL) {
        const that = this;
        BABYLON.SceneLoader.LoadAssetContainer(
            "",
            wormModelURL,
            world.scene,
            function (container) {
                var mymeshes = container.meshes.filter((mesh) => mesh.geometry);
                const disposeSource = true;
                const allow32BitsIndices = false;
                const meshSubclass = null;
                const subdivideWithSubMeshes = false;
                const multiMultiMaterial = true;

                that.wormTemplate = BABYLON.Mesh.MergeMeshes(
                    mymeshes,
                    disposeSource,
                    allow32BitsIndices,
                    meshSubclass,
                    subdivideWithSubMeshes,
                    multiMultiMaterial
                );

                that.wormTemplate.isVisible = false;
            }
        );
    }

    CreateWorm(x, z, rotation, usingInstance) {
        const that = this;

        const name = "worm_" + that.wormIndex;
        that.wormIndex++;

        var wormMesh = null;

        if (usingInstance) {
            wormMesh = that.wormTemplate.createInstance(name);
        } else {
            wormMesh = that.wormTemplate.clone(name);
        }

        wormMesh.position.x = x;
        wormMesh.position.y = that.groundY;
        wormMesh.rotation.y = rotation;
        wormMesh.position.z = z;
        wormMesh.checkCollisions = false;
        wormMesh.isVisible = true;

        if (!usingInstance) {
            const material1 = new BABYLON.StandardMaterial("material1", scene);
            material1.diffuseColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
            );

            const material2 = new BABYLON.StandardMaterial("material2", scene);
            material2.diffuseColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
            );

            const material_eye = new BABYLON.StandardMaterial("material_eye", scene);
            material_eye.diffuseColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
            );

            const multiMaterial = new BABYLON.MultiMaterial("multiMaterial", scene);
            multiMaterial.subMaterials.push(material1);
            multiMaterial.subMaterials.push(material2);
            multiMaterial.subMaterials.push(material_eye);

            wormMesh.material = multiMaterial;
        }

        wormMesh.name = name;  // 设置 wormMesh 的名称
        const worm = new Worm(wormMesh, this, this.initialWormEnergy);  // 传递初始能量
        that.worms.push(worm);
        this.registerClickHandler(wormMesh);  // 调用 registerClickHandler 方法注册点击事件
         return worm;
    }
    registerClickHandler(wormMesh) {
        wormMesh.actionManager = new BABYLON.ActionManager(this.scene);
        wormMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
                document.getElementById("selectedWormId").textContent = `所选虫子名称: ${wormMesh.name}`;
            }
        ));
    }
    


    _buildGrassMesh0() {
        const that = this;
        var items = [];
        for (var i = 0; i < 5; i++) {
            var blade = BABYLON.MeshBuilder.CreateCylinder(
                "blade",
                {
                    height: 12,
                    diameterTop: 0,
                    diameterBottom: 1.2,
                    tessellation: 3,
                },
                that.scene
            );
            blade.material = new BABYLON.StandardMaterial(
                "grassMaterial",
                that.scene
            );
            blade.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
            blade.position.y = 6;
            blade.rotation.z = (Math.PI / 6) * (i - 2);
            items.push(blade);
        }

        var grassMesh = BABYLON.Mesh.MergeMeshes(
            items,
            true,
            false,
            null,
            false,
            true
        );

        return grassMesh;
    }

    _buildDenseGrassMesh() {
        const that = this;
        var items = [];
        for (var i = 0; i < 7; i++) {
            var grass = that._buildGrassMesh0();
            grass.scaling = new BABYLON.Vector3(1, 1, 1);
            grass.rotation.y = (Math.PI / 3.5) * i;
            items.push(grass);
        }
        var denseGrassMesh = BABYLON.Mesh.MergeMeshes(
            items,
            true,
            false,
            null,
            false,
            true
        );
        denseGrassMesh.position.y = -6;
        return denseGrassMesh;
    }

    _buildFlowerGrassMesh() {
        const that = this;
        var items = [];
        for (var i = 0; i < 5; i++) {
            var blade = BABYLON.MeshBuilder.CreateCylinder(
                "blade",
                {
                    height: 12,
                    diameterTop: 0,
                    diameterBottom: 1.2,
                    tessellation: 3,
                },
                that.scene
            );
            blade.material = new BABYLON.StandardMaterial(
                "grassMaterial",
                that.scene
            );
            blade.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
            blade.position.y = 6;
            blade.rotation.z = (Math.PI / 6) * (i - 2);
            items.push(blade);
        }
        var flowerRadius = 0.6;
        var flowerCount = 5;
        for (var i = 0; i < flowerCount; i++) {
            var angle = (i / flowerCount) * 2 * Math.PI;
            var flowerPetal = BABYLON.MeshBuilder.CreateSphere(
                "flowerPetal" + i,
                { diameter: 0.4 },
                that.scene
            );
            flowerPetal.material = new BABYLON.StandardMaterial(
                "flowerMaterial",
                that.scene
            );
            flowerPetal.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            flowerPetal.position.y = 12;
            flowerPetal.position.x = Math.cos(angle) * flowerRadius;
            flowerPetal.position.z = Math.sin(angle) * flowerRadius;
            items.push(flowerPetal);
        }
        var flowerGrassMesh = BABYLON.Mesh.MergeMeshes(
            items,
            true,
            false,
            null,
            false,
            true
        );
        flowerGrassMesh.position.y = -3;
        return flowerGrassMesh;
    }

    LoadGrassModel(grassURL) {
        this.grassTemplate0 = this._buildGrassMesh0();
        this.grassTemplate0.isVisible = false;

        this.grassTemplate1 = this._buildDenseGrassMesh();
        this.grassTemplate1.isVisible = false;

        this.grassTemplate2 = this._buildFlowerGrassMesh();
        this.grassTemplate2.isVisible = false;
    }

    CreateSingleGrass(x, z, rotation) {
        var grassMesh = this.grassTemplate0.createInstance(
            "grass" + this.grassIndex
        );
        this.grassIndex++;

        grassMesh.position.x = x;
        grassMesh.position.z = z;
        grassMesh.position.y = this.groundY0;
        grassMesh.rotation.y = rotation;
        grassMesh.checkCollisions = false;

        const grass = new Grass(grassMesh, this);
        this.grasses.push(grass);
        return grass;
    }

    CreateDenseGrass(x, z, rotation) {
        var denseGrassMesh = this.grassTemplate1.createInstance(
            "grassDense" + this.grassIndex
        );
        this.grassIndex++;
        denseGrassMesh.position.x = x;
        denseGrassMesh.position.z = z;
        denseGrassMesh.position.y = this.groundY0;
        denseGrassMesh.rotation.y = rotation;
        denseGrassMesh.checkCollisions = false;
        const grass = new Grass(denseGrassMesh, this);
        this.grasses.push(grass);
        return grass;
    }

    CreateFlowerGrass(x, z, rotation) {
        var flowerGrassMesh = this.grassTemplate2.createInstance(
            "grassFlower" + this.grassIndex
        );
        this.grassIndex++;

        flowerGrassMesh.position.x = x;
        flowerGrassMesh.position.z = z;
        flowerGrassMesh.position.y = this.groundY0;
        flowerGrassMesh.rotation.y = rotation;
        flowerGrassMesh.checkCollisions = false;
        const grass = new Grass(flowerGrassMesh, this);
        this.grasses.push(grass);
        return grass;
    }

    _updateCountDisplay() {
        document.getElementById(
            "wormCountDisplay"
        ).textContent = `虫子数量: ${this.worms.length}`;
        document.getElementById(
            "grassCountDisplay"
        ).textContent = `草的数量: ${this.grasses.length}`;
    }

    ToggleWormMovement() {
        this.wormMovementEnabled = !this.wormMovementEnabled;
        this._updateToggleButton();
    }

    UpdateWormSpeed(speed) {
        this.WormSpeed = speed;
    }

    _updateToggleButton() {
        const button = document.getElementById("toggleMovement");
        if (world.wormMovementEnabled) {
            button.textContent = "暂停虫子运动";
        } else {
            button.textContent = "开启虫子运动";
        }
    }

    _drawOnMiniMap(position, color) {
        const x = (position.x + this.WorldSize / 2) * this.miniMapScale;
        const z = (position.z + this.WorldSize / 2) * this.miniMapScale;

        this.miniMapContext.fillStyle = color;
        this.miniMapContext.fillRect(x, z, 2, 2);
    }

    _drawTrend(ctx, chartWidth, chartHeight, singleGrassValues, denseGrassValues, flowerGrassValues, wormValues) {
        const padding = 2;
        const plotWidth = chartWidth - 2 * padding;
        const plotHeight = chartHeight - 2 * padding;

        const maxSingleValue = Math.max(...singleGrassValues);
        const maxDenseValue = Math.max(...denseGrassValues);
        const maxFlowerValue = Math.max(...flowerGrassValues);
        const maxWormValue = Math.max(...wormValues);
        const maxValue = Math.max(maxSingleValue, maxDenseValue, maxFlowerValue, maxWormValue);

        ctx.clearRect(0, 0, chartWidth, chartHeight);

        const drawLine = (values, color) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            values.forEach((value, index) => {
                const x = padding + (index / (values.length - 1)) * plotWidth;
                const y = chartHeight - padding - ((value) / maxValue) * plotHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        };

        drawLine(singleGrassValues, "green");
        drawLine(denseGrassValues, "blue");
        drawLine(flowerGrassValues, "red");
        drawLine(wormValues, "purple");

        ctx.font = "12px Arial";
        ctx.fillText(`总数草: ${maxSingleValue}`, padding, padding + 12);
        ctx.fillText(`草丛: ${maxDenseValue}`, padding, padding + 24);
        ctx.fillText(`带花的草: ${maxFlowerValue}`, padding, padding + 36);
        ctx.fillText(`虫子: ${maxWormValue}`, padding, padding + 48);
    }

    RunFrame(fps) {
        if (!this.wormMovementEnabled) return;

        this.worms.forEach(function (worm) {
            worm.Move();
            worm.Eat();
            worm.Attack();
        });

        this._updateCountDisplay();

        this.trendChartContext.clearRect(0, 0, this.trendChart.width, this.trendChart.height);

        if (!this.singleGrassValues) {
            this.singleGrassValues = [];
            this.denseGrassValues = [];
            this.flowerGrassValues = [];
            this.wormValues = [];
        }

        const singleCount = this.grasses.filter(grass => grass.grassMesh.name.startsWith("grass")).length;
        const denseCount = this.grasses.filter(grass => grass.grassMesh.name.startsWith("grassDense")).length;
        const flowerCount = this.grasses.filter(grass => grass.grassMesh.name.startsWith("grassFlower")).length;
        const wormCount = this.worms.length;

        this.singleGrassValues.push(singleCount);
        this.denseGrassValues.push(denseCount);
        this.flowerGrassValues.push(flowerCount);
        this.wormValues.push(wormCount);

        if (this.singleGrassValues.length > 500) {
            this.singleGrassValues.shift();
            this.denseGrassValues.shift();
            this.flowerGrassValues.shift();
            this.wormValues.shift();
        }

        this._drawTrend(this.trendChartContext, this.trendChart.width, this.trendChart.height, this.singleGrassValues, this.denseGrassValues, this.flowerGrassValues, this.wormValues);

        this.miniMapContext.clearRect(0, 0, this.miniMapWidth, this.miniMapHeight);

        this.worms.forEach((worm) => {
            this._drawOnMiniMap(worm.wormMesh.position, "red");
        });
        this.grasses.forEach((grass) => {
            this._drawOnMiniMap(grass.grassMesh.position, "green");
        });

        // 增加帧计数器
        this.frameCounter++;

        // 每过一定帧数尝试生长新的草，频率与FPS相关
        const growInterval = Math.max(1, Math.floor(1000 / fps));
        if (this.frameCounter >= growInterval) {
            this.frameCounter = 0; // 重置帧计数器
            this._randomlyGrowGrass();
        }

        // 更新草的重生时间
        this._updateGrassRespawn();
    }

    _randomlyGrowGrass() {
        let x, z;
        let inExistingArea = true;
        while (inExistingArea) {
            x = Math.random() * this.WorldSize - this.WorldSize / 2;
            z = Math.random() * this.WorldSize - this.WorldSize / 2;
            inExistingArea = this._isInExistingArea(x, z);
        }
        const randomChoice = Math.random();
        if (randomChoice < 0.33) {
            this.CreateDenseGrass(x, z, 0);
        } else if (randomChoice < 0.66) {
            this.CreateFlowerGrass(x, z, 0);
        } else {
            this.CreateSingleGrass(x, z, 0);
        }
    }

    _updateGrassRespawn() {
        const currentFrame = this.frameCounter;
        this.grassRespawnFrames = this.grassRespawnFrames.filter(respawn => {
            if (currentFrame >= respawn.frame) {
                this._randomlyGrowGrass(respawn.x, respawn.z);
                return false; // 移除已重生的草
            }
            return true; // 保留尚未重生的草
        });
    }

    _isInExistingArea(x, z) {
        const minDistance = 5; // 草和虫子之间的最小距离
        return this.grasses.some(grass => {
            const dx = grass.grassMesh.position.x - x;
            const dz = grass.grassMesh.position.z - z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance < minDistance;
        }) || this.worms.some(worm => {
            const dx = worm.wormMesh.position.x - x;
            const dz = worm.wormMesh.position.z - z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            return distance < minDistance;
        });
    }
}