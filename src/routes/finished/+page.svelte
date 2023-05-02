<script lang="ts">
  import {
    endTimeStamp,
    startTimeStamp,
    addCount,
    removeCount,
    dragCount,
    touchCount,
    undoCount,
    redoCount,
  } from "../store";
</script>

<svelte:head>
  <title>Thank You!</title>
  <meta
    name="description"
    content="thank you for participating in the Vxltr ux trial."
  />
</svelte:head>

<section class="flex grow flex-col p-10">
  <h1 class="text-xl font-bold">Thank You</h1>
  <p>
    Thank you for participating in the UX trial.<br />
    You finished the trial in <b>{$endTimeStamp - $startTimeStamp}ms</b>.<br />
    Your feedback is appreciated.
  </p>
</section>
