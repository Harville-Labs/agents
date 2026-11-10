<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import { fileUrl, quietLink } from '../repo.ts';
import Items from './Items.svelte';
import Rich from './Rich.svelte';
import type { Entry } from './types.ts';

let { entry }: { entry: Entry } = $props();
</script>

<div class="grid gap-1 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
  <dt class="font-medium">
    {#each entry.title as [label, path], i (label)}
      {#if i}<span class="text-foreground-muted"> / </span>{/if}
      {#if path}
        <a class={quietLink} href={fileUrl(path)}>
          {#if entry.mono}<Typography.InlineCode>{label}</Typography.InlineCode>{:else}{label}{/if}
        </a>
      {:else}
        {label}
      {/if}
    {/each}
  </dt>
  <dd class="min-w-0 space-y-2">
    {#if entry.one}<p><Rich text={entry.one} /></p>{/if}
    {#each entry.body ?? [] as block, i (i)}
      <div class="space-y-1 text-foreground-muted">
        {#if block.label}<p class="text-[13px] text-foreground">{block.label}</p>{/if}
        {#if 'p' in block}
          <p><Rich text={block.p} /></p>
        {:else if 'ol' in block}
          <Items items={block.ol} ordered />
        {:else if 'ul' in block}
          <Items items={block.ul} />
        {:else}
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-border">
                {#each block.table[0] as head (head)}<th class="py-2 pr-4 font-normal">{head}</th>{/each}
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each block.table.slice(1) as row, r (r)}
                <tr>
                  {#each row as cell, c (c)}<td class="py-2 pr-4 align-top text-foreground"><Rich text={cell} /></td>{/each}
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/each}
    {#if entry.say}
      <p class="border-l-2 border-border-strong pl-3">
        <span class="text-foreground-muted">say it: </span><Rich text={entry.say} />
      </p>
    {/if}
  </dd>
</div>
