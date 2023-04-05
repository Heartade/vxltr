<script lang="ts">
  import ColorButton from "$lib/components/ColorButton.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<div
  class="absolute top-0 left-0 bottom-0 w-full h-screen flex flex-col items-center justify-center"
>
  <div class="flex flex-col self-center rounded-xl bg-white drop-shadow-xl">
    <div class="flex flex-row gap-2 p-2 self-stretch justify-between">
      <h1 class="text-2xl px-1 font-light self-center">Palette</h1>
      <button
        class="rounded-lg bg-blue-500 tracking-wider text-white font-medium hover:bg-blue-400 py-1 px-2"
        on:click={() => {
          dispatch("close");
        }}
      >
        Close</button
      >
    </div>
    <div class="w-full h-1 bg-gray-200" />
    <div class="grid grid-cols-8 gap-2 p-3">
      {#each [...new Array(64).keys()] as i}
        <ColorButton
          colorId={i}
          on:click={() => {
            dispatch("close");
          }}
        />
      {/each}
    </div>
  </div>
</div>

<style>
</style>
