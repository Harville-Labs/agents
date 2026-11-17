export type Ref = { label: string; path: string };

export type Actor = 'go' | 'subagents' | 'you';

export type Step = { title: string; by: Actor; text: string; uses?: Ref[] };

const chip = 'rounded px-1.5 font-mono text-[11px]';
export const badge: Record<Actor, string> = {
  go: `${chip} bg-foreground text-background`,
  subagents: `${chip} border border-border-strong`,
  you: `${chip} border border-dashed border-border-strong`,
};

export type Example = {
  id: string;
  skill: string;
  prompt: string;
  playbooks: Ref[];
  know: string;
  steps: Step[];
  will: string[];
  wont: string[];
  variants?: [string, string][];
};

const skill = (name: string): Ref => ({ label: name, path: `skills/${name}/SKILL.md` });
const playbook = (file: string, label: string): Ref => ({
  label,
  path: `skills/go/playbooks/${file}.md`,
});
const agent = (name: string): Ref => ({ label: `${name} agent`, path: `agents/${name}.md` });
const forges: Ref = { label: 'forges', path: 'skills/go/references/forges.md' };
const triage: Ref = { label: 'bot triage', path: 'skills/go/references/review-bot-triage.md' };
const watcher: Ref = { label: 'watch-pr', path: 'skills/go/scripts/watch-pr/cli.ts' };
const opening = playbook('opening-a-pr', 'opening a pr');

