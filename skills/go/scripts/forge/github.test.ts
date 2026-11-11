import { afterAll, describe, expect, it } from "bun:test";
import { fakeForge, reply } from "./fake.test-helper.ts";

const REPO = "repos/octo/app";
const fake = fakeForge({
	remote: "git@github.com:octo/app.git",
	tool: "gh",
	responses: `case "$endpoint" in
  "${REPO}/pulls/7") echo "abc123" ;;
  "${REPO}/pulls/7/reviews") case "$*" in *POST*) ${reply({ id: 1 })} ;; *) ${reply([[{ user: { login: "me" }, commit_id: "old1" }, { user: { login: "other" }, commit_id: "x" }], [{ user: { login: "me" }, commit_id: "old2" }, { user: { login: "other" }, commit_id: "y" }]])} ;; esac ;;
  "user") echo "me" ;;
  "graphql") ${reply({ data: {} })} ;;
  *) echo "unknown endpoint: $endpoint" >&2; exit 3 ;;
esac`,
});
afterAll(() => fake.remove());

describe("forge on GitHub", () => {
	it("posts the summary and every line comment as one review on the head commit", () => {
		const summary = fake.file("summary.md", "Two findings.\n");
		const comments = fake.file(
			"comments.json",
			JSON.stringify([
				{ path: "src/a.ts", line: 42, body: "Off by one." },
				{ path: "src/b.ts", line: 3, side: "old", body: "Still used." },
			]),
		);
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary, "--comments", comments]);
		expect(result.stderr).toBe("");
		expect(result.status).toBe(0);
		expect(result.calls).toEqual([
			{ args: `api --jq .head.sha ${REPO}/pulls/7` },
			{
				args: `api --method POST --input - ${REPO}/pulls/7/reviews`,
				body: {
					commit_id: "abc123",
					event: "COMMENT",
					body: "Two findings.\n",
					comments: [
						{ path: "src/a.ts", line: 42, side: "RIGHT", body: "Off by one." },
						{ path: "src/b.ts", line: 3, side: "LEFT", body: "Still used." },
					],
				},
			},
		]);
		expect(JSON.parse(result.stdout)).toEqual({ forge: "github", pr: 7, comments: 2 });
	});

	it("replies in a thread by the id the watcher prints", () => {
		const body = fake.file("reply.md", "Fixed in abc123.");
		const result = fake.run(["reply", "--pr", "7", "--thread", "PRRT_1", "--body-file", body]);
		expect(result.status).toBe(0);
		expect(result.calls).toHaveLength(1);
		expect(result.calls[0]?.args).toBe("api --input - graphql");
		expect(result.calls[0]?.body).toMatchObject({
			variables: { thread: "PRRT_1", body: "Fixed in abc123." },
		});
		expect(JSON.stringify(result.calls[0]?.body)).toContain("addPullRequestReviewThreadReply");
	});

	it("resolves a thread by the id the watcher prints", () => {
		const result = fake.run(["resolve", "--pr", "7", "--thread", "PRRT_1"]);
		expect(result.status).toBe(0);
		expect(result.calls[0]?.body).toMatchObject({ variables: { thread: "PRRT_1" } });
		expect(JSON.stringify(result.calls[0]?.body)).toContain("resolveReviewThread");
	});

	it("finds the commit of your latest review across pages", () => {
		const result = fake.run(["last-review", "--pr", "7"]);
		expect(result.stderr).toBe("");
		expect(JSON.parse(result.stdout)).toEqual({ forge: "github", pr: 7, commit: "old2" });
		expect(result.calls.map((call) => call.args)).toEqual([
			"api --jq .login user",
			`api --paginate --slurp ${REPO}/pulls/7/reviews`,
		]);
	});

	it("names the field when a comment is malformed", () => {
		const comments = fake.file("bad.json", JSON.stringify([{ path: "a.ts", body: "x" }]));
		const summary = fake.file("s.md", "s");
		const result = fake.run(["review", "--pr", "7", "--summary-file", summary, "--comments", comments]);
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("comments[0].line");
		expect(result.calls).toEqual([]);
	});
});
