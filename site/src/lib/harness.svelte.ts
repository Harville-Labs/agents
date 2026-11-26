export type Harness = 'cc' | 'oc' | 'cx' | 'pi' | 'cu' | 'ag';

export const harnesses: { value: Harness; label: string }[] = [
  { value: 'cc', label: 'claude code' },
  { value: 'oc', label: 'opencode' },
  { value: 'cx', label: 'codex' },
  { value: 'pi', label: 'pi' },
  { value: 'cu', label: 'cursor' },
  { value: 'ag', label: 'antigravity' },
];

const prefixes: Record<Harness, string> = {
  cc: '/hl:',
  oc: '@',
  cx: '$',
  pi: '/skill:',
  cu: '/',
  ag: '/',
};

export const installs: Record<Harness, string> = {
  cc: '/plugin marketplace add Harville-Labs/agents\n/plugin install hl@harville-labs',
  oc: 'opencode plugin add "hl@git+https://github.com/Harville-Labs/agents.git"',
  cx: 'codex plugin marketplace add Harville-Labs/agents\ncodex plugin add hl@harville-labs',
  pi: 'pi install git:github.com/Harville-Labs/agents',
  cu: 'git clone https://github.com/Harville-Labs/agents.git ~/.cursor/plugins/local/hl',
  ag: 'agy plugin install https://github.com/Harville-Labs/agents',
};

export const isHarness = (v: unknown): v is Harness => harnesses.some((h) => h.value === v);

function saved(): Harness {
  try {
    const v = localStorage.getItem('hl-harness');
    return isHarness(v) ? v : 'cc';
  } catch {
    // Storage can be blocked (private windows); the default is fine.
    return 'cc';
  }
}

export const harness = $state({ current: saved() });

export function pick(h: Harness) {
  harness.current = h;
  try {
    localStorage.setItem('hl-harness', h);
  } catch {
    // Storage can be blocked; the choice lasts this visit.
  }
}

export const cmd = (name: string) => prefixes[harness.current] + name;
