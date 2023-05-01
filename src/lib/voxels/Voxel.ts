import * as BABYLON from "babylonjs";
import type { VoxelIndex } from "./VoxelIndex";

export class Voxel {
  private _id: string;
  private _position: BABYLON.Vector3;
  private _positionId: string;
  private _material: BABYLON.StandardMaterial;
  private _materialId: number;
  private _mesh?: BABYLON.Mesh;
  private _parent: VoxelIndex;
  private _enabled: boolean = false;
  private _occluded: boolean = false;

  get id() {
    return this._id;
  }
  get position() {
    return this._position;
  }
  get positionId() {
    return this._positionId;
  }
  get material() {
    return this._material;
  }
  get materialId() {
    return this._materialId;
  }
  get mesh() {
    return this._mesh;
  }
  get parent() {
    return this._parent;
  }
  get enabled() {
    return this._enabled;
  }
  get occluded() {
    return this._occluded;
  }
  get visible() {
    return this._enabled && !this._occluded;
  }

  private _setMeshEnabled(enabled: boolean) {
    // if ((this._mesh ? true : false) === enabled) return;
    if(this._mesh && !enabled) {
      this._mesh.dispose();
      this._mesh = undefined;
    } else if (!this._mesh && enabled) {
      this._mesh = BABYLON.MeshBuilder.CreateBox(
        `voxel-${this._positionId}`,
        { size: 1 },
        this.parent.scene
      );
      this._mesh.position = this._position;
      this._mesh.setEnabled(true);
      this._mesh.actionManager?.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
          console.log(`Picked voxel [${this._position.asArray().join(",")}]`);
        })
      );
      this._mesh.actionManager?.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickOutTrigger,
          () => {
            console.log(
              `Picked out voxel [${this._position.asArray().join(",")}]`
            );
          }
        )
      );
      this._mesh.material = this._material;
    }
  }

  constructor(p: BABYLON.Vector3, parent: VoxelIndex) {
    this._parent = parent;
    this._position = new BABYLON.Vector3(
      ...p.asArray().map((v) => Math.round(v))
    );
    this._positionId = this._position
      .asArray()
      .map((v) => Math.floor(v).toString(16).padStart(2, "0"))
      .join("");
    this._id = `${this._positionId}`;
    this._setMeshEnabled(false);
    
    this._material = this.parent.materials[11];
    this._materialId = 11;
    this.setMaterial(11);
  }

  setMaterial(mat: number) {
    this._materialId = mat;
    this._material = this.parent.materials[mat];
    if(this._mesh) this._mesh.material = this._material;
  }

  setEnabled(enabled: boolean) {
    if (this._enabled == enabled) return;
    this._enabled = enabled;
    this.parent.onSetEnable(this);
    this._setMeshEnabled(this._enabled && !this._occluded);
  }

  setOccluded(occluded: boolean) {
    if (this._occluded == occluded) return;
    this._occluded = occluded;
    this._setMeshEnabled(this._enabled && !this._occluded);
  }
}
