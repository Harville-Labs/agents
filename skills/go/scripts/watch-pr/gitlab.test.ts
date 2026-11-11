import { afterAll, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "watch-pr-glab-"));
afterAll(() => rmSync(directory, { recursive: true, force: true }));

const PROJECT = "projects/group%2Fsub%2Fproject";
const MR = {
	iid: 7,
	state: "opened",
	draft: false,
	has_conflicts: false,
	detailed_merge_status: "mergeable",
	sha: "abc123",
	source_branch: "feature",
	target_branch: "main",
	merged_at: null,
	head_pipeline: { id: 900, status: "failed" },
	source_project_id: 1,
	target_project_id: 1,
};
const line = (value: unknown) => `printf '%s\\n' '${JSON.stringify(value)}'`;

writeFileSync(
	join(directory, "glab"),
	`#!/bin/sh
[ "$1 $2 $3" = "api --hostname gitlab.example" ] || { echo "unexpected: $*" >&2; exit 2; }
case "$*" in *"--paginate --output ndjson"*) ;; *) echo "not paginated: $*" >&2; exit 2 ;; esac
for endpoint; do :; done
case "$endpoint" in
  "${PROJECT}/merge_requests/7") ${line(MR)} ;;
  "${PROJECT}/merge_requests?state=opened&source_branch=feature") ${line(MR)} ;;
  "${PROJECT}/merge_requests?state=opened") ${line(MR)}; ${line({ ...MR, iid: 8, source_branch: "next", target_branch: "feature" })} ;;
  "${PROJECT}/pipelines/900/jobs") ${line({ name: "unit", status: "failed", stage: "test", allow_failure: false, web_url: "https://gitlab.example/j/1", failure_reason: "script_failure" })}; ${line({ name: "lint", status: "success", stage: "test", allow_failure: false, web_url: "https://gitlab.example/j/2" })} ;;
  "${PROJECT}/pipelines/900/bridges") ${line({ name: "deploy-docs", status: "running", stage: "deploy", allow_failure: false, web_url: "https://gitlab.example/j/3", downstream_pipeline: null })}; ${line({ name: "child", status: "success", stage: "test", allow_failure: false, web_url: "https://gitlab.example/j/4", downstream_pipeline: { id: 901, project_id: 1, status: "failed" } })} ;;
  "projects/1/pipelines/901/jobs") ${line({ name: "e2e", status: "failed", stage: "test", allow_failure: false, web_url: "https://gitlab.example/j/5" })} ;;
  "projects/1/pipelines/901/bridges") ${line({ name: "grandchild", status: "success", stage: "test", allow_failure: false, web_url: "https://gitlab.example/j/6", downstream_pipeline: { id: 902, project_id: 2, status: "running" } })} ;;
  "projects/2/pipelines/902/jobs") ${line({ name: "deploy", status: "running", stage: "deploy", allow_failure: false, web_url: "https://gitlab.example/j/7" })} ;;
  "projects/2/pipelines/902/bridges") ;;
  "${PROJECT}/merge_requests/7/discussions") ${line({ id: "d1", notes: [{ system: false, resolvable: true, resolved: false, author: { username: "reviewer" }, body: "Fix this.", created_at: "2026-11-01T10:00:00Z", position: { new_path: "a.ts", new_line: 3 } }] })}; ${line({ id: "d2", notes: [{ system: false, resolvable: true, resolved: true, author: { username: "reviewer" }, body: "Done.", created_at: "2026-11-01T10:00:00Z", position: null }] })} ;;
  "${PROJECT}/merge_requests/7/pipelines") ${line({ id: 900, status: "failed" })}; ${line({ id: 850, status: "success" })} ;;
  *) echo "unknown endpoint: $endpoint" >&2; exit 3 ;;
esac
`,
	{ mode: 0o755 },
);
writeFileSync(
	join(directory, "git"),
	`#!/bin/sh
case "$*" in
  "remote get-url origin") echo "git@gitlab.example:group/sub/project.git" ;;
  "branch --show-current") echo "feature" ;;
  *) exit 1 ;;
esac
`,
	{ mode: 0o755 },
);

function read(body: string): unknown {
	const program = `import { GlabGitLabReader } from ${JSON.stringify(`${import.meta.dir}/gitlab.ts`)};
const reader = new GlabGitLabReader("gitlab.example");
${body}`;
	const child = spawnSync(process.execPath, ["-e", program], {
		encoding: "utf8",
		timeout: 5000,
		env: { ...process.env, PATH: `${directory}:${process.env.PATH}` },
	});
	expect(child.stderr).toBe("");
	expect(child.status).toBe(0);
	return JSON.parse(child.stdout);
}

describe("glab GitLab reader", () => {
	it("finds the open merge request for the current branch", () => {
		expect(
			read("console.log(JSON.stringify(await reader.currentPr(null)));"),
		).toEqual({ owner: "group/sub", repo: "project", number: 7 });
	});

	it("lists open merge requests for stack discovery", () => {
		expect(
			read(
				`console.log(JSON.stringify(await reader.openPullRequests({ owner: "group/sub", repo: "project" })));`,
			),
		).toEqual([
			{ number: 7, headRefName: "feature", baseRefName: "main", isCrossRepository: false },
			{ number: 8, headRefName: "next", baseRefName: "feature", isCrossRepository: false },
		]);
	});

	it("reads head pipeline jobs, bridges, and every downstream pipeline as checks", () => {
		const result = read(`const context = await reader.currentPr(null);
const facts = await reader.pullRequest(context);
const checks = await reader.checks(facts);
console.log(JSON.stringify({ source: checks.source, checks: checks.checks.map((c) => [c.name, c.kind]) }));`);
		expect(result).toEqual({
			source: "gitlab-pipeline",
			checks: [
				["unit", "failed"],
				["lint", "passed"],
				["deploy-docs", "pending"],
				["child", "passed"],
				["child / e2e", "failed"],
				["child / grandchild", "passed"],
				["child / grandchild / deploy", "pending"],
			],
		});
	});

	it("returns only unresolved discussions as review threads", () => {
		const result = read(`const context = await reader.currentPr(null);
console.log(JSON.stringify((await reader.reviewThreads(context)).map((t) => [t.id, t.firstComment.body])));`);
		expect(result).toEqual([["d1", "Fix this."]]);
	});

	it("refuses a failed head pipeline and sees an earlier passing one", () => {
		const result = read(`const facts = await reader.pullRequest(await reader.currentPr(null));
console.log(JSON.stringify(await reader.mergeRead(facts)));`);
		expect(result).toEqual({
			hadPreviousPassingCi: true,
			merge: { kind: "refused", forge: "gitlab", headPipelineStatus: "failed" },
		});
	});
});
