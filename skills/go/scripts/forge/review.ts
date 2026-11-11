import { readFileSync } from "node:fs";
import { parseJson } from "../watch-pr/command.ts";
import { enumValue, list, missing, record, string } from "../watch-pr/json.ts";
import type * as T from "../watch-pr/types.ts";
import type { Side } from "./diff-position.ts";

export interface LineComment {
	readonly path: string;
	readonly line: number;
	readonly side: Side;
	readonly body: string;
}

export interface Review {
	readonly summary: string;
	readonly comments: readonly LineComment[];
}

export interface ForgeWriter {
	readonly kind: T.ForgeKind;
	review(context: T.PrContext, review: Review): Promise<void>;
	reply(context: T.PrContext, thread: string, body: string): Promise<void>;
	resolve(context: T.PrContext, thread: string): Promise<void>;
	lastReview(context: T.PrContext): Promise<string | null>;
}

export const readBody = (path: string): string => readFileSync(path, "utf8");

export function parseComments(text: string, label: string): readonly LineComment[] {
	return list(parseJson(text, label), "comments").map((item, index) => {
		const path = `comments[${index}]`;
		const object = record(item, path);
		const line = object.line;
		if (typeof line !== "number" || !Number.isInteger(line) || line < 1)
			missing(`${path}.line`, line);
		return {
			path: string(object.path, `${path}.path`),
			line,
			side:
				object.side === undefined
					? "new"
					: enumValue(object.side, ["new", "old"] as const, `${path}.side`),
			body: string(object.body, `${path}.body`),
		};
	});
}
