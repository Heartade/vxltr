<script lang="ts">
  import Icon from "svelte-icons-pack/Icon.svelte";
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
  import { COLORS, colorId, tool, mode } from "./store";
  import { createEventDispatcher } from "svelte";
  import BsPlus from "svelte-icons-pack/bs/BsPlus";
  import BsDash from "svelte-icons-pack/bs/BsDash";
  import ModeButton from "$lib/components/ModeButton.svelte";

  const dispatch = createEventDispatcher();
</script>

<header class="w-full flex flex-wrap flex-row p-2 gap-3 bg-white items-center">
  <h1 class="text-2xl px-6 font-light self-center">vxltr.</h1>
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
    <ToolboxButton
      selected={$tool === "PAINT"}
      on:click={() => {
        tool.update(() => "PAINT");
      }}
      name="PAINT"
    />
  </div>
  <button
    class="w-8 h-8 rounded-full drop-shadow-lg data-[selected=true]:ring-2 ring-offset-1 ring-blue-600"
    style={`background-color: ${COLORS[$colorId]}; border-color: ${COLORS[$colorId]}`}
    on:click={() => {
      dispatch("openPalette");
    }}
    aria-label={"Open palette"}
  />
</header>

<style>
</style>
