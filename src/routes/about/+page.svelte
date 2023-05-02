<script lang="ts">
  import { onMount } from "svelte";
  import {
    endTimeStamp,
    startTimeStamp,
    addCount,
    removeCount,
    dragCount,
    touchCount,
    undoCount,
    redoCount,
    dragInit,
    drag,
  } from "../store";
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
  import { goto } from "$app/navigation";

  onMount(() => {
    drag.update(() => true);
  });
</script>

<svelte:head>
  <title>About</title>
  <meta
    name="description"
    content="thank you for participating in the Vxltr ux trial."
  />
</svelte:head>

<section class="flex grow flex-col p-10">
  <h1 class="text-xl font-bold">About</h1>
  <p>
    Thank you for participating in the UX trial.<br /><br />
    <b class="text-lg">
      Your task is recreating the voxel model displayed in
      <span class="text-green-700">green</span>
      using the app.
    </b><br /><br />
    {#if $drag}
      Drag between points to fill or erase voxels.
    {:else}
      <b>POINT</b> mode adds or removes a voxel on the point you touch.
      <b>FACE</b> mode adds or removes voxels on the surface you touch.
    {/if}
    <br />
    The trial will start when you click the <b>Start Trial</b> button below. It will
    usually take around 1~2 minutes.
  </p>
  <ToolboxButton
    selected={true}
    disabled={false}
    name="Start Trial"
    on:click={() => {
      let u = new URL(location.origin);
      goto(u);
    }}
  />
</section>
