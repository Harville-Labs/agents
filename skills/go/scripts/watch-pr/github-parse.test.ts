import { describe, expect, it } from "bun:test";
import { WatcherQueryError } from "./errors.ts";
import {
	buildReviewThreads,
	mapRollupNode,
	parseFastCheck,
	parsePullRequest,
	parseReviewThreadPage,
} from "./github-parse.ts";
import { parsePrNumber } from "./types.ts";

const context = {
	owner: "owner",
	repo: "repo",
	number: parsePrNumber(42),
};

describe("rollup node mapping", () => {
	it("maps terminal and non-terminal CheckRun states fail closed", () => {
		const cases = [
			["IN_PROGRESS", null, "pending", "PENDING"],
			["COMPLETED", "SUCCESS", "passed", "SUCCESS"],
			["COMPLETED", "NEUTRAL", "skipped", "NEUTRAL"],
			["COMPLETED", "SKIPPED", "skipped", "SKIPPED"],
			["COMPLETED", "ACTION_REQUIRED", "failed", "ACTION_REQUIRED"],
			["COMPLETED", "TIMED_OUT", "failed", "FAILURE"],
			["COMPLETED", "FUTURE_VALUE", "failed", "FAILURE"],
		] as const;
		for (const [status, conclusion, kind, reportedState] of cases) {
			expect(
				mapRollupNode({
					__typename: "CheckRun",
					name: "ci",
					status,
					conclusion,
				}),
			).toMatchObject({ kind, reportedState });
		}
	});

	it("classifies an in-progress Code Review Gate from the rollup as the gate", () => {
		expect(
			mapRollupNode({
				__typename: "CheckRun",
				name: "Code Review Gate",
				status: "IN_PROGRESS",
				conclusion: null,
			}),
		).toMatchObject({ kind: "code-review-gate" });
		expect(
			mapRollupNode({
				__typename: "StatusContext",
				context: "Code Review Gate",
				state: "PENDING",
			}),
		).toMatchObject({ kind: "code-review-gate" });
	});

	it("classifies a Code Review Gate waiting on an owner approval as the gate", () => {
		expect(
			mapRollupNode({
				__typename: "CheckRun",
				name: "Code Review Gate",
				status: "COMPLETED",
				conclusion: "ACTION_REQUIRED",
				description: "1 of 2 policies",
			}),
		).toMatchObject({
			kind: "code-review-gate",
			reportedState: "ACTION_REQUIRED",
		});
	});

	it("classifies a fast-path Code Review Gate waiting on an owner approval as the gate", () => {
		expect(
			parseFastCheck({
				name: "Code Review Gate",
				state: "ACTION_REQUIRED",
				bucket: "fail",
			}),
		).toMatchObject({
			kind: "code-review-gate",
			reportedState: "ACTION_REQUIRED",
		});
		expect(
			parseFastCheck({ name: "ci", state: "ACTION_REQUIRED", bucket: "fail" }),
		).toMatchObject({ kind: "failed", reportedState: "ACTION_REQUIRED" });
	});

	it("maps StatusContext states and drops unknown typenames", () => {
		expect(
			mapRollupNode({
				__typename: "StatusContext",
				context: "ci",
				state: "EXPECTED",
			}),
		).toMatchObject({ kind: "pending", reportedState: "PENDING" });
		expect(
			mapRollupNode({
				__typename: "StatusContext",
				context: "ci",
				state: "FUTURE_VALUE",
			}),
		).toMatchObject({ kind: "failed", reportedState: "FUTURE_VALUE" });
		expect(mapRollupNode({ __typename: "FutureNode" })).toBeNull();
	});
});

