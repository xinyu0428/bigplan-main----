class Grass {
    constructor(grassMesh, scene) {
        this.grassMesh = grassMesh;
        //this.grassMesh.showBoundingBox = true;
        this.scene = scene;
    }

    get Name() {
        return this.grassMesh.Id;
    }
}
