<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import { cmd } from './harness.svelte.ts';

let { name }: { name: string } = $props();
</script>

<Typography.InlineCode>{cmd(name)}</Typography.InlineCode>
