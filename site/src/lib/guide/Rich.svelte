<script lang="ts">
import { Typography } from '@sivir-ui/svelte';

let { text }: { text: string } = $props();

const parts = $derived(text.split('`'));
</script>

{#each parts as part, i (i)}{#if i % 2}<Typography.InlineCode>{part}</Typography.InlineCode>{:else}{part}{/if}{/each}
