import { describe, expect, it } from "bun:test";
import { hiddenText, pageCount, selectFiles } from "./package.ts";

describe("selectFiles", () => {
	it("packs only the files the paper needs to build", () => {
		const paper = [
			"main.tex",
			"main.bbl",
			"main.log",
			"paper.pdf",
			"arxiv.tar.gz",
			"claim.md",
			"suggestions.md",
			"sources.tsv",
			"references.bib",
			"manual.bib",
			"outline.md",
			"related-work.md",
			"decisions.tsv",
			"arxiv-metadata.md",
			"latexmkrc",
			"generated/numbers.tex",
			"generated/tables/latency.tex",
			"sections/intro.tex",
			"figures/latency.pdf",
			"figures/screenshot.PNG",
			"figures/pipeline.tex",
			"figures/pipeline.drawio",
			"build/pages/page-1.png",
		];
		expect(selectFiles(paper)).toEqual([
			"figures/latency.pdf",
			"figures/pipeline.tex",
			"figures/screenshot.PNG",
			"generated/numbers.tex",
			"generated/tables/latency.tex",
			"main.bbl",
			"main.tex",
			"sections/intro.tex",
		]);
	});
});

describe("hiddenText", () => {
	it("refuses text hidden by iffalse or a comment environment", () => {
		expect(hiddenText("main.tex", "a\n\\iffalse old draft \\fi\n\\begin{comment}x\\end{comment}")).toEqual([
			"main.tex: \\iffalse hides text that arXiv still publishes. Delete it",
			"main.tex: a comment environment hides text that arXiv still publishes. Delete it",
		]);
	});

	it("ignores those words inside a % comment, which packing strips", () => {
		expect(hiddenText("main.tex", "% \\iffalse")).toEqual([]);
	});
});

describe("pageCount", () => {
	it("reads the page count, also from a wrapped log line", () => {
		expect(pageCount("Output written on main.pdf (8 pages, 210345 bytes).")).toBe(8);
		const first = `Output written on /${"p".repeat(79 - 19)}`;
		expect(pageCount(`${first}\n/main.pdf (1 page, 2 bytes).`)).toBe(1);
		expect(pageCount("no output")).toBeNull();
	});
});
