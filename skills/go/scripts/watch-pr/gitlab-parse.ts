import { parseJson } from "./command.ts";
import {
	enumValue,
	list,
	missing,
	optionalString,
	record,
	string,
} from "./json.ts";
import * as T from "./types.ts";

const MR_STATES = ["opened", "merged", "closed", "locked"] as const;
const FACT_STATE = {
	opened: "OPEN",
	merged: "MERGED",
	closed: "CLOSED",
	locked: "CLOSED",
} as const;
const COMPUTING = new Set(["checking", "unchecked", "approvals_syncing"]);
const JOB_KIND: Readonly<
	Record<string, Exclude<T.Check["kind"], "code-review-gate">>
> = {
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
};
const TOKEN_BOT = /^(project|group)_\d+_bot/;

export function parseNdjson(text: string, label: string): readonly unknown[] {
	return text
		.split(/\r?\n/)
		.filter((line) => line.trim() !== "")
		.map((line) => parseJson(line, label));
}

function number(value: unknown, path: string): number {
	if (typeof value !== "number") missing(path, value);
	return value;
}

function pipeline(value: unknown, path: string): T.GitLabPipeline | null {
	if (value === null || value === undefined) return null;
	const object = record(value, path);
	return {
		id: number(object.id, `${path}.id`),
		status: string(object.status, `${path}.status`),
	};
}

export function parseMergeRequest(
	value: unknown,
	context: T.PrContext,
): T.PullRequestFacts {
	const object = record(value, "merge request");
	const status = string(
		object.detailed_merge_status,
		"merge request.detailed_merge_status",
	);
	const state = enumValue(object.state, MR_STATES, "merge request.state");
	return {
		context,
		mergeable:
			object.has_conflicts === true || status === "conflict"
				? "CONFLICTING"
				: COMPUTING.has(status)
					? "UNKNOWN"
					: "MERGEABLE",
		mergeState: {
			forge: "gitlab",
			detailedMergeStatus: status,
			headPipeline: pipeline(object.head_pipeline, "merge request.head_pipeline"),
		},
		reviewDecision:
			status === "requested_changes"
				? "CHANGES_REQUESTED"
				: status === "not_approved"
					? "REVIEW_REQUIRED"
					: null,
		headRefOid: optionalString(object.sha ?? null, "merge request.sha"),
		headRefName: string(object.source_branch, "merge request.source_branch"),
		baseRefName: string(object.target_branch, "merge request.target_branch"),
		state: FACT_STATE[state],
		mergedAt: optionalString(object.merged_at ?? null, "merge request.merged_at"),
		isDraft: object.draft === true,
	};
}

export function parseOpenMergeRequests(
	values: readonly unknown[],
): readonly T.OpenPullRequest[] {
	return values.map((item, index) => {
		const path = `open merge requests[${index}]`;
		const object = record(item, path);
		return {
			number: T.parsePrNumber(object.iid, `${path}.iid`),
			headRefName: string(object.source_branch, `${path}.source_branch`),
			baseRefName: string(object.target_branch, `${path}.target_branch`),
			isCrossRepository:
				number(object.source_project_id, `${path}.source_project_id`) !==
				number(object.target_project_id, `${path}.target_project_id`),
		};
	});
}

export function parseJob(value: unknown, path: string): T.Check {
	const object = record(value, path);
	const status = string(object.status, `${path}.status`);
	const known = JOB_KIND[status] ?? "pending";
	const kind =
		known === "failed" && status === "failed" && object.allow_failure === true
			? "skipped"
			: known;
	return {
		kind,
		name: string(object.name, `${path}.name`),
		reportedState: status,
		description:
			typeof object.failure_reason === "string" ? object.failure_reason : "",
		link: typeof object.web_url === "string" ? object.web_url : "",
		workflow: typeof object.stage === "string" ? object.stage : "",
	};
}

function comment(note: Record<string, unknown>, path: string): T.ReviewComment {
	const author = record(note.author, `${path}.author`);
	const login = string(author.username, `${path}.author.username`);
	const position =
		note.position === null || note.position === undefined
			? null
			: record(note.position, `${path}.position`);
	return {
		authorLogin: login,
		authorIsBot: TOKEN_BOT.test(login),
		body: string(note.body, `${path}.body`),
		path: typeof position?.new_path === "string" ? position.new_path : null,
		line: typeof position?.new_line === "number" ? position.new_line : null,
		createdAt: string(note.created_at, `${path}.created_at`),
	};
}

export function parseDiscussions(
	values: readonly unknown[],
): readonly T.RawReviewThread[] {
	return values.flatMap((item, index) => {
		const path = `discussions[${index}]`;
		const object = record(item, path);
		const notes = list(object.notes, `${path}.notes`).map((note, n) =>
			record(note, `${path}.notes[${n}]`),
		);
		const first = notes.findIndex((note) => note.system !== true);
		const note = notes[first];
		if (note === undefined || note.resolvable !== true) return [];
		return [
			{
				id: string(object.id, `${path}.id`),
				resolved: note.resolved === true,
				firstComment: comment(note, `${path}.notes[${first}]`),
			},
		];
	});
}

export function gitlabMergeRead(
	facts: T.PullRequestFacts,
	pipelines: readonly unknown[],
): T.MergeRead {
	if (facts.mergeState.forge !== "gitlab")
		throw new Error("GitLab merge read needs GitLab merge request facts");
	const head = facts.mergeState.headPipeline;
	const hadPreviousPassingCi = pipelines.some((item, index) => {
		const read = pipeline(item, `pipelines[${index}]`);
		return read !== null && read.id !== head?.id && read.status === "success";
	});
	const status = head?.status ?? null;
	return {
		hadPreviousPassingCi,
		merge:
			status === "failed" || status === "canceled"
				? { kind: "refused", forge: "gitlab", headPipelineStatus: status }
				: { kind: "allowed", forge: "gitlab", headPipelineStatus: status },
	};
}
