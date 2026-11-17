<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import { badge, type Example } from './examples.ts';
import Rich from './guide/Rich.svelte';
import { cmd } from './harness.svelte.ts';
import { fileUrl, quietLink } from './repo.ts';
import Section from './Section.svelte';

let { example: e }: { example: Example } = $props();

const used = $derived(new Set(e.steps.flatMap((s) => s.uses ?? []).map((r) => r.path)).size);
</script>

<Section id={e.id} title="{cmd(e.skill)} {e.prompt}">
  <p class="text-foreground-muted">
    From this one line, go runs {e.steps.length} steps and draws on {used} skills, references, and agents,
    following
    {#each e.playbooks as p, i (p.path)}{i === 0 ? '' : i === e.playbooks.length - 1 ? ' and ' : ', '}<a
        class={quietLink}
        href={fileUrl(p.path)}><Typography.InlineCode>{p.label}</Typography.InlineCode></a
      >{/each}.
  </p>
  <p class="border-l-2 border-border-strong pl-3">
    <span class="mr-1 text-foreground-muted">what you need to know:</span>{e.know}
  </p>

  <ol class="relative space-y-5 border-l border-border pl-6">
    {#each e.steps as step, i (step.title)}
      <li class="relative">
        <span
          class="absolute top-0.5 -left-[2.15rem] flex size-5 items-center justify-center rounded-full bg-background font-mono text-[11px] ring-1 ring-border-strong"
          >{i + 1}</span
        >
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span class="font-medium">{step.title}</span>
          <span class={badge[step.by]}>{step.by}</span>
        </div>
        <p class="mt-1 text-foreground-muted"><Rich text={step.text} /></p>
        {#if step.uses?.length}
          <p class="mt-1.5 flex flex-wrap gap-1.5">
            {#each step.uses as ref (ref.path)}
              <a class={quietLink} href={fileUrl(ref.path)}><Typography.InlineCode>{ref.label}</Typography.InlineCode></a>
            {/each}
          </p>
        {/if}
      </li>
    {/each}
  </ol>

  <div class="grid gap-6 sm:grid-cols-2">
    <div class="space-y-2">
      <Typography.H3>it will</Typography.H3>
      <ul class="list-disc space-y-1 pl-5 marker:text-foreground-muted">
        {#each e.will as line (line)}<li><Rich text={line} /></li>{/each}
      </ul>
    </div>
    <div class="space-y-2">
      <Typography.H3>it won't</Typography.H3>
      <ul class="list-disc space-y-1 pl-5 marker:text-foreground-muted">
        {#each e.wont as line (line)}<li><Rich text={line} /></li>{/each}
      </ul>
    </div>
  </div>

  {#if e.variants?.length}
    <dl class="divide-y divide-border">
      {#each e.variants as [say, change] (say)}
        <div class="grid gap-1 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4">
          <dt><span class="mr-1 text-foreground-muted">say</span>"{say}"</dt>
          <dd class="text-foreground-muted">{change}</dd>
        </div>
      {/each}
    </dl>
  {/if}
</Section>
