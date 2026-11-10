<script lang="ts">
import { Badge, CodeBlock, ToggleGroup, Typography } from '@sivir-ui/svelte';
import { otherPlaybooks, playbooks } from './data.ts';
import { cmd } from './harness.svelte.ts';

// ToggleGroup clears its value when the active item is clicked again; keep the last pick.
let chosen = $state<string | string[] | undefined>(playbooks[0].name);
let last = $state(playbooks[0]);
$effect(() => {
  const p = playbooks.find((x) => x.name === chosen);
  if (p) last = p;
  else chosen = last.name;
});
</script>

<div class="grid gap-6 sm:grid-cols-[13rem_minmax(0,1fr)]">
  <fieldset>
  <legend class="sr-only">task</legend>
  <ToggleGroup.Root
    bind:value={chosen}
    class="flex-col items-stretch gap-0.5 [&_button]:h-auto [&_button]:justify-start [&_button]:py-1.5 [&_button]:text-left"
  >
    {#each playbooks as p (p.name)}
      <ToggleGroup.Item value={p.name}>{p.task}</ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
  </fieldset>

  <div class="min-w-0 space-y-4" aria-live="polite">
    <div class="space-y-1">
      <Typography.H3>{last.name}</Typography.H3>
      <p class="text-foreground-muted">{last.when}</p>
    </div>
    <CodeBlock code={`${cmd('go')} ${last.example}`} lang="plaintext" copy="inline" />
    <ol class="list-decimal space-y-1.5 pl-5 marker:text-foreground-muted">
      {#each last.steps as step (step)}
        <li class="pl-1">{step}</li>
      {/each}
    </ol>
    {#if last.skills.length}
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="mr-1 text-foreground-muted">calls</span>
        {#each last.skills as s (s)}
          <Badge variant="secondary">{s}</Badge>
        {/each}
      </div>
    {/if}
  </div>
</div>
<p class="text-foreground-muted">{otherPlaybooks}</p>
