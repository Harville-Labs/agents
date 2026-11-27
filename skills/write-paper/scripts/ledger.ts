export const LEDGER_COLUMNS = ["key", "source", "title", "supports", "where", "read"] as const;

export type Source = { readonly kind: "doi"; readonly doi: string } | { readonly kind: "manual" };

export type Read = "full" | "abstract";

export type LedgerRow = {
	readonly line: number;
	readonly key: string;
	readonly source: Source;
	readonly title: string;
	readonly supports: string;
	readonly where: string;
	readonly read: Read;
};

export type Ledger = { readonly rows: readonly LedgerRow[]; readonly errors: readonly string[] };

const ARXIV_ID = /^arxiv:(\d{4}\.\d{4,5}|[a-z-]+(?:\.[a-z]{2})?\/\d{7})(?:v\d+)?$/i;

export function parseSource(text: string): Source | null {
	if (text === "manual") return { kind: "manual" };
	const doi = /^doi:(10\.\d{4,9}\/\S+)$/i.exec(text);
	if (doi) return { kind: "doi", doi: doi[1] };
	const arxiv = ARXIV_ID.exec(text);
	if (arxiv) return { kind: "doi", doi: `10.48550/arXiv.${arxiv[1]}` };
	return null;
}

export function isArxivDoi(doi: string): boolean {
	return doi.toLowerCase().startsWith("10.48550/arxiv.");
}

export function parseLedger(text: string, file = "sources.tsv"): Ledger {
	const lines = text.split(/\r?\n/);
	const header = lines[0]?.split("\t") ?? [];
	if (header.join("\t") !== LEDGER_COLUMNS.join("\t"))
		return {
			rows: [],
			errors: [`${file}:1: the header must be exactly: ${LEDGER_COLUMNS.join(" <tab> ")}`],
		};

	const rows: LedgerRow[] = [];
	const errors: string[] = [];
	const firstRow = new Map<string, LedgerRow>();
	lines.slice(1).forEach((raw, index) => {
		const line = index + 2;
		if (raw.trim() === "") return;
		const at = `${file}:${line}`;
		const cells = raw.split("\t").map((cell) => cell.trim());
		if (cells.length !== LEDGER_COLUMNS.length) {
			errors.push(`${at}: expected ${LEDGER_COLUMNS.length} tab-separated cells, found ${cells.length}`);
			return;
		}
		const [key, sourceText, title, supports, where, read] = cells;
		const rowErrors: string[] = [];
		if (!/^[A-Za-z0-9_:.-]+$/.test(key))
			rowErrors.push(`${at}: key "${key}" may hold only letters, digits, and _ : . -`);
		const source = parseSource(sourceText);
		if (!source)
			rowErrors.push(
				`${at}: source "${sourceText}" must be doi:10.xxxx/..., arxiv:<id>, or manual`,
			);
		if (!title) rowErrors.push(`${at}: title is empty. Copy the title from the source itself`);
		if (!supports) rowErrors.push(`${at}: supports is empty. Name the sentence in the paper this source backs`);
		if (!where)
			rowErrors.push(`${at}: where is empty. Give the section, page, table, or figure in the source that says it`);
		if (read !== "full" && read !== "abstract")
			rowErrors.push(`${at}: read must be full or abstract, not "${read}"`);
		if (rowErrors.length > 0 || !source) {
			errors.push(...rowErrors);
			return;
		}
		const row: LedgerRow = { line, key, source, title, supports, where, read: read as Read };
		const first = firstRow.get(key);
		if (first && (sourceLabel(first.source) !== sourceLabel(source) || first.title !== title))
			errors.push(`${at}: key "${key}" already names a different source or title on line ${first.line}`);
		if (!first) firstRow.set(key, row);
		rows.push(row);
	});
	return { rows, errors };
}

function sourceLabel(source: Source): string {
	return source.kind === "doi" ? source.doi.toLowerCase() : "manual";
}
