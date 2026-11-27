import { describe, expect, it } from "bun:test";
import { escapeLatex, titlesMatch, toBibtex } from "./bib.ts";
import { LEDGER_COLUMNS, parseLedger, parseSource } from "./ledger.ts";
import { bibKeys, citeKeys } from "./tex.ts";

const HEADER = LEDGER_COLUMNS.join("\t");

describe("parseSource", () => {
	it("maps arxiv ids to their DataCite DOI and drops the version", () => {
		expect(parseSource("arxiv:1706.03762v7")).toEqual({ kind: "doi", doi: "10.48550/arXiv.1706.03762" });
		expect(parseSource("arxiv:hep-th/9901001")).toEqual({ kind: "doi", doi: "10.48550/arXiv.hep-th/9901001" });
	});

	it("rejects anything that is not a DOI, an arxiv id, or manual", () => {
		expect(parseSource("https://example.com/paper.pdf")).toBeNull();
		expect(parseSource("doi:not-a-doi")).toBeNull();
	});
});

describe("parseLedger", () => {
	it("reads complete rows and lets one source back several claims", () => {
		const ledger = parseLedger(
			[
				HEADER,
				"vaswani2017\tarxiv:1706.03762\tAttention Is All You Need\tTransformers replaced recurrence\t§3\tfull",
				"vaswani2017\tarxiv:1706.03762\tAttention Is All You Need\tBLEU 28.4 on WMT14 En-De\tTable 2\tfull",
				"",
			].join("\n"),
		);
		expect(ledger.errors).toEqual([]);
		expect(ledger.rows.map((row) => row.line)).toEqual([2, 3]);
	});

	it("rejects a wrong header", () => {
		expect(parseLedger("key\tsource\n").errors[0]).toContain("header must be exactly");
	});

	it("names each empty or invalid cell with its line", () => {
		const { errors } = parseLedger(`${HEADER}\nk\tdoi:10.1000/x\tTitle\t\t\tskimmed\n`);
		expect(errors).toEqual([
			"sources.tsv:2: supports is empty. Name the sentence in the paper this source backs",
			"sources.tsv:2: where is empty. Give the section, page, table, or figure in the source that says it",
			'sources.tsv:2: read must be full or abstract, not "skimmed"',
		]);
	});

	it("rejects one key used for two different sources", () => {
		const { errors } = parseLedger(
			`${HEADER}\nk\tdoi:10.1000/a\tA\ts\tw\tfull\nk\tdoi:10.1000/b\tA\ts\tw\tfull\n`,
		);
		expect(errors).toEqual(['sources.tsv:3: key "k" already names a different source or title on line 2']);
	});
});

describe("titlesMatch", () => {
	it("ignores case, punctuation, markup, and accents", () => {
		expect(titlesMatch("Deep residual learning for image recognition", "Deep Residual Learning for Image Recognition")).toBe(true);
		expect(titlesMatch("Über <i>Graphs</i>: a study", "Uber Graphs - A Study")).toBe(true);
	});

	it("accepts a title written without its subtitle", () => {
		expect(titlesMatch("BERT", "BERT: Pre-training of Deep Bidirectional Transformers")).toBe(true);
	});

	it("rejects a DOI that resolves to a different paper", () => {
		expect(titlesMatch("Attention Is All You Need", "ImageNet Classification with Deep CNNs")).toBe(false);
	});
});

describe("toBibtex", () => {
	it("writes a journal article with escaped title and IEEE page ranges", () => {
		const bib = toBibtex("he2016", "10.1109/CVPR.2016.90", {
			type: "article-journal",
			title: "Nets & <i>residuals</i> at 50%",
			author: [{ family: "He", given: "Kaiming" }, { literal: "The ResNet Team" }],
			issued: { "date-parts": [[2016, 6]] },
			"container-title": ["IEEE TPAMI"],
			volume: 38,
			issue: "2",
			page: "770-778",
		});
		expect(bib).toBe(
			[
				"@article{he2016,",
				"  author = {He, Kaiming and {The ResNet Team}},",
				"  title = {{Nets \\& residuals at 50\\%}},",
				"  journal = {IEEE TPAMI},",
				"  volume = {38},",
				"  number = {2},",
				"  pages = {770--778},",
				"  year = {2016},",
				"  doi = {10.1109/CVPR.2016.90},",
				"  url = {https://doi.org/10.1109/CVPR.2016.90},",
				"}",
				"",
			].join("\n"),
		);
	});

	it("maps the type names Crossref sends to IEEE entry types", () => {
		const cvpr = toBibtex("he2016", "10.1109/CVPR.2016.90", {
			type: "proceedings-article",
			title: "Deep Residual Learning for Image Recognition",
			"container-title": "2016 IEEE Conference on Computer Vision and Pattern Recognition (CVPR)",
			publisher: "IEEE",
		});
		expect(cvpr).toStartWith("@inproceedings{he2016,");
		expect(cvpr).toContain("booktitle = {2016 IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},");
		expect(toBibtex("k", "10.1145/3065386", { type: "journal-article", title: "T" })).toStartWith("@article{k,");
	});

	it("writes an arXiv preprint as misc with its arXiv id", () => {
		const bib = toBibtex("v", "10.48550/arXiv.1706.03762", {
			type: "article",
			title: "Attention Is All You Need",
			publisher: "arXiv",
			issued: { "date-parts": [[2017]] },
		});
		expect(bib).toContain("@misc{v,");
		expect(bib).toContain("note = {arXiv:1706.03762},");
		expect(bib).not.toContain("howpublished");
	});

	it("escapes every LaTeX special character", () => {
		expect(escapeLatex("a_b #1 $5 ~x^2 {y} \\z")).toBe(
			"a\\_b \\#1 \\$5 \\textasciitilde{}x\\textasciicircum{}2 \\{y\\} \\textbackslash{}z",
		);
	});
});

describe("citeKeys", () => {
	it("collects keys from every cite form and skips comments", () => {
		const tex = "As shown \\cite{a, b} and \\cite[p.~3]{c}.\n% \\cite{commented}\n50\\% \\nocite{d}\\nocite{*}";
		expect(citeKeys(tex)).toEqual(["a", "b", "c", "d"]);
	});
});

describe("bibKeys", () => {
	it("lists entry keys and skips string and comment blocks", () => {
		expect(bibKeys("@string{x = \"y\"}\n@misc{web2024,\n title={T}}\n@comment{note,}\n@book{b, title={B}}")).toEqual([
			"web2024",
			"b",
		]);
	});
});
