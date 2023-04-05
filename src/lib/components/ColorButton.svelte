<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { COLORS, colorId as colorIdState } from "../../routes/store";

  export let colorId: number;
  const dispatch = createEventDispatcher();
</script>

<button
  data-selected={$colorIdState === colorId}
  class="w-8 h-8 rounded-full drop-shadow-lg data-[selected=true]:ring-2 ring-offset-1 ring-blue-600"
  style={`background-color: ${COLORS[colorId]}; border-color: ${COLORS[colorId]}`}
  on:click={() => {
    colorIdState.update(() => colorId);
    dispatch("click");
  }}
  aria-label={`Color id: ${colorId}`}
/>
