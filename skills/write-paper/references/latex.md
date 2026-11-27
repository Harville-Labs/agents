# LaTeX and arXiv

## The template

| File | Holds |
|---|---|
| `main.tex` | The paper, in `IEEEtran` conference mode. |
| `generated/numbers.tex` | A macro for every number the prose uses, written by a script. |
| `sources.tsv` | The citation ledger. See `literature-review.md`. |
| `references.bib` | Generated from the ledger by `citations build`. It isn't in the template until the first build. |
| `manual.bib` | Hand-written entries for sources with no DOI. |
| `claim.md` | The claim, the contributions, the evidence table, the limits, and the authors. |
| `figures/`, `generated/tables/` | Figures and tables, made by scripts. Create these folders when you add the first one. |
| `latexmkrc` | Builds with pdflatex and runs BibTeX. |

Keep IEEEtran's margins, fonts, and column layout. Don't add the IEEE copyright notice. It belongs only on a paper a venue accepted.

## Numbers

Never type a result into the `.tex` files. A script in the experiment's repository reads the run artifacts and writes `generated/numbers.tex`, one `\newcommand` per number, such as `\newcommand{\speedupPfifty}{30\%}`. Macro names hold letters only. Follow a macro with `{}` in prose so it keeps the space after it. Every macro is a row in the evidence table in `claim.md`, with the command that writes it. When a run changes, rerun the script, not an edit.

## Figures and tables

Every figure goes in `figures/`, and every generated table goes in `generated/tables/`. Each one answers the question its caption states, appears at or after the paragraph that first refers to it, and uses `[t]` placement. A figure that spans both columns uses `figure*`.

**Plots.** Write a script in the experiment's repository that reads the run artifacts and writes a PDF into `paper/figures/`. In Python, use matplotlib through uv, such as `uv run --with matplotlib analysis/plot_latency.py runs/ paper/figures/latency.pdf`.

- Size the figure to its printed width: 3.5 in for one column and 7.16 in for both. Set the font size to 8 pt, so the text matches the caption without scaling.
- Embed TrueType fonts. In matplotlib, set `pdf.fonttype` to 42. Some venues' PDF checks reject the Type 3 fonts that matplotlib uses by default.
- Make each figure readable in grayscale. Tell series apart by marker or line style as well as color, and use a palette that people with color blindness can tell apart.
- Label each axis with its quantity and unit. Show the spread, such as a range or interval, whenever the text reports one.

**Diagrams.** Draw a method or system diagram in TikZ, in `figures/<name>.tex`, and `\input` it inside a `figure`. Add `\usepackage{tikz}` and the libraries it uses to `main.tex`. For a diagram too complex for TikZ, draw it in another tool, export a PDF to `figures/`, and keep the editable source next to it.

**Tables.** A script writes each results table as a `table` environment in `generated/tables/<name>.tex`, and `main.tex` uses `\input` to include it. Use `booktabs` (`\toprule`, `\midrule`, `\bottomrule`), no vertical rules, and the caption above the table, as IEEE places it. Report a measured value with its spread. A table that holds no results, such as a hardware list, can be written by hand.

**Images.** Put screenshots and photos from the experiment in `figures/` as PNG, at 300 dpi or more at their printed size. Record the step that produced each one in `claim.md`.

**Other papers' figures.** Never copy one. Redraw it from the numbers the paper reports and cite it, or describe it in words.

## Build

```sh
bun <this skill's folder>/scripts/build.ts paper
```

The script checks the citations first. Then it builds `main.tex` with the first engine it finds: `latexmk` (a local TeX Live), then `docker` (the `texlive/texlive` image, several GB on the first pull), then `tectonic`. Pass `--engine <name>` to choose one. It copies the result to `paper/paper.pdf`. It fails on undefined citations or references, labels defined twice, missing files, lines more than 1 pt into the margin, and floats taller than the page. It writes `paper.pdf` even when a check fails, so you can see the problem. Tectonic uses XeTeX, so treat its output as a preview only. arXiv builds with pdflatex.

When `pdftoppm` is installed, the script renders each page to `paper/build/pages/`. Look at every page image, or at `paper.pdf` itself if your harness reads PDFs, and check these:

- Nothing sits above the title or the abstract on page 1. A float placed early in the source can land there. Move its source later.
- Each figure appears on the page that first refers to it, or the page after. Its text is readable and about the size of the caption.
- No `??` appears where a reference or citation should be. No text or figure runs past a margin. No large empty gap appears.
- The body is near eight pages, not counting the references and appendices.

## Package for arXiv

arXiv builds the paper from its source and publishes that source, comments included. Every version stays public for good, so get v1 right.

1. Build with the build script on `--engine latexmk` or `--engine docker`, which use pdflatex, as arXiv does. Another engine, such as XeLaTeX or Tectonic, can hide errors that arXiv will hit.
2. Strip the comments and unused files:

   ```sh
   uvx --from arxiv-latex-cleaner arxiv_latex_cleaner paper
   ```

   It writes a cleaned copy to `paper_arXiv/`, next to `paper/`.
3. Copy `main.bbl` into `paper_arXiv/`. arXiv uses the `.bbl` file and does not need the `.bib` files.
4. Check that the copy builds on its own. Extract it into an empty folder, run `pdflatex main.tex` twice there (locally or in the same TeX Live image), and confirm that the page count and the reference list match `paper.pdf`.
5. Pack it with `tar -czf paper/arxiv.tar.gz -C paper_arXiv .`, then delete `paper_arXiv/`.
6. Write `paper/arxiv-metadata.md` for the form the human fills in: the title, the authors, the abstract as plain text with each macro replaced by its value, the comments line (such as "8 pages, 4 figures"), the primary category, and any cross-list categories.

Keep figures in formats that pdflatex reads (PDF, PNG, or JPG). File names are case-sensitive on arXiv. Paths in `\includegraphics` and `\input` are relative.
