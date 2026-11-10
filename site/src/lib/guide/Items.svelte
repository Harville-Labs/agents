<script lang="ts">
import { fileUrl, quietLink } from '../repo.ts';
import Rich from './Rich.svelte';
import type { Item } from './types.ts';

let { items, ordered = false }: { items: Item[]; ordered?: boolean } = $props();
</script>

<svelte:element
  this={ordered ? 'ol' : 'ul'}
  class="space-y-1 pl-5 marker:text-foreground-muted {ordered ? 'list-decimal' : 'list-disc'}"
>
  {#each items as item, i (i)}
    <li class="pl-1">
      {#if typeof item === 'string'}
        <Rich text={item} />
      {:else}
        {#if item.path}
          <a class={quietLink} href={fileUrl(item.path)}><code class="font-mono text-[13px]">{item.term}</code></a>
        {:else}
          <code class="font-mono text-[13px]">{item.term}</code>
        {/if}
        {#if item.text}<span class="text-foreground-muted">{item.text}</span>{/if}
      {/if}
    </li>
  {/each}
</svelte:element>
