import * as BABYLON from "babylonjs";
import type { VoxelIndex } from "./VoxelIndex";
import { MAP_SIZE } from "./Config";

export class Wall {
  private _id: string;
  private _mesh: BABYLON.Mesh;
  private _parent: VoxelIndex;
  c = Math.floor((MAP_SIZE - 1) / 2);

  constructor(
    parent: VoxelIndex,
    position: BABYLON.Vector3,
    rotation: BABYLON.Vector3,
    material: BABYLON.PBRMaterial
  ) {
    this._id = `wall-${position.x},${position.y},${position.z}`;
    this._parent = parent;
    this._mesh = BABYLON.MeshBuilder.CreatePlane(
      this._id,
      { size: MAP_SIZE - 0.1, sideOrientation: BABYLON.Mesh.FRONTSIDE },
      this._parent.scene
    );
    this._mesh.position = position;
    this._mesh.rotation = rotation;
    this._mesh.material = material;
    this._mesh.isPickable = false;
    this._mesh.enablePointerMoveEvents = false;
    this._mesh.setEnabled(true);
    this._mesh.onBeforeRenderObservable.add(() => {
      const camera = this._parent.sceneManager.camera;
      const mesh_pos_relative_to_center = this._mesh.position.subtract(
        BABYLON.Vector3.One().scale(this.c)
      );
      const camera_pos_relative_to_mesh = camera.position.subtract(
        mesh_pos_relative_to_center
      );
      const angle = BABYLON.Vector3.GetAngleBetweenVectors(
        mesh_pos_relative_to_center,
        camera_pos_relative_to_mesh,
        BABYLON.Vector3.Up()
      );
      if (this._parent.isDragEnabled) {
        this._mesh.isPickable = Math.abs(angle) >= Math.PI / 2;
      }
    });
  }
}
