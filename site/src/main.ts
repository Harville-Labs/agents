import './style.css';
import { commands, otherPlaybooks, playbooks, principles } from './data.ts';
import { quiz } from './quiz.ts';

type Harness = 'cc' | 'oc' | 'cx';

const prefix: Record<Harness, string> = { cc: '/hl:', oc: '/', cx: '$' };

const install: Record<Harness, string> = {
  cc: '/plugin marketplace add Harville-Labs/agents\n/plugin install hl@harville-labs',
  oc: 'opencode plugin add "hl@git+https://github.com/Harville-Labs/agents.git"',
  cx: 'codex plugin marketplace add Harville-Labs/agents\ncodex plugin add hl@harville-labs',
};

const isHarness = (v: string | null | undefined): v is Harness =>
  v === 'cc' || v === 'oc' || v === 'cx';

function savedHarness(): Harness {
  try {
    const v = localStorage.getItem('hl-harness');
    return isHarness(v) ? v : 'cc';
  } catch {
    // Storage can be blocked (private windows); the default is fine.
    return 'cc';
  }
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function byId(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (!e) throw new Error(`index.html is missing #${id}`);
  return e;
}

let harness = savedHarness();
let current = 0;

const chip =
  'cursor-pointer rounded-sm border px-3 py-2 text-left text-[15px] transition-colors aria-pressed:border-mark aria-pressed:bg-mark-soft border-rule bg-card hover:border-dim';

function renderTasks() {
  const box = byId('tasks');
  box.replaceChildren();
  playbooks.forEach((p, i) => {
    const b = el('button', chip, p.task);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(i === current));
    b.addEventListener('click', () => {
      current = i;
      renderTasks();
      renderPlaybook();
    });
    box.append(b);
  });
}

function renderPlaybook() {
  const p = playbooks[current];
  const box = byId('playbook');
  box.replaceChildren();
  const head = el('div', 'flex flex-wrap items-baseline justify-between gap-2');
  head.append(el('h3', 'text-2xl font-bold', p.name), el('span', 'text-dim', p.when));
  const say = el(
    'pre',
    'overflow-x-auto rounded-sm bg-paper px-3 py-2 font-mono text-sm',
    `${prefix[harness]}go ${p.example}`,
  );
  const ol = el('ol', 'list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-mark');
  for (const step of p.steps) ol.append(el('li', 'pl-1', step));
  box.append(head, say, ol);
  if (p.skills.length) {
    const tags = el('div', 'flex flex-wrap gap-1.5');
    for (const s of p.skills) {
      tags.append(el('span', 'rounded-sm border border-rule px-2 py-0.5 font-mono text-xs', s));
    }
    box.append(el('p', 'text-sm text-dim', 'Skills it calls'), tags);
  }
}

let qi = 0;
let score = 0;

function renderQuiz() {
  const s = quiz[qi];
  let answered = false;
  byId('qcount').textContent = `${qi + 1} / ${quiz.length}`;
  byId('qscore').textContent = `${score} right`;
  byId('qtext').textContent = s.q;
  byId('qfb').textContent = '';
  const box = byId('qans');
  box.replaceChildren();
  for (const o of s.options) {
    const b = el(
      'button',
      'cursor-pointer rounded-sm border border-rule bg-paper px-3 py-2 text-left font-mono text-sm hover:border-dim',
      o,
    );
    b.type = 'button';
    b.dataset.option = o;
    b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const ok = o === s.answer;
      if (ok) score++;
      if (!ok) b.classList.add('border-mark', 'bg-mark-soft');
      const right = box.querySelector<HTMLElement>(`[data-option="${s.answer}"]`);
      right?.classList.add('border-go', 'bg-go-soft');
      byId('qfb').textContent = `${ok ? 'Right.' : `It's ${s.answer}.`} ${s.why}`;
      byId('qscore').textContent = `${score} right`;
    });
    box.append(b);
  }
  byId('qnext').textContent = qi === quiz.length - 1 ? 'Start over' : 'Next scenario';
}

byId('qnext').addEventListener('click', () => {
  if (qi === quiz.length - 1) {
    qi = 0;
    score = 0;
  } else qi++;
  renderQuiz();
});

function renderPrinciples() {
  const box = byId('principles');
  for (const [group, list] of principles) {
    const d = el('div', 'space-y-2');
    d.append(el('h3', 'font-bold', group));
    const ul = el('ul', 'space-y-1.5 text-[15px]');
    for (const [name, what] of list) {
      const li = el('li');
      li.append(
        el('span', 'font-mono text-sm text-mark', name),
        el('span', 'block text-dim', what),
      );
      ul.append(li);
    }
    d.append(ul);
    box.append(d);
  }
}

function renderHarness() {
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-h]')) {
    b.setAttribute('aria-pressed', String(b.dataset.h === harness));
  }
  for (const c of document.querySelectorAll<HTMLElement>('[data-cmd]')) {
    c.textContent = prefix[harness] + (c.dataset.cmd ?? '');
  }
  const tb = byId('commands');
  tb.replaceChildren();
  for (const [name, what] of commands) {
    const tr = el('tr', 'border-b border-rule last:border-0');
    const td = el('td', 'py-2.5 pr-6 pl-4 align-top whitespace-nowrap');
    td.append(el('code', 'font-mono text-sm text-mark', prefix[harness] + name));
    tr.append(td, el('td', 'py-2.5 pr-4 align-top', what));
    tb.append(tr);
  }
  byId('install').textContent = install[harness];
  renderPlaybook();
}

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-h]')) {
  b.addEventListener('click', () => {
    if (!isHarness(b.dataset.h)) return;
    harness = b.dataset.h;
    try {
      localStorage.setItem('hl-harness', harness);
    } catch {
      // Storage can be blocked; the choice lasts this visit.
    }
    renderHarness();
  });
}

byId('other').textContent = otherPlaybooks;
renderTasks();
renderPrinciples();
renderQuiz();
renderHarness();
