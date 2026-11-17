import { reference } from './reference.ts';
import { skills } from './skills.ts';
import { start } from './start.ts';
import type { Counts } from './types.ts';

export type { Block, Counts, Entry, GuideSection, Item } from './types.ts';

export const guide = (n: Counts) => [...start(n), ...skills, ...reference(n)];
