export type Side = "new" | "old";
export interface DiffLine {
	readonly old_line?: number;
	readonly new_line?: number;
}

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function diffLine(diff: string, side: Side, line: number): DiffLine | null {
	let oldLine = 0;
	let newLine = 0;
	for (const text of diff.split("\n")) {
		const hunk = HUNK.exec(text);
		if (hunk !== null) {
			oldLine = Number(hunk[1]);
			newLine = Number(hunk[2]);
			continue;
		}
		const marker = text[0];
		if (marker === "+") {
			if (side === "new" && newLine === line) return { new_line: newLine };
			newLine++;
		} else if (marker === "-") {
			if (side === "old" && oldLine === line) return { old_line: oldLine };
			oldLine++;
		} else if (marker === " ") {
			if ((side === "new" ? newLine : oldLine) === line)
				return { old_line: oldLine, new_line: newLine };
			oldLine++;
			newLine++;
		}
	}
	return null;
}
