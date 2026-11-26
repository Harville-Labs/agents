import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const goPath = join(root, 'skills', 'go', 'SKILL.md');

export const reminder = `${readFileSync(join(root, 'rules', 'AGENTS.md'), 'utf8').trim()} Its path is ${goPath}.`;
