export function stripComments(tex: string): string {
	return tex
		.split("\n")
		.map((line) => line.replace(/(^|[^\\])((?:\\\\)*)%.*$/, "$1$2%"))
		.join("\n");
}

const CITE = /\\(?:no)?cite[a-zA-Z]*\*?\s*(?:\[[^\]]*\]\s*){0,2}\{([^}]*)\}/g;

export function citeKeys(tex: string): string[] {
	const keys = new Set<string>();
	for (const match of stripComments(tex).matchAll(CITE))
		for (const key of match[1].split(",").map((part) => part.trim()))
			if (key !== "" && key !== "*") keys.add(key);
	return [...keys].sort();
}

const NOT_ENTRIES = new Set(["comment", "string", "preamble"]);

export function bibKeys(bib: string): string[] {
	const keys: string[] = [];
	for (const match of bib.matchAll(/@(\w+)\s*\{\s*([^,\s]+)\s*,/g))
		if (!NOT_ENTRIES.has(match[1].toLowerCase())) keys.push(match[2]);
	return keys;
}
