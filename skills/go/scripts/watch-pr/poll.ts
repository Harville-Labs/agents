import {
	blockerVerdict,
	classifyPr,
	queryBackoffSeconds,
	readSnapshot,
	selectTierMajorStackDecision,
	statusQueryVerdict,
	type VerdictStamp,
	verdictFactory,
} from "./policy.ts";
import { WatcherQueryError } from "./errors.ts";
import type * as T from "./types.ts";
import { nonEmpty } from "./types.ts";
export interface WatchClock {
	now(): number;
	observedAt(): string;
	sleep(seconds: number): Promise<void>;
}
export interface RunDependencies {
	readonly reader: T.ForgeReader;
	readonly clock: WatchClock;
	readonly emit: (verdict: T.ProgressVerdict) => void;
}
export const deadlinePassed = (
	started: number,
	options: T.PollingOptions,
	now: number,
): boolean => options.timeout > 0 && now - started >= options.timeout;
export type StepResult<V> =
	| { readonly kind: "terminal"; readonly verdict: V }
	| {
			readonly kind: "sleep";
			readonly seconds: number;
			readonly onDeadline?: () => V;
	  }
	| { readonly kind: "continue" };
export async function pollUntilTerminal<V>(args: {
	readonly dependencies: RunDependencies;
	readonly options: T.PollingOptions;
	readonly stamp: VerdictStamp;
	readonly step: () => Promise<StepResult<V>>;
}): Promise<V | T.BlockerVerdict | T.TimeoutVerdict> {
	let failures = 0;
	const started = args.dependencies.clock.now();
	const sleep = async (seconds: number): Promise<void> => {
		const remaining =
			args.options.timeout > 0
				? Math.max(
						0,
						args.options.timeout - (args.dependencies.clock.now() - started),
					)
				: seconds;
		await args.dependencies.clock.sleep(Math.min(seconds, remaining));
	};
	while (true) {
		let result: StepResult<V>;
		try {
			result = await args.step();
			failures = 0;
		} catch (error) {
			if (!(error instanceof WatcherQueryError)) throw error;
			failures += 1;
			if (!error.failure.retryable || failures >= args.options.maxQueryErrors)
				return statusQueryVerdict(args.stamp, failures, error.failure);
			const retryInSeconds = queryBackoffSeconds(
				args.options.interval,
				failures,
			);
			args.dependencies.emit(
				args.stamp({
					kind: "RETRY",
					terminal: false,
					failure: error.failure,
					consecutiveFailures: failures,
					retryInSeconds,
				}),
			);
			if (deadlinePassed(started, args.options, args.dependencies.clock.now()))
				return args.stamp({
					kind: "TIMEOUT",
					terminal: true,
					exitCode: 5,
					reason: { kind: "status-unavailable", failure: error.failure },
				});
			await sleep(retryInSeconds);
			continue;
		}
		if (result.kind === "terminal") return result.verdict;
		if (result.kind === "sleep") {
			if (
				result.onDeadline !== undefined &&
				deadlinePassed(started, args.options, args.dependencies.clock.now())
			)
				return result.onDeadline();
			await sleep(result.seconds);
		}
	}
}
export async function runSimple(args: {
	readonly dependencies: RunDependencies;
	readonly contexts: T.NonEmpty<T.PrContext>;
	readonly mode: T.WatchMode;
	readonly statusOnly: boolean;
	readonly options: T.PollingOptions;
}): Promise<T.TerminalVerdict> {
	const stamp = verdictFactory(args.dependencies.clock, args.mode);
	const step = async (): Promise<StepResult<T.TerminalVerdict>> => {
		const rows: T.PrSnapshot[] = [];
		for (const context of args.contexts)
			rows.push(
				await readSnapshot({
					reader: args.dependencies.reader,
					context,
					pendingHistory: "include",
					allowDraft: args.options.allowDraft,
				}),
			);
		const complete = nonEmpty(rows);
		if (complete === null) throw new Error("watch context cannot be empty");
		if (args.statusOnly)
			return {
				kind: "terminal",
				verdict: stamp({
					kind: "STATUS",
					terminal: true,
					exitCode: 0,
					reason: "status-only",
					rows: complete,
				}),
			};
		if (args.mode === "queued-stack")
			throw new Error("queued-stack requires status-only in the simple runner");
		if (args.mode === "stack")
			args.dependencies.emit(
				stamp(
					{ kind: "STATUS", terminal: false, reason: "poll", rows: complete },
					args.mode,
				),
			);
		const decision =
			args.mode === "single"
				? classifyPr(complete[0], args.options.allowDraft)
				: selectTierMajorStackDecision(complete, args.options.allowDraft);
		if (decision.kind === "blocker")
			return {
				kind: "terminal",
				verdict: blockerVerdict(stamp, decision.blocker),
			};
		if (decision.kind === "ready" || decision.kind === "merged")
			return {
				kind: "terminal",
				verdict: stamp(
					{
						kind: "READY",
						terminal: true,
						exitCode: 0,
						scope: { kind: "single", pr: decision.pr },
					},
					args.mode,
				),
			};
		if (decision.kind === "clear")
			return {
				kind: "terminal",
				verdict: stamp(
					{
						kind: "READY",
						terminal: true,
						exitCode: 0,
						scope: { kind: "stack", prs: decision.prs },
					},
					args.mode,
				),
			};
		args.dependencies.emit(
			stamp({
				kind: "WAITING",
				terminal: false,
				frontier: decision.frontier,
				reason: { kind: "pending-checks", pending: decision.pending },
			}),
		);
		return {
			kind: "sleep",
			seconds: args.options.interval,
			onDeadline: () =>
				stamp({
					kind: "TIMEOUT",
					terminal: true,
					exitCode: 5,
					reason: { kind: "pending-checks", pending: decision.pending },
				}),
		};
	};
	return pollUntilTerminal({
		dependencies: args.dependencies,
		options: args.options,
		stamp,
		step,
	});
}
