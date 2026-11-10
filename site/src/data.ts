export type Playbook = {
  task: string;
  name: string;
  when: string;
  example: string;
  steps: string[];
  skills: string[];
};

export const playbooks: Playbook[] = [
  {
    task: 'Something is broken',
    name: 'Bug fix',
    when: 'Something is broken.',
    example: 'the settings page crashes when the name is empty',
    steps: [
      'Reproduce it on the real surface with control-cli or control-ui.',
      'Pin it with a failing test named for the correct behavior.',
      'Narrow the cause: list hypotheses and rule them out until one is left.',
      'Fix the cause, not the symptom.',
      'Verify on the same surface. The repro passes and the test is green.',
      'Commit the failing test before the fix.',
      'Open a PR.',
    ],
    skills: ['control-cli', 'control-ui', 'tdd', 'how', 'why'],
  },
  {
    task: 'Build something new',
    name: 'Feature',
    when: 'You are building something new.',
    example: 'add CSV export to the usage report',
    steps: [
      'Run how over the subsystem the feature touches.',
      'Run architect to compare designs.',
      'Write down the throughput checkpoint.',
      'Delegate the code to a medium worker, with the data shape named.',
      'Verify on the surface the feature changes.',
      'Rebase into small, ordered commits.',
      'Run interrogate if the design is contested.',
      'Open a PR.',
    ],
    skills: ['how', 'architect', 'interrogate'],
  },
  {
    task: 'Clean up structure',
    name: 'Refactoring',
    when: 'The structure needs to change and the behavior must not.',
    example: 'collapse the three config loaders into one',
    steps: [
      'Map the code and its callers.',
      'Remove dead code first.',
      'Change the structure without changing behavior.',
      'Move every caller and delete the old API in the same change.',
      'Show that behavior is unchanged.',
    ],
    skills: ['how', 'architect'],
  },
  {
    task: 'Understand how something works',
    name: 'Investigation',
    when: 'You want to understand how or why something works. Nothing is edited.',
    example: 'why does the router retry twice on a 429?',
    steps: ['Trace the code and its history.', 'Answer with file and commit references.'],
    skills: ['how', 'why'],
  },
  {
    task: 'It is too slow',
    name: 'Perf issue',
    when: 'Something is slow.',
    example: 'startup takes four seconds; it used to take one',
    steps: [
      'Measure a baseline.',
      'Find what limits the number before changing anything.',
      'Fix it.',
      'Measure again against the baseline.',
    ],
    skills: ['benchmark-checklist', 'how'],
  },
  {
    task: 'Push one metric up',
    name: 'Hillclimb',
    when: 'You want to push one metric up over many attempts.',
    example: 'raise the eval pass rate from 71% to 85%',
    steps: [
      'Fix the target and how it is measured.',
      'Loop: hypothesis, change, before and after.',
      'Keep a decision log.',
      'Commit each accepted improvement on its own.',
    ],
    skills: ['benchmark-checklist', 'show-me-your-work'],
  },
  {
    task: 'Try an idea cheaply',
    name: 'Prototype',
    when: 'You want to try an idea cheaply before committing to it.',
    example: 'sketch two sidebar layouts so we can pick one',
    steps: ['Build throwaway versions.', 'Look at the results.', 'Let the results decide.'],
    skills: ['architect'],
  },
  {
    task: 'Get it ready for review',
    name: 'Opening a PR',
    when: 'The change is ready for review.',
    example: 'open a PR for this branch',
    steps: [
      'Run deslop on the diff, then no-comments.',
      'Review your own diff with self-review.',
      'Update docs, and write an ADR if a decision needs one.',
      'Write the description with technical-writing and unslop.',
    ],
    skills: ['deslop', 'no-comments', 'self-review', 'update-docs', 'write-adr'],
  },
  {
    task: 'Get my PR green',
    name: 'Babysit',
    when: 'A PR needs to get through review and CI.',
    example: 'check on PR 142',
    steps: [
      'Work the lowest unmerged PR in a stack first.',
      'Treat review bots with suspicion: fix, dismiss with evidence, or ask.',
      'Reply on each thread after the fix is pushed.',
    ],
    skills: [],
  },
  {
    task: 'Land a green stack',
    name: 'Shipping',
    when: 'A green stack is ready to land.',
    example: 'ship the stack',
    steps: [
      'Verify each PR on its own. Green CI is not enough.',
      'Land only what was verified, bottom up, with gh or glab.',
    ],
    skills: ['control-cli', 'control-ui'],
  },
  {
    task: 'A big job, checked later',
    name: 'Autonomous run',
    when: 'A long job you will check on later.',
    example: 'move every call site to the new client; I am going to bed',
    steps: [
      'Write a plan for this exact task with figure-it-out.',
      'Split it into units that each end in a check.',
      'Keep a decision log.',
      'Stop at the stated finish line or at something irreversible.',
    ],
    skills: ['figure-it-out', 'show-me-your-work'],
  },
  {
    task: 'Continue another session',
    name: 'Session pickup',
    when: 'You are continuing work another session started.',
    example: 'pick up the work on feat/88-retry',
    steps: [
      'Read the branch or transcript.',
      'Rebuild the current state.',
      'Check what was claimed before building on it.',
    ],
    skills: [],
  },
];

