<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let selected: boolean;
  export let name: string;
  const dispatch = createEventDispatcher();
</script>

<button
  data-selected={selected}
  class="rounded-lg text-sm data-[selected=true]:bg-orange-500 tracking-wider data-[selected=true]:text-white data-[selected=true]:font-medium font-medium text-orange-500 data-[selected=true]:hover:bg-orange-400 hover:bg-orange-100 border-2 border-orange-500 bg-white py-1 px-2"
  on:click={() => {
    dispatch("click");
  }}
>
  {name}
  <!-- <Icon src={iconSrc} size="32" /> -->
</button>
