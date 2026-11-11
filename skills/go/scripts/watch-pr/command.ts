import { spawn } from "node:child_process";
import { WatcherQueryError } from "./errors.ts";
export interface CommandResult {
	readonly code: number;
	readonly stdout: string;
	readonly stderr: string;
}
export const firstLine = (value: string): string =>
	value.trim().split(/\r?\n/, 1)[0]?.slice(0, 240) ?? "";
export function run(
	argv: readonly [string, ...string[]],
): Promise<CommandResult> {
	return new Promise((resolve, reject) => {
		const child = spawn(argv[0], argv.slice(1), {
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";
		child.stdout.setEncoding("utf8");
		child.stderr.setEncoding("utf8");
		child.stdout.on("data", (chunk: string) => {
			stdout += chunk;
		});
		child.stderr.on("data", (chunk: string) => {
			stderr += chunk;
		});
		child.on("error", reject);
		child.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }));
	});
}
export function parseJson(text: string, label: string): unknown {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new WatcherQueryError({
			kind: "json-parse",
			retryable: true,
			detail: `${label}: ${error instanceof Error ? error.message : String(error)}`,
		});
	}
}
export async function runText(
	argv: readonly [string, ...string[]],
): Promise<string> {
	const result = await run(argv);
	if (result.code !== 0)
		throw new WatcherQueryError({
			kind: "command-exit",
			retryable: true,
			code: result.code,
			detail:
				firstLine(result.stderr) || `${argv.join(" ")} exited ${result.code}`,
		});
	return result.stdout;
}
export async function runJson(
	argv: readonly [string, ...string[]],
): Promise<unknown> {
	return parseJson(await runText(argv), argv.join(" "));
}
