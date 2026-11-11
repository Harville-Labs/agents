import { describe, expect, it } from "bun:test";
import { diffLine } from "./diff-position.ts";

const DIFF = [
	"@@ -10,4 +10,5 @@ function a() {",
	" keep",
	"-gone",
	"+added",
	"+more",
	" same",
	"\\ No newline at end of file",
	"@@ -40,2 +41,2 @@",
	"-old",
	"+new",
	" tail",
].join("\n");

describe("diff positions", () => {
	it("places an added line on the new side only", () => {
		expect(diffLine(DIFF, "new", 11)).toEqual({ new_line: 11 });
	});

	it("places a removed line on the old side only", () => {
		expect(diffLine(DIFF, "old", 11)).toEqual({ old_line: 11 });
	});

	it("gives an unchanged line both numbers from either side", () => {
		expect(diffLine(DIFF, "new", 13)).toEqual({ old_line: 12, new_line: 13 });
		expect(diffLine(DIFF, "old", 12)).toEqual({ old_line: 12, new_line: 13 });
	});

	it("counts lines in a later hunk from its own header", () => {
		expect(diffLine(DIFF, "new", 42)).toEqual({ old_line: 41, new_line: 42 });
	});

	it("returns null for a line outside every hunk", () => {
		expect(diffLine(DIFF, "new", 30)).toBeNull();
		expect(diffLine(DIFF, "old", 11.5)).toBeNull();
	});
});
