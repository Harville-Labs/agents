import { spawnSync } from "node:child_process";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { delimiter, join, resolve } from "node:path";
import { main as citations, nodeRuntime, readOrNull } from "./citations.ts";

export const ENGINES = ["latexmk", "docker", "tectonic"] as const;
export type Engine = (typeof ENGINES)[number];

export type Run = (cmd: string, args: readonly string[], cwd: string) => { status: number; output: string };

export type BuildRuntime = {
	readonly has: (cmd: string) => boolean;
	readonly run: Run;
	readonly read: (path: string) => Promise<string | null>;
	readonly copy: (from: string, to: string) => Promise<void>;
	readonly renderPages: (pdf: string, outDir: string) => Promise<string[] | null>;
	readonly checkCitations: (dir: string) => Promise<number>;
	readonly stdout: (line: string) => void;
	readonly stderr: (line: string) => void;
};

const USAGE = `Usage: build <paper-dir> [--engine latexmk|docker|tectonic]

Checks the citations, builds main.tex, copies the result to paper.pdf, fails
on undefined citations or references, missing files, and overfull lines, and
renders each page to build/pages/ for a visual check.`;

export const TEXLIVE_IMAGE = "texlive/texlive:latest";
const LATEXMK_ARGS = ["-interaction=nonstopmode", "-halt-on-error", "main.tex"];

export function pickEngine(has: (cmd: string) => boolean): Engine | null {
	return ENGINES.find((engine) => has(engine)) ?? null;
}

export function engineCommand(engine: Engine, dir: string): { cmd: string; args: string[] } {
	switch (engine) {
		case "latexmk":
			return { cmd: "latexmk", args: LATEXMK_ARGS };
		case "docker":
			return {
				cmd: "docker",
				args: ["run", "--rm", "-v", `${resolve(dir)}:/paper`, "-w", "/paper", TEXLIVE_IMAGE, "latexmk", ...LATEXMK_ARGS],
			};
		case "tectonic":
			return { cmd: "tectonic", args: ["--keep-logs", "--keep-intermediates", "main.tex"] };
	}
}

export function logProblems(rawLog: string): string[] {
	const log = rawLog.replace(/^(.{79})\r?\n/gm, "$1");
	const problems: string[] = [];
	for (const m of log.matchAll(/Citation `([^']+)'[^\n]*undefined/g)) problems.push(`undefined citation ${m[1]}`);
	for (const m of log.matchAll(/Reference `([^']+)'[^\n]*undefined/g)) problems.push(`undefined reference ${m[1]}`);
	for (const m of log.matchAll(/Label `([^']+)' multiply defined/g)) problems.push(`label ${m[1]} is defined twice`);
	for (const m of log.matchAll(/File `([^']+)' not found/g)) problems.push(`missing file ${m[1]}`);
	for (const m of log.matchAll(/Overfull \\hbox \((\d+(?:\.\d+)?)pt too wide\)[^\n]*?lines? (\d+)/g))
		if (Number(m[1]) > 1) problems.push(`line ${m[2]} runs ${m[1]}pt into the margin`);
	if (/Float too large for page/.test(log)) problems.push("a figure or table is taller than the page");
	if (/There were undefined (?:references|citations)/.test(log) && !problems.some((p) => p.startsWith("undefined")))
		problems.push("undefined references or citations. Search main.log for 'undefined'");
	return [...new Set(problems)];
}

export async function main(argv: readonly string[], rt: BuildRuntime): Promise<number> {
	const [dir, ...flags] = argv;
	if (dir === "--help" || dir === "-h") {
		rt.stdout(USAGE);
		return 0;
	}
	const forced = flags[0] === "--engine" && flags.length === 2 ? ENGINES.find((name) => name === flags[1]) : undefined;
	if (!dir || dir.startsWith("-") || (flags.length > 0 && !forced)) {
		rt.stderr(USAGE);
		return 2;
	}
	if ((await rt.checkCitations(dir)) !== 0) return 1;

	const engine = forced ?? pickEngine(rt.has);
	if (!engine) {
		rt.stderr(
			"error: no TeX engine found. Install TeX Live (it includes latexmk and pdflatex), start Docker to use the TeX Live image, or install Tectonic for a quick preview.",
		);
		return 1;
	}
	if (engine === "docker") rt.stdout(`building with ${TEXLIVE_IMAGE}. The first run pulls the image, which is several GB.`);
	const { cmd, args } = engineCommand(engine, dir);
	const result = rt.run(cmd, args, dir);
	if (result.status !== 0) {
		rt.stderr(result.output.split("\n").slice(-30).join("\n"));
		rt.stderr(`error: ${cmd} failed with status ${result.status}. The output above ends at the first error.`);
		return 1;
	}

	const problems = logProblems((await rt.read(join(dir, "main.log"))) ?? "");
	await rt.copy(join(dir, "main.pdf"), join(dir, "paper.pdf"));
	rt.stdout(`wrote ${join(dir, "paper.pdf")} with ${engine}`);
	if (engine === "tectonic")
		rt.stdout("Tectonic is a preview. arXiv builds with pdflatex, so build with latexmk or docker before you package.");

	const pages = await rt.renderPages(join(dir, "paper.pdf"), join(dir, "build", "pages"));
	if (pages) rt.stdout(`look at every page: ${pages.join(" ")}`);
	else rt.stdout("pdftoppm is not installed, so no page images. Look at paper.pdf page by page.");

	if (problems.length > 0) {
		for (const problem of problems) rt.stderr(`error: ${problem}`);
		return 1;
	}
	return 0;
}

export function has(cmd: string): boolean {
	const names = process.platform === "win32" ? [`${cmd}.exe`, `${cmd}.cmd`] : [cmd];
	return (process.env.PATH ?? "")
		.split(delimiter)
		.some((dir) => dir !== "" && names.some((name) => existsSync(join(dir, name))));
}

export const run: Run = (cmd, args, cwd) => {
	const child = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
	return { status: child.status ?? 1, output: `${child.stdout ?? ""}${child.stderr ?? ""}${child.error ? String(child.error) : ""}` };
};

async function renderPages(pdf: string, outDir: string): Promise<string[] | null> {
	if (!has("pdftoppm")) return null;
	await rm(outDir, { recursive: true, force: true });
	await mkdir(outDir, { recursive: true });
	if (run("pdftoppm", ["-r", "110", "-png", resolve(pdf), join(resolve(outDir), "page")], ".").status !== 0) return null;
	return (await readdir(outDir))
		.filter((name) => name.endsWith(".png"))
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
		.map((name) => join(outDir, name));
}

if (import.meta.main)
	process.exit(
		await main(process.argv.slice(2), {
			has,
			run,
			read: readOrNull,
			copy: (from, to) => copyFile(from, to),
			renderPages,
			checkCitations: (dir) => citations(["check", dir], nodeRuntime),
			stdout: (line) => console.log(line),
			stderr: (line) => console.error(line),
		}),
	);
