import { MAP_SIZE, VoxelIndex } from "$lib/voxels";
import * as BABYLON from "babylonjs";

export class SceneManager {
  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  get scene() {
    return this._scene;
  }
  private _camera: BABYLON.ArcRotateCamera;
  get camera() {
    return this._camera;
  }
  private _light: BABYLON.HemisphericLight;
  private _voxels: VoxelIndex;
  get voxels() {
    return this._voxels;
  }

  enableCameraMove(enable: boolean) {
    if (enable) this._camera.attachControl(this._canvas, true);
    else this._camera.detachControl();
  }

  constructor(canvas: HTMLCanvasElement, isDragMode: boolean) {
    this._canvas = canvas;
    this._engine = new BABYLON.Engine(canvas, true);
    this._scene = new BABYLON.Scene(this._engine);
    this._camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      0,
      0,
      new BABYLON.Vector3(
        MAP_SIZE / 2 - 0.5,
        MAP_SIZE / 2 - 0.5,
        MAP_SIZE / 2 - 0.5
      ),
      this._scene
    );
    this._camera.setPosition(new BABYLON.Vector3(MAP_SIZE * 2, MAP_SIZE * 2, MAP_SIZE * 2));
    this._camera.attachControl(canvas, true);
    this._light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 3, 2),
      this._scene
    );
    this._voxels = new VoxelIndex(this, isDragMode);
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }
}
