export const repo = 'https://github.com/Harville-Labs/agents';

/** The SKILL.md for a skill directory, on GitHub. */
export const skillUrl = (dir: string) => `${repo}/blob/main/skills/${dir}/SKILL.md`;

/** Links keep the surrounding text's look and underline only on hover. */
export const quietLink = 'hover:underline underline-offset-4';
