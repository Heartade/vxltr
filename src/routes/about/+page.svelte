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
    dragInit.update((v) => {
      if (!v) drag.update(() => Math.random() > 0.5);
      return true;
    });
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
    Thank you for participating in the UX trial.<br />
    You will be asked to recreate a voxel model displayed in <b>green</b> using
    the Vxltr app.<br />
  </p>
  <ToolboxButton
    selected={true}
    disabled={false}
    name="Start Trial"
    on:click={() => {
      let u = new URL(location.origin)
      goto(u)
    }}
  />
</section>
