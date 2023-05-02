<script lang="ts">
  import { goto } from "$app/navigation";
  import ToolboxButton from "$lib/components/ToolboxButton.svelte";
  import {
    endTimeStamp,
    drag,
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
    Your feedback is greatly appreciated.<br /><br />
    <b class="text-lg">
      Please copy the below value and paste it in the feedback form.
    </b><br /><br />
    <code>
      <b>
        {$drag},{$endTimeStamp -
          $startTimeStamp},{$addCount},{$removeCount},{$undoCount},{$redoCount},{$dragCount},{$touchCount}
      </b>
    </code>
    <br /><br />
  </p>
  <div class="flex flex-row gap-1">
    <ToolboxButton
      selected={false}
      disabled={false}
      name="Copy"
      on:click={() => {
        navigator.clipboard.writeText(
          `${$drag},${
            $endTimeStamp - $startTimeStamp
          },${$addCount},${$removeCount},${$undoCount},${$redoCount},${$dragCount},${$touchCount}`
        );
        alert("copied");
      }}
    />
    <ToolboxButton
      selected={true}
      disabled={false}
      name="Proceed to Feedback"
      on:click={() => {
        location.href = "https://forms.office.com/r/Xy4ea0uzXU";
      }}
    />
  </div>
</section>
