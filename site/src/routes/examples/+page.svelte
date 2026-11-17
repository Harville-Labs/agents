<script lang="ts">
import { Typography } from '@sivir-ui/svelte';
import Cmd from '../../lib/Cmd.svelte';
import Example from '../../lib/Example.svelte';
import { badge, examples, steering } from '../../lib/examples.ts';
import HarnessToggle from '../../lib/HarnessToggle.svelte';
import { cmd } from '../../lib/harness.svelte.ts';
import { link, repo } from '../../lib/repo.ts';
import Section from '../../lib/Section.svelte';
import { site } from '../../lib/site.ts';
</script>

<svelte:head>
  <title>examples · hl stack</title>
  <meta
    name="description"
    content="Real prompts for hl stack, and every step, skill, and guardrail the agent applies to each one, in order."
  />
  <link rel="canonical" href="{site}/examples/" />
</svelte:head>

<nav class="absolute top-4 right-4 flex gap-4 text-foreground-muted lowercase sm:top-6 sm:right-6">
  <a href="../" class="hover:text-foreground">hl stack</a>
  <a href="../guide/" class="hover:text-foreground">field guide</a>
  <a href={repo} class="hover:text-foreground">github</a>
</nav>

<main
  class="mx-auto max-w-[680px] space-y-10 px-4 pt-16 pb-28 text-[15px] leading-relaxed lowercase sm:px-6 [&_button]:lowercase [&_code]:normal-case"
>
  <header class="space-y-5">
    <Typography.H1>examples</Typography.H1>
    <Typography.Text variant="lead">
      You type one line, and each example below follows what happens next, step by step: which skill runs,
      who runs it, and what it will and won't do. Most of the knowledge lives in the playbooks, so you only
      need to name the goal.
    </Typography.Text>
    <HarnessToggle />
    <nav aria-label="examples" class="flex flex-col gap-1 text-foreground-muted">
      {#each examples as e (e.id)}
        <a href="#{e.id}" class="hover:text-foreground"><code class="font-mono text-[13px]">{cmd(e.skill)}</code> {e.prompt}</a>
      {/each}
    </nav>
  </header>

  <Section id="reading" title="how to read a timeline">
    <p>
      each step names who does the work. <span class={badge.go}>go</span>
      is the session you typed into, which plans the work, checks it, and reports back.
      <span class={badge.subagents}>subagents</span> are the
      workers, reviewers, and verifiers it starts, each in its own worktree.
      <span class={badge.you}>you</span>
      marks the only places where it waits for you.
    </p>
    <p>
      the chips under a step link to the skill or reference that step follows. you never type those, because go
      loads them when a step needs them. the examples say MR because they come from GitLab, but on GitHub the
      same prompts work with PR, and go uses <code>gh</code> in place of <code>glab</code>.
    </p>
  </Section>

  {#each examples as e (e.id)}
    <Example example={e} />
  {/each}

  <Section id="steering" title="words that steer it">
    <p class="text-foreground-muted">
      you don't have to pick a playbook or a mode, because a few words in the prompt pick one for you.
    </p>
    <dl class="divide-y divide-border">
      {#each steering as [say, does] (say)}
        <div class="grid gap-1 py-2.5 sm:grid-cols-[16rem_1fr] sm:gap-4">
          <dt>"{say}"</dt>
          <dd class="text-foreground-muted">{does}</dd>
        </div>
      {/each}
    </dl>
    <p>
      if you're not sure what to say, ask <Cmd name="help" /> and it will name the skill or playbook that fits. the
      <a class={link} href="../guide/">field guide</a> has every one in depth.
    </p>
  </Section>
</main>
