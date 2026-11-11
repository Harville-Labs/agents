import { firstLine, parseJson, run, runJson } from "./command.ts";
import type * as T from "./types.ts";
import { nonEmpty, parsePrNumber } from "./types.ts";
import { parseRemote } from "./remote.ts";
import {
	at,
	list,
	missing,
	nullableEnum,
	optionalString,
	record,
	string,
} from "./json.ts";
import { WatcherQueryError, ChecksUnavailable } from "./errors.ts";
import {
	ROLLUP_STATES,
	buildReviewThreads,
	mapRollupNode,
	parseFastCheck,
	parsePrUrl,
	parsePullRequest,
	parseReviewThreadPage,
} from "./github-parse.ts";
export const REVIEW_THREADS_QUERY =
	"\nquery ReviewThreads($owner: String!, $repo: String!, $pr: Int!, $after: String) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $pr) {\n      reviewThreads(first: 100, after: $after) {\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        nodes {\n          id\n          isResolved\n          comments(first: 10) {\n            nodes {\n              body\n              createdAt\n              path\n              line\n              author { __typename login }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";
export const PR_COMMIT_STATUS_QUERY =
	"\nquery PrCommitStatuses($owner: String!, $repo: String!, $pr: Int!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $pr) {\n      commits(last: 50) {\n        nodes {\n          commit {\n            oid\n            statusCheckRollup {\n              state\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";
export const PR_CHECK_ROLLUP_QUERY =
	"\nquery PrCheckRollup($owner: String!, $repo: String!, $pr: Int!, $after: String) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $pr) {\n      commits(last: 1) {\n        nodes {\n          commit {\n            statusCheckRollup {\n              contexts(first: 100, after: $after) {\n                pageInfo {\n                  hasNextPage\n                  endCursor\n                }\n                nodes {\n                  __typename\n                  ... on CheckRun {\n                    name\n                    status\n                    conclusion\n                    detailsUrl\n                  }\n                  ... on StatusContext {\n                    context\n                    state\n                    targetUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n";

function graphqlArgs(
	query: string,
	context: T.PrContext,
): [string, ...string[]] {
	return [
		"gh",
		"api",
		"graphql",
		"-f",
		`query=${query}`,
		"-f",
		`owner=${context.owner}`,
		"-f",
		`repo=${context.repo}`,
		"-F",
		`pr=${context.number}`,
	];
}

