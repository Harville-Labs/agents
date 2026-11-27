import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { has, type Run, run, TEXLIVE_IMAGE } from "./build.ts";
import { stripComments } from "./tex.ts";

const USAGE = `Usage: package <paper-dir>

Packs only what arXiv needs to build the paper into <paper-dir>/arxiv.tar.gz:
main.tex, main.bbl, every other .tex file, and the images in figures/. Strips
% comments from the .tex files, refuses hidden text, then builds the packed
copy with pdflatex in a fresh folder and checks its page count against
paper.pdf. Notes, the ledger, and other working files stay out.`;

const FIGURE_TYPES = [".pdf", ".png", ".jpg", ".jpeg"];
const SKIPPED_DIRS = ["build", "node_modules"];

export function selectFiles(paths: readonly string[]): string[] {
	return paths
		.map((path) => path.split(/[\\/]/).join("/"))
		.filter((path) => !SKIPPED_DIRS.includes(path.split("/")[0]))
		.filter(
			(path) =>
				path === "main.bbl" ||
				path.endsWith(".tex") ||
				(path.startsWith("figures/") && FIGURE_TYPES.some((type) => path.toLowerCase().endsWith(type))),
		)
		.sort();
}

export function hiddenText(path: string, tex: string): string[] {
	const problems: string[] = [];
	const body = stripComments(tex);
	if (/\\iffalse\b/.test(body)) problems.push(`${path}: \\iffalse hides text that arXiv still publishes. Delete it`);
	if (/\\begin\{comment\}/.test(body))
		problems.push(`${path}: a comment environment hides text that arXiv still publishes. Delete it`);
	return problems;
}

export function pageCount(log: string): number | null {
	const match = /Output written on [^\n]*?\((\d+) pages?/.exec(log.replace(/^(.{79})\r?\n/gm, "$1"));
	return match ? Number(match[1]) : null;
}

export function pdflatexCommand(useDocker: boolean, dir: string): { cmd: string; args: string[] } {
	const pdflatex = ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "main.tex"];
	if (!useDocker) return { cmd: pdflatex[0], args: pdflatex.slice(1) };
	return { cmd: "docker", args: ["run", "--rm", "-v", `${resolve(dir)}:/paper`, "-w", "/paper", TEXLIVE_IMAGE, ...pdflatex] };
}

async function listFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { recursive: true, withFileTypes: true });
	return entries.filter((entry) => entry.isFile()).map((entry) => relative(dir, join(entry.parentPath, entry.name)));
}

async function main(argv: readonly string[], runCommand: Run): Promise<number> {
	const [dir] = argv;
	if (!dir || argv.length !== 1 || dir.startsWith("-")) {
		(dir === "--help" || dir === "-h" ? console.log : console.error)(USAGE);
		return dir === "--help" || dir === "-h" ? 0 : 2;
	}
	const files = selectFiles(await listFiles(dir));
	if (!files.includes("main.bbl") || !files.includes("main.tex")) {
		console.error(`error: ${dir} needs main.tex and main.bbl. Build it with build.ts --engine latexmk or docker first`);
		return 1;
	}
	const useDocker = !has("pdflatex");
	if (useDocker && !has("docker")) {
		console.error("error: checking the package needs pdflatex. Install TeX Live, or start Docker to use its image");
		return 1;
	}

	const stage = await mkdtemp(join(tmpdir(), "arxiv-"));
	try {
		const problems: string[] = [];
		for (const file of files) {
			await mkdir(dirname(join(stage, file)), { recursive: true });
			const bytes = await readFile(join(dir, file));
			if (!file.endsWith(".tex")) {
				await writeFile(join(stage, file), bytes);
				continue;
			}
			const tex = bytes.toString("utf8");
			problems.push(...hiddenText(file, tex));
			await writeFile(join(stage, file), stripComments(tex));
		}
		if (problems.length > 0) {
			for (const problem of problems) console.error(`error: ${problem}`);
			return 1;
		}

		const { cmd, args } = pdflatexCommand(useDocker, stage);
		for (const pass of [1, 2]) {
			const result = runCommand(cmd, args, stage);
			if (result.status !== 0) {
				console.error(result.output.split("\n").slice(-30).join("\n"));
				console.error(`error: the packed copy does not build on its own (pdflatex pass ${pass}). Fix the paper, then package again`);
				return 1;
			}
		}
		const packed = pageCount((await readFile(join(stage, "main.log"), "utf8").catch(() => "")) ?? "");
		const built = pageCount(await readFile(join(dir, "main.log"), "utf8").catch(() => ""));
		if (packed === null || packed !== built) {
			console.error(`error: the packed copy has ${packed ?? "?"} pages but paper.pdf has ${built ?? "?"}. Rebuild paper.pdf, then package again`);
			return 1;
		}

		const out = resolve(dir, "arxiv.tar.gz");
		await rm(out, { force: true });
		const tar = runCommand("tar", ["-czf", out, ...files], stage);
		if (tar.status !== 0) {
			console.error(`error: tar failed: ${tar.output}`);
			return 1;
		}
		console.log(`wrote ${join(dir, "arxiv.tar.gz")} (${packed} pages) with ${files.length} files:`);
		for (const file of files) console.log(`  ${file}`);
		return 0;
	} finally {
		await rm(stage, { recursive: true, force: true });
	}
}

if (import.meta.main) process.exit(await main(process.argv.slice(2), run));
