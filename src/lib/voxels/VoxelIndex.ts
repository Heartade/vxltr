import { Voxel } from "./Voxel";
import * as BABYLON from "babylonjs";
import type { Mode, Tool } from "../../routes/store";
import { MAP_SIZE } from "./Config";
import { Wall } from "./Wall";
import type { SceneManager } from "$lib/scene/InitScene";

export class VoxelIndex {
  private _voxels: Voxel[][][];

  private _materials: BABYLON.StandardMaterial[];
  get materials() {
    return [...this._materials];
  }

  private _sceneManager: SceneManager;
  get sceneManager() {
    return this._sceneManager;
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
        this._voxels[mesh.position.x]?.[mesh.position.y]?.[mesh.position.z];
      return voxel;
    } else return undefined;
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

  enableBox(start: BABYLON.Vector3, endExclusive: BABYLON.Vector3) {
    for (let x = Math.floor(start.x); x < Math.floor(endExclusive.x); x++) {
      for (let y = Math.floor(start.y); y < Math.floor(endExclusive.y); y++) {
        for (let z = Math.floor(start.z); z < Math.floor(endExclusive.z); z++) {
          let voxel = this._voxels[x]?.[y]?.[z];
          if (voxel) voxel.setEnabled(true);
        }
      }
    }
  }

  disableBox(start: BABYLON.Vector3, endExclusive: BABYLON.Vector3) {
    for (let x = Math.floor(start.x); x < Math.floor(endExclusive.x); x++) {
      for (let y = Math.floor(start.y); y < Math.floor(endExclusive.y); y++) {
        for (let z = Math.floor(start.z); z < Math.floor(endExclusive.z); z++) {
          let voxel = this._voxels[x]?.[y]?.[z];
          if (voxel) voxel.setEnabled(false);
        }
      }
    }
  }

  private _dragInfo: [BABYLON.Vector3, BABYLON.Vector3] | null = null;
  private _dragMesh: BABYLON.Mesh | null = null;

