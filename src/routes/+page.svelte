<script lang="ts">
  import { onMount } from "svelte";
  import type { VoxelIndex } from "$lib/voxels";
  import Toolbox from "./Toolbox.svelte";
  import ColorSelector from "./ColorSelector.svelte";
  import {
    tool,
    colorId,
    mode,
    drag,
    dragInit,
    showTarget,
    startTimeStamp,
    endTimeStamp,
    addCount,
    removeCount,
    undoCount,
    redoCount,
    dragCount,
    touchCount,
  } from "./store";
  import { SceneManager } from "$lib/scene/InitScene";
  import { goto } from "$app/navigation";

  let canvas: HTMLCanvasElement;
  let voxels: VoxelIndex;
  let sceneManager: SceneManager;
  let showPalette: boolean = false;

  onMount(() => {
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
  $: if ($endTimeStamp > 0) {
    let url = new URL(location.origin + "/finished");
    goto(url);
  }
</script>

<svelte:head>
  <title>Vxltr</title>
  <meta name="description" content="vxltr. a web-based voxel art creator" />
</svelte:head>

<section class="flex grow flex-col">
  <Toolbox
    on:openPalette={() => {
      showPalette = true;
    }}
    on:undo={() => {
      voxels.undo();
    }}
    on:redo={() => {
      voxels.redo();
    }}
  />
  <canvas class="w-full flex grow" bind:this={canvas} />
  {#if showPalette}
    <ColorSelector
      on:close={() => {
        showPalette = false;
      }}
    />
  {/if}
</section>

<style>
</style>
