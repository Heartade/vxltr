import * as BABYLON from "babylonjs";
import { Vector3 } from "babylonjs";

//new BABYLON.StandardMaterial('voxel')
//MATERIAL.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5)
export const MAP_SIZE = 16;

export class Voxel {
  private _id: string;
  private _position: BABYLON.Vector3;
  private _positionId: string;
  private _material: BABYLON.StandardMaterial;
  private _materialId: number;
  private _mesh: BABYLON.Mesh;
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
    this._mesh = BABYLON.MeshBuilder.CreateBox(
      `voxel-${this._positionId}`,
      { size: 1 },
      this.parent.scene
    );
    this._mesh.position = this._position;
    this._mesh.setEnabled(false);
    let temp = Math.floor(
      (64 * (p.x * MAP_SIZE * MAP_SIZE + p.y * MAP_SIZE + p.z)) /
        (MAP_SIZE * MAP_SIZE * MAP_SIZE)
    );
    this._material = this.parent.materials[temp];
    this._materialId = temp;
    this.setMaterial(temp);
  }
  setMaterial(mat: number) {
    this._materialId = mat;
    this._material = this.parent.materials[mat];
    this._mesh.material = this._material;
  }
  setEnabled(enabled: boolean) {
    if (this._enabled == enabled) return;
    this._enabled = enabled;
    this.parent.onSetEnable(this);
    this._mesh.setEnabled(this._enabled && !this._occluded);
  }
  setOccluded(occluded: boolean) {
    if (this._occluded == occluded) return;
    this._occluded = occluded;
    this._mesh.setEnabled(this._enabled && !this._occluded);
  }
}

export class VoxelIndex {
  private _voxels: Voxel[][][];

  private _materials: BABYLON.StandardMaterial[];
  get materials() {
    return [...this._materials];
  }

  private _scene: BABYLON.Scene;
  get scene() {
    return this._scene;
  }
  onSetEnable(v: Voxel) {
    let pos = v.position.asArray();
    // console.log(`setEnable [${pos.join(',')}]`);
    [0, 1, 2].forEach((i) => {
      [-1, 1].forEach((j) => {
        let adjPos = [...pos];
        adjPos[i] += j;
        let adjVoxel = this._voxels[adjPos[0]]?.[adjPos[1]]?.[adjPos[2]];
        if (adjVoxel) this.checkOccluded(adjVoxel);
      });
    });
  }
  checkOccluded(v: Voxel) {
    let pos = v.position.asArray();
    // console.log(`checkOccluded [${pos.join(',')}]`)
    let occluded = [0, 1, 2].every((i) => {
      return [-1, 1].every((j) => {
        let adjPos = [...pos];
        adjPos[i] += j;
        let enabled =
          this._voxels[adjPos[0]]?.[adjPos[1]]?.[adjPos[2]]?.enabled ?? false;
        // console.log(`checkOccluded [${pos.join(',')}] ... [${adjPos.join(',')}] ... ${enabled}`)
        return enabled;
      });
    });
    // console.log(`${occluded ? 'occluded' : 'visible'}`)
    v.setOccluded(occluded);
  }

  constructor(scene: BABYLON.Scene) {
    this._scene = scene;
    this._materials = [0, 1, 2, 3]
      .map((r, i) =>
        [0, 1, 2, 3].map((g, j) =>
          [0, 1, 2, 3].map((b, k) => {
            let mat = new BABYLON.StandardMaterial(
              `voxel-${i * 16 + j * 4 + k}`,
              this._scene
            );
            mat.diffuseColor = new BABYLON.Color3(r / 3, g / 3, b / 3);
            return mat;
          })
        )
      )
      .flat(2);
    this._voxels = new Array(MAP_SIZE)
      .fill(0)
      .map((_, x) =>
        new Array(MAP_SIZE)
          .fill(0)
          .map((_, y) =>
            new Array(MAP_SIZE)
              .fill(0)
              .map((_, z) => new Voxel(new BABYLON.Vector3(x, y, z), this))
          )
      );
    this._voxels.flat(2).forEach((v) => v.setEnabled(true));
    console.log(this._voxels.flat(2).reduce((v, i) => v + i.visible, 0));
  }
}
