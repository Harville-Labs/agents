import { isArxivDoi } from "./ledger.ts";

type Text = string | readonly string[] | undefined;

export type CslName = { readonly family?: string; readonly given?: string; readonly literal?: string };

export type Csl = {
	readonly type?: string;
	readonly title?: Text;
	readonly author?: readonly CslName[];
	readonly issued?: { readonly "date-parts"?: readonly (readonly (number | string)[])[] };
	readonly "container-title"?: Text;
	readonly volume?: string | number;
	readonly issue?: string | number;
	readonly page?: string;
	readonly publisher?: string;
};

export function firstText(value: Text): string {
	return (typeof value === "string" ? value : (value?.[0] ?? "")).trim();
}

function stripMarkup(text: string): string {
	return text
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function normalizeTitle(title: string): string {
	return stripMarkup(title)
		.normalize("NFKD")
		.replace(/\p{M}/gu, "")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]/gu, "");
}

export function titlesMatch(expected: string, resolved: string): boolean {
	const want = normalizeTitle(expected);
	if (want.length === 0) return false;
	const mainTitle = stripMarkup(resolved).split(/:|\s[-\u2013\u2014]\s/)[0];
	return want === normalizeTitle(resolved) || want === normalizeTitle(mainTitle);
}

const LATEX_SPECIAL: Record<string, string> = {
	"\\": "\\textbackslash{}",
	"{": "\\{",
	"}": "\\}",
	"&": "\\&",
	"%": "\\%",
	$: "\\$",
	"#": "\\#",
	_: "\\_",
	"~": "\\textasciitilde{}",
	"^": "\\textasciicircum{}",
};

const GREEK = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega".split(" ");

const MATH_SYMBOLS: Record<string, string> = {
	...Object.fromEntries(
		GREEK.flatMap((name, i) => {
			const lower = String.fromCodePoint(0x3b1 + i + (i >= 17 ? 1 : 0));
			const upper = String.fromCodePoint(0x391 + i + (i >= 17 ? 1 : 0));
			const upperName = name[0].toUpperCase() + name.slice(1);
			const latin = ["alpha", "beta", "epsilon", "zeta", "eta", "iota", "kappa", "mu", "nu", "omicron", "rho", "tau", "chi"];
			return [
				[lower, name === "omicron" ? "o" : `\\${name}`],
				[upper, latin.includes(name) ? upperName[0] : `\\${upperName}`],
			];
		}),
	),
	"\u03c2": "\\varsigma",
	"\u2264": "\\leq",
	"\u2265": "\\geq",
	"\u2248": "\\approx",
	"\u00b1": "\\pm",
	"\u2192": "\\rightarrow",
	"\u221e": "\\infty",
	"\u2212": "-",
};

const ESCAPED = new RegExp(`[\\\\{}&%$#_~^${Object.keys(MATH_SYMBOLS).join("")}]`, "g");

function escapeText(text: string): string {
	return text.replace(ESCAPED, (char) =>
		char in LATEX_SPECIAL ? LATEX_SPECIAL[char] : `\\ensuremath{${MATH_SYMBOLS[char]}}`,
	);
}

export function escapeLatex(text: string, keepMath = false): string {
	const clean = stripMarkup(text);
	if (!keepMath) return escapeText(clean);
	return clean
		.split(/(\$[^$]+\$)/)
		.map((part) => (/^\$[^$]+\$$/.test(part) ? part : escapeText(part)))
		.join("");
}

function authorField(names: readonly CslName[]): string {
	return names
		.map((name) => {
			if (name.literal) return `{${escapeLatex(name.literal)}}`;
			const family = escapeLatex(name.family ?? "");
			return name.given ? `${family}, ${escapeLatex(name.given)}` : family;
		})
		.filter((name) => name !== "")
		.join(" and ");
}

function entryType(doi: string, cslType: string): string {
	if (isArxivDoi(doi)) return "misc";
	switch (cslType) {
		case "article-journal":
		case "journal-article":
			return "article";
		case "paper-conference":
		case "proceedings-article":
			return "inproceedings";
		case "chapter":
		case "book-chapter":
			return "incollection";
		case "book":
		case "monograph":
		case "edited-book":
			return "book";
		case "report":
			return "techreport";
		case "thesis":
		case "dissertation":
			return "phdthesis";
		default:
			return "misc";
	}
}

export function toBibtex(key: string, doi: string, csl: Csl): string {
	const type = entryType(doi, csl.type ?? "");
	const container = escapeLatex(firstText(csl["container-title"]));
	const publisher = escapeLatex(csl.publisher ?? "");
	const year = csl.issued?.["date-parts"]?.[0]?.[0];
	const fields: [string, string | undefined][] = [
		["author", csl.author && csl.author.length > 0 ? authorField(csl.author) : undefined],
		["title", `{${escapeLatex(firstText(csl.title), isArxivDoi(doi))}}`],
		["journal", type === "article" ? container : undefined],
		["booktitle", type === "inproceedings" || type === "incollection" ? container : undefined],
		["volume", type === "article" && csl.volume !== undefined ? String(csl.volume) : undefined],
		["number", type === "article" && csl.issue !== undefined ? String(csl.issue) : undefined],
		["pages", csl.page ? csl.page.replace(/\s*[-–]\s*/g, "--") : undefined],
		["publisher", type === "inproceedings" || type === "incollection" || type === "book" ? publisher : undefined],
		["institution", type === "techreport" ? publisher : undefined],
		["school", type === "phdthesis" ? publisher : undefined],
		["howpublished", type === "misc" && !isArxivDoi(doi) ? publisher : undefined],
		["note", isArxivDoi(doi) ? `arXiv:${doi.slice("10.48550/arXiv.".length)}` : undefined],
		["year", year !== undefined ? String(year) : undefined],
		["doi", doi],
		["url", `https://doi.org/${doi}`],
	];
	const body = fields
		.filter((field): field is [string, string] => field[1] !== undefined && field[1] !== "")
		.map(([name, value]) => `  ${name} = {${value}},`)
		.join("\n");
	return `@${type}{${key},\n${body}\n}\n`;
}
