import { WatcherQueryError } from "./errors.ts";
import {
	at,
	enumValue,
	list,
	missing,
	nullableEnum,
	optionalString,
	record,
	string,
} from "./json.ts";
import type * as T from "./types.ts";
import { parsePrNumber } from "./types.ts";
const MERGE_STATES = [
	"BEHIND",
	"BLOCKED",
	"CLEAN",
	"CONFLICTING",
	"DIRTY",
	"DRAFT",
	"HAS_HOOKS",
	"UNKNOWN",
	"UNSTABLE",
] as const satisfies readonly T.MergeStateStatus[];
export const ROLLUP_STATES = [
	"ERROR",
	"EXPECTED",
	"FAILURE",
	"PENDING",
	"SUCCESS",
] as const;
const REVIEW_DECISIONS = [
	"APPROVED",
	"CHANGES_REQUESTED",
	"REVIEW_REQUIRED",
] as const;
// `gh pr view` reports no review decision as "", not null. Only this field does
// it, so the normalization stays here rather than in nullableEnum, where it
// would stop a genuinely unexpected rollup state from failing closed.
const reviewDecision = (value: unknown): T.ReviewDecision =>
	nullableEnum(
		value === "" ? null : value,
		REVIEW_DECISIONS,
		"pull request.reviewDecision",
	);
