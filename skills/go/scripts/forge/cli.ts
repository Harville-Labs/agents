import { Command, CommanderError, InvalidArgumentError, Option } from "commander";
import { run } from "../watch-pr/command.ts";
import { detectForge, parseRemote } from "../watch-pr/remote.ts";
import type * as T from "../watch-pr/types.ts";
import { parsePrNumber } from "../watch-pr/types.ts";
import { githubWriter } from "./github.ts";
import { gitlabWriter } from "./gitlab.ts";
import { type ForgeWriter, parseComments, readBody } from "./review.ts";

interface Globals {
	readonly forge?: T.ForgeKind;
	readonly hostname?: string;
	readonly owner?: string;
	readonly repo?: string;
	readonly pr: T.PrNumber;
}

function prNumber(value: string): T.PrNumber {
	try {
		return parsePrNumber(Number(value.replace(/^[#!]/, "")));
	} catch {
		throw new InvalidArgumentError("must be a positive integer");
	}
}

async function target(options: Globals): Promise<{ writer: ForgeWriter; context: T.PrContext }> {
	if (options.forge === "github" && options.hostname !== undefined)
		throw new Error("--hostname applies only to GitLab");
	const origin = await run(["git", "remote", "get-url", "origin"]);
	const remote = origin.code === 0 ? parseRemote(origin.stdout) : null;
	const forge = detectForge({
		forge: options.forge ?? null,
		hostname: options.hostname ?? null,
		remote,
	});
	const owner = options.owner ?? remote?.owner;
	const repo = options.repo ?? remote?.repo;
	if (owner === undefined || repo === undefined)
		throw new Error("origin is not a GitHub or GitLab remote. Pass --owner and --repo.");
	return {
		writer: forge.kind === "github" ? githubWriter : gitlabWriter(forge.host),
		context: { owner, repo, number: options.pr },
	};
}

export async function main(
	argv: readonly string[],
	io: { stdout: (value: string) => void; stderr: (value: string) => void } = {
		stdout: (value) => process.stdout.write(value),
		stderr: (value) => process.stderr.write(value),
	},
): Promise<number> {
	const print = (value: unknown) => io.stdout(`${JSON.stringify(value)}\n`);
	const program = new Command("forge")
		.description(
			"Write to a pull request (GitHub) or merge request (GitLab) the same way on both forges.\nThe forge, host, and repository come from the origin remote unless given.",
		)
		.configureOutput({ writeOut: io.stdout, writeErr: io.stderr })
		.exitOverride()
		.addOption(
			new Option("--forge <forge>", "github or gitlab; detected from origin when omitted").choices([
				"github",
				"gitlab",
			]),
		)
		.option("--hostname <host>", "GitLab host (implies --forge gitlab)")
		.option("--owner <owner>", "repository owner or GitLab namespace path")
		.option("--repo <repo>", "repository name")
		.requiredOption("--pr <number>", "pull or merge request number", prNumber);
	const act = (handler: (options: Globals, local: Record<string, string>) => Promise<void>) =>
		async function (this: Command) {
			await handler(this.optsWithGlobals<Globals>(), this.opts());
		};

	program
		.command("review")
		.description("Post one review: a summary plus optional line comments, published together")
		.requiredOption("--summary-file <path>", "Markdown file with the review summary")
		.option(
			"--comments <path>",
			'JSON file: [{"path", "line", "side": "new"|"old" (default new), "body"}]',
		)
		.action(
			act(async (options, local) => {
				const summary = readBody(local.summaryFile as string);
				const comments =
					local.comments === undefined
						? []
						: parseComments(readBody(local.comments), local.comments);
				const { writer, context } = await target(options);
				await writer.review(context, { summary, comments });
				print({ forge: writer.kind, pr: context.number, comments: comments.length });
			}),
		);
	program
		.command("reply")
		.description("Reply in a review thread by the id watch-pr prints")
		.requiredOption("--thread <id>", "thread id (GitHub PRRT_..., GitLab discussion id)")
		.requiredOption("--body-file <path>", "Markdown file with the reply")
		.action(
			act(async (options, local) => {
				const body = readBody(local.bodyFile as string);
				const { writer, context } = await target(options);
				await writer.reply(context, local.thread as string, body);
				print({ forge: writer.kind, pr: context.number, thread: local.thread });
			}),
		);
	program
		.command("resolve")
		.description("Resolve a review thread by the id watch-pr prints")
		.requiredOption("--thread <id>", "thread id (GitHub PRRT_..., GitLab discussion id)")
		.action(
			act(async (options, local) => {
				const { writer, context } = await target(options);
				await writer.resolve(context, local.thread as string);
				print({ forge: writer.kind, pr: context.number, thread: local.thread });
			}),
		);
	program
		.command("last-review")
		.description("Print the head commit your latest review saw, or null if you have not reviewed")
		.action(
			act(async (options) => {
				const { writer, context } = await target(options);
				print({ forge: writer.kind, pr: context.number, commit: await writer.lastReview(context) });
			}),
		);

	try {
		await program.parseAsync(argv, { from: "user" });
		return 0;
	} catch (error) {
		if (error instanceof CommanderError) return error.exitCode === 0 ? 0 : 64;
		io.stderr(`forge: ${error instanceof Error ? error.message : String(error)}\n`);
		return 1;
	}
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
