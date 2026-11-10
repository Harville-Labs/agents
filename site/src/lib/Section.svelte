<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import type { Snippet } from 'svelte';

let { title, id, children }: { title: string; id: string; children: Snippet } = $props();
</script>

<section {id} class="scroll-mt-8 space-y-4 border-t border-border pt-10">
  <Typography.H2>{title}</Typography.H2>
  {@render children()}
</section>
