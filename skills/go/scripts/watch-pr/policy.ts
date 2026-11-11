import type { WatchClock } from "./poll.ts";
import type * as T from "./types.ts";
import { nonEmpty } from "./types.ts";
const AUTOMATION_TOKENS = [
	"bugbot",
	"coderabbit",
	"security review",
	"pr review automation",
	"review automation",
] as const;
export async function readSnapshot(args: {
	readonly reader: T.ForgeReader;
	readonly context: T.PrContext;
	readonly pendingHistory: "include" | "omit";
	readonly allowDraft: boolean;
}): Promise<T.PrSnapshot> {
	const facts = await args.reader.pullRequest(args.context);
	if (facts.state === "MERGED" || facts.mergedAt !== null)
		return { kind: "merged", context: args.context, facts };
	if (facts.state === "CLOSED")
		return { kind: "closed", context: args.context, facts };
	const threads = await args.reader.reviewThreads(args.context);
	const checks = await args.reader.checks(facts);
	const failed = nonEmpty(
		checks.checks.filter(
			(check): check is T.FailedCheck => check.kind === "failed",
		),
	);
	const pending = nonEmpty(
		checks.checks.filter(
			(check): check is T.PendingCheck => check.kind === "pending",
		),
	);
	let ci: T.CiState;
	if (failed === null && pending !== null && args.pendingHistory === "omit")
		ci = {
			kind: "ci-pending",
			source: checks.source,
			all: checks.checks,
			failed: [],
			pending,
			hadPreviousPassingCi: false,
		};
	else {
		const read = await args.reader.mergeRead(facts);
		const base = {
			source: checks.source,
			all: checks.checks,
			hadPreviousPassingCi: read.hadPreviousPassingCi,
		};
		if (failed !== null)
			ci = {
				...base,
				kind: "ci-failing",
				failed,
				pending: pending ?? [],
				merge: read.merge,
			};
		else if (read.merge.kind === "refused")
			ci = {
				...base,
				kind: "ci-merge-refused",
				failed: [],
				pending: pending ?? [],
				merge: read.merge,
			};
		else if (pending !== null)
			ci = { ...base, kind: "ci-pending", failed: [], pending };
		else
			ci = {
				...base,
				kind: "ci-clean",
				failed: [],
				pending: [],
				merge: read.merge,
			};
	}
	return {
		kind: "open",
		context: args.context,
		facts,
		threads,
		ci,
		reviewAutomationRunning: checks.checks.some(
			(check) =>
				check.kind === "pending" &&
				AUTOMATION_TOKENS.some((token) =>
					check.name.toLowerCase().includes(token),
				),
		),
	};
}
export function hasConflicts(facts: T.PullRequestFacts): boolean {
	if (facts.mergeable === "CONFLICTING") return true;
	return (
		facts.mergeState.forge === "github" &&
		(facts.mergeState.status === "DIRTY" ||
			facts.mergeState.status === "CONFLICTING")
	);
}
const conflictBlocker = (row: T.PrSnapshot): T.MergeBlocker | null =>
	row.kind === "open" && hasConflicts(row.facts)
		? { kind: "merge-conflicts", pr: row.context, facts: row.facts }
		: null;
function threadBlocker(row: T.PrSnapshot): T.MergeBlocker | null {
	if (row.kind !== "open") return null;
	const threads = nonEmpty(row.threads);
	return threads === null
		? null
		: { kind: "review-threads", pr: row.context, threads };
}
const ciBlocker = (row: T.PrSnapshot): T.MergeBlocker | null =>
	row.kind === "open" &&
	(row.ci.kind === "ci-failing" || row.ci.kind === "ci-merge-refused")
		? { kind: "failing-checks", pr: row.context, ci: row.ci }
		: null;