export class GhGitHubReader implements T.GitHubReader {
	async originRepo(): Promise<T.Repository | null> {
		const result = await run(["git", "remote", "get-url", "origin"]);
		if (result.code !== 0) return null;
		const remote = parseRemote(result.stdout);
		return remote?.host === "github.com"
			? { owner: remote.owner, repo: remote.repo }
			: null;
	}
	async currentPr(pr: T.PrNumber | null): Promise<T.PrContext> {
		const argv: [string, ...string[]] = ["gh", "pr", "view"];
		if (pr !== null) argv.push(String(pr));
		argv.push("--json", "number,url");
		const object = record(await runJson(argv), "current PR");
		const parsed = parsePrUrl(string(object.url, "current PR.url"));
		return {
			...parsed,
			number: pr ?? parsePrNumber(object.number, "current PR.number"),
		};
	}
	async pullRequest(context: T.PrContext): Promise<T.PullRequestFacts> {
		return parsePullRequest(
			await runJson([
				"gh",
				"pr",
				"view",
				String(context.number),
				"--repo",
				`${context.owner}/${context.repo}`,
				"--json",
				"mergeable,mergeStateStatus,reviewDecision,headRefOid,headRefName,baseRefName,state,mergedAt,isDraft",
			]),
			context,
		);
	}
	async openPullRequests(
		repository: T.Repository,
	): Promise<readonly T.OpenPullRequest[]> {
		const value = await runJson([
			"gh",
			"pr",
			"list",
			"--repo",
			`${repository.owner}/${repository.repo}`,
			"--state",
			"open",
			"--limit",
			"300",
			"--json",
			"number,headRefName,baseRefName,isCrossRepository",
		]);
		return list(value, "open PRs").map((item, index) => {
			const object = record(item, `open PRs[${index}]`);
			if (typeof object.isCrossRepository !== "boolean")
				missing(
					`open PRs[${index}].isCrossRepository`,
					object.isCrossRepository,
				);
			return {
				isCrossRepository: object.isCrossRepository,
				number: parsePrNumber(object.number, `open PRs[${index}].number`),
				headRefName: string(
					object.headRefName,
					`open PRs[${index}].headRefName`,
				),
				baseRefName: string(
					object.baseRefName,
					`open PRs[${index}].baseRefName`,
				),
			};
		});
	}
	async checksFastPath(context: T.PrContext): Promise<T.ChecksFastPath> {
		const result = await run([
			"gh",
			"pr",
			"checks",
			String(context.number),
			"--repo",
			`${context.owner}/${context.repo}`,
			"--json",
			"name,state,description,link,workflow,bucket",
		]);
		if ([0, 1, 8].includes(result.code) && result.stdout.trim()) {
			try {
				const value = parseJson(result.stdout, "gh pr checks");
				if (Array.isArray(value))
					return { kind: "checks", checks: value.map(parseFastCheck) };
			} catch (error) {
				if (!(error instanceof WatcherQueryError)) throw error;
			}
		}
		return { kind: "unusable", exitCode: result.code, stderr: result.stderr };
	}
	async checkRollupPage(
		context: T.PrContext,
		after: string | null,
	): Promise<T.RollupPage> {
		const argv = graphqlArgs(PR_CHECK_ROLLUP_QUERY, context);
		if (after !== null) argv.push("-f", `after=${after}`);
		const value = await runJson(argv);
		const commits = list(
			at(value, ["data", "repository", "pullRequest", "commits", "nodes"]),
			"commits.nodes",
		);
		if (commits.length === 0) return { checks: [], endCursor: null };
		const commit = record(
			at(commits[commits.length - 1], ["commit"]),
			"commit",
		);
		if (commit.statusCheckRollup === null)
			return { checks: [], endCursor: null };
		const contexts = record(
			at(commit, ["statusCheckRollup", "contexts"]),
			"contexts",
		);
		const checks = list(contexts.nodes, "contexts.nodes")
			.map(mapRollupNode)
			.filter((check): check is T.Check => check !== null);
		const page = record(contexts.pageInfo, "contexts.pageInfo");
		if (typeof page.hasNextPage !== "boolean")
			missing("contexts.pageInfo.hasNextPage", page.hasNextPage);
		const cursor = optionalString(
			page.endCursor,
			"contexts.pageInfo.endCursor",
		);
		return { checks, endCursor: page.hasNextPage && cursor ? cursor : null };
	}
	async reviewThreadPage(
		context: T.PrContext,
		after: string | null,
	): Promise<T.ReviewThreadPage> {
		const argv = graphqlArgs(REVIEW_THREADS_QUERY, context);
		if (after !== null) argv.push("-f", `after=${after}`);
		return parseReviewThreadPage(await runJson(argv));
	}
	async commitRollups(
		context: T.PrContext,
	): Promise<readonly T.CommitRollup[]> {
		const value = await runJson(graphqlArgs(PR_COMMIT_STATUS_QUERY, context));
		const commits = list(
			at(value, ["data", "repository", "pullRequest", "commits", "nodes"]),
			"commits.nodes",
		);
		return commits.map((item, index) => {
			const commit = record(at(item, ["commit"]), `commits[${index}].commit`);
			const rollup = commit.statusCheckRollup;
			return {
				oid: string(commit.oid, `commits[${index}].oid`),
				state:
					rollup === null
						? null
						: nullableEnum(
								at(rollup, ["state"]),
								ROLLUP_STATES,
								`commits[${index}].statusCheckRollup.state`,
							),
			};
		});
	}
}

