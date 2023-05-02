import { Voxel } from "./Voxel";
import * as BABYLON from "babylonjs";
import {
  type Mode,
  type Tool,
  hasUndo,
  hasRedo,
  startTimeStamp,
  endTimeStamp,
  addCount,
  removeCount,
  undoCount,
  redoCount,
  touchCount,
  dragCount,
} from "../../routes/store";
import { MAP_SIZE } from "./Config";
import { Wall } from "./Wall";
import type { SceneManager } from "$lib/scene/InitScene";
import * as VectorUtils from "$lib/utils/VectorUtils";

export class VoxelIndex {
  private _voxels: Voxel[][][];

  private _gridTexture: BABYLON.Texture;
  private _filledGridTexture: BABYLON.Texture;
  private _dragMeshMaterial: BABYLON.StandardMaterial;
  private _materials: BABYLON.StandardMaterial[];
  private _transparentMaterials: BABYLON.StandardMaterial[];
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
  setShowTarget(show: boolean) {
    this._testModel.forEach((v) => {
      v.setEnabled(show);
    });
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

  _enableList(list: Voxel[]) {
    list.forEach((v) => {
      v.setEnabled(true);
    });
  }

  _disableList(list: Voxel[]) {
    list.forEach((v) => {
      v.setEnabled(false);
    });
  }

  enableList(list: Voxel[]) {
    this.undoStack.push(["ADD", list]);
    this.redoStack = [];
    addCount.update((x) => x + 1);
    hasUndo.update(() => this.undoStack.length > 0);
    hasRedo.update(() => this.redoStack.length > 0);
    this._enableList(list);
  }

  disableList(list: Voxel[]) {
    this.undoStack.push(["REMOVE", list]);
    removeCount.update((x) => x + 1);
    this._disableList(list);
  }

  enableBox(start: BABYLON.Vector3, endExclusive: BABYLON.Vector3) {
    let list: Voxel[] = [];
    for (let x = Math.floor(start.x); x < Math.floor(endExclusive.x); x++) {
      for (let y = Math.floor(start.y); y < Math.floor(endExclusive.y); y++) {
        for (let z = Math.floor(start.z); z < Math.floor(endExclusive.z); z++) {
          let voxel = this._voxels[x]?.[y]?.[z];
          if (voxel) list.push(voxel);
        }
      }
    }
    this.enableList(list);
  }

  disableBox(start: BABYLON.Vector3, endExclusive: BABYLON.Vector3) {
    let list: Voxel[] = [];
    for (let x = Math.floor(start.x); x < Math.floor(endExclusive.x); x++) {
      for (let y = Math.floor(start.y); y < Math.floor(endExclusive.y); y++) {
        for (let z = Math.floor(start.z); z < Math.floor(endExclusive.z); z++) {
          let voxel = this._voxels[x]?.[y]?.[z];
          if (voxel) list.push(voxel);
        }
      }
    }
    this.disableList(list);
  }

  checkVoxelIsInTestModel(v: Voxel) {
    const checkSingle = (x: number, v: Voxel) => {
      let c = Math.floor((MAP_SIZE - 1) / 2);
      let pos = new BABYLON.Vector3(x / 2 + c + 0.5, MAP_SIZE - x - 2, x / 2);
      let size = new BABYLON.Vector3(MAP_SIZE - x - 2, 1, x + 1);
      return VectorUtils.betweenVector(
        pos.subtract(size.scale(0.5)),
        pos.add(size.scale(0.5)),
        v.position
      );
    };
    return this._testModel.some((_, x) => checkSingle(x, v));
  }

  checkTestModel() {
    let map = this._voxels
      .flat(2)
      .map((v) => v.enabled === this.checkVoxelIsInTestModel(v));
    console.log(map.filter((v) => v).length, map.length);
    let ret = this._voxels
      .flat(2)
      .every((v) => v.enabled === this.checkVoxelIsInTestModel(v));
    // if (ret) {
    //   endTimeStamp.update((v) => {
    //     if (v === 0) return Date.now();
    //     else return v;
    //   });
    // }
    return ret;
  }

  private _dragInfo: [BABYLON.Vector3, BABYLON.Vector3] | null = null;
  private _dragMesh: BABYLON.Mesh | null = null;

  private _testModel: BABYLON.Mesh[] = [];

  private drawDragMesh() {
    const createMesh = (dragInfo: [BABYLON.Vector3, BABYLON.Vector3]) => {
      const scaling = new BABYLON.Vector3(
        Math.abs(dragInfo[0].x - dragInfo[1].x) + 1,
        Math.abs(dragInfo[0].y - dragInfo[1].y) + 1,
        Math.abs(dragInfo[0].z - dragInfo[1].z) + 1
      );
      const mesh = BABYLON.MeshBuilder.CreateTiledBox(
        "dragMesh",
        {
          width: scaling.x,
          height: scaling.y,
          depth: scaling.z,
          tileSize: 1,
          updatable: true,
        },
        this._sceneManager.scene
      );
      mesh.isPickable = false;
      mesh.position = dragInfo[0].add(dragInfo[1]).scale(0.5);
      mesh.renderingGroupId = 1;
      mesh.material = this._dragMeshMaterial;
      return mesh;
    };
    if (this._dragInfo) {
      this._dragMesh?.dispose();
      this._dragMesh = createMesh(this._dragInfo);
    }
  }

  private undoStack: [Tool, Voxel[]][] = [];
  private redoStack: [Tool, Voxel[]][] = [];

  // hasUndo() {
  //   return this.undoStack.length > 0;
  // }

  // hasRedo() {
  //   return this.redoStack.length > 0;
  // }

  undo() {
    const undo = this.undoStack.pop();
    if (undo) {
      undoCount.update((x) => x + 1);
      this.redoStack.push(undo);
      if (undo[0] === "ADD") {
        this._disableList(undo[1]);
      } else {
        this._enableList(undo[1]);
      }
      hasUndo.update(() => this.undoStack.length > 0);
      hasRedo.update(() => this.redoStack.length > 0);
    }
  }

  redo() {
    const redo = this.redoStack.pop();
    if (redo) {
      redoCount.update((x) => x + 1);
      this.undoStack.push(redo);
      if (redo[0] === "ADD") {
        this._enableList(redo[1]);
      } else {
        this._disableList(redo[1]);
      }
      hasUndo.update(() => this.undoStack.length > 0);
      hasRedo.update(() => this.redoStack.length > 0);
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
            const voxel = this.findVoxelFromPick(e.pickInfo);
            const point =
              this.tool === "REMOVE" && voxel
                ? voxel?.position
                : e.pickInfo.pickedPoint;
            if (point) {
              this.materials[this.materialId].opacityTexture =
                this._filledGridTexture;
              this._sceneManager.enableCameraMove(false);
              const rounded_point = VectorUtils.clipVector(
                0,
                MAP_SIZE - 1,
                VectorUtils.roundVector(point)
              );
              this._dragInfo = [rounded_point, rounded_point];
              this.drawDragMesh();
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
        let isTouch = this.inputCache[event.pointerId ?? 0]?.length() < 30;
        if (isTouch) {
          touchCount.update((x) => x + 1);
        } else {
          dragCount.update((x) => x + 1);
        }
        this.pointerDown[event.pointerId ?? 0] = false;
        if (this._isDragEnabled) {
          this.materials[this.materialId].opacityTexture = null;
          this._sceneManager.enableCameraMove(true);
          if (e.pickInfo) {
            const voxel = this.findVoxelFromPick(e.pickInfo);
            const point =
              this.tool === "REMOVE" && voxel
                ? voxel?.position
                : e.pickInfo.pickedPoint;
            this._dragMesh?.dispose();
            this._dragMesh = null;
            if (point) {
              const roundedPoint = VectorUtils.clipVector(
                0,
                MAP_SIZE - 1,
                VectorUtils.roundVector(point)
              );
              if (!isTouch && this._dragInfo) {
                this._dragInfo = [this._dragInfo[0], roundedPoint];
                const pointStart = VectorUtils.minVector(
                  this._dragInfo[0],
                  this._dragInfo[1]
                );
                const pointEnd = VectorUtils.maxVector(
                  this._dragInfo[0],
                  this._dragInfo[1]
                ).add(BABYLON.Vector3.One());

                if (this._tool === "ADD") {
                  this.enableBox(pointStart, pointEnd);
                }
                if (this._tool === "REMOVE") {
                  this.disableBox(pointStart, pointEnd);
                }
              }
            }
          }
          this._dragInfo = null;
        } else {
          if (e.pickInfo) {
            let pickInfo: BABYLON.PickingInfo = e.pickInfo;
            if (isTouch) {
              let pickedPoint = e.pickInfo.pickedPoint;
              let voxel = this.findVoxelFromPick(pickInfo);
              if (!voxel) {
                if (pickedPoint && this.tool == "ADD") {
                  if (this.mode == "FACE") {
                    let arr = pickedPoint.asArray();
                    let minVal = arr.indexOf(Math.min(...arr));
                    let maxVal = arr.indexOf(Math.max(...arr));
                    let startingPoint = [0, 0, 0];
                    let endPoint = [MAP_SIZE, MAP_SIZE, MAP_SIZE];
                    if (arr[minVal] < 0) {
                      endPoint[minVal] = 1;
                    } else {
                      startingPoint[maxVal] = MAP_SIZE - 1;
                    }
                    this.enableBox(
                      new BABYLON.Vector3(...startingPoint),
                      new BABYLON.Vector3(...endPoint)
                    );
                  } else {
                    let pos = VectorUtils.clipVector(
                      0,
                      MAP_SIZE - 1,
                      VectorUtils.roundVector(pickedPoint)
                    );
                    let v = this._voxels[pos.x]?.[pos.y]?.[pos.z];
                    if (v) {
                      this.enableList([v]);
                      v.setMaterial(this.materialId);
                    }
                  }
                }
              } else {
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
                        return this._voxels[pos.x + axis[0]]?.[
                          pos.y + axis[1]
                        ]?.[pos.z + axis[2]];
                      })(axis)
                    );
                    this.enableList(add);
                  } else if (this.tool == "REMOVE") {
                    this.disableList(face);
                  } else if (this.tool == "PAINT") {
                    face.forEach((v) => v.setMaterial(this.materialId));
                  }
                }
              }
            }
          }
        }
        console.log(this.checkTestModel());
        break;
      case BABYLON.PointerEventTypes.POINTERMOVE:
        if (this.pointerDown[event.pointerId ?? 0]) {
          this.inputCache[event.pointerId ?? 0] = this.inputCache[
            event.pointerId ?? 0
          ].add(
            new BABYLON.Vector2(
              Math.abs(event.movementX),
              Math.abs(event.movementY)
            )
          );
          if (this.inputCache[event.pointerId ?? 0].length() > 30) {
            console.log("registered!");
            if (this._isDragEnabled) {
              const pickInfo = this._scene.pick(
                this._scene.pointerX,
                this._scene.pointerY
              );
              if (this._dragInfo && pickInfo) {
                console.log("dragging");
                const voxel = this.findVoxelFromPick(pickInfo);
                const point =
                  this.tool === "REMOVE" && voxel
                    ? voxel?.position
                    : pickInfo.pickedPoint;
                console.log(point);
                if (point) {
                  const roundedPoint = VectorUtils.clipVector(
                    0,
                    MAP_SIZE - 1,
                    VectorUtils.roundVector(point)
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
    mat.alpha = 0.1;
    mat.unlit = true;
    mat.opacityTexture = this._gridTexture;
    return posrot.map(([pos, rot]) => new Wall(this, pos, rot, mat));
  }

  constructor(sceneManager: SceneManager, isDragEnabled: boolean = false) {
    this._sceneManager = sceneManager;
    this._scene = sceneManager.scene;
    this._isDragEnabled = isDragEnabled;
    this._dragMeshMaterial = new BABYLON.StandardMaterial(
      "drag-mesh-material",
      this._scene
    );
    //this._dragMeshMaterial.backFaceCulling = false;
    this._gridTexture = new BABYLON.Texture(
      "texture/grid_filled.png",
      this.scene
    );
    this._gridTexture.uScale = MAP_SIZE;
    this._gridTexture.vScale = MAP_SIZE;
    this._filledGridTexture = new BABYLON.Texture(
      "texture/grid_filled.png",
      this.scene
    );
    this._dragMeshMaterial.opacityTexture = this._filledGridTexture;
    this._dragMeshMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    this._dragMeshMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    this._dragMeshMaterial.alpha = 0.25;
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
    this._transparentMaterials = this._materials.map((m) => {
      let n = m.clone(`transparent-${m.name}`) as BABYLON.StandardMaterial;
      n.opacityTexture = this._filledGridTexture;
      return n;
    });
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
    this._voxels.flat(2).forEach((v) => v.setMaterial(this.materialId));
    let c = Math.floor((MAP_SIZE - 1) / 2);
    const testModelMaterial = new BABYLON.StandardMaterial(
      "test-model-material",
      this._scene
    );
    testModelMaterial.diffuseColor = new BABYLON.Color3(0.3, 1, 0.5);
    testModelMaterial.emissiveColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    testModelMaterial.alpha = 0.5;
    // testModelMaterial.opacityTexture = this._filledGridTexture;
    this._testModel = new Array(MAP_SIZE - 2).fill(0).map((_, x) => {
      const mesh = BABYLON.MeshBuilder.CreateTiledBox(`test-model-${x}`, {
        width: MAP_SIZE - x - 1.99,
        height: 1.01,
        depth: x + 1.01,
        tileSize: 1,
      });
      mesh.isPickable = false;
      mesh.position = new BABYLON.Vector3(
        x / 2 + c + 0.5,
        MAP_SIZE - x - 2,
        x / 2
      );
      // mesh.renderingGroupId = 2;
      mesh.material = testModelMaterial;
      return mesh;
    });
    // if (!isDragEnabled) {
    //   this.enableBox(
    //     new BABYLON.Vector3(c, c, c),
    //     new BABYLON.Vector3(c + 2, c + 2, c + 2)
    //   );
    // }
    this._walls = this._initWalls();

    this._scene.onPointerObservable.add(this.onPointer.bind(this));
    startTimeStamp.update(() => Date.now());
  }
}