export function parsePrUrl(value: string): T.PrContext {
	try {
		const url = new URL(value);
		const parts = url.pathname.split("/").filter(Boolean);
		if (
			url.protocol !== "https:" ||
			url.hostname !== "github.com" ||
			url.port ||
			url.username ||
			url.password ||
			url.search ||
			url.hash ||
			parts.length !== 4 ||
			parts[2] !== "pull"
		)
			throw new Error("not a canonical GitHub pull URL");
		return {
			owner: parts[0],
			repo: parts[1],
			number: parsePrNumber(Number(parts[3])),
		};
	} catch (error) {
		throw new WatcherQueryError({
			kind: "invalid-context-url",
			retryable: false,
			rawValue: value,
			detail: `could not infer owner/repo from PR URL: ${value} (${error instanceof Error ? error.message : String(error)})`,
		});
	}
}
function checkDetails(value: Record<string, unknown>, nameKey: string) {
	return {
		name: string(value[nameKey], nameKey),
		description: typeof value.description === "string" ? value.description : "",
		link:
			typeof value.link === "string"
				? value.link
				: typeof value.detailsUrl === "string"
					? value.detailsUrl
					: "",
		workflow: typeof value.workflow === "string" ? value.workflow : "",
	};
}
export function parseFastCheck(value: unknown): T.Check {
	const object = record(value, "check");
	const details = checkDetails(object, "name");
	const state = string(object.state, "check.state").toUpperCase();
	const bucket = string(object.bucket, "check.bucket");
	if (state === "ACTION_REQUIRED") return gateOr("failed", details, state);
	if (bucket === "fail" || ["FAILURE", "ERROR"].includes(state))
		return { ...details, kind: "failed", reportedState: state };
	if (bucket === "pending") return gateOr("pending", details, state);
	if (bucket === "pass")
		return { ...details, kind: "passed", reportedState: state };
	if (bucket === "skipping")
		return { ...details, kind: "skipped", reportedState: state };
	return { ...details, kind: "failed", reportedState: state };
}
// Every read path classifies the owner-approval gate here, so the rule has one
// home. A gate that is pending or waits on an owner approval must not count as
// pending or failed, or the watcher waits on a human.
function gateOr(
	kind: "pending" | "failed",
	details: {
		readonly name: string;
		readonly description: string;
		readonly link: string;
		readonly workflow: string;
	},
	reportedState: string,
): T.Check {
	return details.name === "Code Review Gate"
		? {
				...details,
				kind: "code-review-gate",
				name: "Code Review Gate",
				reportedState,
			}
		: { ...details, kind, reportedState };
}
export function mapRollupNode(value: unknown): T.Check | null {
	const object = record(value, "rollup node");
	const typename = object.__typename;
	if (typename !== "CheckRun" && typename !== "StatusContext") return null;
	const details = checkDetails(
		object,
		typename === "CheckRun" ? "name" : "context",
	);
	const link =
		typeof object.targetUrl === "string" ? object.targetUrl : details.link;
	if (typename === "CheckRun") {
		const status =
			typeof object.status === "string" ? object.status.toUpperCase() : "";
		const conclusion =
			typeof object.conclusion === "string"
				? object.conclusion.toUpperCase()
				: "";
		if (status !== "COMPLETED")
			return gateOr("pending", { ...details, link }, "PENDING");
		if (conclusion === "SUCCESS")
			return { ...details, link, kind: "passed", reportedState: "SUCCESS" };
		if (conclusion === "NEUTRAL" || conclusion === "SKIPPED")
			return { ...details, link, kind: "skipped", reportedState: conclusion };
		if (conclusion === "ACTION_REQUIRED")
			return gateOr("failed", { ...details, link }, conclusion);
		return { ...details, link, kind: "failed", reportedState: "FAILURE" };
	}
	const state =
		typeof object.state === "string" ? object.state.toUpperCase() : "";
	if (state === "PENDING" || state === "EXPECTED")
		return gateOr("pending", { ...details, link }, "PENDING");
	return state === "SUCCESS"
		? { ...details, link, kind: "passed", reportedState: state }
		: { ...details, link, kind: "failed", reportedState: state || "FAILURE" };
}
function parseComment(value: unknown): T.ReviewComment {
	const object = record(value, "review comment");
	const author =
		object.author === null
			? null
			: record(object.author, "review comment.author");
	return {
		authorLogin:
			author === null
				? null
				: optionalString(author.login, "review comment.author.login"),
		authorIsBot: author?.__typename === "Bot",
		body: string(object.body, "review comment.body"),
		path: optionalString(object.path, "review comment.path"),
		line:
			object.line === null
				? null
				: Number.isInteger(object.line)
					? Number(object.line)
					: missing("review comment.line", object.line),
		createdAt: string(object.createdAt, "review comment.createdAt"),
	};
}
// GitHub Apps (CodeRabbit, Copilot review, Greptile, Bugbot, and the like) author as
// `Bot` in GraphQL, which covers every review bot without a list of logins.
function isReviewBot(comment: T.ReviewComment | null): boolean {
	return comment?.authorIsBot === true;
}
// A bot that stamps a RUN_ID names its own passes. Otherwise one pass is one review
// submission, and a submission's comments share an author and a minute.
function passKey(comment: T.ReviewComment): string {
	const runId = /RUN_ID:\s*([a-zA-Z0-9_.:-]+)/.exec(comment.body)?.[1];
	return (
		runId ??
		`${comment.authorLogin ?? "unknown"}@${comment.createdAt.slice(0, 16)}`
	);
}
export function parseReviewThreadPage(value: unknown): T.ReviewThreadPage {
	const reviewThreads = record(
		at(value, ["data", "repository", "pullRequest", "reviewThreads"]),
		"reviewThreads",
	);
	const nodes = list(reviewThreads.nodes, "reviewThreads.nodes");
	const threads: T.RawReviewThread[] = [];
	for (const node of nodes) {
		const thread = record(node, "review thread");
		if (typeof thread.isResolved !== "boolean")
			missing("review thread.isResolved", thread.isResolved);
		const comments = list(
			at(thread, ["comments", "nodes"]),
			"review thread.comments.nodes",
		);
		threads.push({
			id: string(thread.id, "review thread.id"),
			firstComment: comments.length === 0 ? null : parseComment(comments[0]),
			resolved: thread.isResolved,
		});
	}
	const page = record(reviewThreads.pageInfo, "reviewThreads.pageInfo");
	if (typeof page.hasNextPage !== "boolean")
		missing("reviewThreads.pageInfo.hasNextPage", page.hasNextPage);
	const cursor = optionalString(
		page.endCursor,
		"reviewThreads.pageInfo.endCursor",
	);
	return { threads, endCursor: page.hasNextPage && cursor ? cursor : null };
}
export function buildReviewThreads(
	threads: readonly T.RawReviewThread[],
): readonly T.ReviewThread[] {
	const keys = new Set<string>();
	for (const { firstComment } of threads) {
		if (firstComment !== null && isReviewBot(firstComment))
			keys.add(passKey(firstComment));
	}
	const passes = keys.size;
	return threads
		.filter((thread) => !thread.resolved)
		.map(({ id, firstComment }) => ({
			id,
			firstComment,
			isReviewBot: isReviewBot(firstComment),
			reviewBotPasses: passes,
		}));
}
export function parsePullRequest(
	value: unknown,
	context: T.PrContext,
): T.PullRequestFacts {
	const object = record(value, "pull request");
	if (typeof object.isDraft !== "boolean")
		missing("pull request.isDraft", object.isDraft);
	return {
		context,
		mergeable: enumValue(
			object.mergeable,
			["MERGEABLE", "CONFLICTING", "UNKNOWN"] as const,
			"pull request.mergeable",
		),
		mergeState: {
			forge: "github",
			status: enumValue(
				object.mergeStateStatus,
				MERGE_STATES,
				"pull request.mergeStateStatus",
			),
		},
		reviewDecision: reviewDecision(object.reviewDecision),
		headRefOid: optionalString(object.headRefOid, "pull request.headRefOid"),
		headRefName: string(object.headRefName, "pull request.headRefName"),
		baseRefName: string(object.baseRefName, "pull request.baseRefName"),
		state: enumValue(
			object.state,
			["OPEN", "CLOSED", "MERGED"] as const,
			"pull request.state",
		),
		mergedAt: optionalString(object.mergedAt, "pull request.mergedAt"),
		isDraft: object.isDraft,
	};
}
