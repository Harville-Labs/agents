import { afterAll, describe, expect, it } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { fakeForge, reply } from "./fake.test-helper.ts";

const MR = "projects/group%2Fsub%2Fproject/merge_requests/7";
const VERSIONS = [
	{ id: 2, created_at: "2026-11-02T00:00:00Z", base_commit_sha: "base", start_commit_sha: "start", head_commit_sha: "head2" },
	{ id: 1, created_at: "2026-11-01T00:00:00Z", base_commit_sha: "base", start_commit_sha: "start", head_commit_sha: "head1" },
];
const DIFF = "@@ -1,3 +1,4 @@\n keep\n-gone\n+added\n+more\n same\n";
const fake = fakeForge({
	remote: "git@gitlab.example:group/sub/project.git",
	tool: "glab",
	responses: `case "$endpoint" in
  "${MR}/versions") ${reply(VERSIONS[0])}; ${reply(VERSIONS[1])} ;;
  "${MR}/diffs") ${reply({ old_path: "src/old.ts", new_path: "src/a.ts", diff: DIFF })} ;;
  "${MR}/draft_notes") case "$*" in *POST*) ${reply({ id: 5 })} ;; *) if [ -f drafts ]; then ${reply({ id: 4 })}; fi ;; esac ;;
  "${MR}/draft_notes/bulk_publish") ;;
  "${MR}/notes") case "$*" in *POST*) ${reply({ id: 6 })} ;; *) ${reply({ author: { username: "me" }, created_at: "2026-11-01T12:00:00Z" })}; ${reply({ author: { username: "other" }, created_at: "2026-11-03T00:00:00Z" })} ;; esac ;;
  "${MR}/discussions/d1/notes") ${reply({ id: 7 })} ;;
  "${MR}/discussions/d1") ${reply({ id: "d1" })} ;;
  "user") ${reply({ username: "me" })} ;;
  *) echo "unknown endpoint: $endpoint" >&2; exit 3 ;;
esac`,
});
afterAll(() => fake.remove());

const write = (method: string, endpoint: string) =>
	`api --hostname gitlab.example --method ${method} --input - ${MR}${endpoint}`;
const read = (endpoint: string) =>
	`api --hostname gitlab.example --paginate --output ndjson ${MR}${endpoint}`;
const position = {
	position_type: "text",
	base_sha: "base",
	start_sha: "start",
	head_sha: "head2",
	old_path: "src/old.ts",
	new_path: "src/a.ts",
};

describe("forge on GitLab", () => {
	it("posts the summary and line threads as drafts and publishes them together", () => {
		const summary = fake.file("summary.md", "Three findings.");
		const comments = fake.file(
			"comments.json",
			JSON.stringify([
				{ path: "src/a.ts", line: 2, body: "Added line." },
				{ path: "src/a.ts", line: 4, body: "Unchanged line." },
				{ path: "src/a.ts", line: 2, side: "old", body: "Removed line." },
			]),
		);
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary, "--comments", comments]);
		expect(result.stderr).toBe("");
		expect(result.status).toBe(0);
		expect(result.calls).toEqual([
			{ args: read("/draft_notes") },
			{ args: read("/versions") },
			{ args: read("/diffs") },
			{ args: write("POST", "/draft_notes"), body: { note: "Three findings." } },
			{ args: write("POST", "/draft_notes"), body: { note: "Added line.", position: { ...position, new_line: 2 } } },
			{ args: write("POST", "/draft_notes"), body: { note: "Unchanged line.", position: { ...position, old_line: 3, new_line: 4 } } },
			{ args: write("POST", "/draft_notes"), body: { note: "Removed line.", position: { ...position, old_line: 2 } } },
			{ args: write("POST", "/draft_notes/bulk_publish"), body: {} },
		]);
		expect(JSON.parse(result.stdout)).toEqual({ forge: "gitlab", pr: 7, comments: 3 });
	});

	it("posts a summary without line comments as one note", () => {
		const summary = fake.file("summary.md", "Looks good.");
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary]);
		expect(result.status).toBe(0);
		expect(result.calls).toEqual([{ args: write("POST", "/notes"), body: { body: "Looks good." } }]);
	});

	it("refuses a line the diff does not show before posting anything", () => {
		const summary = fake.file("summary.md", "s");
		const comments = fake.file("far.json", JSON.stringify([{ path: "src/a.ts", line: 90, body: "x" }]));
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary, "--comments", comments]);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("src/a.ts:90");
		expect(result.calls.some((call) => call.args.includes("POST"))).toBe(false);
	});

	it("refuses to publish when you already have unpublished drafts", () => {
		const summary = fake.file("summary.md", "s");
		const comments = fake.file("one.json", JSON.stringify([{ path: "src/a.ts", line: 2, body: "x" }]));
		fake.file("drafts", "");
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary, "--comments", comments]);
		rmSync(join(fake.directory, "drafts"));
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("unpublished draft");
		expect(result.calls).toEqual([{ args: read("/draft_notes") }]);
	});

	it("replies in a discussion by the id the watcher prints", () => {
		const body = fake.file("reply.md", "Fixed.");
		const result = fake.run(["reply", "--pr", "7", "--thread", "d1", "--body-file", body]);
		expect(result.status).toBe(0);
		expect(result.calls).toEqual([{ args: write("POST", "/discussions/d1/notes"), body: { body: "Fixed." } }]);
	});

	it("resolves a discussion by the id the watcher prints", () => {
		const result = fake.run(["resolve", "--pr", "7", "--thread", "d1"]);
		expect(result.status).toBe(0);
		expect(result.calls).toEqual([{ args: write("PUT", "/discussions/d1"), body: { resolved: true } }]);
	});

	it("finds the head that was current at your latest note", () => {
		const result = fake.run(["last-review", "--pr", "7"]);
		expect(result.stderr).toBe("");
		expect(JSON.parse(result.stdout)).toEqual({ forge: "gitlab", pr: 7, commit: "head1" });
	});
});
