import * as BABYLON from "babylonjs";
import type { Vector3 } from "babylonjs";
import type { Mode, Tool } from "../routes/store";

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

    // let temp = Math.floor(
    //   (64 * (p.x * MAP_SIZE * MAP_SIZE + p.y * MAP_SIZE + p.z)) /
    //     (MAP_SIZE * MAP_SIZE * MAP_SIZE)
    // );
    this._material = this.parent.materials[11];
    this._materialId = 11;
    this.setMaterial(11);
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

  private _tool: Tool = "ADD";
  get tool() {
    return this._tool;
  }

  setTool(tool: Tool) {
    this._tool = tool;
  }

  private _mode: Mode = "POINT";
  get mode() {
    return this._mode;
  }

  setMode(mode: Mode) {
    this._mode = mode;
  }

  onSetEnable(v: Voxel) {
    let pos = v.position.asArray();
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
    let occluded = [0, 1, 2].every((i) => {
      return [-1, 1].every((j) => {
        let adjPos = [...pos];
        adjPos[i] += j;
        let enabled =
          this._voxels[adjPos[0]]?.[adjPos[1]]?.[adjPos[2]]?.enabled ?? false;
        return enabled;
      });
    });
    v.setOccluded(occluded);
  }

  private _materialId: number = 11;
  get materialId() {
    return this._materialId;
  }
  setMaterialId(id: number) {
    this._materialId = id;
  }

  inputCache: BABYLON.Vector2[] = [];
  pointerDown: boolean[] = [];

  findVoxelFromPick(pickInfo: BABYLON.PickingInfo) {
    let mesh = pickInfo.pickedMesh;
    if (mesh) {
      let voxel =
        this._voxels[mesh.position.x][mesh.position.y][mesh.position.z];
      return voxel;
    } else return null;
  }

  findAxisFromPick(voxel: Voxel, pickInfo: BABYLON.PickingInfo) {
    let point = pickInfo.pickedPoint;
    if (point) {
      let pos = voxel.position;
      let direction = point.subtract(pos).normalize().asArray();
      let absDirection = direction.map(Math.abs);
      let max = Math.max(...absDirection);
      let maxAxis = absDirection.indexOf(max);
      let axis = [0, 0, 0];
      axis[maxAxis] = direction[maxAxis] > 0 ? 1 : -1;
      return axis;
    } else return null;
  }

  _faceFilter(o: Voxel, v: Voxel, axis: BABYLON.Vector3) {
    let p = v.position;
    if (!v.visible) return false;
    if (o.materialId !== v.materialId) return false;
    let next = this._voxels[p.x + axis.x]?.[p.y + axis.y]?.[p.z + axis.z];
    if (next && next.enabled) return false;
    return true;
  }
  findFace(voxel: Voxel, axis: BABYLON.Vector3) {
    let pos = voxel.position;
    if (axis.x != 0 && axis.y == 0 && axis.z == 0) {
      return this._voxels[pos.x]
        .flat()
        .filter((v) => this._faceFilter(voxel, v, axis));
    } else if (axis.x == 0 && axis.y != 0 && axis.z == 0) {
      return this._voxels
        .map((x) => x[pos.y])
        .flat()
        .filter((v) => this._faceFilter(voxel, v, axis));
    } else if (axis.x == 0 && axis.y == 0 && axis.z != 0) {
      return this._voxels
        .map((x) => x.map((y) => y[pos.z]))
        .flat()
        .filter((v) => this._faceFilter(voxel, v, axis));
    } else {
      return [];
    }
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
            mat.diffuseColor = new BABYLON.Color3(r / 4, g / 4, b / 4);
            mat.emissiveColor = new BABYLON.Color3(r / 8, g / 8, b / 8);
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
    // this._voxels.flat(2).forEach((v) => v.setEnabled(true));
    let c = Math.floor((MAP_SIZE - 1) / 2);
    this._voxels[c][c][c].setEnabled(true);
    this._voxels[c + 1][c][c].setEnabled(true);
    this._voxels[c][c + 1][c].setEnabled(true);
    this._voxels[c + 1][c + 1][c].setEnabled(true);
    this._voxels[c][c][c + 1].setEnabled(true);
    this._voxels[c + 1][c][c + 1].setEnabled(true);
    this._voxels[c][c + 1][c + 1].setEnabled(true);
    this._voxels[c + 1][c + 1][c + 1].setEnabled(true);
    this._scene.onPointerObservable.add((e) => {
      let event = e.event as BABYLON.IPointerEvent;
      if (e.type == BABYLON.PointerEventTypes.POINTERDOWN) {
        this.inputCache[event.pointerId ?? 0] = new BABYLON.Vector2(
          event.movementX,
          event.movementY
        );
        this.pointerDown[event.pointerId ?? 0] = true;
      }
      if (e.type == BABYLON.PointerEventTypes.POINTERUP) {
        console.log(this.inputCache[event.pointerId ?? 0]);
        let isTouch = this.inputCache[event.pointerId ?? 0]?.length() < 10;
        this.pointerDown[event.pointerId ?? 0] = false;
        if (e.pickInfo) {
          let pickInfo: BABYLON.PickingInfo = e.pickInfo;
          if (isTouch) {
            let voxel = this.findVoxelFromPick(pickInfo);
            if (!voxel) return;
            let pos = voxel.position;
            let axis = this.findAxisFromPick(voxel, pickInfo);
            if (!axis) return;
            else {
              let face =
                this._mode === "FACE"
                  ? this.findFace(voxel, new BABYLON.Vector3(...axis))
                  : [voxel];
              if (this.tool == "ADD") {
                let add = face.map(
                  ((axis) => (v) => {
                    let pos = v.position;
                    return this._voxels[pos.x + axis[0]]?.[pos.y + axis[1]]?.[
                      pos.z + axis[2]
                    ];
                  })(axis)
                );
                add.forEach((v) => {
                  v.setEnabled(true);
                  v.setMaterial(this.materialId);
                });
              } else if (this.tool == "REMOVE") {
                face.forEach(v=>v.setEnabled(false));
              } else if (this.tool == "PAINT") {
                face.forEach(v=>v.setMaterial(this.materialId));
              }
            }
          }
        }
      }
      if (e.type == BABYLON.PointerEventTypes.POINTERMOVE) {
        if (this.pointerDown[event.pointerId ?? 0]) {
          this.inputCache[event.pointerId ?? 0] = this.inputCache[
            event.pointerId ?? 0
          ].add(new BABYLON.Vector2(event.movementX, event.movementY));
          if (this.inputCache[event.pointerId ?? 0].length() > 100) {
            console.log("registered!");
          }
        }
      }
    });
  }
}
