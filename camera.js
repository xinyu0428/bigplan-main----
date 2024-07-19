class CustomCamera extends BABYLON.FreeCamera {
    constructor(name, position, scene) {
        super(name, position, scene);

        this.angularSensibility = 1000.0;
        this.moveSpeed = 1.0;
        this.zoomSpeed = 1.0;
        this.minHeight = 1.0; // 最小高度，防止穿过地面
        this.minZoomDistance = -200.0; // 最小缩放距离
        this.maxZoomDistance = 200.0; // 最大缩放距离
        this.keysUp = [38]; // 上箭头
        this.keysDown = [40]; // 下箭头
        this.keysLeft = [37]; // 左箭头
        this.keysRight = [39]; // 右箭头

        // 注册事件处理函数
        canvas.addEventListener("mousedown", (evt) => {
            if (evt.button === 0) {
                this._isRotating = true;
            }
        });

        canvas.addEventListener("mouseup", (evt) => {
            if (evt.button === 0) {
                this._isRotating = false;
            }
        });

        canvas.addEventListener("mousemove", (evt) => {
            if (this._isRotating) {
                var offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || 0;
                var offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || 0;

                this.cameraRotation.y += offsetX / this.angularSensibility;
                this.cameraRotation.x += offsetY / this.angularSensibility;
            }
        });

        // 添加鼠标滚轮缩放功能
        canvas.addEventListener("wheel", (evt) => {
            var delta = evt.deltaY;
            this.zoom(delta * this.zoomSpeed * -0.03);
        });
    }

    // 定义自由相机的键盘控制
    _update() {
        super._update();

        var camera = this;
        if (camera._localDirection) {
            camera.getViewMatrix().invertToRef(camera._camMatrix);
            BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._camMatrix, camera._transformedDirection);
            camera.cameraDirection.addInPlace(camera._transformedDirection);
        }
    }

    // 定义相机的移动
    _checkInputs() {
        super._checkInputs();

        var camera = this;
        if (!camera._keys) return;

        if (camera.keysUp.length) {
            for (var index = 0; index < camera.keysUp.length; index++) {
                if (camera._keys[camera.keysUp[index]]) {
                    camera._localDirection.copyFromFloats(0, 0, camera.moveSpeed);
                    camera._update();
                }
            }
        }

        if (camera.keysDown.length) {
            for (var index = 0; index < camera.keysDown.length; index++) {
                if (camera._keys[camera.keysDown[index]]) {
                    camera._localDirection.copyFromFloats(0, 0, -camera.moveSpeed);
                    camera._update();
                }
            }
        }

        if (camera.keysLeft.length) {
            for (var index = 0; index < camera.keysLeft.length; index++) {
                if (camera._keys[camera.keysLeft[index]]) {
                    camera._localDirection.copyFromFloats(-camera.moveSpeed, 0, 0);
                    camera._update();
                }
            }
        }

        if (camera.keysRight.length) {
            for (var index = 0; index < camera.keysRight.length; index++) {
                if (camera._keys[camera.keysRight[index]]) {
                    camera._localDirection.copyFromFloats(camera.moveSpeed, 0, 0);
                    camera._update();
                }
            }
        }

        this._checkHeight();
    }

    // 检查并限制相机高度
    _checkHeight() {
        if (this.position.y < this.minHeight) {
            this.position.y = this.minHeight;
        }
    }

    // 缩放方法
    zoom(amount) {
        var newPosition = this.position.add(this.getDirection(BABYLON.Axis.Z).scale(amount));
        var distanceFromOrigin = BABYLON.Vector3.Distance(newPosition, BABYLON.Vector3.Zero());

        if (distanceFromOrigin >= this.minZoomDistance && distanceFromOrigin <= this.maxZoomDistance) {
            this.position.copyFrom(newPosition);
        }

        //this._checkHeight();
    }
}