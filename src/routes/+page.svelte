<script lang="ts">
  import welcome from "$lib/images/svelte-welcome.webp";
  import welcome_fallback from "$lib/images/svelte-welcome.png";
  import { onMount } from "svelte";
  import * as BABYLON from "babylonjs";
  import { VoxelIndex, MAP_SIZE } from "$lib/voxel-set";
  import Toolbox from "./Toolbox.svelte";
  import ColorSelector from "./ColorSelector.svelte";
  import { tool, colorId, mode } from "./store";

  let canvas: HTMLCanvasElement;
  let engine: BABYLON.Engine;
  let scene: BABYLON.Scene;
  let camera: BABYLON.ArcRotateCamera;
  let light: BABYLON.HemisphericLight;
  let voxels: VoxelIndex;
  let showPalette: boolean = false;

  onMount(() => {
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      0,
      0,
      new BABYLON.Vector3(MAP_SIZE / 2 - 0.5, MAP_SIZE / 2 - 0.5, MAP_SIZE / 2 - 0.5),
      scene
    );
    camera.setPosition(
      new BABYLON.Vector3(MAP_SIZE, MAP_SIZE, MAP_SIZE)
    );
    camera.attachControl(canvas, true);
    light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(1, 3, 2),
      scene
    );
    voxels = new VoxelIndex(scene);

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });
  });

  $: if ($tool) {
    if (voxels) {
      voxels.setTool($tool);
    }
  }

  $: if ($mode) {
	if (voxels) {
	  voxels.setMode($mode);
	}
  }

  $: if ($colorId) {
    if (voxels) {
      voxels.setMaterialId($colorId);
    }
  }
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="vxltr. a web-based voxel art creator" />
</svelte:head>

<section class="flex grow flex-col">
  <Toolbox on:openPalette={()=>{showPalette = true}} />
  <canvas class="w-full flex grow" bind:this={canvas} />
  {#if showPalette}
	<ColorSelector on:close={()=>{showPalette = false}}/>
  {/if}
</section>

<style>
</style>
