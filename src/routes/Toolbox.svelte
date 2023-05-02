<script lang="ts">
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
  import TargetButton from "$lib/components/TargetButton.svelte";
  import {
    COLORS,
    colorId,
    tool,
    mode,
    drag,
    showTarget,
    hasUndo,
    hasRedo,
  } from "./store";
  import { createEventDispatcher } from "svelte";
  import BsPlus from "svelte-icons-pack/bs/BsPlus";
  import BsDash from "svelte-icons-pack/bs/BsDash";
  import ModeButton from "$lib/components/ModeButton.svelte";

  const dispatch = createEventDispatcher();
</script>

<header class="fixed w-full flex flex-row p-1 gap-2 bg-white items-center">
  <!-- <h1 class="text-2xl px-6 font-light self-center">vxltr.</h1> -->
  <!-- <div class="w-1 self-stretch my-2 bg-gray-200" /> -->
  <div class="w-full flex flex-wrap flex-row p-1 gap-2 items-center">
    <div class="flex flex-row gap-1">
      <ToolboxButton
        selected={$tool === "ADD"}
        on:click={() => {
          tool.update(() => "ADD");
        }}
        name="ADD"
      />
      <ToolboxButton
        selected={$tool === "REMOVE"}
        on:click={() => {
          tool.update(() => "REMOVE");
        }}
        name="REMOVE"
      />
      <!-- <ToolboxButton
        selected={$tool === "PAINT"}
        on:click={() => {
          tool.update(() => "PAINT");
        }}
        name="PAINT"
      /> -->
    </div>
    <!-- <button
      class="w-8 h-8 rounded-full drop-shadow-lg data-[selected=true]:ring-2 ring-offset-1 ring-blue-600"
      style={`background-color: ${COLORS[$colorId]}; border-color: ${COLORS[$colorId]}`}
      on:click={() => {
        dispatch("openPalette");
      }}
      aria-label={"Open palette"}
    /> -->
    {#if $drag === false}
      <div class="flex flex-row gap-1">
        <ModeButton
          selected={$mode === "POINT"}
          on:click={() => {
            mode.update(() => "POINT");
          }}
          name="POINT"
        />
        <ModeButton
          selected={$mode === "FACE"}
          on:click={() => {
            mode.update(() => "FACE");
          }}
          name="FACE"
        />
      </div>
    {/if}
    <div class="flex flex-row gap-1">
      <ToolboxButton
        disabled={!$hasUndo}
        selected={$hasUndo}
        on:click={() => {
          dispatch("undo");
        }}
        name={"↩"}
      />
      <ToolboxButton
        disabled={!$hasRedo}
        selected={$hasRedo}
        on:click={() => {
          dispatch("redo");
        }}
        name={"↪"}
      />
    </div>
    <!-- <div class="flex flex-row gap-1">
      <TargetButton
        selected={$showTarget}
        on:click={() => {
          showTarget.update(() => !$showTarget);
        }}
        name={$showTarget ? "HIDE TARGET" : "SHOW TARGET"}
      />
    </div> -->
  </div>
</header>

<style>
</style>
