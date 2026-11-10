export type Harness = 'cc' | 'oc' | 'cx';

export const harnesses: { value: Harness; label: string }[] = [
  { value: 'cc', label: 'claude code' },
  { value: 'oc', label: 'opencode' },
  { value: 'cx', label: 'codex' },
];

const prefixes: Record<Harness, string> = { cc: '/hl:', oc: '/', cx: '$' };

export const installs: Record<Harness, string> = {
  cc: '/plugin marketplace add Harville-Labs/agents\n/plugin install hl@harville-labs',
  oc: 'opencode plugin add "hl@git+https://github.com/Harville-Labs/agents.git"',
  cx: 'codex plugin marketplace add Harville-Labs/agents\ncodex plugin add hl@harville-labs',
};

export const isHarness = (v: unknown): v is Harness => v === 'cc' || v === 'oc' || v === 'cx';

function saved(): Harness {
  try {
    const v = localStorage.getItem('hl-harness');
    return isHarness(v) ? v : 'cc';
  } catch {
    // Storage can be blocked (private windows); the default is fine.
    return 'cc';
  }
}

/** The harness the reader picked. Every command on the page is spelled for it. */
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
