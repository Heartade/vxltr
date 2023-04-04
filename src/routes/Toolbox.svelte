<script lang="ts">
  import Icon from "svelte-icons-pack/Icon.svelte";
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
  import { tool } from "./store";
  import AiOutlineNodeExpand from "svelte-icons-pack/ai/AiOutlineNodeExpand";
  import BsPlus from "svelte-icons-pack/bs/BsPlus";
  import BsDash from "svelte-icons-pack/bs/BsDash";
</script>

<div class="w-full flex flex-row p-2 gap-2">
  <ToolboxButton
    selected={$tool === "ADD"}
    on:click={() => {
      tool.update(() => "ADD");
    }}
  >
    <Icon src={BsPlus} size="32" />
  </ToolboxButton>
  <ToolboxButton
    selected={$tool === "REMOVE"}
    on:click={() => {
      tool.update(() => "REMOVE");
    }}
  >
    <Icon src={BsDash} size="32" />
  </ToolboxButton>
</div>

<style>
</style>
