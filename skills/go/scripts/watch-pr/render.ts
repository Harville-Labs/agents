import { hasConflicts } from "./policy.ts";
import type * as T from "./types.ts";
const GITHUB: T.Forge = { kind: "github", host: "github.com" };
const forgeName = (forge: T.Forge): string =>
	forge.kind === "github" ? "GitHub" : "GitLab";
export function changeUrl(forge: T.Forge, context: T.PrContext): string {
	const base = `https://${forge.host}/${context.owner}/${context.repo}`;
	return forge.kind === "github"
		? `${base}/pull/${context.number}`
		: `${base}/-/merge_requests/${context.number}`;
}
function mergeStateLine(facts: T.PullRequestFacts): string {
	return facts.mergeState.forge === "github"
		? `mergeStateStatus=${facts.mergeState.status}`
		: `detailedMergeStatus=${facts.mergeState.detailedMergeStatus}`;
}
function allowedLine(merge: T.MergeAllowed): string {
	return merge.forge === "github"
		? `mergeStateStatus=${merge.mergeStateStatus}`
		: `headPipelineStatus=${merge.headPipelineStatus ?? "none"}`;
}
function refusalLines(merge: T.MergeRefusal): string[] {
	return merge.forge === "github"
		? [
				`mergeStateStatus=${merge.mergeStateStatus}`,
				`headRollupState=${merge.headRollupState}`,
			]
		: [`headPipelineStatus=${merge.headPipelineStatus}`];
}
export const renderJson = (verdict: T.WatcherVerdict): string =>
	`${JSON.stringify(verdict)}\n`;
function ciCell(row: T.PrSnapshot, forge: T.Forge): string {
	if (row.kind !== "open") return "\u2014";
	const was = row.ci.hadPreviousPassingCi ? ", was ✅" : "";
	switch (row.ci.kind) {
		case "ci-clean":
			return "✅";
		case "ci-pending":
			return `⏳ ${row.ci.pending.length} pending${was}`;
		case "ci-failing":
			return `❌ ${row.ci.failed.length} failed${row.ci.pending.length ? `, ${row.ci.pending.length} pending` : ""}${was}`;
		case "ci-merge-refused":
			return `❌ ${forgeName(forge)} reports failing checks${was}`;
		default: {
			const exhaustive: never = row.ci;
			return exhaustive;
		}
	}
}
function reviewCell(row: T.PrSnapshot): string {
	if (row.kind !== "open") return "\u2014";
	const open = row.threads.length;
	return row.reviewAutomationRunning
		? open
			? `🤖 running, ${open} open`
			: "🤖 running"
		: open
			? `📝 ${open} open`
			: "✅";
}
function mergeCell(row: T.PrSnapshot): string {
	if (row.kind === "merged") return "✅ merged";
	if (row.kind === "closed") return "❌ closed";
	if (row.facts.isDraft) return "⏸ draft";
	if (row.facts.reviewDecision === "CHANGES_REQUESTED")
		return "⚠️ changes requested";
	return hasConflicts(row.facts) ? "⚠️ conflict" : "✅";
}
export function renderStatusTable(
	rows: T.NonEmpty<T.PrSnapshot>,
	forge: T.Forge = GITHUB,
): string {
	const [label, prefix] = forge.kind === "github" ? ["PR", "#"] : ["MR", "!"];
	const lines = [`| ${label} | CI | Review | Merge |`, "| --- | --- | --- | --- |"];
	for (const row of rows) {
		const url = changeUrl(forge, row.context);
		lines.push(
			`| [${prefix}${row.context.number}](${url}) | ${ciCell(row, forge)} | ${reviewCell(row)} | ${mergeCell(row)} |`,
		);
	}
	return `${lines.join("\n")}\n`;
}
function threadLine(thread: T.ReviewThread): string {
	const comment = thread.firstComment;
	return [
		thread.id,
		comment?.path ?? "None",
		comment?.line ?? "None",
		comment?.authorLogin ?? "None",
		`isReviewBot=${thread.isReviewBot}`,
		`reviewBotPasses=${thread.reviewBotPasses}`,
		(comment?.body ?? "").split(/\r?\n/, 1)[0]?.slice(0, 180) ?? "",
	].join(" ");
}
type StatusQueryBlocker = {
	readonly kind: "status-query";
	readonly failures: number;
	readonly failure: { readonly detail: string };
};
const GITLAB_STATUS_ACTION: Readonly<Record<string, string>> = {
	need_rebase: "rebase the source branch with `glab mr rebase <n>`, then rearm",
	ci_must_pass:
		"the head pipeline has not passed; read it with `glab ci status --branch <source branch>`",
	status_checks_must_pass:
		"external status checks have not passed; read them with `glab api projects/:id/merge_requests/<n>/status_checks`",
	commits_status: "the source branch has no commits; push the change",
	jira_association_missing:
		"put the Jira issue key in the merge request title or description",
	title_regex:
		"rename the merge request to match the project's title pattern, which the merge widget shows",
	security_policy_pipeline_check:
		"a security policy needs a pipeline on the target branch; ask a maintainer to run one",
	security_policy_violations:
		"read the security policy findings in the merge widget, then fix them or get them approved",
	locked_paths: "ask the lock owner to unlock the changed paths",
	locked_lfs_files: "ask the lock owner to unlock the changed LFS files",
};

