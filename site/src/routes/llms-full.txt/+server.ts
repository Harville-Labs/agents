import { catalog } from '../../lib/server/catalog.ts';

export const prerender = true;

export function GET() {
  const c = catalog();
  const files = [
    'AGENTS.md',
    ...[...c.workflow, ...c.bestPractices, ...c.principles, ...c.agents].map((e) => e.path),
    ...c.playbooks,
  ];
  const text = `# hl plugin, full text\n\n${files.map((f) => `<file path="${f}">\n${c.read(f)}\n</file>`).join('\n\n')}\n`;
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
