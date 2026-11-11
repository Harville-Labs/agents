import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface Call {
	readonly args: string;
	readonly body?: unknown;
}

export interface Fake {
	readonly directory: string;
	file(name: string, content: string): string;
	run(argv: readonly string[]): {
		readonly status: number | null;
		readonly stdout: string;
		readonly stderr: string;
		readonly calls: readonly Call[];
	};
	remove(): void;
}

export const reply = (value: unknown) =>
	`printf '%s\\n' '${JSON.stringify(value)}'`;

export function fakeForge(args: {
	readonly remote: string;
	readonly tool: "gh" | "glab";
	readonly responses: string;
}): Fake {
	const directory = mkdtempSync(join(tmpdir(), "forge-"));
	const log = join(directory, "calls.log");
	writeFileSync(log, "");
	writeFileSync(
		join(directory, args.tool),
		`#!/bin/sh
printf '%s\\n' "$*" >> "${log}"
case "$*" in *"--input -"*) cat >> "${log}"; printf '\\n' >> "${log}" ;; esac
for endpoint; do :; done
${args.responses}
`,
		{ mode: 0o755 },
	);
	writeFileSync(
		join(directory, "git"),
		`#!/bin/sh
[ "$*" = "remote get-url origin" ] && { echo "${args.remote}"; exit 0; }
exit 1
`,
		{ mode: 0o755 },
	);
	return {
		directory,
		file(name, content) {
			const path = join(directory, name);
			writeFileSync(path, content);
			return path;
		},
		run(argv) {
			writeFileSync(log, "");
			const child = spawnSync(
				process.execPath,
				[join(import.meta.dir, "cli.ts"), ...argv],
				{
					cwd: directory,
					encoding: "utf8",
					timeout: 10000,
					env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
				},
			);
			const calls: Call[] = [];
			for (const line of readFileSync(log, "utf8").split("\n")) {
				if (line === "") continue;
				const last = calls[calls.length - 1];
				if (line.startsWith("{") && last !== undefined && !("body" in last))
					calls[calls.length - 1] = { ...last, body: JSON.parse(line) };
				else calls.push({ args: line });
			}
			return {
				status: child.status,
				stdout: child.stdout,
				stderr: child.stderr,
				calls,
			};
		},
		remove: () => rmSync(directory, { recursive: true, force: true }),
	};
}
