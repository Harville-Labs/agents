<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import { cmd } from './harness.svelte.ts';
import { quietLink, skillUrl } from './repo.ts';

let { name }: { name: string } = $props();
</script>

<a class={quietLink} href={skillUrl(name)}>
  <Typography.InlineCode>{cmd(name)}</Typography.InlineCode>
</a>