export async function resolveChecks(
	reader: T.GitHubReader,
	context: T.PrContext,
): Promise<T.CheckRead> {
	const fast = await reader.checksFastPath(context);
	const direct = fast.kind === "checks" ? nonEmpty(fast.checks) : null;
	if (direct !== null) return { source: "gh-pr-checks", checks: direct };
	const checks: T.Check[] = [];
	let after: string | null = null;
	do {
		const page = await reader.checkRollupPage(context, after);
		checks.push(...page.checks);
		after = page.endCursor;
	} while (after !== null);
	const fallback = nonEmpty(checks);
	if (fallback !== null) return { source: "graphql-rollup", checks: fallback };
	const suffix =
		fast.kind === "unusable"
			? `fast path exit=${fast.exitCode}; GraphQL rollup was empty${firstLine(fast.stderr) ? `; ${firstLine(fast.stderr)}` : ""}`
			: "fast path and GraphQL rollup were empty";
	throw new ChecksUnavailable(`could not read PR checks: ${suffix}`);
}
export async function resolveReviewThreads(
	reader: T.GitHubReader,
	context: T.PrContext,
): Promise<readonly T.ReviewThread[]> {
	const threads: T.RawReviewThread[] = [];
	let after: string | null = null;
	do {
		const page = await reader.reviewThreadPage(context, after);
		threads.push(...page.threads);
		after = page.endCursor;
	} while (after !== null);
	return buildReviewThreads(threads);
}
export async function resolveContext(args: {
	readonly reader: T.ForgeReader;
	readonly owner: string | null;
	readonly repo: string | null;
	readonly pr: T.PrNumber | null;
}): Promise<T.PrContext> {
	if (args.pr !== null && args.owner !== null && args.repo !== null)
		return { owner: args.owner, repo: args.repo, number: args.pr };
	if (args.pr !== null) {
		const origin = await args.reader.originRepo();
		if (origin !== null)
			return {
				owner: args.owner ?? origin.owner,
				repo: args.repo ?? origin.repo,
				number: args.pr,
			};
	}
	const inferred = await args.reader.currentPr(args.pr);
	return {
		owner: args.owner ?? inferred.owner,
		repo: args.repo ?? inferred.repo,
		number: args.pr ?? inferred.number,
	};
}
export function orderStack(
	context: T.PrContext,
	open: readonly T.OpenPullRequest[],
): T.NonEmpty<T.PrContext> {
	const byNumber = new Map(open.map((pr) => [pr.number, pr]));
	// A base ref belongs to this repository. A fork head with the same name
	// cannot be its parent, even when that name is the default branch.
	const byHead = new Map(
		open
			.filter((pr) => !pr.isCrossRepository)
			.map((pr) => [pr.headRefName, pr]),
	);
	const children = new Map<string, T.OpenPullRequest[]>();
	for (const pr of open)
		children.set(pr.baseRefName, [...(children.get(pr.baseRefName) ?? []), pr]);
	for (const values of children.values())
		values.sort((a, b) => a.number - b.number);
	const start = byNumber.get(context.number);
	if (start === undefined) return [context];
	const down: T.OpenPullRequest[] = [];
	let current = start;
	while (byHead.has(current.baseRefName)) {
		const parent = byHead.get(current.baseRefName);
		if (parent === undefined) break;
		down.push(parent);
		current = parent;
	}
	const seen = new Set<T.PrNumber>([
		...down.map((pr) => pr.number),
		start.number,
	]);
	const up: T.OpenPullRequest[] = [];
	const visit = (parent: T.OpenPullRequest): void => {
		if (parent.isCrossRepository) return;
		for (const child of children.get(parent.headRefName) ?? []) {
			if (seen.has(child.number)) continue;
			seen.add(child.number);
			up.push(child);
			visit(child);
		}
	};
	visit(start);
	return (
		nonEmpty(
			[...down.reverse(), start, ...up].map((pr) => ({
				...context,
				number: pr.number,
			})),
		) ?? [context]
	);
}
export async function discoverStack(
	reader: T.ForgeReader,
	context: T.PrContext,
): Promise<T.NonEmpty<T.PrContext>> {
	return orderStack(context, await reader.openPullRequests(context));
}

export function assessGitHubMerge(args: {
	readonly mergeStateStatus: T.MergeStateStatus;
	readonly headRollupState: T.RollupState;
}): T.GitHubMergeAssessment {
	if (args.mergeStateStatus === "BLOCKED") {
		if (args.headRollupState === "ERROR" || args.headRollupState === "FAILURE")
			return {
				kind: "refused",
				forge: "github",
				mergeStateStatus: args.mergeStateStatus,
				headRollupState: args.headRollupState,
			};
		return {
			kind: "allowed",
			forge: "github",
			basis: "rollup",
			mergeStateStatus: args.mergeStateStatus,
			headRollupState: args.headRollupState,
		};
	}
	return {
		kind: "allowed",
			forge: "github",
		basis: "merge-state",
		mergeStateStatus: args.mergeStateStatus,
		headRollupState: args.headRollupState,
	};
}
export async function readGitHubMerge(
	reader: T.GitHubReader,
	facts: T.PullRequestFacts,
): Promise<T.MergeRead> {
	if (facts.mergeState.forge !== "github")
		throw new Error("readGitHubMerge needs GitHub pull request facts");
	const commits = await reader.commitRollups(facts.context);
	const headRollupState =
		facts.headRefOid === null
			? null
			: (commits.find((commit) => commit.oid === facts.headRefOid)?.state ??
				null);
	return {
		hadPreviousPassingCi: commits.some(
			(commit) => commit.oid !== facts.headRefOid && commit.state === "SUCCESS",
		),
		merge: assessGitHubMerge({
			mergeStateStatus: facts.mergeState.status,
			headRollupState,
		}),
	};
}
export function githubForge(
	reader: T.GitHubReader,
	host = "github.com",
): T.ForgeReader {
	return {
		forge: { kind: "github", host },
		originRepo: () => reader.originRepo(),
		currentPr: (pr) => reader.currentPr(pr),
		pullRequest: (context) => reader.pullRequest(context),
		openPullRequests: (repository) => reader.openPullRequests(repository),
		checks: (facts) => resolveChecks(reader, facts.context),
		reviewThreads: (context) => resolveReviewThreads(reader, context),
		mergeRead: (facts) => readGitHubMerge(reader, facts),
	};
}
