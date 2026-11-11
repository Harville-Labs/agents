import { runText } from "../watch-pr/command.ts";
import { parseNdjson } from "../watch-pr/gitlab-parse.ts";
import { record, string } from "../watch-pr/json.ts";
import type * as T from "../watch-pr/types.ts";
import { diffLine } from "./diff-position.ts";
import type { ForgeWriter, LineComment, Review } from "./review.ts";

const mergeRequest = (context: T.PrContext): string =>
	`projects/${encodeURIComponent(`${context.owner}/${context.repo}`)}/merge_requests/${context.number}`;

interface Version {
	readonly createdAt: string;
	readonly base: string;
	readonly start: string;
	readonly head: string;
}

function versions(values: readonly unknown[]): readonly Version[] {
	return values.map((item, index) => {
		const path = `versions[${index}]`;
		const object = record(item, path);
		return {
			createdAt: string(object.created_at, `${path}.created_at`),
			base: string(object.base_commit_sha, `${path}.base_commit_sha`),
			start: string(object.start_commit_sha, `${path}.start_commit_sha`),
			head: string(object.head_commit_sha, `${path}.head_commit_sha`),
		};
	});
}

export function gitlabWriter(host: string): ForgeWriter {
	const read = async (endpoint: string): Promise<readonly unknown[]> =>
		parseNdjson(
			await runText([
				"glab",
				"api",
				"--hostname",
				host,
				"--paginate",
				"--output",
				"ndjson",
				endpoint,
			]),
			`glab api ${endpoint}`,
		);
	const send = async (method: string, endpoint: string, body: unknown): Promise<void> => {
		await runText(
			["glab", "api", "--hostname", host, "--method", method, "--input", "-", endpoint],
			JSON.stringify(body),
		);
	};

	async function positions(mr: string, comments: readonly LineComment[]) {
		const [latest] = versions(await read(`${mr}/versions`));
		if (latest === undefined)
			throw new Error(`${mr} has no diff versions yet. Wait for GitLab to compute the diff.`);
		const diffs = (await read(`${mr}/diffs`)).map((item, index) => record(item, `diffs[${index}]`));
		return comments.map((comment) => {
			const file = diffs.find(
				(diff) => diff.new_path === comment.path || diff.old_path === comment.path,
			);
			const line =
				file === undefined
					? null
					: diffLine(string(file.diff, "diffs.diff"), comment.side, comment.line);
			if (file === undefined || line === null)
				throw new Error(
					`${comment.path}:${comment.line} (${comment.side} side) is not in the merge request diff. GitLab only accepts line comments on lines the diff shows. Put the finding in the summary instead.`,
				);
			return {
				note: comment.body,
				position: {
					position_type: "text",
					base_sha: latest.base,
					start_sha: latest.start,
					head_sha: latest.head,
					old_path: string(file.old_path, "diffs.old_path"),
					new_path: string(file.new_path, "diffs.new_path"),
					...line,
				},
			};
		});
	}

	return {
		kind: "gitlab",
		async review(context, review: Review) {
			const mr = mergeRequest(context);
			if (review.comments.length === 0) {
				await send("POST", `${mr}/notes`, { body: review.summary });
				return;
			}
			if ((await read(`${mr}/draft_notes`)).length > 0)
				throw new Error(
					`you have an unpublished draft review on !${context.number}. Publishing would post those drafts too. Submit or discard them in the GitLab UI, then run this again.`,
				);
			const notes = await positions(mr, review.comments);
			await send("POST", `${mr}/draft_notes`, { note: review.summary });
			for (const note of notes) await send("POST", `${mr}/draft_notes`, note);
			await send("POST", `${mr}/draft_notes/bulk_publish`, {});
		},
		async reply(context, thread, body) {
			await send("POST", `${mergeRequest(context)}/discussions/${thread}/notes`, { body });
		},
		async resolve(context, thread) {
			await send("PUT", `${mergeRequest(context)}/discussions/${thread}`, { resolved: true });
		},
		async lastReview(context) {
			const mr = mergeRequest(context);
			const [user] = await read("user");
			const me = string(record(user, "user").username, "user.username");
			const mine = (await read(`${mr}/notes`))
				.map((item, index) => record(item, `notes[${index}]`))
				.filter((note) => record(note.author, "note.author").username === me)
				.map((note) => string(note.created_at, "note.created_at"));
			if (mine.length === 0) return null;
			const at = mine.reduce((a, b) => (Date.parse(a) >= Date.parse(b) ? a : b));
			const seen = versions(await read(`${mr}/versions`)).filter(
				(version) => Date.parse(version.createdAt) <= Date.parse(at),
			);
			if (seen.length === 0) return null;
			return seen.reduce((a, b) => (Date.parse(a.createdAt) >= Date.parse(b.createdAt) ? a : b))
				.head;
		},
	};
}

