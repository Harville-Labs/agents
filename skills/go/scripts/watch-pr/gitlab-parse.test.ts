import { describe, expect, it } from "bun:test";
import {
	gitlabMergeRead,
	parseDiscussions,
	parseJob,
	parseMergeRequest,
	parseNdjson,
	parseOpenMergeRequests,
} from "./gitlab-parse.ts";
import { parsePrNumber } from "./types.ts";

const context = {
	owner: "group/sub",
	repo: "project",
	number: parsePrNumber(7),
};

const mergeRequest = (overrides: Record<string, unknown> = {}) => ({
	iid: 7,
	state: "opened",
	draft: false,
	has_conflicts: false,
	detailed_merge_status: "mergeable",
	sha: "abc123",
	source_branch: "feature",
	target_branch: "main",
	merged_at: null,
	head_pipeline: { id: 900, status: "success" },
	...overrides,
});

const job = (overrides: Record<string, unknown> = {}) => ({
	name: "test",
	status: "success",
	stage: "verify",
	allow_failure: false,
	web_url: "https://gitlab.example/group/sub/project/-/jobs/1",
	failure_reason: null,
	...overrides,
});

describe("GitLab merge request facts", () => {
	it("maps an open, clean merge request onto watcher facts", () => {
		expect(parseMergeRequest(mergeRequest(), context)).toEqual({
			context,
			mergeable: "MERGEABLE",
			mergeState: {
				forge: "gitlab",
				detailedMergeStatus: "mergeable",
				headPipeline: { id: 900, status: "success" },
			},
			reviewDecision: null,
			headRefOid: "abc123",
			headRefName: "feature",
			baseRefName: "main",
			state: "OPEN",
			mergedAt: null,
			isDraft: false,
		});
	});

	it("reports conflicts from has_conflicts or the conflict merge status", () => {
		expect(
			parseMergeRequest(mergeRequest({ has_conflicts: true }), context)
				.mergeable,
		).toBe("CONFLICTING");
		expect(
			parseMergeRequest(
				mergeRequest({ detailed_merge_status: "conflict" }),
				context,
			).mergeable,
		).toBe("CONFLICTING");
	});

	it("treats a merge status GitLab is still computing as unknown", () => {
		for (const status of ["checking", "unchecked", "approvals_syncing"])
			expect(
				parseMergeRequest(
					mergeRequest({ detailed_merge_status: status }),
					context,
				).mergeable,
			).toBe("UNKNOWN");
	});

	it("maps review state from the detailed merge status", () => {
		expect(
			parseMergeRequest(
				mergeRequest({ detailed_merge_status: "requested_changes" }),
				context,
			).reviewDecision,
		).toBe("CHANGES_REQUESTED");
		expect(
			parseMergeRequest(
				mergeRequest({ detailed_merge_status: "not_approved" }),
				context,
			).reviewDecision,
		).toBe("REVIEW_REQUIRED");
	});

	it("maps merged, closed, and locked states", () => {
		const merged = parseMergeRequest(
			mergeRequest({ state: "merged", merged_at: "2026-11-01T00:00:00Z" }),
			context,
		);
		expect(merged.state).toBe("MERGED");
		expect(merged.mergedAt).toBe("2026-11-01T00:00:00Z");
		expect(
			parseMergeRequest(mergeRequest({ state: "closed" }), context).state,
		).toBe("CLOSED");
		expect(
			parseMergeRequest(mergeRequest({ state: "locked" }), context).state,
		).toBe("CLOSED");
	});

	it("keeps a missing head pipeline as null", () => {
		const facts = parseMergeRequest(
			mergeRequest({ head_pipeline: null }),
			context,
		);
		expect(facts.mergeState).toEqual({
			forge: "gitlab",
			detailedMergeStatus: "mergeable",
			headPipeline: null,
		});
	});

	it("names the field when GitLab returns an unexpected shape", () => {
		expect(() =>
			parseMergeRequest(mergeRequest({ state: "archived" }), context),
		).toThrow("merge request.state");
	});
});

describe("GitLab open merge requests", () => {
	it("marks a merge request from a fork as cross-repository", () => {
		expect(
			parseOpenMergeRequests([
				{
					iid: 3,
					source_branch: "a",
					target_branch: "main",
					source_project_id: 1,
					target_project_id: 1,
				},
				{
					iid: 4,
					source_branch: "b",
					target_branch: "main",
					source_project_id: 2,
					target_project_id: 1,
				},
			]),
		).toEqual([
			{
				number: parsePrNumber(3),
				headRefName: "a",
				baseRefName: "main",
				isCrossRepository: false,
			},
			{
				number: parsePrNumber(4),
				headRefName: "b",
				baseRefName: "main",
				isCrossRepository: true,
			},
		]);
	});
});

