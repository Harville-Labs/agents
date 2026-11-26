import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

interface ExtensionContext {
  ui: {
    notify(message: string, level: 'info' | 'warning' | 'error'): void;
  };
}

interface BeforeAgentStartEvent {
  systemPrompt: string;
}

interface ExtensionAPI {
  on(event: 'session_start', handler: (event: unknown, ctx: ExtensionContext) => Promise<void> | void): void;
  on(
    event: 'before_agent_start',
    handler: (event: BeforeAgentStartEvent, ctx: ExtensionContext) => Promise<{ systemPrompt: string }>,
  ): void;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const goPath = join(root, 'skills', 'go', 'SKILL.md');

const reminder = `For any nontrivial task, load the "go" skill (${goPath}) and follow it.`;

export default function (pi: ExtensionAPI) {
  pi.on('session_start', async (_event, ctx) => {
    ctx.ui.notify('hl stack loaded', 'info');
  });

  pi.on('before_agent_start', async (event) => {
    return {
      systemPrompt: `${event.systemPrompt}\n\n${reminder}`,
    };
  });
}
