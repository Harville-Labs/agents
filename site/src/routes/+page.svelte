<script lang="ts">
import { CodeBlock, ToggleGroup, Typography } from '@sivir-ui/svelte';
import Cmd from '../lib/Cmd.svelte';
import { commands, flow, sizes } from '../lib/data.ts';
import { harness, harnesses, installs, isHarness, pick } from '../lib/harness.svelte.ts';
import Playbooks from '../lib/Playbooks.svelte';
import Principles from '../lib/Principles.svelte';
import Quiz from '../lib/Quiz.svelte';
import { repo } from '../lib/repo.ts';
import Section from '../lib/Section.svelte';

const { InlineCode: Code } = Typography;
const pstack = 'https://github.com/cursor/plugins/tree/main/pstack';
const link =
  'text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground';

// Both controls follow the shared harness and write back to it. ToggleGroup clears its value
// when the active item is clicked again; a harness must stay picked, so that snaps back.
let choice = $derived<string | string[] | undefined>(harness.current);
let tab = $derived<string>(harness.current);
$effect(() => {
  if (isHarness(choice)) pick(choice);
  else choice = harness.current;
});
$effect(() => {
  if (isHarness(tab)) pick(tab);
});

const tabs = $derived(
  harnesses.map((h) => ({ label: h.label, lang: 'bash', value: h.value, code: installs[h.value] })),
);
</script>

<nav class="absolute top-4 right-4 flex gap-4 text-foreground-muted lowercase sm:top-6 sm:right-6">
  <a href="guide/" class="hover:text-foreground">field guide</a>
  <a href={repo} class="hover:text-foreground">github</a>
</nav>

<main
  class="mx-auto max-w-[680px] space-y-10 px-4 pt-16 pb-28 text-[15px] leading-relaxed lowercase sm:px-6 [&_button]:lowercase [&_code]:normal-case [&_pre]:normal-case"
