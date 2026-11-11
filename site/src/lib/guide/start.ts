import type { GuideSection } from './types.ts';

export const start: GuideSection[] = [
  {
    id: 'start',
    title: 'start here',
    sub: 'the mental model in four parts.',
    entries: [
      {
        title: [['the 30-second explanation']],
        one: 'hl is a plugin of engineering habits for coding agents. one entry point, `go`, reads your task, picks a playbook (bug fix, feature, refactor, and so on), and pulls in the skills that playbook needs. the skills are short procedures. the principles are the reasons behind them. the agents are the helpers it delegates to. it runs the same in claude code, opencode, and codex.',
        body: [
          {
            table: [
              ['layer', 'count', 'what it is'],
              ['go + playbooks', '1 + 24', 'the router and its step-by-step recipes'],
              ['workflow skills', '41', 'procedures you can call directly or that go calls'],
              ['best practices', '10', 'rule tables per stack or topic'],
              ['principles', '25', 'the why, cited by go and the playbooks; never auto-invoked'],
              ['agents', '4', 'subagents: worker, reviewer, verifier, comment-auditor'],
            ],
          },
        ],
      },
      {
        title: [['invoking a skill']],
        body: [
          {
            table: [
              ['harness', 'form'],
              ['claude code', '`/hl:go`'],
              ['opencode', '`@go`'],
              ['codex', '`$go`'],
            ],
          },
        ],
      },
      {
        title: [['model sizes']],
        body: [
          {
            p: "skills never name a model. they name a size. `~/.config/hl/models.md` maps each size to a real model per harness. a missing line means `inherit`, the session's own model.",
          },
          {
            ul: [
              {
                term: 'nano',
                text: 'explorers, investigators, trivial edits',
              },
              {
                term: 'small',
                text: 'swarm workers, routine code',
              },
              {
                term: 'medium',
                text: 'code delegates',
              },
              {
                term: 'large',
                text: 'hardest changes, judgment, prose',
              },
              {
                term: 'panel',
                text: 'list of runners for arena, architect, interrogate; first non-session vendor judges',
              },
            ],
          },
        ],
      },
      {
        title: [['budget']],
        body: [
          {
            p: 'one reasoning level for the harness: `unlimited`, `large`, `medium`, or `small`. skills step it up for the hardest work and down for routine work.',
          },
        ],
      },
    ],
  },
  {
    id: 'go',
    title: 'go and its playbooks',
    sub: 'the front door. everything else is reachable from here.',
    entries: [
      {
        title: [['go', 'skills/go/SKILL.md']],
        mono: true,
        one: 'routes a nontrivial task to a playbook, applies the principles, delegates on purpose, and verifies before reporting.',
        say: 'go is the dispatcher: it reads the task, picks the recipe, and holds the agent to a short list of rules that always apply.',
        body: [
          {
            label: 'non-negotiables (triggers)',
            ul: [
              "first message: restate the goal, the problem, and the smallest change you expect. don't wait for a yes.",
              'nontrivial change or "are we sure?": run `how`.',
              'about to ask a "which approach" question: if running something would answer it, run it instead of asking.',
              'any code: name the data shape first (model-the-domain).',
              'code crossing a function boundary: `architect`.',
              'parallel fan-out: `swarm`. design bakeoff: `arena`. contested design: `interrogate`.',
              'any prose, including the reply: `unslop`. docs, PRs, commits: `technical-writing`.',
              'before commit: `deslop`. before review: `no-comments`.',
              'shipping a UI, CLI, or TUI: `control-ui` or `control-cli`. bugs get reproduced on the real surface first.',
              'any number you measured: `benchmark-checklist` before you report it.',
              'PR status requests: babysit playbook. "land it": shipping playbook.',
              'review bots: skeptical. judge each comment on its merits.',
              "broken skill: fix it in its own PR, don't silently work around it.",
              'long or unattended work: a decision trail via `show-me-your-work`.',
              'cite only principles whose SKILL.md you actually read this session.',
            ],
          },
          {
            label: 'other sections',
            p: 'autonomy (keep moving, stop only at the irreversible), subagents (pick a size and effort per job), models (read models.md once per session), writing the reply, comments, and the playbook index.',
          },
        ],
      },
      {
        title: [['feature', 'skills/go/playbooks/feature.md']],
        one: 'you own the design. delegate implementation.',
        body: [
          {
            ol: [
              '`how` over the subsystem',
              '`architect` for parallel designs',
              'throughput checkpoint',
              'delegate, review, verify on the real surface',
              'opening a PR',
            ],
          },
        ],
        keys: 'feature playbook',
      },
      {
        title: [['bug fix', 'skills/go/playbooks/bug-fix.md']],
        one: 'every shipped line traces to runtime evidence.',
        body: [
          {
            ol: [
              'reproduce it yourself on the real surface',
              'failing test first when there is a cheap local path; otherwise an executable repro',
              'find the root cause, not a symptom',
              'revert anything a refuted hypothesis motivated',
              'smallest fix, verify, PR',
            ],
          },
        ],
        keys: 'bug fix playbook',
      },
      {
        title: [['refactoring', 'skills/go/playbooks/refactoring.md']],
        one: "structure changes, behavior doesn't.",
        body: [
          {
            ol: [
              'pin the contract with a characterization test or snapshot',
              'change structure in small verified steps',
              'split out any bug or feature you find',
            ],
          },
        ],
        keys: 'refactoring playbook',
      },
      {
        title: [['perf issue', 'skills/go/playbooks/perf-issue.md']],
        one: 'every fix tied to a measurement.',
        body: [
          {
            ol: [
              'baseline trace, vetted by benchmark-checklist',
              '`how` to ground hypotheses',
              'one change, one measurement',
            ],
          },
        ],
        keys: 'perf issue playbook',
      },
      {
        title: [['hillclimb', 'skills/go/playbooks/hillclimb.md']],
        one: 'sustained improvement of one metric.',
        body: [
          {
            p: 'one change, one measurement, keep or revert. never stack untested changes. ground the workload before picking the metric.',
          },
        ],
        keys: 'hillclimb playbook',
      },
      {
        title: [['investigation', 'skills/go/playbooks/investigation.md']],
        one: 'read-only. the output is a cited answer.',
        body: [
          {
            p: 'route through `how`, plus `why` for motivation questions.',
          },
        ],
        keys: 'investigation playbook',
      },
      {
        title: [['prototype', 'skills/go/playbooks/prototype.md']],
        one: 'a throwaway instrument for one decision.',
        body: [
          {
            p: 'speed over polish. no decision to make means no prototype. the real build goes through feature.',
          },
        ],
        keys: 'prototype playbook',
      },
      {
        title: [['multi-phase plan', 'skills/go/playbooks/multi-phase-plan.md']],
        one: "the plan is the deliverable. don't implement.",
        body: [
          {
            p: 'skip it for one or two obvious files. settle open questions by prototype. write a checklist an owner runs box by box.',
          },
        ],
        keys: 'multi-phase plan playbook',
      },
      {
        title: [['opening a PR', 'skills/go/playbooks/opening-a-pr.md']],
        one: 'the end of every other playbook.',
        body: [
          {
            p: 'read AGENTS.md and the issue, work in a worktree on `<type>/<issue>-<slug>`, size and stack PRs, honest body.',
          },
        ],
        keys: 'opening a pr playbook',
      },
      {
        title: [['babysit', 'skills/go/playbooks/babysit.md']],
        one: 'own the merge frontier.',
        body: [
          {
            p: "declare a mode (drive or background), resolve the forge (gh or glab), clear one PR at a time, stop where the human's call begins.",
          },
        ],
        keys: 'babysit playbook',
      },
      {
        title: [['shipping', 'skills/go/playbooks/shipping.md']],
        one: 'green is not safe.',
        body: [
          {
            p: 'an independent verifier per PR. land only the contiguous verified run from the bottom of the stack.',
          },
        ],
        keys: 'shipping playbook',
      },
      {
        title: [['reviewing PRs', 'skills/go/playbooks/reviewing-prs.md']],
        one: 'review the queue that waits on you.',
        body: [
          {
            p: 'list the PRs or MRs where you are a requested reviewer, review each in a fresh subagent, confirm every finding, and post it in a thread on its diff line. approve only when told to.',
          },
        ],
        keys: 'reviewing prs playbook review assigned',
      },
      {
        title: [
          ['autopilot-full', 'skills/go/playbooks/autopilot-full.md'],
          ['autopilot-stack', 'skills/go/playbooks/autopilot-stack.md'],
        ],
        one: 'one owner per PR from build to merge.',
        body: [
          {
            p: 'a swarm that never wrote the code proves it. the stack variant stops at verified and hands off without merging.',
          },
        ],
        keys: 'autopilot-full autopilot-stack playbook',
      },
      {
        title: [['autonomous run', 'skills/go/playbooks/autonomous-run.md']],
        one: 'define done, then drive to it.',
        body: [
          {
            p: 'a checkable exit predicate first. wake on events with a watcher plus a long heartbeat.',
          },
        ],
        keys: 'autonomous run playbook',
      },
      {
        title: [['orchestrate', 'skills/go/playbooks/orchestrate.md']],
        one: 'run the program, never the code.',
        body: [
          {
            p: 'multi-day work: decide which agent does each piece, keep state in a committed notes.md, check every output.',
          },
        ],
        keys: 'orchestrate playbook',
      },
      {
        title: [['eval', 'skills/go/playbooks/eval.md']],
        one: 'design, blind, run, synthesize.',
        body: [
          {
            p: 'the candidate never sees words like eval, judge, rubric, or benchmark anywhere.',
          },
        ],
        keys: 'eval playbook',
      },
      {
        title: [
          ['runtime', 'skills/go/playbooks/runtime-forensics.md'],
          ['trace forensics', 'skills/go/playbooks/trace-forensics.md'],
        ],
        one: 'diagnose from evidence, not source.',
        body: [
          {
            p: "runtime: capture a live profile, heap, or trace. trace: the artifact already exists, so read it, don't rerun it. reduce to the smoking gun in a subagent.",
          },
        ],
        keys: 'runtime forensics trace forensics playbook',
      },
      {
        title: [['visual parity', 'skills/go/playbooks/visual-parity.md']],
        one: 'the baseline is the spec.',
        body: [
          {
            p: 'image diff, not eyes. no harness changes, no baseline tampering.',
          },
        ],
        keys: 'visual parity playbook',
      },
      {
        title: [
          ['session pickup', 'skills/go/playbooks/session-pickup.md'],
          ['pause safely', 'skills/go/playbooks/pause-safely.md'],
        ],
        one: 'resume from the trail; stop with a checkpoint.',
        body: [
          {
            p: 'pickup reads the prior transcript and git state. pause stops at a safe boundary with no irreversible action.',
          },
        ],
        keys: 'session pickup pause safely playbook',
      },
      {
        title: [
          ['authoring a skill', 'skills/go/playbooks/authoring-a-skill.md'],
          ['worktree cleanup', 'skills/go/playbooks/worktree-cleanup.md'],
        ],
        one: 'housekeeping.',
        body: [
          {
            p: 'skills: frontmatter is name and description only, validate links. cleanup: audit with a script, verify no active chat uses a worktree before deleting.',
          },
        ],
        keys: 'authoring a skill worktree cleanup playbook',
      },
    ],
  },
];
