<script lang="ts">
  import Icon from "svelte-icons-pack/Icon.svelte";
  import AiOutlineNodeExpand from "svelte-icons-pack/ai/AiOutlineNodeExpand";
  import { createEventDispatcher } from "svelte";

  export let selected: boolean;
  export let disabled: boolean = false;
  export let name: string;
  const dispatch = createEventDispatcher();
</script>

<button
  data-selected={selected}
  disabled={disabled}
  class="rounded-lg disabled:bg-gray-300 text-sm disabled:text-gray-400 disabled:border-gray-400 data-[selected=true]:bg-blue-500 tracking-wider data-[selected=true]:text-white data-[selected=true]:font-medium font-medium text-blue-500 data-[selected=true]:hover:bg-blue-400 hover:bg-blue-100 border-2 border-blue-500 bg-white py-1 px-2"
  on:click={() => {
    dispatch("click");
  }}
>
  {name}
  <!-- <Icon src={iconSrc} size="32" /> -->
</button>
