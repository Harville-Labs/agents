import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { repo } from '../repo.ts';

const root = join(process.cwd(), '..');
const raw = (path: string) =>
  `${repo.replace('github.com', 'raw.githubusercontent.com')}/main/${path}`;

export type Entry = { name: string; description: string; path: string; url: string };

function read(path: string): Entry {
  const text = readFileSync(join(root, path), 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match)
    throw new Error(`${path} has no frontmatter. Start it with --- and a name and description.`);
  const meta = parse(match[1]) as { name?: unknown; description?: unknown };
  if (typeof meta.name !== 'string' || typeof meta.description !== 'string') {
    throw new Error(`${path} frontmatter needs a string name and description.`);
  }
  return {
    name: meta.name,
    description: meta.description.trim().replace(/\s+/g, ' '),
    path,
    url: raw(path),
  };
}

const sorted = (dir: string, pick: (f: string) => string | undefined) =>
  readdirSync(join(root, dir))
    .sort()
    .map(pick)
    .filter((p): p is string => p !== undefined)
    .map(read);

export function catalog() {
  const skills = sorted('skills', (d) => `skills/${d}/SKILL.md`);
  return {
    workflow: skills.filter(
      (s) => !s.name.startsWith('principle-') && !s.name.endsWith('-best-practices'),
    ),
    bestPractices: skills.filter((s) => s.name.endsWith('-best-practices')),
    principles: skills.filter((s) => s.name.startsWith('principle-')),
    agents: sorted('agents', (f) => (f.endsWith('.md') ? `agents/${f}` : undefined)),
    playbooks: readdirSync(join(root, 'skills/go/playbooks'))
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => `skills/go/playbooks/${f}`),
    raw,
    read: (path: string) => readFileSync(join(root, path), 'utf8').trim(),
  };
}