function gitlabStatusAction(status: string, mr: number): string {
	return (
		GITLAB_STATUS_ACTION[status] ??
		`look up detailed_merge_status "${status}" in the GitLab merge requests API docs`
	).replaceAll("<n>", String(mr));
}

function renderBlocker(
	blocker: T.MergeBlocker | StatusQueryBlocker,
	forge: T.Forge,
): string {
	switch (blocker.kind) {
		case "merge-conflicts":
			return [
				"BLOCKER: merge-conflicts",
				`pr=${blocker.pr.number}`,
				`mergeable=${blocker.facts.mergeable}`,
				mergeStateLine(blocker.facts),
				"action=resolve merge conflicts before waiting for CI",
			].join("\n");
		case "review-threads":
			return [
				"BLOCKER: review-threads",
				`pr=${blocker.pr.number}`,
				`unresolved=${blocker.threads.length}`,
				...blocker.threads.map(threadLine),
			].join("\n");
		case "failing-checks": {
			const failed = blocker.ci.kind === "ci-failing" ? blocker.ci.failed : [];
			const details = failed.map(
				(check) =>
					`${check.name} ${check.reportedState} ${check.description} ${check.link}`,
			);
			if (blocker.ci.kind === "ci-merge-refused")
				details.push(...refusalLines(blocker.ci.merge));
			return [
				"BLOCKER: failing-checks",
				`pr=${blocker.pr.number}`,
				`failed=${failed.length}`,
				...details,
			].join("\n");
		}
		case "merge-gate": {
			const state = blocker.facts.mergeState;
			const status =
				state.forge === "gitlab" ? state.detailedMergeStatus : null;
			const action =
				blocker.reason === "closed-without-merge"
					? "restore or remove the closed PR from the queued stack"
					: blocker.reason === "draft-pr"
						? "mark the PR ready for review before waiting for the merge queue"
						: blocker.reason === "changes-requested"
							? "resolve the changes-requested review before waiting for the merge queue"
							: gitlabStatusAction(status ?? "", blocker.pr.number);
			return [
				`BLOCKER: ${blocker.reason}`,
				`pr=${blocker.pr.number}`,
				...(status === null ? [] : [`detailed_merge_status=${status}`]),
				`action=${action}`,
			].join("\n");
		}
		case "status-query":
			return [
				"BLOCKER: status-query",
				`failures=${blocker.failures}`,
				`detail=${blocker.failure.detail}`,
				`action=verify current PR context, ${forgeName(forge)} authentication, and API availability, then rearm`,
			].join("\n");
		default: {
			const exhaustive: never = blocker;
			return exhaustive;
		}
	}
}
export function renderPretty(
	verdict: T.WatcherVerdict,
	forge: T.Forge = GITHUB,
): string {
	switch (verdict.kind) {
		case "QUEUE":
			return `QUEUE: captured ${verdict.queue.length} PR${verdict.queue.length === 1 ? "" : "s"} bottom-to-top: ${verdict.queue.map((pr) => `#${pr.number}`).join(",")}\n`;
		case "STATUS":
			return renderStatusTable(verdict.rows, forge);
		case "WAITING":
			return verdict.reason.kind === "pending-checks"
				? `WAITING: frontier=#${verdict.frontier.number}; ${verdict.reason.pending.length} check${verdict.reason.pending.length === 1 ? "" : "s"} pending\n`
				: `WAITING: frontier=#${verdict.frontier.number} is blocker-free; waiting for merge queue (${verdict.reason.unmergedCount} PR${verdict.reason.unmergedCount === 1 ? "" : "s"} unmerged)\n`;
		case "ADVANCE":
			return `ADVANCE: merged #${verdict.merged.number}; next=#${verdict.frontier.number}; remaining=${verdict.remaining}\n`;
		case "RETRY":
			return `RETRY: ${forgeName(forge)} status query failed; retrying in ${verdict.retryInSeconds}s\ndetail=${verdict.failure.detail}\n`;
		case "BLOCKER":
			return `${renderBlocker(verdict.blocker, forge)}\n`;
		case "READY": {
			const detail =
				verdict.scope.kind === "single" && verdict.scope.pr.kind === "ready-pr"
					? `\n${allowedLine(verdict.scope.pr.proof.ci.merge)}\nreviewDecision=${verdict.scope.pr.proof.gate.reviewDecision}\nisDraft=${verdict.scope.pr.proof.gate.draft === "draft-allowed"}${verdict.scope.pr.proof.gate.draft === "draft-allowed" ? "\nnote=draft allowed (--allow-draft); leave draft \u2014 do not mark ready" : ""}`
					: "";
			return `READY: no merge conflicts, no unresolved review threads, no failing or pending checks${detail}\n`;
		}
		case "COMPLETE":
			return `COMPLETE: queued stack merged (${verdict.queue.length} PR${verdict.queue.length === 1 ? "" : "s"})\n`;
		case "TIMEOUT":
			if (verdict.reason.kind === "pending-checks")
				return "TIMEOUT: checks still pending\n";
			if (verdict.reason.kind === "status-unavailable")
				return `TIMEOUT: ${forgeName(forge)} status remained unavailable\n`;
			return `TIMEOUT: queued stack still has ${verdict.reason.unmergedCount} PR${verdict.reason.unmergedCount === 1 ? "" : "s"} unmerged; frontier=#${verdict.reason.frontier.number}\n`;
		default: {
			const exhaustive: never = verdict;
			return exhaustive;
		}
	}
}
