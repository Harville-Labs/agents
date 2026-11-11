import { describe, expect, it } from "bun:test";
import { WatcherQueryError } from "./errors.ts";
import { assessGitHubMerge, githubForge } from "./github.ts";
import { runSimple } from "./poll.ts";
import { runQueued } from "./queue.ts";
import {
	classifyPr,
	queryBackoffSeconds,
	readSnapshot,
	selectTierMajorStackDecision,
} from "./policy.ts";
import {
	fakeReader,
	failedCheck,
	passingCheck,
	pendingCheck,
} from "./fakes.test-helper.ts";
import type {
	MergeStateStatus,
	PollingOptions,
	PrContext,
	PullRequestFacts,
	RollupState,
} from "./types.ts";
import { parsePrNumber } from "./types.ts";

const context = (number: number): PrContext => ({
	owner: "owner",
	repo: "repo",
	number: parsePrNumber(number),
});
const options = {
	interval: 10,
	sweepInterval: 300,
	timeout: 0,
	maxQueryErrors: 5,
	allowDraft: false,
} satisfies PollingOptions;

describe("readiness truth table", () => {
	it("covers every specified row and every UNKNOWN rollup value", () => {
		const cases: readonly [
			MergeStateStatus,
			RollupState,
			"allowed" | "refused",
		][] = [
			["BLOCKED", "FAILURE", "refused"],
			["BLOCKED", "ERROR", "refused"],
			["BLOCKED", "PENDING", "allowed"],
			["UNSTABLE", "FAILURE", "allowed"],
			["UNKNOWN", "ERROR", "allowed"],
			["UNKNOWN", "EXPECTED", "allowed"],
			["UNKNOWN", "FAILURE", "allowed"],
			["UNKNOWN", "PENDING", "allowed"],
			["UNKNOWN", "SUCCESS", "allowed"],
			["UNKNOWN", null, "allowed"],
			["CLEAN", "SUCCESS", "allowed"],
		];
		for (const [mergeStateStatus, headRollupState, expected] of cases) {
			expect(
				assessGitHubMerge({ mergeStateStatus, headRollupState }).kind,
			).toBe(expected);
		}
	});

	it("turns a clean visible list plus GitHub refusal into an explicit CI blocker", async () => {
		const reader = fakeReader({
			facts: { mergeState: { forge: "github", status: "BLOCKED" } },
			fastPath: { kind: "checks", checks: [passingCheck()] },
			commitRollups: [{ oid: "head", state: "FAILURE" }],
		});
		const snapshot = await readSnapshot({
			reader,
			context: context(1),
			pendingHistory: "include",
			allowDraft: false,
		});
		expect(snapshot.kind).toBe("open");
		if (snapshot.kind !== "open") throw new Error("expected open snapshot");
		expect(snapshot.ci.kind).toBe("ci-merge-refused");
		expect(classifyPr(snapshot)).toMatchObject({
			kind: "blocker",
			blocker: { kind: "failing-checks" },
		});
	});
});

describe("snapshot query planning", () => {
	it("does not query commit rollups while queued checks are pending", async () => {
		const reader = fakeReader({
			fastPath: { kind: "checks", checks: [pendingCheck()] },
		});
		const snapshot = await readSnapshot({
			reader,
			context: context(2),
			pendingHistory: "omit",
			allowDraft: false,
		});
		expect(snapshot.kind).toBe("open");
		if (snapshot.kind !== "open") throw new Error("expected open snapshot");
		expect(snapshot.ci.kind).toBe("ci-pending");
		expect(reader.calls).toEqual([
			"pullRequest",
			"reviewThreadPage:null",
			"checksFastPath",
		]);
	});

	it("queries rollups for settled and failed lists", async () => {
		const settled = fakeReader();
		await readSnapshot({
			reader: settled,
			context: context(3),
			pendingHistory: "omit",
			allowDraft: false,
		});
		expect(settled.calls).toContain("commitRollups");

		const failed = fakeReader({
			fastPath: { kind: "checks", checks: [failedCheck()] },
		});
		await readSnapshot({
			reader: failed,
			context: context(4),
			pendingHistory: "omit",
			allowDraft: false,
		});
		expect(failed.calls).toContain("commitRollups");
	});

	it("short-circuits merged rows before threads and checks", async () => {
		const reader = fakeReader({
			facts: { state: "MERGED", mergedAt: "2026-07-26T00:00:00Z" },
		});
		expect(
			(
				await readSnapshot({
					reader,
					context: context(5),
					pendingHistory: "include",
					allowDraft: false,
				})
			).kind,
		).toBe("merged");
		expect(reader.calls).toEqual(["pullRequest"]);
	});
});

