<script lang="ts">
  import { onMount } from "svelte";
  import type { VoxelIndex } from "$lib/voxels";
  import Toolbox from "./Toolbox.svelte";
  import ColorSelector from "./ColorSelector.svelte";
  import { tool, colorId, mode, drag, showTarget } from "./store";
  import { SceneManager } from "$lib/scene/InitScene";

  let canvas: HTMLCanvasElement;
  let voxels: VoxelIndex;
  let sceneManager: SceneManager;
  let showPalette: boolean = false;

  onMount(() => {
    drag.update(() => location.href.includes("group=a"));
    sceneManager = new SceneManager(canvas, $drag);
    voxels = sceneManager.voxels;
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

  $: if ($showTarget) {
    if (voxels) {
      voxels.setShowTarget($showTarget);
    }
  } else {
    if (voxels) {
      voxels.setShowTarget(false);
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
