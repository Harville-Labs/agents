import { reminder } from '../lib/reminder.ts';

interface BeforeAgentStartEvent {
  systemPrompt: string;
}

interface ExtensionAPI {
  on(event: 'before_agent_start', handler: (event: BeforeAgentStartEvent) => { systemPrompt: string }): void;
}

export default function (pi: ExtensionAPI) {
  pi.on('before_agent_start', (event) => ({ systemPrompt: `${event.systemPrompt}\n\n${reminder}` }));
}