describe("closed enum parsing", () => {
	const rawPullRequest = {
		mergeable: "MERGEABLE",
		mergeStateStatus: "CLEAN",
		reviewDecision: "APPROVED",
		headRefOid: "head",
		headRefName: "feature",
		baseRefName: "main",
		state: "OPEN",
		mergedAt: null,
		isDraft: false,
	};

	it("accepts mergeStateStatus CONFLICTING", () => {
		expect(
			parsePullRequest(
				{ ...rawPullRequest, mergeStateStatus: "CONFLICTING" },
				context,
			).mergeStateStatus,
		).toBe("CONFLICTING");
	});

	it("reads gh's empty reviewDecision as no decision rather than a parse failure", () => {
		expect(
			parsePullRequest({ ...rawPullRequest, reviewDecision: "" }, context)
				.reviewDecision,
		).toBeNull();
	});

	it("still rejects an unknown reviewDecision", () => {
		expect(() =>
			parsePullRequest({ ...rawPullRequest, reviewDecision: "MAYBE" }, context),
		).toThrow(WatcherQueryError);
	});

	it("rejects unknown enum values as retryable errors carrying the raw value", () => {
		try {
			parsePullRequest(
				{ ...rawPullRequest, mergeStateStatus: "FUTURE_STATE" },
				context,
			);
			throw new Error("expected parser to throw");
		} catch (error) {
			expect(error).toBeInstanceOf(WatcherQueryError);
			if (!(error instanceof WatcherQueryError)) throw error;
			expect(error.failure).toMatchObject({
				kind: "missing-key",
				retryable: true,
				rawValue: '"FUTURE_STATE"',
			});
		}
	});
});

const reviewThreadResponse = (
	nodes: readonly {
		id: string;
		resolved: boolean;
		body: string;
		createdAt: string;
		author: { __typename: string; login: string };
	}[],
) => ({
	data: {
		repository: {
			pullRequest: {
				reviewThreads: {
					pageInfo: { hasNextPage: false, endCursor: null },
					nodes: nodes.map((node) => ({
						id: node.id,
						isResolved: node.resolved,
						comments: {
							nodes: [
								{
									body: node.body,
									createdAt: node.createdAt,
									path: null,
									line: null,
									author: node.author,
								},
							],
						},
					})),
				},
			},
		},
	},
});

it("marks threads opened by any GitHub App bot as review-bot threads", () => {
	const bot = { __typename: "Bot", login: "coderabbitai" };
	const human = { __typename: "User", login: "someone" };
	const threads = buildReviewThreads(
		parseReviewThreadPage(
			reviewThreadResponse([
				{
					id: "one",
					resolved: false,
					body: "RUN_ID: run-1",
					createdAt: "now",
					author: bot,
				},
				{
					id: "two",
					resolved: false,
					body: "nit",
					createdAt: "now",
					author: human,
				},
				{
					id: "three",
					resolved: true,
					body: "RUN_ID: run-2",
					createdAt: "now",
					author: bot,
				},
			]),
		).threads,
	);
	expect(threads.map((thread) => thread.id)).toEqual(["one", "two"]);
	expect(threads.map((thread) => thread.isReviewBot)).toEqual([true, false]);
	expect(threads.map((thread) => thread.reviewBotPasses)).toEqual([2, 2]);
});

it("counts one review pass per bot submission minute when no run id is stamped", () => {
	const bot = { __typename: "Bot", login: "copilot-pull-request-reviewer" };
	const threads = buildReviewThreads(
		parseReviewThreadPage(
			reviewThreadResponse([
				{
					id: "a",
					resolved: false,
					body: "x",
					createdAt: "2026-11-09T10:00:05Z",
					author: bot,
				},
				{
					id: "b",
					resolved: false,
					body: "y",
					createdAt: "2026-11-09T10:00:40Z",
					author: bot,
				},
				{
					id: "c",
					resolved: false,
					body: "z",
					createdAt: "2026-11-09T12:30:00Z",
					author: bot,
				},
			]),
		).threads,
	);
	expect(threads.map((thread) => thread.reviewBotPasses)).toEqual([2, 2, 2]);
});