describe("GitLab jobs as checks", () => {
	it("maps each job status onto a check kind", () => {
		const kinds = Object.fromEntries(
			[
				"success",
				"failed",
				"canceled",
				"skipped",
				"manual",
				"created",
				"pending",
				"running",
				"waiting_for_resource",
				"preparing",
				"scheduled",
			].map((status) => [status, parseJob(job({ status }), "job").kind]),
		);
		expect(kinds).toEqual({
			success: "passed",
			failed: "failed",
			canceled: "failed",
			skipped: "skipped",
			manual: "skipped",
			created: "pending",
			pending: "pending",
			running: "pending",
			waiting_for_resource: "pending",
			preparing: "pending",
			scheduled: "pending",
		});
	});

	it("does not block on a failed job that is allowed to fail", () => {
		expect(
			parseJob(job({ status: "failed", allow_failure: true }), "job").kind,
		).toBe("skipped");
	});

	it("carries the job link, stage, and failure reason", () => {
		expect(
			parseJob(
				job({ status: "failed", failure_reason: "script_failure" }),
				"job",
			),
		).toEqual({
			kind: "failed",
			name: "test",
			reportedState: "failed",
			description: "script_failure",
			link: "https://gitlab.example/group/sub/project/-/jobs/1",
			workflow: "verify",
		});
	});
});

describe("GitLab discussions as review threads", () => {
	const note = (overrides: Record<string, unknown> = {}) => ({
		system: false,
		resolvable: true,
		resolved: false,
		author: { username: "reviewer" },
		body: "Please rename this.",
		created_at: "2026-11-01T10:00:00Z",
		position: { new_path: "src/a.ts", new_line: 12 },
		...overrides,
	});

	it("reads the first human note of a resolvable discussion", () => {
		expect(
			parseDiscussions([
				{ id: "d1", notes: [note({ system: true }), note()] },
			]),
		).toEqual([
			{
				id: "d1",
				resolved: false,
				firstComment: {
					authorLogin: "reviewer",
					authorIsBot: false,
					body: "Please rename this.",
					path: "src/a.ts",
					line: 12,
					createdAt: "2026-11-01T10:00:00Z",
				},
			},
		]);
	});

	it("skips discussions that cannot be resolved", () => {
		expect(
			parseDiscussions([
				{ id: "d1", notes: [note({ resolvable: false })] },
				{ id: "d2", notes: [note({ system: true })] },
			]),
		).toEqual([]);
	});

	it("keeps resolved discussions so bot passes still count", () => {
		expect(
			parseDiscussions([{ id: "d1", notes: [note({ resolved: true })] }]).map(
				(thread) => thread.resolved,
			),
		).toEqual([true]);
	});

	it("recognizes project and group access token bots", () => {
		const bots = parseDiscussions([
			{
				id: "d1",
				notes: [note({ author: { username: "project_12_bot_abc" } })],
			},
			{
				id: "d2",
				notes: [note({ author: { username: "group_3_bot_def" } })],
			},
		]);
		expect(bots.map((thread) => thread.firstComment?.authorIsBot)).toEqual([
			true,
			true,
		]);
	});

	it("keeps a general comment without a position", () => {
		const [thread] = parseDiscussions([
			{ id: "d1", notes: [note({ position: null })] },
		]);
		expect(thread?.firstComment?.path).toBeNull();
		expect(thread?.firstComment?.line).toBeNull();
	});
});

describe("GitLab merge read", () => {
	const facts = (headPipeline: { id: number; status: string } | null) =>
		parseMergeRequest(mergeRequest({ head_pipeline: headPipeline }), context);

	it("refuses to merge when the head pipeline failed or was canceled", () => {
		for (const status of ["failed", "canceled"] as const)
			expect(
				gitlabMergeRead(facts({ id: 900, status }), []).merge,
			).toEqual({ kind: "refused", forge: "gitlab", headPipelineStatus: status });
	});

	it("allows a merge request with a passing or missing head pipeline", () => {
		expect(gitlabMergeRead(facts({ id: 900, status: "running" }), []).merge).toEqual({
			kind: "allowed",
			forge: "gitlab",
			headPipelineStatus: "running",
		});
		expect(gitlabMergeRead(facts(null), []).merge).toEqual({
			kind: "allowed",
			forge: "gitlab",
			headPipelineStatus: null,
		});
	});

	it("counts an earlier passing pipeline but not the head pipeline", () => {
		const head = facts({ id: 900, status: "success" });
		expect(
			gitlabMergeRead(head, [{ id: 900, status: "success" }])
				.hadPreviousPassingCi,
		).toBe(false);
		expect(
			gitlabMergeRead(head, [
				{ id: 900, status: "failed" },
				{ id: 850, status: "success" },
			]).hadPreviousPassingCi,
		).toBe(true);
	});

	it("rejects facts from another forge", () => {
		expect(() =>
			gitlabMergeRead(
				{ ...facts(null), mergeState: { forge: "github", status: "CLEAN" } },
				[],
			),
		).toThrow("GitLab");
	});
});

describe("ndjson output", () => {
	it("parses one value per non-empty line", () => {
		expect(parseNdjson('{"a":1}\n\n{"a":2}\n', "jobs")).toEqual([
			{ a: 1 },
			{ a: 2 },
		]);
	});

	it("names the command when a line is not JSON", () => {
		expect(() => parseNdjson("{oops\n", "jobs")).toThrow("jobs");
	});
});