function gateReason(
	row: T.PrSnapshot,
	allowDraft: boolean,
): T.MergeGateReason | null {
	if (row.kind === "merged") return null;
	if (row.kind === "closed") return "closed-without-merge";
	if (row.facts.isDraft && !allowDraft) return "draft-pr";
	return row.facts.reviewDecision === "CHANGES_REQUESTED"
		? "changes-requested"
		: null;
}
function gateBlocker(
	row: T.PrSnapshot,
	allowDraft: boolean,
): T.MergeBlocker | null {
	const reason = gateReason(row, allowDraft);
	return reason === null ||
		(reason === "draft-pr" &&
			row.kind === "open" &&
			row.ci.kind === "ci-pending")
		? null
		: { kind: "merge-gate", pr: row.context, reason };
}
function readyContribution(
	row: T.PrSnapshot,
	allowDraft: boolean,
): T.ReadyPr | T.MergedPr | null {
	if (row.kind === "merged")
		return {
			kind: "merged-pr",
			context: row.context,
			mergedAt: row.facts.mergedAt,
		};
	if (
		row.kind !== "open" ||
		row.ci.kind !== "ci-clean" ||
		row.threads.length !== 0 ||
		conflictBlocker(row) !== null ||
		gateReason(row, allowDraft) !== null
	)
		return null;
	const reviewDecision = row.facts.reviewDecision;
	if (reviewDecision === "CHANGES_REQUESTED") return null;
	return {
		kind: "ready-pr",
		context: row.context,
		proof: {
			mergeability: "clear",
			threads: [],
			ci: row.ci,
			gate: {
				state: "OPEN",
				reviewDecision,
				draft: row.facts.isDraft ? "draft-allowed" : "not-draft",
			},
		},
	};
}
export function classifyPr(
	row: T.PrSnapshot,
	allowDraft = false,
): T.PrDecision {
	for (const blocker of [
		conflictBlocker(row),
		threadBlocker(row),
		ciBlocker(row),
		gateBlocker(row, allowDraft),
	])
		if (blocker !== null) return { kind: "blocker", blocker };
	if (row.kind === "open" && row.ci.kind === "ci-pending")
		return { kind: "waiting", frontier: row.context, pending: row.ci.pending };
	const ready = readyContribution(row, allowDraft);
	if (ready === null) throw new Error("snapshot has no classified decision");
	return ready.kind === "merged-pr"
		? { kind: "merged", pr: ready }
		: { kind: "ready", pr: ready };
}
export function selectTierMajorStackDecision(
	rows: T.NonEmpty<T.PrSnapshot>,
	allowDraft = false,
): T.StackDecision {
	for (const tier of [conflictBlocker, threadBlocker, ciBlocker])
		for (const row of rows) {
			const blocker = tier(row);
			if (blocker !== null) return { kind: "blocker", blocker };
		}
	for (const row of rows) {
		const blocker = gateBlocker(row, allowDraft);
		if (blocker !== null) return { kind: "blocker", blocker };
	}
	for (const row of rows)
		if (row.kind === "open" && row.ci.kind === "ci-pending")
			return {
				kind: "waiting",
				frontier: row.context,
				pending: row.ci.pending,
			};
	const prs = nonEmpty(
		rows
			.map((row) => readyContribution(row, allowDraft))
			.filter((row): row is T.ReadyPr | T.MergedPr => row !== null),
	);
	if (prs === null || prs.length !== rows.length)
		throw new Error("stack has no classified decision");
	return { kind: "clear", prs };
}
export const queryBackoffSeconds = (
	interval: number,
	failures: number,
): number => Math.min(Math.max(interval, 60) * 2 ** (failures - 1), 300);
interface Envelope<M extends T.WatchMode> {
	readonly schemaVersion: 2;
	readonly sequence: number;
	readonly observedAt: string;
	readonly mode: M;
}
type Payload<V> = V extends unknown
	? Omit<V, keyof Envelope<T.WatchMode>>
	: never;
type VerdictPayload = Payload<T.WatcherVerdict>;
export interface VerdictStamp<M extends T.WatchMode = T.WatchMode> {
	<const P extends VerdictPayload>(payload: P): Envelope<M> & P;
	<const P extends VerdictPayload, M2 extends T.WatchMode>(
		payload: P,
		mode: M2,
	): Envelope<M2> & P;
}
export function verdictFactory<M extends T.WatchMode>(
	clock: WatchClock,
	mode: M,
): VerdictStamp<M> {
	let sequence = 0;
	function stamp<const P extends VerdictPayload>(payload: P): Envelope<M> & P;
	function stamp<const P extends VerdictPayload, M2 extends T.WatchMode>(
		payload: P,
		mode: M2,
	): Envelope<M2> & P;
	function stamp<const P extends VerdictPayload>(
		payload: P,
		override?: T.WatchMode,
	): Envelope<T.WatchMode> & P {
		return {
			schemaVersion: 2,
			sequence: (sequence += 1),
			observedAt: clock.observedAt(),
			mode: override ?? mode,
			...payload,
		};
	}
	return stamp;
}
export function blockerVerdict(
	stamp: VerdictStamp,
	blocker: T.MergeBlocker,
): T.BlockerVerdict {
	switch (blocker.kind) {
		case "merge-conflicts":
			return stamp({ kind: "BLOCKER", terminal: true, exitCode: 2, blocker });
		case "review-threads":
			return stamp({ kind: "BLOCKER", terminal: true, exitCode: 3, blocker });
		case "failing-checks":
			return stamp({ kind: "BLOCKER", terminal: true, exitCode: 4, blocker });
		case "merge-gate":
			return stamp({ kind: "BLOCKER", terminal: true, exitCode: 6, blocker });
		default: {
			const exhaustive: never = blocker;
			return exhaustive;
		}
	}
}
export function statusQueryVerdict(
	stamp: VerdictStamp,
	failures: number,
	failure: T.QueryFailure,
): T.BlockerVerdict {
	return stamp({
		kind: "BLOCKER",
		terminal: true,
		exitCode: 7,
		blocker: { kind: "status-query", failures, failure },
	});
}
