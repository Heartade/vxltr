<script lang="ts">
  import Icon from "svelte-icons-pack/Icon.svelte";
  import AiOutlineNodeExpand from "svelte-icons-pack/ai/AiOutlineNodeExpand";
  import { createEventDispatcher } from "svelte";

  export let selected: boolean;
  const dispatch = createEventDispatcher();
</script>

<button
  data-selected={selected}
  class="rounded data-[selected=true]:bg-blue-300 hover:bg-blue-700 bg-blue-500 text-white font-bold p-1"
  on:click={() => {
    dispatch("click");
  }}
>
  <slot />
</button>
