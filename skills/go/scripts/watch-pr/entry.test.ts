import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";

function start(path: string) {
	return spawnSync(process.execPath, [`${import.meta.dir}/${path}`, "--help"], {
		encoding: "utf8",
		timeout: 10000,
	});
}

describe("watcher entry points", () => {
	for (const path of ["watch-pr", "cli.ts"])
		it(`${path} prints usage when run directly`, () => {
			const child = start(path);
			expect(child.stdout).toContain("Usage: watch-pr");
			expect(child.status).toBe(0);
		});
});