it("scans stacks tier-major so an upstack conflict outranks frontier CI", async () => {
	const frontier = await readSnapshot({
		reader: fakeReader({
			fastPath: { kind: "checks", checks: [failedCheck()] },
			commitRollups: [{ oid: "head", state: "FAILURE" }],
		}),
		context: context(10),
		pendingHistory: "omit",
		allowDraft: false,
	});
	const upstack = await readSnapshot({
		reader: fakeReader({ facts: { mergeable: "CONFLICTING" } }),
		context: context(11),
		pendingHistory: "omit",
		allowDraft: false,
	});
	const decision = selectTierMajorStackDecision([frontier, upstack]);
	expect(decision).toMatchObject({
		kind: "blocker",
		blocker: { kind: "merge-conflicts", pr: { number: 11 } },
	});
});

it("attributes a stack wait to the PR whose checks are pending, not the bottom", async () => {
	const readyBottom = await readSnapshot({
		reader: fakeReader(),
		context: context(20),
		pendingHistory: "omit",
		allowDraft: false,
	});
	const pendingUpstack = await readSnapshot({
		reader: fakeReader({
			fastPath: { kind: "checks", checks: [pendingCheck("upstack-build")] },
		}),
		context: context(21),
		pendingHistory: "omit",
		allowDraft: false,
	});
	const decision = selectTierMajorStackDecision([readyBottom, pendingUpstack]);
	expect(decision).toMatchObject({
		kind: "waiting",
		frontier: { number: 21 },
		pending: [{ name: "upstack-build" }],
	});
});

it("waits on a draft while checks are pending, then reports the draft gate", async () => {
	const pending = await readSnapshot({
		reader: fakeReader({
			facts: { isDraft: true },
			fastPath: { kind: "checks", checks: [pendingCheck()] },
		}),
		context: context(12),
		pendingHistory: "omit",
		allowDraft: false,
	});
	expect(classifyPr(pending).kind).toBe("waiting");

	const settled = await readSnapshot({
		reader: fakeReader({ facts: { isDraft: true } }),
		context: context(12),
		pendingHistory: "omit",
		allowDraft: false,
	});
	expect(classifyPr(settled)).toMatchObject({
		kind: "blocker",
		blocker: { kind: "merge-gate", reason: "draft-pr" },
	});
});

it("uses the specified retry floor and cap", () => {
	expect(queryBackoffSeconds(1, 1)).toBe(60);
	expect(queryBackoffSeconds(1, 2)).toBe(120);
	expect(queryBackoffSeconds(60, 4)).toBe(300);
});

describe("polling deadline sleeps", () => {
	for (const mode of ["single", "queued-stack", "query-retry"] as const) {
		it(`caps ${mode} sleeps at the configured deadline`, async () => {
			let now = 0;
			const sleeps: number[] = [];
			const pending = fakeReader({
				fastPath: { kind: "checks", checks: [pendingCheck()] },
			});
			const reader =
				mode === "query-retry"
					? {
							...pending,
							async pullRequest(): Promise<PullRequestFacts> {
								throw new WatcherQueryError({
									kind: "command-exit",
									retryable: true,
									code: 1,
									detail: "temporary failure",
								});
							},
						}
					: pending;
			const dependencies = {
				reader,
				clock: {
					now: () => now,
					observedAt: () => "2026-07-26T00:00:00.000Z",
					async sleep(seconds: number) {
						sleeps.push(seconds);
						now += seconds;
					},
				},
				emit() {},
			};
			const polling = { ...options, interval: 60, timeout: 5 };
			const result =
				mode === "queued-stack"
					? await runQueued({
							dependencies,
							contexts: [context(1)],
							options: polling,
						})
					: await runSimple({
							dependencies,
							contexts: [context(1)],
							mode: "single",
							statusOnly: false,
							options: polling,
						});
			expect(result.kind).toBe("TIMEOUT");
			expect(sleeps).toEqual([5]);
			expect(now).toBe(5);
		});
	}
	it("preserves the polling interval when the deadline is disabled", async () => {
		let now = 0;
		let reads = 0;
		const sleeps: number[] = [];
		const pending = fakeReader({
			fastPath: { kind: "checks", checks: [pendingCheck()] },
		});
		const passed = fakeReader({
			fastPath: { kind: "checks", checks: [passingCheck()] },
		});
		const result = await runSimple({
			dependencies: {
				reader: githubForge({
					...pending,
					async checksFastPath(pr) {
						reads += 1;
						return reads === 1
							? pending.checksFastPath(pr)
							: passed.checksFastPath(pr);
					},
				}),
				clock: {
					now: () => now,
					observedAt: () => "2026-07-26T00:00:00.000Z",
					async sleep(seconds) {
						sleeps.push(seconds);
						now += seconds;
					},
				},
				emit() {},
			},
			contexts: [context(1)],
			mode: "single",
			statusOnly: false,
			options: { ...options, interval: 60, timeout: 0 },
		});
		expect(result.kind).toBe("READY");
		expect(sleeps).toEqual([60]);
	});
});
