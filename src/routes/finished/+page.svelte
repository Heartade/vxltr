<script lang="ts">
  import { goto } from "$app/navigation";
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
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
    Your feedback is greatly appreciated.<br />
    Please copy the below value and paste it in the feedback form.<br />
    <code>
      <b>
        {$endTimeStamp -
          $startTimeStamp},{$addCount},{$removeCount},{$undoCount},{$redoCount},{$dragCount},{$touchCount}
      </b>
    </code>
    <br />
  </p>
  <div class="flex flex-row gap-1">
    <ToolboxButton
      selected={false}
      disabled={false}
      name="Copy"
      on:click={() => {
        navigator.clipboard.writeText(
          `${
            $endTimeStamp - $startTimeStamp
          },${$addCount},${$removeCount},${$undoCount},${$redoCount},${$dragCount},${$touchCount}`
        );
        let u = new URL(location.origin);
        goto(u);
        alert("copied");
      }}
    />
    <ToolboxButton
      selected={true}
      disabled={false}
      name="Proceed to Feedback"
      on:click={() => {
        let u = new URL(location.origin);
        goto(u);
      }}
    />
  </div>
</section>