>
  <header class="space-y-5">
    <Typography.H1>hl plugin</Typography.H1>
    <Typography.Text variant="lead">
      one set of engineering rules, workflow skills, and review subagents that behaves the same in claude
      code, opencode, and codex. it is built on lauren tan's (poteto) <a class={link} href={pstack}>pstack</a>.
      this page shows how it works, which playbook fits which task, and the principles behind each decision.
    </Typography.Text>
    <div class="flex flex-wrap items-center gap-3">
      <fieldset class="contents">
      <legend class="float-left mr-3 text-foreground-muted">commands for</legend>
      <ToggleGroup.Root bind:value={choice}>
        {#each harnesses as h (h.value)}
          <ToggleGroup.Item value={h.value}>{h.label}</ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
      </fieldset>
    </div>
  </header>

  <Section id="layers" title="three layers, each loaded when needed">
    <p>
      <Code>AGENTS.md</Code> holds the rules every session follows: read before you write, fix what you trip
      over, prove it works, report honestly, and keep moving until something is irreversible. it is short on
      purpose, because it loads into every session.
    </p>
    <p>
      skills hold the detail. the <Code>*-best-practices</Code> skills load when a task touches a language or
      topic. workflow skills such as deslop or interrogate run when a step calls for them.
    </p>
    <p>
      <Cmd name="go" /> ties it together. hand it a task and it picks a playbook, copies the steps into the
      todo list, and calls the other skills at the right moment.
    </p>
  </Section>

  <Section id="go" title="what happens when you run go">
    <dl class="divide-y divide-border">
      {#each flow as [step, what] (step)}
        <div class="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt class="font-medium">{step}</dt>
          <dd class="text-foreground-muted">{what}</dd>
        </div>
      {/each}
    </dl>
  </Section>

  <Section id="playbooks" title="which playbook fits?">
    <p class="text-foreground-muted">
      pick what you are trying to do. you never name the playbook yourself; go picks it from how you describe
      the task. knowing the map helps you phrase the request.
    </p>
    <Playbooks />
  </Section>

  <Section id="principles" title="the principles">
    <p>
      each principle is its own small skill. go reads the ones that apply and names them in its reply, along
      with the choice each one changed. you can steer with them too: "apply subtract before you add". test
      yourself on when each one fires.
    </p>
    <Quiz />
    <Principles />
  </Section>

  <Section id="sizes" title="sizes, not model names">
    <p>
      no skill names a model. a skill asks for a size, and you map each size to a model you have by running
      <Cmd name="setup-models" />. it writes <Code>~/.config/hl/models.md</Code> with a section per harness. a
      missing line, or <Code>inherit</Code>, runs on the session's own model.
    </p>
    <table class="w-full text-left">
      <thead class="text-foreground-muted">
        <tr class="border-b border-border">
          <th class="py-2 pr-4 font-normal">size</th>
          <th class="py-2 pr-4 font-normal">runs</th>
          <th class="py-2 font-normal">typical pick</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each sizes as [size, runs, pickup] (size)}
          <tr>
            <td class="py-2 pr-4 align-top"><code class="font-mono text-[13px]">{size}</code></td>
            <td class="py-2 pr-4 align-top">{runs}</td>
            <td class="py-2 align-top text-foreground-muted">{pickup}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <CodeBlock
      lang="markdown"
      code={'budget: large\n\n## claude-code\nnano: <model>\nmedium: <model>\npanel: <model>, <model>\n\n## opencode\n(same sizes)\n\n## codex\n(same sizes)'}
    />
    <p class="text-foreground-muted">
      the panel matters. when two models from the same family agree, that is weaker evidence, and go says so.
    </p>
  </Section>

  <Section id="stops" title="when it stops to ask">
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="space-y-2">
        <Typography.H3>goes ahead</Typography.H3>
        <ul class="list-disc space-y-1 pl-5 marker:text-foreground-muted">
          <li>commits, branches, pushes its own branches</li>
          <li>opens prs and answers review threads</li>
          <li>reversible choices it can test instead of ask about</li>
          <li>fixes what it trips over, each in its own commit</li>
        </ul>
      </div>
      <div class="space-y-2">
        <Typography.H3>always pauses</Typography.H3>
        <ul class="list-disc space-y-1 pl-5 marker:text-foreground-muted">
          <li>force-push to a shared branch</li>
          <li>deploys</li>
          <li>deleting data</li>
          <li>messages to customers</li>
        </ul>
      </div>
    </div>
    <p>
      say "going to bed" or "run until done" and it keeps working, with a decision log from show-me-your-work
      to review later. a repository's own <Code>AGENTS.md</Code> can add stop points.
    </p>
  </Section>

  <Section id="commands" title="skills you will type yourself">
    <p class="text-foreground-muted">go calls most skills for you. these are the ones worth knowing by name. the
      <a class={link} href="guide/">field guide</a> covers every skill, playbook, and principle in depth.
    </p>
    <dl class="divide-y divide-border">
      {#each commands as [name, what] (name)}
        <div class="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
          <dt><Cmd {name} /></dt>
          <dd>{what}</dd>
        </div>
      {/each}
    </dl>
  </Section>

  <Section id="install" title="install">
    <CodeBlock {tabs} bind:value={tab} />
    <p>
      then run <Cmd name="setup-models" />. to load the rules into every session on your machine, clone the
      <a class={link} href={repo}>repository</a> and run
      <Code>scripts/install.sh</Code>.
    </p>
  </Section>

  <Section id="thanks" title="thanks">
    <p>
      go, its playbooks, the principles, and most of the workflow skills come from lauren tan's (poteto)
      <a class={link} href={pstack}>pstack</a>, with help from michael denyer's
      <a class={link} href="https://github.com/michael-denyer/pstack-claude">claude code port</a>. these tools
      are major advancements in the way developers work with agents.
    </p>
  </Section>
</main>
