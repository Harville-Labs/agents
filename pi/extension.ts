// Pi extension for hl stack: registers the session start reminder and helpers.
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const goPath = join(root, "skills", "go", "SKILL.md");

const reminder = `For any nontrivial task, load the "go" skill (${goPath}) and follow it.`;

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("hl stack loaded", "info");
  });

  pi.on("before_agent_start", async (event) => {
    return {
      systemPrompt: event.systemPrompt + `\n\n${reminder}`,
    };
  });
}
