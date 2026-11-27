import { describe, expect, it } from "bun:test";
import { type BuildRuntime, engineCommand, logProblems, main, pickEngine } from "./build.ts";

function runtime(options: { installed?: string[]; log?: string; status?: number; citations?: number; pages?: string[] | null }) {
	const stdout: string[] = [];
	const stderr: string[] = [];
	const ran: string[] = [];
	const copied: string[] = [];
	const rt: BuildRuntime = {
		has: (cmd) => (options.installed ?? ["latexmk"]).includes(cmd),
		run: (cmd, args) => {
			ran.push([cmd, ...args].join(" "));
			return { status: options.status ?? 0, output: "! LaTeX Error: File `x.sty' not found." };
		},
		read: async (path) => (path.endsWith("main.log") ? (options.log ?? "") : null),
		copy: async (from, to) => {
			copied.push(`${from} -> ${to}`);
		},
		renderPages: async () => (options.pages === undefined ? ["p/build/pages/page-1.png"] : options.pages),
		checkCitations: async () => options.citations ?? 0,
		stdout: (line) => stdout.push(line),
		stderr: (line) => stderr.push(line),
	};
	return { rt, stdout, stderr, ran, copied };
}

describe("pickEngine", () => {
	it("prefers a local pdflatex build, then Docker, then Tectonic", () => {
		expect(pickEngine((cmd) => ["latexmk", "docker", "tectonic"].includes(cmd))).toBe("latexmk");
		expect(pickEngine((cmd) => ["docker", "tectonic"].includes(cmd))).toBe("docker");
		expect(pickEngine((cmd) => cmd === "tectonic")).toBe("tectonic");
		expect(pickEngine(() => false)).toBeNull();
	});

	it("mounts the paper folder into the TeX Live image", () => {
		const { args } = engineCommand("docker", "/work/paper");
		expect(args.slice(0, 7)).toEqual(["run", "--rm", "-v", "/work/paper:/paper", "-w", "/paper", "texlive/texlive:latest"]);
	});
});

describe("logProblems", () => {
	it("reports the problems that make a PDF wrong", () => {
		const log = [
			"LaTeX Warning: Citation `smith2020' on page 2 undefined on input line 40.",
			"LaTeX Warning: Reference `fig:missing' on page 3 undefined on input line 55.",
			"LaTeX Warning: Label `sec:intro' multiply defined.",
			"! LaTeX Error: File `figures/loss.pdf' not found.",
			"Overfull \\hbox (14.2pt too wide) in paragraph at lines 61--63",
			"Overfull \\hbox (0.4pt too wide) in paragraph at lines 70--71",
			"LaTeX Warning: Float too large for page by 20.0pt on input line 90.",
		].join("\n");
		expect(logProblems(log)).toEqual([
			"undefined citation smith2020",
			"undefined reference fig:missing",
			"label sec:intro is defined twice",
			"missing file figures/loss.pdf",
			"line 61 runs 14.2pt into the margin",
			"a figure or table is taller than the page",
		]);
	});

	it("passes a clean log", () => {
		expect(logProblems("Output written on main.pdf (8 pages).")).toEqual([]);
	});
});

describe("build", () => {
	it("builds with latexmk, writes paper.pdf, and lists the page images", async () => {
		const { rt, ran, copied, stdout, stderr } = runtime({});
		expect(await main(["p"], rt)).toBe(0);
		expect(ran).toEqual(["latexmk -interaction=nonstopmode -halt-on-error main.tex"]);
		expect(copied).toEqual(["p/main.pdf -> p/paper.pdf"]);
		expect(stdout).toEqual(["wrote p/paper.pdf with latexmk", "look at every page: p/build/pages/page-1.png"]);
		expect(stderr).toEqual([]);
	});

	it("stops before building when the citation check fails", async () => {
		const { rt, ran } = runtime({ citations: 1 });
		expect(await main(["p"], rt)).toBe(1);
		expect(ran).toEqual([]);
	});

	it("still writes paper.pdf when the log has problems, then fails", async () => {
		const { rt, copied, stderr } = runtime({ log: "LaTeX Warning: Citation `k' on page 1 undefined" });
		expect(await main(["p"], rt)).toBe(1);
		expect(copied).toHaveLength(1);
		expect(stderr).toEqual(["error: undefined citation k"]);
	});

	it("shows the engine's error when the build fails", async () => {
		const { rt, copied, stderr } = runtime({ status: 12 });
		expect(await main(["p"], rt)).toBe(1);
		expect(copied).toEqual([]);
		expect(stderr.join("\n")).toContain("File `x.sty' not found");
	});

	it("warns that a Tectonic build is only a preview", async () => {
		const { rt, stdout } = runtime({ installed: ["tectonic"], pages: null });
		expect(await main(["p"], rt)).toBe(0);
		expect(stdout).toContain(
			"Tectonic is a preview. arXiv builds with pdflatex, so build with latexmk or docker before you package.",
		);
		expect(stdout).toContain("pdftoppm is not installed, so no page images. Look at paper.pdf page by page.");
	});

	it("says how to get a TeX engine when none is installed", async () => {
		const { rt, stderr } = runtime({ installed: [] });
		expect(await main(["p"], rt)).toBe(1);
		expect(stderr[0]).toContain("no TeX engine found");
	});

	it("honors --engine and rejects unknown engines", async () => {
		const forced = runtime({ installed: ["latexmk", "tectonic"] });
		expect(await main(["p", "--engine", "tectonic"], forced.rt)).toBe(0);
		expect(forced.ran[0]).toStartWith("tectonic ");
		const bad = runtime({});
		expect(await main(["p", "--engine", "word"], bad.rt)).toBe(2);
	});
});
