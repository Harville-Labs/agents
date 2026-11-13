import type { GuideSection } from './types.ts';

export const reference: GuideSection[] = [
  {
    id: 'verify',
    title: 'verification and driving apps',
    entries: [
      {
        title: [['control-cli', 'skills/control-cli/SKILL.md']],
        mono: true,
        one: 'drives a CLI or TUI like a user.',
        body: [
          {
            p: 'isolated HOME, exit codes checked, tmux keystrokes and screen captures for TUIs.',
          },
        ],
      },
      {
        title: [['control-ui', 'skills/control-ui/SKILL.md']],
        mono: true,
        one: 'drives a web or electron UI like a user.',
        body: [
          {
            p: 'harness browser, then playwright, then electron. role locators, no sleeps. saves screenshots, console errors, failed requests.',
          },
        ],
      },
      {
        title: [
          ['create-verification-skill', 'skills/create-verification-skill/SKILL.md'],
          ['maintain-verification-skill', 'skills/maintain-verification-skill/SKILL.md'],
        ],
        mono: true,
        one: 'a project skill for driving the real app.',
        body: [
          {
            p: 'generates `.agents/skills/verify-<app>` and keeps it in sync as the app changes.',
          },
        ],
        keys: 'create-verification-skill maintain-verification-skill',
      },
      {
        title: [
          ['create-formal-verification-skill', 'skills/create-formal-verification-skill/SKILL.md'],
          [
            'maintain-formal-verification-skill',
            'skills/maintain-formal-verification-skill/SKILL.md',
          ],
        ],
        mono: true,
        one: 'proofs instead of samples.',
        say: 'tests check examples; these check every case in scope.',
        body: [
          {
            p: 'TLA+ or similar model checks that must be able to fail, kept in sync with the code.',
          },
        ],
        keys: 'create-formal-verification-skill maintain-formal-verification-skill',
      },
    ],
  },
  {
    id: 'build',
    title: 'building and dependencies',
    entries: [
      {
        title: [['add-dependency', 'skills/add-dependency/SKILL.md']],
        mono: true,
        one: 'before you install a package.',
        body: [
          {
            p: 'check if one exists already, evaluate maintenance, size, license, fit, and security, and justify it in the PR.',
          },
        ],
      },
      {
        title: [['add-service', 'skills/add-service/SKILL.md']],
        mono: true,
        one: 'a new deployable service.',
        body: [
          {
            p: 'PORT, `/healthz`, SIGTERM handling, a multi-stage Dockerfile that runs checks, image workflow, k8s manifests with a deny-all egress NetworkPolicy, and an infra handoff list.',
          },
        ],
      },
    ],
  },
  {
    id: 'design',
    title: 'design',
    entries: [
      {
        title: [['ui-design', 'skills/ui-design/SKILL.md']],
        mono: true,
        one: "a design method that runs on the repo's own style.",
        body: [
          {
            p: "the method always applies: a brief, a motion and interaction system, anti-slop rules, and a screenshot QA round. the style is the repo's own tokens and components when it has them, and a default style (tokens, component and sidebar recipes, reference screenshots) when it doesn't.",
          },
        ],
      },
    ],
  },
  {
    id: 'slack',
    title: 'slack automation',
    entries: [
      {
        title: [['triage-issue-reports', 'skills/triage-issue-reports/SKILL.md']],
        mono: true,
        one: 'triages a bug report thread.',
        body: [
          {
            label: 'safety',
            p: 'frozen channel and thread; never post at root, cross-post, or DM; only the coordinator posts.',
          },
          {
            label: 'steps',
            ol: [
              'freeze coordinates, read everything',
              'trace the cause with how and why',
              'classify: bug, performance, feature, question, reroute',
              'route; owner pings off by default',
              'dedupe against the tracker',
              'create an issue only when all conditions hold',
              'post one verdict with a marker like `[hl:bug]`, verify it landed',
              'watch one follow-up window',
            ],
          },
        ],
      },
      {
        title: [['reproduce-and-fix-issues', 'skills/reproduce-and-fix-issues/SKILL.md']],
        mono: true,
        one: 'from report to draft PR.',
        body: [
          {
            p: 'reproduces twice, fixes, opens a draft PR. never merges.',
          },
        ],
      },
    ],
  },
  {
    id: 'bp',
    title: 'best practices',
    sub: 'rule tables. go, python, rust, svelte, and typescript load only when called.',
    entries: [
      {
        title: [['code', 'skills/code-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: "files under 500 lines, split by responsibility, one home per rule, types from one source, alike isn't duplicate, libraries over hand-rolled.",
          },
        ],
        keys: 'code-best-practices',
      },
      {
        title: [['testing', 'skills/testing-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'a table of checks for each change, including a regression check when a new test is impractical; hermetic tests, outcomes not calls, no sleeps.',
          },
        ],
        keys: 'testing-best-practices',
      },
      {
        title: [['security', 'skills/security-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: "no committed secrets (rotate, don't just delete), schemas at the boundary, allow-lists, confined paths, bound what strangers can spend, no shells, private by default, isolated networks, hardened containers.",
          },
        ],
        keys: 'security-best-practices',
      },
      {
        title: [['git', 'skills/git-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'issue first with area, priority, and type labels (`P1` on GitHub, `priority::1` on GitLab), assigned to you, `<type>/<issue>-<slug>`, conventional commits, one change per PR, honest "how it was tested", findings in threads on the diff line, squash, changelog in the same PR, semver by tag.',
          },
        ],
        keys: 'git-best-practices',
      },
      {
        title: [['deploy', 'skills/deploy-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'app owns image and manifests, infra owns shared resources. main deploys by sha tag, never hand-edit pins, small non-root images, plain kustomize, NetworkPolicy.',
          },
        ],
        keys: 'deploy-best-practices',
      },
      {
        title: [['typescript', 'skills/typescript-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'discriminated unions, branded types, unknown over any, schemas before guards, no `as`, `never` exhaustiveness, satisfies, strict ESM, vite, biome, bun.',
          },
        ],
        keys: 'typescript-best-practices',
      },
      {
        title: [['svelte', 'skills/svelte-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'runes only, snippets not slots, $derived computes and $effect syncs, markup used twice is a component, tailwind only, library widgets, accessibility checklist.',
          },
        ],
        keys: 'svelte-best-practices',
      },
      {
        title: [['python', 'skills/python-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'uv for everything, ruff and ty, one check command, typed signatures, pydantic at the boundary, pathlib, hermetic pytest.',
          },
        ],
        keys: 'python-best-practices',
      },
      {
        title: [['go (language)', 'skills/go-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'static binary, cmd wires and internal works, stdlib first, wrapped sentinel errors, deadlines everywhere, hardened http.Server, table tests.',
          },
        ],
        keys: 'go-best-practices',
      },
      {
        title: [['rust', 'skills/rust-best-practices/SKILL.md']],
        mono: true,
        body: [
          {
            p: 'pinned toolchain, clippy -D warnings, thin binaries, types model states, no panics on input, no unsafe without an ADR, deterministic output.',
          },
        ],
        keys: 'rust-best-practices',
      },
    ],
  },
  {
    id: 'principles',
    title: 'principles',
    sub: 'the 25 reasons. go cites them; they never fire on their own.',
    entries: [
      {
        title: [['core']],
        body: [
          {
            ul: [
              {
                term: 'laziness-protocol',
                path: 'skills/principle-laziness-protocol/SKILL.md',
                text: 'consolidate decisions, minimize the diff, bias to deletion',
              },
              {
                term: 'foundational-thinking',
                path: 'skills/principle-foundational-thinking/SKILL.md',
                text: 'data structures first, scaffold first',
              },
              {
                term: 'redesign-from-first-principles',
                path: 'skills/principle-redesign-from-first-principles/SKILL.md',
                text: 'rebuild as if the requirement existed on day one',
              },
              {
                term: 'attack-the-premise',
                path: 'skills/principle-attack-the-premise/SKILL.md',
                text: 'two failed fixes on one premise: test the premise',
              },
              {
                term: 'subtract-before-you-add',
                path: 'skills/principle-subtract-before-you-add/SKILL.md',
              },
              {
                term: 'minimize-reader-load',
                path: 'skills/principle-minimize-reader-load/SKILL.md',
                text: 'the 30-second test',
              },
              {
                term: 'outcome-oriented-execution',
                path: 'skills/principle-outcome-oriented-execution/SKILL.md',
                text: 'end state over smooth steps',
              },
              {
                term: 'experience-first',
                path: 'skills/principle-experience-first/SKILL.md',
                text: 'the user includes the next maintainer',
              },
              {
                term: 'exhaust-the-design-space',
                path: 'skills/principle-exhaust-the-design-space/SKILL.md',
                text: '2–3 prototypes for novel calls',
              },
              {
                term: 'build-the-lever',
                path: 'skills/principle-build-the-lever/SKILL.md',
                text: 'script it; do the first unit by hand and diff',
              },
            ],
          },
        ],
        keys: 'principles core laziness foundational redesign attack premise subtract reader load outcome experience design space lever',
      },
      {
        title: [['architecture']],
        body: [
          {
            ul: [
              {
                term: 'model-the-domain',
                path: 'skills/principle-model-the-domain/SKILL.md',
                text: 'state machines, typed models, registries, reducers',
              },
              {
                term: 'boundary-discipline',
                path: 'skills/principle-boundary-discipline/SKILL.md',
                text: 'parse at the edge, trust inside',
              },
              {
                term: 'type-system-discipline',
                path: 'skills/principle-type-system-discipline/SKILL.md',
                text: 'brand primitives, derive from schemas',
              },
              {
                term: 'make-operations-idempotent',
                path: 'skills/principle-make-operations-idempotent/SKILL.md',
                text: 'safe to rerun',
              },
              {
                term: 'migrate-callers-then-delete-legacy-apis',
                path: 'skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md',
              },
              {
                term: 'separate-before-serializing-shared-state',
                path: 'skills/principle-separate-before-serializing-shared-state/SKILL.md',
              },
            ],
          },
        ],
        keys: 'principles architecture domain boundary type idempotent migrate callers shared state',
      },
      {
        title: [['verification']],
        body: [
          {
            ul: [
              {
                term: 'prove-it-works',
                path: 'skills/principle-prove-it-works/SKILL.md',
                text: 'the real artifact, scripted checks',
              },
              {
                term: 'fix-root-causes',
                path: 'skills/principle-fix-root-causes/SKILL.md',
                text: 'reproduce, ask why repeatedly, suspect persisted state',
              },
              {
                term: 'sequence-verifiable-units',
                path: 'skills/principle-sequence-verifiable-units/SKILL.md',
                text: 'small units, each verified before the next',
              },
              {
                term: 'test-behavior-not-implementation',
                path: 'skills/principle-test-behavior-not-implementation/SKILL.md',
              },
              {
                term: 'explain-the-number',
                path: 'skills/principle-explain-the-number/SKILL.md',
                text: 'decide what it means before you look',
              },
              {
                term: 'encode-lessons-in-structure',
                path: 'skills/principle-encode-lessons-in-structure/SKILL.md',
                text: 'a repeated instruction becomes a lint or check',
              },
            ],
          },
        ],
        keys: 'principles verification prove root causes sequence behavior number lessons structure',
      },
      {
        title: [['delegation']],
        body: [
          {
            ul: [
              {
                term: 'guard-the-context-window',
                path: 'skills/principle-guard-the-context-window/SKILL.md',
                text: 'route bulk work to subagents',
              },
              {
                term: 'never-block-on-the-human',
                path: 'skills/principle-never-block-on-the-human/SKILL.md',
                text: 'proceed, then present; confirm only the irreversible',
              },
            ],
          },
        ],
        keys: 'principles delegation context window never block human',
      },
    ],
  },
  {
    id: 'agents',
    title: 'agents',
    entries: [
      {
        title: [['worker', 'agents/worker.md']],
        mono: true,
        one: "go's delegate.",
        body: [
          {
            p: "reads go and the cited principles, does the work, reports what changed, what ran, and what wasn't verified.",
          },
        ],
        keys: 'worker agent',
      },
      {
        title: [['reviewer', 'agents/reviewer.md']],
        mono: true,
        one: 'read-only code review.',
        body: [
          {
            p: 'diffs main...HEAD against AGENTS.md and the org rules. reports only confirmed findings with file, line, and triggering input.',
          },
        ],
        keys: 'reviewer agent',
      },
      {
        title: [['verifier', 'agents/verifier.md']],
        mono: true,
        one: 'runs the full check, never fixes.',
        body: [
          {
            p: 'reports a table and ends green, red, or partial.',
          },
        ],
        keys: 'verifier agent',
      },
      {
        title: [['comment-auditor', 'agents/comment-auditor.md']],
        mono: true,
        one: 'the comment sicko.',
        body: [
          {
            p: 'keeps legal headers, external constraints, justified suppressions, public API docs, issue links. everything else is MUST KILL. reports only.',
          },
        ],
        keys: 'comment-auditor agent',
      },
    ],
  },
];
