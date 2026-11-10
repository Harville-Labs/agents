import type { GuideSection } from './types.ts';

export const skills: GuideSection[] = [
  {
    id: 'think',
    title: 'think and design',
    sub: 'understanding before changing, and comparing options before committing.',
    entries: [
      {
        title: [['how', 'skills/how/SKILL.md']],
        mono: true,
        one: 'explains how code works.',
        say: 'how sends readers through the code and comes back with a map.',
        body: [
          {
            label: 'steps',
            ol: [
              'assess complexity',
              'simple: one explainer',
              'complex: parallel explorers, then a synthesizer, then present',
            ],
          },
          {
            label: 'use for',
            p: 'walkthroughs, "where should this live", grounding before a change.',
          },
        ],
      },
      {
        title: [['why', 'skills/why/SKILL.md']],
        mono: true,
        one: 'explains why code is the way it is.',
        say: 'why is archaeology: it digs through history and context to recover the reason behind a line.',
        body: [
          {
            label: 'steps',
            ol: [
              'pin the code anchor',
              'one investigator per evidence source: git (always), issues, docs, chat, observability, errors, analytics',
              'synthesize with the epistemics rules and record null results',
            ],
          },
          {
            label: 'rule',
            p: 'skip a source only when no tool reaches it (flag the gap) or it is provably irrelevant.',
          },
        ],
      },
      {
        title: [['architect', 'skills/architect/SKILL.md']],
        mono: true,
        one: 'designs before code crosses a function boundary.',
        say: 'architect sketches the types and seams first, so the code fills in a shape someone already checked.',
        body: [
          {
            ol: [
              'ground (how)',
              'sketch types, signatures, modules, using arena',
              'agree (opt-in)',
              'implement against the sketch',
            ],
          },
          {
            p: 'if the shape is wrong: rerun how, redesign from first principles, subtract, sketch again.',
          },
        ],
      },
      {
        title: [['arena', 'skills/arena/SKILL.md']],
        mono: true,
        one: 'a bakeoff between competing implementations.',
        say: 'arena has several models build the same thing, judges them, and merges the winner with the best ideas from the rest.',
        body: [
          {
            ol: [
              'frame the artifact and a 3–6 item rubric only the picker sees',
              'one runner per panel entry, each in its own worktree',
              'cross-judge, pick a base',
              'graft the best parts of the losers',
              'verify',
            ],
          },
        ],
      },
      {
        title: [['swarm', 'skills/swarm/SKILL.md']],
        mono: true,
        one: 'parallel fan-out for coverage or races.',
        say: 'swarm splits a big job across many cheap workers and stitches the results.',
        body: [
          {
            ol: [
              'frame a done predicate and a shape: slices, a race, or mixed',
              'workers on small, each with its own output and exact SHAs',
              'fan out, aggregate, report',
            ],
          },
        ],
      },
      {
        title: [['interrogate', 'skills/interrogate/SKILL.md']],
        mono: true,
        one: 'adversaries try to break a change.',
        say: 'interrogate is a red team where a finding only counts if it reproduces.',
        body: [
          {
            p: 'multiple models attack it. only findings proven by an actual run survive.',
          },
          {
            label: 'output',
            p: 'intent, findings (command, output, how it breaks, who found it), dropped counts.',
          },
        ],
      },
      {
        title: [['figure-it-out', 'skills/figure-it-out/SKILL.md']],
        mono: true,
        one: 'builds a playbook when none fits.',
        say: 'the fallback for odd tasks: invent a method, then run it scientifically.',
        body: [
          {
            ol: [
              'frame',
              'design the workflow, rigor scaled to the task',
              'run a hypothesis loop',
              'keep an audit trail',
              'verify and hand back',
            ],
          },
        ],
      },
      {
        title: [['sharpen', 'skills/sharpen/SKILL.md']],
        mono: true,
        one: 'makes a task deeper, not bigger.',
        say: 'sharpen upgrades a vague ask into what an expert would actually do.',
        body: [
          {
            p: 'asks four questions, then rewrites the prompt:',
          },
          {
            ol: [
              "what would a top pro do that I'm not asking for?",
              'what is the rawest material?',
              'which methods and tools?',
              'what external check proves it right?',
            ],
          },
        ],
      },
      {
        title: [['statechart', 'skills/statechart/SKILL.md']],
        mono: true,
        one: "draws a system's states.",
        say: 'a checked state machine you can also look at.',
        body: [
          {
            p: 'writes a TLA+ spec plus a view module and renders it as mermaid.',
          },
        ],
      },
      {
        title: [['blast-radius', 'skills/blast-radius/SKILL.md']],
        mono: true,
        one: 'what could this change break?',
        say: "impact analysis that admits what it can't see.",
        body: [
          {
            p: 'ranks callers on a certainty ladder, names "the one fact" the safety depends on, and looks where grep stops (reflection, config, other repos).',
          },
        ],
      },
    ],
  },
  {
    id: 'quality',
    title: 'code quality and review',
    entries: [
      {
        title: [['tdd', 'skills/tdd/SKILL.md']],
        mono: true,
        one: 'test-driven development.',
        say: 'red, green, and no cheating the test.',
        body: [
          {
            p: 'use a failing test when there is a cheap local path; otherwise use an executable regression check. never weaken an assertion to pass.',
          },
        ],
      },
      {
        title: [['deslop', 'skills/deslop/SKILL.md']],
        mono: true,
        one: 'cleans the diff so it reads hand-written.',
        say: 'deslop removes the tells of AI-written code before commit.',
        body: [
          {
            label: 'targets',
            p: 'defensive noise, swallowed errors, escape-hatch types, speculative abstraction, duplication, narrating comments, leftovers, off-style code, over-logging, test slop.',
          },
          {
            label: 'rule',
            p: 'touches only the diff.',
          },
        ],
      },
      {
        title: [['no-comments', 'skills/no-comments/SKILL.md']],
        mono: true,
        one: 'audits comments before review.',
        say: 'comments that narrate die; comments that guard become code.',
        body: [
          {
            p: 'spawns comment-auditor, vets its report, removes MUST KILL comments. a comment stating a constraint becomes a type, check, test, or lint.',
          },
        ],
      },
      {
        title: [['self-review', 'skills/self-review/SKILL.md']],
        mono: true,
        one: 'reviews your own diff before you say done.',
        say: 'the agent reviews itself honestly before a human has to.',
        body: [
          {
            p: "runs the diff through checklists, reruns the check command, lists what's unverified.",
          },
        ],
      },
      {
        title: [['correct', 'skills/correct/SKILL.md']],
        mono: true,
        one: 'fixes classes of mistakes, not instances.',
        say: 'if it happened twice, make it impossible.',
        body: [
          {
            p: 'finds mistakes that happened at least twice and fixes each at the highest level: architecture, then types or lint, then tests, then docs. keeps a rule table.',
          },
        ],
      },
      {
        title: [['benchmark-checklist', 'skills/benchmark-checklist/SKILL.md']],
        mono: true,
        one: 'vets a number before you trust it.',
        say: 'no speedup claim survives without controls.',
        body: [
          {
            p: 'seven questions, starting with "why not double?". at least five alternating runs.',
          },
        ],
      },
    ],
  },
  {
    id: 'writing',
    title: 'writing',
    entries: [
      {
        title: [['unslop', 'skills/unslop/SKILL.md']],
        mono: true,
        one: 'prose rules for anything a person reads.',
        say: 'deslop for words.',
        body: [
          {
            p: 'a numbered list of rules against filler, hype, hedging, stock phrases, and rhythm tics. go applies it to every reply.',
          },
        ],
      },
      {
        title: [['technical-writing', 'skills/technical-writing/SKILL.md']],
        mono: true,
        one: 'the house style for docs, PRs, and commits.',
        say: 'plain, specific, translatable writing with one job per page.',
        body: [
          {
            label: 'layers',
            ul: [
              'three top rules: cut dead words, use short words, break a rule if it makes the sentence worse',
              'diátaxis picks the mode: tutorial, how-to, reference, explanation. never mix',
              'google style: "you", present tense, active voice, condition first',
              'simplified technical english: one instruction per sentence, about 20 words',
              'global english: no idioms, slashes, or latin',
            ],
          },
        ],
      },
      {
        title: [['update-docs', 'skills/update-docs/SKILL.md']],
        mono: true,
        one: 'finds every doc a change touches.',
        say: 'docs ship in the same PR, found by search, not memory.',
        body: [
          {
            p: 'searches for every mention, then a table maps change type to doc: config key, env var, CLI flag, protocol, route, invariant, changelog. checks links, commands, and examples.',
          },
        ],
      },
      {
        title: [['write-adr', 'skills/write-adr/SKILL.md']],
        mono: true,
        one: 'records a decision.',
        say: 'the answer to "why did we do it this way?" written before anyone asks.',
        body: [
          {
            p: 'when an invariant changes or you chose between real alternatives. `NNNN-kebab.md` with context, decision, alternatives, consequences. never edit an accepted one; supersede it.',
          },
        ],
      },
      {
        title: [['write-agents-md', 'skills/write-agents-md/SKILL.md']],
        mono: true,
        one: "writes a repo's AGENTS.md.",
        say: 'an onboarding doc for agents, checked against reality.',
        body: [
          {
            p: 'research the repo, then: what it is, commands (run them), layout, invariants, common changes, conventions, things not to do. under about 250 lines. wires CLAUDE.md with `@AGENTS.md`.',
          },
        ],
      },
    ],
  },
  {
    id: 'context',
    title: 'context and memory',
    entries: [
      {
        title: [['recall', 'skills/recall/SKILL.md']],
        mono: true,
        one: 'rebuilds context from recent chats.',
        body: [
          {
            p: 'capsule, threads with status tags, problems, next move.',
          },
        ],
      },
      {
        title: [['catchup', 'skills/catchup/SKILL.md']],
        mono: true,
        one: 'read-only "what did I miss".',
        body: [
          {
            p: 'what happened in under 100 words, about 30 words per action item, pictures where they help.',
          },
        ],
      },
      {
        title: [['catchup-video', 'skills/catchup-video/SKILL.md']],
        mono: true,
        one: 'catchup as a short video.',
        body: [
          {
            p: 'a subtitled mp4 slideshow of at most 10 slides.',
          },
        ],
      },
      {
        title: [['reflect', 'skills/reflect/SKILL.md']],
        mono: true,
        one: 'learns from a session.',
        body: [
          {
            p: 'judgment, tooling, and divergent reviewers, then a synthesizer. waits for approval. never edits the plugin cache.',
          },
        ],
      },
      {
        title: [['show-me-your-work', 'skills/show-me-your-work/SKILL.md']],
        mono: true,
        one: 'a decision log for unattended work.',
        say: 'receipts for every call the agent made while you were away.',
        body: [
          {
            p: 'appends TSV rows with a script, audits them against the transcript, ends with a reviewed-by line.',
          },
        ],
      },
      {
        title: [['teach', 'skills/teach/SKILL.md']],
        mono: true,
        one: 'how plus why, for a learner.',
        body: [
          {
            p: 'plain definition first, conversational.',
          },
        ],
      },
      {
        title: [['in-your-own-words', 'skills/in-your-own-words/SKILL.md']],
        mono: true,
        one: 'restates your goal.',
        body: [
          {
            p: 'catches misunderstanding before work starts.',
          },
        ],
      },
      {
        title: [['help', 'skills/help/SKILL.md']],
        mono: true,
        one: 'which skill do I want?',
        body: [
          {
            p: 'a picker table plus the close calls between similar skills.',
          },
        ],
      },
      {
        title: [['automate-me', 'skills/automate-me/SKILL.md']],
        mono: true,
        one: 'builds your personal mode.',
        body: [
          {
            p: 'reads your transcripts and writes a `<handle>-mode` skill of how you work.',
          },
        ],
      },
      {
        title: [['setup-models', 'skills/setup-models/SKILL.md']],
        mono: true,
        one: 'maps sizes to real models.',
        body: [
          {
            ol: [
              "list models the harness offers (never write one you haven't seen)",
              'load the current file',
              'ask for a budget',
              'propose a model per size',
              'write `~/.config/hl/models.md`',
              'confirm; applies to new sessions',
              'offer verification skills',
            ],
          },
        ],
      },
    ],
  },
];