export const examples: Example[] = [
  {
    id: 'review-queue',
    skill: 'go',
    prompt: "review all the MRs I'm requested on",
    playbooks: [playbook('reviewing-prs', 'reviewing prs')],
    know: 'You only have to say that you want your review queue cleared. You do not need to list the MRs, name the forge, or remember which ones you already reviewed.',
    steps: [
      {
        title: 'Restate the goal and pick a playbook',
        by: 'go',
        text: 'go repeats your goal back in a sentence, recognizes "requested on" as a review request, and copies the five steps of the Reviewing PRs playbook into its todo list.',
        uses: [skill('go')],
      },
      {
        title: 'Find the forge and list the queue',
        by: 'go',
        text: 'It reads the origin remote to decide between `glab` for GitLab and `gh` for GitHub. Then it lists the open MRs in this repository where you are a requested reviewer, leaves out the ones you wrote yourself, and skips drafts.',
        uses: [forges],
      },
      {
        title: 'Skip what you already reviewed',
        by: 'go',
        text: 'For each MR it finds the commit you last reviewed. On GitLab that is the head of the MR version that was current when you last commented. If the head has not moved since then, the MR is skipped. Before any review starts, it shows you the queue along with what it skipped and why.',
        uses: [forges],
      },
      {
        title: 'Review every MR in parallel',
        by: 'subagents',
        text: "Each MR gets its own read-only reviewer working in a separate worktree. The reviewer reads the MR description, the issue it closes, and the repository's `AGENTS.md` before it reads the code. On a first review it compares against the target branch. On a re-review it looks only at the commits since your last review, unless the author rebased, in which case it reviews the whole diff again. Reviewers report back to go and post nothing themselves.",
        uses: [agent('reviewer')],
      },
      {
        title: 'Confirm every finding before posting it',
        by: 'go',
        text: 'go opens the code at each finding and checks it for itself. It drops anything it cannot confirm, style issues the formatter already handles, preferences that your rules do not back up, and anything you have already raised in an open thread on that MR.',
      },
      {
        title: 'Post one review per MR',
        by: 'go',
        text: "Each finding goes into its own thread on the diff line it is about, and a short summary goes in the review body. The review is posted as a comment, and go never pushes to the author's branch.",
        uses: [forges],
      },
      {
        title: 'Report back',
        by: 'go',
        text: 'You get a link to each MR, the number of findings posted with the most serious one called out, the MRs it skipped with the reason, and the verdict it recommends for each.',
      },
    ],
    will: [
      'Look only at the commits pushed since your last review.',
      'Review the whole diff again if the author rebased or force-pushed.',
      'Attach each finding to the line it is about.',
    ],
    wont: [
      'Open a second thread about something your open thread already covers.',
      'Review an MR again when nothing has changed since your last review.',
      'Approve or request changes unless you asked it to.',
      "Push commits to the author's branch.",
    ],
    variants: [
      ['…and approve the clean ones', 'MRs with no confirmed findings also get approved.'],
      ['…including drafts', 'Draft MRs stay in the queue.'],
    ],
  },
  {
    id: 'issues-to-mrs',
    skill: 'go',
    prompt: 'open MRs for issues 31, 32, and 40 and babysit them',
    playbooks: [
      playbook('bug-fix', 'bug fix'),
      playbook('feature', 'feature'),
      opening,
      playbook('babysit', 'babysit'),
    ],
    know: 'You only need the issue numbers. go reads this as two jobs: first build an MR for each issue, then babysit all of them once they exist. Because you did not ask it to merge, it stops when each MR is ready to merge and hands them back to you.',
    steps: [
      {
        title: 'Read the issues',
        by: 'go',
        text: "go reads each issue along with its comments, assigns it to you, and decides whether it is a bug or a feature. It also reads the repository's `AGENTS.md` and stops to tell you if an issue conflicts with one of its rules.",
        uses: [opening],
      },
      {
        title: 'Plan the work',
        by: 'go',
        text: 'Three separate issues touch separate code, so go plans to build them at the same time. Each one gets its own branch from `main`, such as `fix/31-export-crash`, in its own worktree.',
        uses: [playbook('feature', 'feature')],
      },
      {
        title: 'Build each MR',
        by: 'subagents',
        text: 'go hands each issue to a worker and reviews what comes back. A bug fix starts by reproducing the bug and pinning it with a failing test before anything changes. A feature starts by reading the code around it and comparing a few designs.',
        uses: [
          agent('worker'),
          playbook('bug-fix', 'bug fix'),
          playbook('feature', 'feature'),
          skill('tdd'),
          skill('architect'),
        ],
      },
      {
        title: 'Open the MRs',
        by: 'subagents',
        text: 'Before opening an MR, the worker updates the docs, adds a changelog line, runs the full check command, strips out AI slop and needless comments, and reviews its own diff. Each MR opens as ready rather than draft, assigned to you, with a Conventional Commits title and a Why section that ends in `Closes #31`. The worker posts the link and returns without babysitting.',
        uses: [
          opening,
          skill('update-docs'),
          skill('deslop'),
          skill('no-comments'),
          skill('self-review'),
        ],
      },
      {
        title: 'Start the babysit',
        by: 'go',
        text: 'Once all three MRs exist, go starts the babysit. "babysit them" means `drive` mode, which keeps working until the MRs are ready to merge. It checks that nothing else is already babysitting them, then runs the watcher in the background so it does not hold your session. The watcher reads each pipeline, including child pipelines, the open threads, and GitLab\'s merge status.',
        uses: [playbook('babysit', 'babysit'), watcher],
      },
      {
        title: 'Clear blockers in order',
        by: 'go',
        text: 'go clears one MR at a time, starting with conflicts, then review threads, then CI. It batches every known fix into a single push. It does not rebase or force-push during a babysit, so a conflict is reported to you with the branch that needs a rebase.',
        uses: [playbook('babysit', 'babysit')],
      },
      {
        title: 'Handle review bot threads',
        by: 'go',
        text: 'Every bot comment is checked against the code before anything happens. A real bug gets a failing test and a fix, and once that fix is pushed, go replies in the thread with the commit and resolves it. A false alarm gets a reply that explains exactly why it does not apply, and then it is resolved. A finding about security, auth, billing, data, or migrations that is not a plain fix goes to you rather than being dismissed.',
        uses: [triage, forges],
      },
      {
        title: 'Handle human review threads',
        by: 'go',
        text: 'When a person leaves a comment, go replies in that thread, and if the point holds it pushes a fix and cites the commit. The thread stays open, because resolving it is the reviewer’s call.',
        uses: [forges],
      },
      {
        title: 'Deal with failing CI',
        by: 'go',
        text: 'Before retrying anything, go works out why the job failed. A flaky failure gets one fresh pipeline, never a retry of the single job. If the same failure happens again, it was not flaky, so go reads the job log. When the failure is in code the MR never touched, it checks with `git merge-base --is-ancestor` whether the branch has fallen behind `main`, and reports that it needs a rebase instead of retrying.',
        uses: [playbook('babysit', 'babysit')],
      },
      {
        title: 'Stop at ready to merge',
        by: 'go',
        text: 'Babysitting ends when GitLab agrees each MR can merge. A missing approval is something to wait for, not a problem to fix. go merges nothing. It then looks back over the bot comments it dismissed, and if one keeps coming up, it offers a PR that adds it to the shared triage rules.',
        uses: [triage],
      },
    ],
    will: [
      'Build every MR before it starts babysitting any of them.',
      'Reply inside the existing thread rather than adding a new top-level comment.',
      "Resolve a bot's thread after replying with the fix or the reason it was dismissed.",
      'Push a fix before replying, so the reply can link the commit.',
      'Lean toward dismissing known bot noise once the bot is on its third pass.',
    ],
    wont: [
      "Resolve a human reviewer's thread.",
      'Rebase or force-push while babysitting.',
      'Change code just to quiet a bot.',
      'Retry a single failed job, or retry a pipeline more than once.',
      'Merge anything.',
    ],
    variants: [
      [
        '…and merge them when ready',
        'Once babysitting ends, go runs Shipping, which checks each MR again before it merges.',
      ],
      [
        "autopilot issues 31, 32, and 40, don't merge",
        'Runs Autopilot-stack instead. Each MR gets one owner that builds it, babysits it, and rebases its own branch, and go verifies every MR with fresh eyes before handing it back.',
      ],
    ],
  },
  {
    id: 'stepping-away',
    skill: 'go',
    prompt:
      "I'm stepping away for the night. Move every service off the old config loader and run until it's done",
    playbooks: [playbook('autonomous-run', 'autonomous run')],
    know: 'You need the goal and the fact that you are leaving. Saying you are stepping away tells go to keep working without waiting for you, and to keep a record you can check in the morning.',
    steps: [
      {
        title: 'Define what done means',
        by: 'go',
        text: 'go writes down a condition it can check, such as "nothing imports the old loader and every service still starts", and estimates how big the job is before it begins.',
        uses: [skill('figure-it-out'), skill('principle-prove-it-works')],
      },
      {
        title: 'Plan the run',
        by: 'go',
        text: 'It splits the migration into small pieces that can each land on their own, and puts the riskiest ones first. The check is built before any code changes, and it records where things stand now so the morning comparison is old against new.',
        uses: [skill('principle-sequence-verifiable-units')],
      },
      {
        title: 'Work through the pieces',
        by: 'subagents',
        text: 'Workers take the pieces, each in its own worktree. Every piece makes the smallest change that could work, gets checked against the done condition, and is kept if it helped or reverted if it did not.',
        uses: [agent('worker')],
      },
      {
        title: 'Fix what it trips over',
        by: 'go',
        text: 'If it finds a broken skill, a flaky check, or a related bug along the way, it fixes it in a separate PR and goes back to the main job instead of stopping to ask you.',
      },
      {
        title: 'Log every decision',
        by: 'go',
        text: 'Each decision becomes one row in a log that says what was done, why, what proves it, and how it turned out. This log is what lets you trust the result without rereading every diff.',
        uses: [skill('show-me-your-work')],
      },
      {
        title: 'Keep going until it is done',
        by: 'go',
        text: 'It stops when the done condition holds. Hitting a plateau is a reason to try a different approach, not to stop, and it never loosens the condition to call the job finished. Its last message names the decision log, what it verified, and what is still open.',
      },
      {
        title: 'Come back and catch up',
        by: 'you',
        text: 'In the morning you run catchup. It tells you in plain words what changed while you were gone, shows screenshots or a small diagram where a picture is clearer, and then lists every decision waiting on you, each with its recommendation, the evidence behind it, and the risk.',
        uses: [skill('catchup')],
      },
    ],
    will: [
      'Commit, push its own branches, and open PRs while you are away.',
      'Make reversible choices on its own and note each one in the log.',
      'Open the morning summary with whatever is waiting on you.',
    ],
    wont: [
      'Deploy anything.',
      'Force-push a shared branch.',
      'Delete data.',
      'Message a customer.',
    ],
    variants: [
      [
        'recall my work on the config loader',
        'Run recall when you start a new session and want the full picture of earlier work.',
      ],
      ['going to bed, babysit these MRs', 'Babysits overnight and leaves the same kind of log.'],
    ],
  },
  {
    id: 'reflect',
    skill: 'reflect',
    prompt: 'what have you learned from your issues with glab?',
    playbooks: [skill('reflect')],
    know: 'You only need to notice that the session went badly with a tool. reflect reads the current session, so run it in the session where the trouble happened.',
    steps: [
      {
        title: 'Find this session',
        by: 'go',
        text: "It locates the transcript for this conversation and reads nothing else, so other projects' chats stay private.",
      },
      {
        title: 'Run three reviewers',
        by: 'subagents',
        text: 'Three reviewers read the transcript in parallel. One looks at where the agent made poor decisions. One looks at which commands failed and what worked instead, such as a `glab` call that kept failing until a different subcommand did the job. The third looks for anything the other two would miss.',
      },
      {
        title: 'Combine the findings',
        by: 'subagents',
        text: 'Another agent checks each finding against the transcript and sorts it into accepted, rejected, or backlog. Something that happened only once is not treated as a lesson. Backlog items are filed to your tracker right away.',
      },
      {
        title: 'Prefer a check to more instructions',
        by: 'go',
        text: 'If a lint rule, script, or test would enforce a lesson more reliably than another sentence in a skill, the lesson is filed as a backlog item for that check instead of being written into the skill.',
        uses: [skill('principle-encode-lessons-in-structure')],
      },
      {
        title: 'Wait for your approval',
        by: 'you',
        text: 'It shows you the accepted lessons and where each change would land, then waits while you choose which ones to apply. Skill changes affect every future agent, so none of them applies itself.',
      },
      {
        title: 'Apply the approved changes',
        by: 'go',
        text: "It makes small one-line fixes directly and uses the skill-authoring playbook for anything larger. It never edits the installed plugin's cache. A change to an hl skill goes in as a PR to this repository once you approve it.",
        uses: [playbook('authoring-a-skill', 'authoring a skill')],
      },
    ],
    will: [
      'Show you where each change will land before you approve it.',
      'File a lesson that a lint or script would enforce as a backlog item, rather than adding text to a skill.',
    ],
    wont: [
      'Read transcripts from other projects.',
      'Edit a skill without your approval.',
      'Open a PR or push before you approve.',
    ],
  },
  {
    id: 'bug',
    skill: 'go',
    prompt: 'fix #31, the export button crashes on an empty report',
    playbooks: [playbook('bug-fix', 'bug fix')],
    know: 'You only need to describe the symptom. You do not need to know where the code lives, how to reproduce the crash, or how to test the fix.',
    steps: [
      {
        title: 'Reproduce the crash',
        by: 'go',
        text: 'go opens the app and clicks the button itself, using a throwaway config so your real data is never touched. It does not ask you to reproduce the bug for it.',
        uses: [skill('control-ui')],
      },
      {
        title: 'Pin it with a failing test',
        by: 'subagents',
        text: 'When there is a cheap local way to test it, a worker writes a test named for the correct behavior, such as `exports an empty report as a header row`, and runs it to confirm it fails for the reason described in the issue. Otherwise it keeps a script that reproduces the crash and explains why there is no test.',
        uses: [skill('tdd')],
      },
      {
        title: 'Find the real cause',
        by: 'subagents',
        text: 'The worker lists possible causes and rules them out with evidence from running the code. It reads how the code works and how it changed over time with `git log -S`, and traces the problem back to where the state first went wrong, which is rarely the line that throws.',
        uses: [skill('how'), skill('why')],
      },
      {
        title: 'Fix the cause',
        by: 'subagents',
        text: 'The fix addresses the cause rather than wrapping it in a `try/catch` or a null check that hides the bad state. The worker also looks for the same mistake elsewhere and either fixes each one or lists it.',
        uses: [skill('principle-fix-root-causes'), agent('worker')],
      },
      {
        title: 'Verify and commit',
        by: 'go',
        text: 'go clicks the button again to confirm the crash is gone and checks that the test now passes. The test is committed before the fix, so the history shows it failing first.',
        uses: [skill('principle-prove-it-works')],
      },
      {
        title: 'Open the PR',
        by: 'go',
        text: 'The PR comes from a branch such as `fix/31-…`, has a title like `fix(export): …`, and its Why section ends in `Closes #31`. The description includes the failing and then passing output.',
        uses: [opening],
      },
    ],
    will: [
      'Include the failing and then passing output in its reply.',
      'Tell you what it tried if it cannot reproduce the bug.',
    ],
    wont: ['Ship a guard just because it might help.', 'Fix a guess it could not reproduce.'],
  },
  {
    id: 'interrogate',
    skill: 'interrogate',
    prompt: 'this branch',
    playbooks: [skill('interrogate')],
    know: 'You only need a branch you are not sure about.',
    steps: [
      {
        title: 'State what the branch is for',
        by: 'go',
        text: 'It restates the purpose of the branch using your message, the commits, and the PR description.',
        uses: [skill('in-your-own-words')],
      },
      {
        title: 'Try to break it',
        by: 'subagents',
        text: 'Several adversaries, running on the different models in your review panel, each try to break the change in their own worktree. A finding only counts if it comes with the command that was run and the wrong output it produced.',
        uses: [skill('arena')],
      },
      {
        title: 'Rerun every finding',
        by: 'go',
        text: 'go reruns each command itself and keeps only the findings that still fail and actually break what the branch is meant to do. Findings with the same root cause are merged.',
      },
    ],
    will: [
      'Give you the command to rerun for each finding.',
      'Say plainly when no findings survive.',
    ],
    wont: [
      'Report style issues or risks that only matter after some future change.',
      'Apply any fixes.',
    ],
  },
];

export const steering: [string, string][] = [
  ['babysit this, get it green', 'Drives the MR until it is ready to merge, then stops.'],
  ['address the review comments', 'Answers review threads and changes nothing else.'],
  [
    'check on MR 12, is it green?',
    'Does one status check and reports back, without editing or polling.',
  ],
  ['…and merge when green', 'Merges, but only what it has verified.'],
  ["…don't merge, I'll land it", 'Builds and verifies the MRs, then hands them to you.'],
  ['land the stack', 'Merges from the bottom of the stack up, one verified MR at a time.'],
  [
    "I'm stepping away, run until done",
    'Keeps working and logs each decision for you to read later.',
  ],
  [
    'apply subtract before you add',
    'Steers the work by a principle. Any principle name works here.',
  ],
];
