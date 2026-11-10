import { reference } from './reference.ts';
import { skills } from './skills.ts';
import { start } from './start.ts';

export type { Block, Entry, GuideSection, Item } from './types.ts';

export const sections = [...start, ...skills, ...reference];
