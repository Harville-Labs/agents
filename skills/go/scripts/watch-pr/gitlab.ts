import { run, runText } from "./command.ts";
import { ChecksUnavailable, WatcherQueryError } from "./errors.ts";
import { buildReviewThreads } from "./github-parse.ts";
import {
	gitlabMergeRead,
	parseDiscussions,
	parseDownstream,
	parseJob,
	parseMergeRequest,
	parseNdjson,
	parseOpenMergeRequests,
} from "./gitlab-parse.ts";
import { parseRemote } from "./remote.ts";
import * as T from "./types.ts";

const project = (repository: T.Repository): string =>
	`projects/${encodeURIComponent(`${repository.owner}/${repository.repo}`)}`;
const mergeRequest = (context: T.PrContext): string =>
	`${project(context)}/merge_requests/${context.number}`;

export class GlabGitLabReader implements T.ForgeReader {
	readonly forge: T.Forge;
	constructor(host: string) {
		this.forge = { kind: "gitlab", host };
	}
	private async api(endpoint: string): Promise<readonly unknown[]> {
		const text = await runText([
			"glab",
			"api",
			"--hostname",
			this.forge.host,
			"--paginate",
			"--output",
			"ndjson",
			endpoint,
		]);
		return parseNdjson(text, `glab api ${endpoint}`);
	}
	private async one(endpoint: string): Promise<unknown> {
		const [value] = await this.api(endpoint);
		return value;
	}
	async originRepo(): Promise<T.Repository | null> {
		const result = await run(["git", "remote", "get-url", "origin"]);
		if (result.code !== 0) return null;
		const remote = parseRemote(result.stdout);
		return remote?.host === this.forge.host
			? { owner: remote.owner, repo: remote.repo }
			: null;
	}
	async currentPr(pr: T.PrNumber | null): Promise<T.PrContext> {
		const origin = await this.originRepo();
		if (origin === null)
			throw new WatcherQueryError({
				kind: "invalid-context-url",
				retryable: false,
				detail: `origin is not a ${this.forge.host} remote. Pass --owner, --repo, and --pr.`,
				rawValue: this.forge.host,
			});
		if (pr !== null) return { ...origin, number: pr };
		const branch = (await runText(["git", "branch", "--show-current"])).trim();
		const [open] = parseOpenMergeRequests(
			await this.api(
				`${project(origin)}/merge_requests?state=opened&source_branch=${encodeURIComponent(branch)}`,
			),
		);
		if (open === undefined)
			throw new WatcherQueryError({
				kind: "invalid-context-url",
				retryable: false,
				detail: `no open merge request has source branch "${branch}". Pass --pr.`,
				rawValue: branch,
			});
		return { ...origin, number: open.number };
	}
	async pullRequest(context: T.PrContext): Promise<T.PullRequestFacts> {
		return parseMergeRequest(await this.one(mergeRequest(context)), context);
	}
	async openPullRequests(
		repository: T.Repository,
	): Promise<readonly T.OpenPullRequest[]> {
		return parseOpenMergeRequests(
			await this.api(`${project(repository)}/merge_requests?state=opened`),
		);
	}
	async checks(facts: T.PullRequestFacts): Promise<T.CheckRead> {
		if (facts.mergeState.forge !== "gitlab")
			throw new Error("GitLab checks need GitLab merge request facts");
		const head = facts.mergeState.headPipeline;
		if (head === null)
			throw new ChecksUnavailable(
				`merge request !${facts.context.number} has no head pipeline yet`,
			);
		const checks = T.nonEmpty(
			await this.pipelineChecks(
				`${project(facts.context)}/pipelines/${head.id}`,
				"",
				new Set(),
			),
		);
		if (checks === null)
			throw new ChecksUnavailable(`pipeline ${head.id} has no jobs yet`);
		return { source: "gitlab-pipeline", checks };
	}
	private async pipelineChecks(
		pipeline: string,
		prefix: string,
		seen: Set<string>,
	): Promise<T.Check[]> {
		const jobs = await this.api(`${pipeline}/jobs`);
		const bridges = await this.api(`${pipeline}/bridges`);
		const named = (value: unknown, path: string): T.Check => {
			const check = parseJob(value, path);
			return { ...check, name: `${prefix}${check.name}` };
		};
		const checks = jobs.map((job, index) =>
			named(job, `${pipeline} jobs[${index}]`),
		);
		const downstream: T.Check[] = [];
		for (const [index, bridge] of bridges.entries()) {
			const path = `${pipeline} bridges[${index}]`;
			const check = named(bridge, path);
			checks.push(check);
			const child = parseDownstream(bridge, path);
			if (child === null || seen.has(child)) continue;
			seen.add(child);
			downstream.push(
				...(await this.pipelineChecks(child, `${check.name} / `, seen)),
			);
		}
		return [...checks, ...downstream];
	}
	async reviewThreads(context: T.PrContext): Promise<readonly T.ReviewThread[]> {
		return buildReviewThreads(
			parseDiscussions(await this.api(`${mergeRequest(context)}/discussions`)),
		);
	}
	async mergeRead(facts: T.PullRequestFacts): Promise<T.MergeRead> {
		return gitlabMergeRead(
			facts,
			await this.api(`${mergeRequest(facts.context)}/pipelines`),
		);
	}
}
