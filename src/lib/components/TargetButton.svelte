<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let selected: boolean;
  export let name: string;
  const dispatch = createEventDispatcher();
</script>

<button
  data-selected={selected}
  class="rounded-lg text-sm data-[selected=true]:bg-pink-500 data-[selected=true]:border-pink-500  tracking-wider text-white font-medium data-[selected=true]:hover:bg-pink-400 hover:bg-green-400 bg-green-500 border-2 border-green-500 py-1 px-2 w-36"
  on:click={() => {
    dispatch("click");
  }}
>
  {name}
  <!-- <Icon src={iconSrc} size="32" /> -->
</button>