  private drawDragMesh() {
    console.log("drawDragMesh");
    if (this._dragInfo) {
      if (this._dragMesh) {
        this._dragMesh.scaling = new BABYLON.Vector3(
          Math.abs(this._dragInfo[0].x - this._dragInfo[1].x) + 1,
          Math.abs(this._dragInfo[0].y - this._dragInfo[1].y) + 1,
          Math.abs(this._dragInfo[0].z - this._dragInfo[1].z) + 1
        );
        this._dragMesh.position = this._dragInfo[0]
          .add(this._dragInfo[1])
          .scale(0.5);
      } else {
        this._dragMesh = BABYLON.MeshBuilder.CreateBox(
          "dragMesh",
          {
            width: 1,
            height: 1,
            depth: 1,
          },
          this._sceneManager.scene
        );
        this._dragMesh.isPickable = false;
        this._dragMesh.position = this._dragInfo[0]
          .add(this._dragInfo[1])
          .scale(0.5);
      }
    }
  }
  onPointer(e: BABYLON.PointerInfo) {
    let event = e.event as BABYLON.IPointerEvent;
    switch (e.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        this.inputCache[event.pointerId ?? 0] = new BABYLON.Vector2(
          event.movementX,
          event.movementY
        );
        this.pointerDown[event.pointerId ?? 0] = true;
        if (this._isDragEnabled) {
          if (e.pickInfo) {
            const point = e.pickInfo.pickedPoint;
            if (point) {
              this._sceneManager.enableCameraMove(false);
              const rounded_point = new BABYLON.Vector3(
                Math.round(point.x),
                Math.round(point.y),
                Math.round(point.z)
              );
              this._dragInfo = [rounded_point, rounded_point];
              this.drawDragMesh();
              console.log([
                Math.round(point.x),
                Math.round(point.y),
                Math.round(point.z),
              ]);
            }
          }
        } else {
          if (e.pickInfo) {
            let pickInfo: BABYLON.PickingInfo = e.pickInfo;
          }
        }
        break;
      case BABYLON.PointerEventTypes.POINTERUP:
        console.log(this.inputCache[event.pointerId ?? 0]);
        let isTouch = this.inputCache[event.pointerId ?? 0]?.length() < 10;
        this.pointerDown[event.pointerId ?? 0] = false;
        if (this._isDragEnabled) {
          this._sceneManager.enableCameraMove(true);
          if (e.pickInfo) {
            const point = e.pickInfo.pickedPoint;
            this._dragMesh?.dispose();
            this._dragMesh = null;
            if (point) {
              const roundedPoint = new BABYLON.Vector3(
                Math.round(point.x),
                Math.round(point.y),
                Math.round(point.z)
              );
              this._dragInfo = [
                this._dragInfo?.[0] ?? roundedPoint,
                roundedPoint,
              ];
              const pointStart = new BABYLON.Vector3(
                Math.min(this._dragInfo[0].x, this._dragInfo[1].x),
                Math.min(this._dragInfo[0].y, this._dragInfo[1].y),
                Math.min(this._dragInfo[0].z, this._dragInfo[1].z)
              );
              const pointEnd = new BABYLON.Vector3(
                Math.max(this._dragInfo[0].x, this._dragInfo[1].x) + 1,
                Math.max(this._dragInfo[0].y, this._dragInfo[1].y) + 1,
                Math.max(this._dragInfo[0].z, this._dragInfo[1].z) + 1
              );
              if (this._tool === "ADD") {
                this.enableBox(pointStart, pointEnd);
              }
              if (this._tool === "REMOVE") {
                this.disableBox(pointStart, pointEnd);
              }
              console.log([
                Math.round(point.x),
                Math.round(point.y),
                Math.round(point.z),
              ]);
              this._dragInfo = null;
            }
          }
        } else {
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
                  face.forEach((v) => v.setEnabled(false));
                } else if (this.tool == "PAINT") {
                  face.forEach((v) => v.setMaterial(this.materialId));
                }
              }
            }
          }
        }
        break;
      case BABYLON.PointerEventTypes.POINTERMOVE:
        if (this.pointerDown[event.pointerId ?? 0]) {
          this.inputCache[event.pointerId ?? 0] = this.inputCache[
            event.pointerId ?? 0
          ].add(new BABYLON.Vector2(event.movementX, event.movementY));
          if (this.inputCache[event.pointerId ?? 0].length() > 100) {
            console.log("registered!");
            if (this._isDragEnabled) {
              const pickInfo = this._scene.pick(
                this._scene.pointerX,
                this._scene.pointerY
              );
              if (pickInfo) {
                console.log("dragging");
                const point = pickInfo.pickedPoint;
                console.log(point);
                if (point) {
                  const roundedPoint = new BABYLON.Vector3(
                    Math.round(point.x),
                    Math.round(point.y),
                    Math.round(point.z)
                  );
                  this._dragInfo = [
                    this._dragInfo?.[0] ?? roundedPoint,
                    roundedPoint,
                  ];
                  this.drawDragMesh();
                }
              }
            }
          }
        }
        break;
    }
  }
  private _isDragEnabled: boolean;
  get isDragEnabled() {
    return this._isDragEnabled;
  }

  private _walls: Wall[];

  private _initWalls(): Wall[] {
    let c = Math.floor((MAP_SIZE - 1) / 2);
    let posrot: [BABYLON.Vector3, BABYLON.Vector3][] = [
      [
        new BABYLON.Vector3(MAP_SIZE - 0.5, c + 0.5, c + 0.5),
        new BABYLON.Vector3(0, Math.PI / 2, 0),
      ],
      [
        new BABYLON.Vector3(-0.5, c + 0.5, c + 0.5),
        new BABYLON.Vector3(0, -Math.PI / 2, 0),
      ],
      [
        new BABYLON.Vector3(c + 0.5, c + 0.5, MAP_SIZE - 0.5),
        new BABYLON.Vector3(0, 0, 0),
      ],
      [
        new BABYLON.Vector3(c + 0.5, c + 0.5, -0.5),
        new BABYLON.Vector3(0, Math.PI, 0),
      ],
      [
        new BABYLON.Vector3(c + 0.5, -0.5, c + 0.5),
        new BABYLON.Vector3(Math.PI / 2, 0, 0),
      ],
      [
        new BABYLON.Vector3(c + 0.5, MAP_SIZE - 0.5, c + 0.5),
        new BABYLON.Vector3(-Math.PI / 2, 0, 0),
      ],
    ];
    let mat = new BABYLON.PBRMaterial("wall", this._scene);
    mat.alpha = 0.15;
    mat.unlit = true;
    return posrot.map(([pos, rot]) => new Wall(this, pos, rot, mat));
  }

  constructor(sceneManager: SceneManager, isDragEnabled: boolean = false) {
    this._sceneManager = sceneManager;
    this._scene = sceneManager.scene;
    this._isDragEnabled = isDragEnabled;
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
    this.enableBox(
      new BABYLON.Vector3(c, c, c),
      new BABYLON.Vector3(c + 2, c + 2, c + 2)
    );
    this._walls = this._initWalls();

    this._scene.onPointerObservable.add(this.onPointer.bind(this));
  }
}
