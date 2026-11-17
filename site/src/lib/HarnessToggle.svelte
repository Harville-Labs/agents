<script lang="ts">
import { ToggleGroup } from '@sivir-ui/svelte';
import { harness, harnesses, isHarness, pick } from './harness.svelte.ts';

// ToggleGroup clears its value when the active item is clicked again; keep the last pick.
let choice = $derived<string | string[] | undefined>(harness.current);
$effect(() => {
  if (isHarness(choice)) pick(choice);
  else choice = harness.current;
});
</script>

<div class="flex flex-wrap items-center gap-3">
  <fieldset class="contents">
    <legend class="float-left mr-3 text-foreground-muted">skills for</legend>
    <ToggleGroup.Root bind:value={choice}>
      {#each harnesses as h (h.value)}
        <ToggleGroup.Item value={h.value}>{h.label}</ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </fieldset>
</div>
