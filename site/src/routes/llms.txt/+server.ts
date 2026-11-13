import { catalog, type Entry } from '../../lib/server/catalog.ts';
import { site } from '../../lib/site.ts';

export const prerender = true;

const list = (entries: Entry[]) =>
  entries.map((e) => `- [${e.name}](${e.url}): ${e.description}`).join('\n');

// The llms.txt convention (https://llmstxt.org): a title, a one-line summary, then linked lists.
export function GET() {
  const c = catalog();
  const text = `# hl stack

> Engineering rules, workflow skills, and review subagents for coding agents. It behaves the same in Claude Code, OpenCode, and Codex. The go skill routes a task to a playbook and applies the principles.

- [Overview](${site}/): how the plugin works and which playbook fits which task.
- [Field guide](${site}/guide/): every skill, playbook, principle, and agent in depth.
- [Full text](${site}/llms-full.txt): every file below in one document.
- [Rules every session follows](${c.raw('AGENTS.md')})

## Workflow skills

${list(c.workflow)}

## Playbooks

${c.playbooks.map((p) => `- [${p.split('/').pop()?.replace('.md', '')}](${c.raw(p)})`).join('\n')}

## Best practices

${list(c.bestPractices)}

## Principles

${list(c.principles)}

## Agents

${list(c.agents)}
`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
