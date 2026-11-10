<script lang="ts">
import { Input, Typography } from '@sivir-ui/svelte';
import GuideEntry from '../../lib/guide/GuideEntry.svelte';
import { sections } from '../../lib/guide/index.ts';
import { repo } from '../../lib/repo.ts';
import Section from '../../lib/Section.svelte';
import { site } from '../../lib/site.ts';

const pstack = 'https://github.com/cursor/plugins/tree/main/pstack';
const port = 'https://github.com/michael-denyer/pstack-claude';
const link =
  'text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground';

const indexed = sections.map((s) => ({
  ...s,
  entries: s.entries.map((entry) => ({ entry, text: JSON.stringify(entry).toLowerCase() })),
}));

let query = $state('');
const shown = $derived.by(() => {
  const q = query.trim().toLowerCase();
  return indexed
    .map((s) => ({ ...s, entries: q ? s.entries.filter((e) => e.text.includes(q)) : s.entries }))
    .filter((s) => s.entries.length);
});
</script>

<svelte:head>
  <title>field guide · hl plugin</title>
  <meta
    name="description"
    content="Every skill, playbook, principle, and agent in the hl plugin: what it is, when it runs, what it does, and one line that explains it."
  />
  <link rel="canonical" href="{site}/guide/" />
</svelte:head>

<nav class="absolute top-4 right-4 flex gap-4 text-foreground-muted lowercase sm:top-6 sm:right-6">
  <a href="../" class="hover:text-foreground">hl plugin</a>
  <a href={repo} class="hover:text-foreground">github</a>
</nav>

<main
  class="mx-auto max-w-[680px] space-y-10 px-4 pt-16 pb-28 text-[15px] leading-relaxed lowercase sm:px-6 [&_code]:normal-case"
>
  <header class="space-y-5">
    <Typography.H1>field guide</Typography.H1>
    <Typography.Text variant="lead">
      every skill, playbook, principle, and agent in the hl plugin: what it is, when it runs, what it does step
      by step, and one line you can say out loud to explain it. adapted from lauren tan's (poteto)
      <a class={link} href={pstack}>pstack</a> and michael denyer's <a class={link} href={port}>claude code port</a>.
    </Typography.Text>
    <nav aria-label="sections" class="flex flex-wrap gap-x-4 gap-y-1 text-foreground-muted">
      {#each sections as s (s.id)}
        <a href="#{s.id}" class="hover:text-foreground">{s.title}</a>
      {/each}
    </nav>
    <Input type="search" bind:value={query} placeholder="filter skills…" aria-label="filter skills" />
  </header>

  {#each shown as s (s.id)}
    <Section id={s.id} title={s.title}>
      {#if s.sub}<p class="text-foreground-muted">{s.sub}</p>{/if}
      <dl class="divide-y divide-border">
        {#each s.entries as { entry } (entry.title.join())}
          <GuideEntry {entry} />
        {/each}
      </dl>
    </Section>
  {:else}
    <p class="text-foreground-muted">no skills match that filter.</p>
  {/each}
</main>
