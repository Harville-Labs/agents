export type Scenario = { q: string; answer: string; options: string[]; why: string };

export const quiz: Scenario[] = [
  {
    q: 'You are about to add a ConfigLoaderFactory. It has one caller.',
    answer: 'laziness-protocol',
    options: ['laziness-protocol', 'foundational-thinking', 'boundary-discipline'],
    why: 'One caller does not need a layer. Write the smallest thing that solves the problem.',
  },
  {
    q: 'Your second fix for a flaky test failed the same way as the first.',
    answer: 'attack-the-premise',
    options: ['fix-root-causes', 'attack-the-premise', 'prove-it-works'],
    why: 'Both fixes assumed the same thing. Write that assumption down and test it before a third fix.',
  },
  {
    q: 'A function checks the same object for null in four places, though a schema parsed it at the API edge.',
    answer: 'boundary-discipline',
    options: ['type-system-discipline', 'boundary-discipline', 'minimize-reader-load'],
    why: 'Validate once where data enters. Inside the boundary, trust the parsed type.',
  },
  {
    q: 'The unit tests pass, so you are about to say the TUI change is done.',
    answer: 'prove-it-works',
    options: ['test-behavior-not-implementation', 'prove-it-works', 'sequence-verifiable-units'],
    why: 'Run the real TUI with control-cli. Passing tests stand in for the program; they are not the program.',
  },
  {
    q: 'You are about to ask which of two layouts the user prefers, and you could build both in ten minutes.',
    answer: 'never-block-on-the-human',
    options: ['experience-first', 'never-block-on-the-human', 'exhaust-the-design-space'],
    why: 'It is reversible and you can look at it. Build both and show them. Exhaust the design space fits too, which is why it is close.',
  },
  {
    q: 'Your benchmark shows a 40% speedup from a one-line change.',
    answer: 'explain-the-number',
    options: ['explain-the-number', 'prove-it-works', 'build-the-lever'],
    why: 'A surprising number needs an explanation. Find what limits it and rule out measuring the wrong thing.',
  },
  {
    q: 'You have written "run the formatter before committing" in three skills.',
    answer: 'encode-lessons-in-structure',
    options: ['encode-lessons-in-structure', 'build-the-lever', 'laziness-protocol'],
    why: 'Turn a repeated reminder into a hook, lint, or script so nobody has to remember it.',
  },
  {
    q: 'A new API replaces an old one. You plan to keep both "for a while".',
    answer: 'migrate-callers-then-delete-legacy-apis',
    options: [
      'outcome-oriented-execution',
      'migrate-callers-then-delete-legacy-apis',
      'subtract-before-you-add',
    ],
    why: 'Move every caller and delete the old API in the same change. Two APIs drift apart.',
  },
];
