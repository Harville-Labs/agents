<script lang="ts">
import { Button } from '@sivir-ui/svelte';
import { quiz } from './quiz.ts';

let i = $state(0);
let score = $state(0);
let picked = $state<string | null>(null);
const s = $derived(quiz[i]);
const last = $derived(i === quiz.length - 1);

function answer(o: string) {
  if (picked) return;
  picked = o;
  if (o === s.answer) score++;
}

function next() {
  if (last) {
    i = 0;
    score = 0;
  } else i++;
  picked = null;
}

const tone = (o: string) =>
  !picked
    ? ''
    : o === s.answer
      ? 'bg-success-soft text-success'
      : o === picked
        ? 'line-through text-foreground-muted'
        : 'text-foreground-muted';
</script>

<div class="space-y-4 rounded-[var(--radius-lg)] bg-card p-5 shadow-[var(--elevation-control)]">
  <div class="flex justify-between text-foreground-muted">
    <span>scenario {i + 1} of {quiz.length}</span>
    <span>{score} right</span>
  </div>
  <p class="text-base font-medium">{s.q}</p>
  <div class="grid gap-2 sm:grid-cols-3">
    {#each s.options as o (o)}
      <Button
        variant="outline"
        class="h-auto justify-start py-2 font-mono text-[13px] normal-case {tone(o)}"
        onclick={() => answer(o)}
      >
        {o}
      </Button>
    {/each}
  </div>
  <p class="min-h-[1.6em]" aria-live="polite">
    {#if picked}{picked === s.answer ? 'right.' : `it's ${s.answer}.`} {s.why}{/if}
  </p>
  <Button variant="primary" onclick={next}>{last ? 'start over' : 'next scenario'}</Button>
</div>
