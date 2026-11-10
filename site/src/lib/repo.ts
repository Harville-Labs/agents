export const repo = 'https://github.com/Harville-Labs/agents';

export const fileUrl = (path: string) => `${repo}/blob/main/${path}`;

export const skillUrl = (dir: string) => fileUrl(`skills/${dir}/SKILL.md`);

export const quietLink = 'hover:underline underline-offset-4';
