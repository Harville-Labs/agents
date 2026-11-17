import { catalog } from '../../lib/server/catalog.ts';

export function load() {
  const c = catalog();
  return {
    counts: {
      playbooks: c.playbooks.length,
      workflow: c.workflow.filter((s) => s.name !== 'go').length,
      bestPractices: c.bestPractices.length,
      principles: c.principles.length,
      agents: c.agents.length,
    },
  };
}
