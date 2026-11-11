import { runJson, runText } from "../watch-pr/command.ts";
import { list, optionalString, record } from "../watch-pr/json.ts";
import type * as T from "../watch-pr/types.ts";
import type { ForgeWriter, Review } from "./review.ts";

const REPLY = `mutation($thread: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $thread, body: $body}) { comment { id } }
}`;
const RESOLVE = `mutation($thread: ID!) {
  resolveReviewThread(input: {threadId: $thread}) { thread { isResolved } }
}`;

const pull = (context: T.PrContext): string =>
	`repos/${context.owner}/${context.repo}/pulls/${context.number}`;

async function send(endpoint: string, body: unknown, method = "POST"): Promise<void> {
	const argv: [string, ...string[]] =
		endpoint === "graphql"
			? ["gh", "api", "--input", "-", endpoint]
			: ["gh", "api", "--method", method, "--input", "-", endpoint];
	await runText(argv, JSON.stringify(body));
}

export const githubWriter: ForgeWriter = {
	kind: "github",
	async review(context, review: Review) {
		const head = (await runText(["gh", "api", "--jq", ".head.sha", pull(context)])).trim();
		await send(`${pull(context)}/reviews`, {
			commit_id: head,
			event: "COMMENT",
			body: review.summary,
			comments: review.comments.map((comment) => ({
				path: comment.path,
				line: comment.line,
				side: comment.side === "old" ? "LEFT" : "RIGHT",
				body: comment.body,
			})),
		});
	},
	async reply(_context, thread, body) {
		await send("graphql", { query: REPLY, variables: { thread, body } });
	},
	async resolve(_context, thread) {
		await send("graphql", { query: RESOLVE, variables: { thread } });
	},
	async lastReview(context) {
		const me = (await runText(["gh", "api", "--jq", ".login", "user"])).trim();
		const pages = list(
			await runJson(["gh", "api", "--paginate", "--slurp", `${pull(context)}/reviews`]),
			"reviews",
		);
		const mine = pages
			.flatMap((page, index) => list(page, `reviews[${index}]`))
			.map((item, index) => record(item, `reviews[${index}]`))
			.filter((review) => record(review.user, "review.user").login === me);
		const last = mine[mine.length - 1];
		return last === undefined ? null : optionalString(last.commit_id, "review.commit_id");
	},
};
