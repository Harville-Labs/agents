// OpenCode v2 server plugin: registers the skills in skills/ and the subagents in agents/.
// OpenCode v2 doesn't read Claude Code plugin manifests, so this file is its only entry point.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  content: string;
  autoinvoke?: boolean;
}

interface AgentInfo {
  name: string;
  description: string;
  mode: 'primary' | 'subagent';
  system: string;
}

interface Editor<T> {
  add?(info: T): void;
  update(id: string, update: (info: T) => void): void;
}

interface SystemEvent {
  system: { type: 'text'; text: string }[];
}

interface PluginContext {
  skill: { transform(fn: (editor: Editor<SkillInfo>) => void): Promise<void> };
  agent: { transform(fn: (editor: Editor<AgentInfo>) => void): Promise<void> };
  session: {
    hook(name: 'context', callback: (event: SystemEvent) => void): Promise<unknown>;
  };
}

interface Document {
  meta: Record<string, unknown>;
  body: string;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const goPath = join(root, 'skills', 'go', 'SKILL.md');

// Matches the reminder that the Claude Code SessionStart hook prints, so every harness
// starts nontrivial work the same way.
const reminder = `For any nontrivial task, load the "go" skill (${goPath}) and follow it.`;

function parse(path: string): Document {
  const text = readFileSync(path, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) throw new Error(`${path} has no YAML frontmatter. Add name and description.`);
  return { meta: Bun.YAML.parse(match[1]) as Record<string, unknown>, body: text.slice(match[0].length) };
}

function field(doc: Document, key: string, path: string): string {
  const value = doc.meta[key];
  if (typeof value !== 'string' || !value) throw new Error(`${path} frontmatter needs a ${key}.`);
  return value;
}

function entries(dir: string): string[] {
  return readdirSync(join(root, dir)).sort();
}

export default {
  id: 'hl',
  async setup(ctx: PluginContext) {
    const skills = entries('skills').map((name): SkillInfo => {
      const path = join(root, 'skills', name, 'SKILL.md');
      const doc = parse(path);
      return {
        id: field(doc, 'name', path),
        name: field(doc, 'name', path),
        description: field(doc, 'description', path),
        path,
        content: doc.body,
        // Path-scoped skills (the *-best-practices ones) load only when asked for by name.
        autoinvoke: doc.meta['disable-model-invocation'] !== true,
      };
    });
    await ctx.skill.transform((editor) => {
      for (const skill of skills) editor.add?.(skill);
    });

    const agents = entries('agents')
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const path = join(root, 'agents', file);
        const doc = parse(path);
        const system = doc.body.replace(
          'Use the absolute path your parent gave you.',
          `Its absolute path is \`${goPath}\`.`,
        );
        return { id: field(doc, 'name', path), description: field(doc, 'description', path), system };
      });
    await ctx.agent.transform((editor) => {
      for (const agent of agents) {
        editor.update(agent.id, (info) => {
          info.name = agent.id;
          info.description = agent.description;
          info.mode = 'subagent';
          info.system = agent.system;
        });
      }
    });

    await ctx.session.hook('context', (event) => {
      event.system.push({ type: 'text', text: reminder });
    });
  },
};