export const otherPlaybooks =
  'Also: multi-phase plan, orchestrate, eval, runtime forensics, trace forensics, visual parity, autopilot, pause safely, worktree cleanup, and authoring a skill.';

export const principles: [string, [string, string][]][] = [
  [
    'Core',
    [
      ['laziness-protocol', 'Make the smallest change that works. Prefer deleting.'],
      ['foundational-thinking', 'Get the types and data right first.'],
      [
        'redesign-from-first-principles',
        'Design as if the requirement had been there from day one.',
      ],
      ['attack-the-premise', 'When two fixes fail, test the assumption they share.'],
      ['subtract-before-you-add', 'Remove dead weight, then build.'],
      ['minimize-reader-load', 'Fewer layers and less hidden state.'],
      ['outcome-oriented-execution', 'Go straight to the target. Skip throwaway compatibility.'],
      ['experience-first', 'What the user experiences beats what is convenient to build.'],
      ['exhaust-the-design-space', 'Try two or three designs before picking one.'],
      ['build-the-lever', 'Write the script or codemod instead of editing by hand.'],
    ],
  ],
  [
    'Architecture',
    [
      ['model-the-domain', 'Use a data structure instead of scattered conditionals.'],
      ['boundary-discipline', 'Validate where data enters. Trust it inside.'],
      ['type-system-discipline', 'Make illegal states impossible to represent.'],
      ['make-operations-idempotent', 'Running twice gives the same result as running once.'],
      ['migrate-callers-then-delete-legacy-apis', 'Move callers and delete the old API together.'],
      ['separate-before-serializing-shared-state', 'Remove the sharing before adding locks.'],
    ],
  ],
  [
    'Verification',
    [
      ['prove-it-works', 'Check the real thing, not a stand-in for it.'],
      ['fix-root-causes', 'Fix where it first went wrong.'],
      ['sequence-verifiable-units', 'Work in small units that each end in a check.'],
      ['test-behavior-not-implementation', 'Assert what a user can observe.'],
      ['explain-the-number', 'Know what limits a measurement before trusting it.'],
    ],
  ],
  [
    'Delegation',
    [
      ['guard-the-context-window', 'Send bulk reading to subagents and keep the summary.'],
      ['never-block-on-the-human', 'Do the reversible work, then show it.'],
    ],
  ],
  [
    'Meta',
    [['encode-lessons-in-structure', 'Turn a repeated reminder into a lint, hook, or script.']],
  ],
];

export const commands: [string, string][] = [
  ['go', 'Any nontrivial task. Describe the task after it.'],
  ['help', 'Ask which skill or playbook fits.'],
  ['setup-models', 'Map sizes to your models.'],
  ['how', 'Explain how a piece of code works.'],
  ['why', 'Explain why it was built that way, from its history.'],
  ['teach', 'How and why together, in plain words.'],
  ['interrogate', 'Have other models attack a diff or design.'],
  ['deslop', 'Clean agent slop out of a diff before committing.'],
  ['unslop', 'Clean slop out of prose.'],
  ['catchup', 'Catch up on what happened while you were away.'],
  ['reflect', 'Turn a lesson from the session into a skill change.'],
];
