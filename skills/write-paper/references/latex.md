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
| `latexmkrc` | Builds with pdflatex and runs BibTeX. |

Keep IEEEtran's margins, fonts, and column layout. Don't add the IEEE copyright notice. It belongs only on a paper a venue accepted.

## Numbers

Never type a result into the `.tex` files. A script in the experiment's repository reads the run artifacts and writes `generated/numbers.tex`, one `\newcommand` per number, such as `\newcommand{\speedupPfifty}{30\%}`. Macro names hold letters only. Follow a macro with `{}` in prose so it keeps the space after it. Every macro is a row in the evidence table in `claim.md`, with the command that writes it. When a run changes, rerun the script, not an edit.

## Figures and tables

- A script draws every figure from the run data into `figures/`, as a PDF. Rerunning the script redraws all of them.
- Size each figure for one column (3.5 in) unless it needs both (7.16 in). Text in the figure stays at 8 pt or larger once it is placed.
- Make each figure readable in grayscale. Tell series apart by marker or line style as well as color, and use a palette that people with color blindness can tell apart.
- Label each axis with its quantity and unit. Say in the caption what the figure shows and what to notice.
- Build tables with `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) and no vertical rules. Report a measured value with its spread, such as the median and range.

## Build

```sh
bun <this skill's folder>/scripts/citations.ts check paper
cd paper && latexmk main.tex
grep -E "undefined|Overfull" main.log
```

A clean build has no undefined references or citations and no overfull boxes. Fix an overfull box by rewording the line or resizing the figure, not by changing the layout. Copy the result to `paper/paper.pdf`.

## Package for arXiv

arXiv builds the paper from its source and publishes that source, comments included. Every version stays public for good, so get v1 right.

1. Build with pdflatex, as arXiv does. Another engine, such as XeLaTeX or Tectonic, can hide errors that arXiv will hit.
2. Strip the comments and unused files:

   ```sh
   uvx --from arxiv-latex-cleaner arxiv_latex_cleaner paper
   ```

   It writes a cleaned copy to `paper_arXiv/`, next to `paper/`.
3. Copy `main.bbl` into `paper_arXiv/`. arXiv uses the `.bbl` file and does not need the `.bib` files.
4. Check that the copy builds on its own. Extract it into an empty folder, run `pdflatex main.tex` twice, and confirm that the page count and the reference list match `paper.pdf`.
5. Pack it with `tar -czf paper/arxiv.tar.gz -C paper_arXiv .`, then delete `paper_arXiv/`.
6. Write `paper/arxiv-metadata.md` for the form the human fills in: the title, the authors, the abstract as plain text with each macro replaced by its value, the comments line (such as "8 pages, 4 figures"), the primary category, and any cross-list categories.

Keep figures in formats that pdflatex reads (PDF, PNG, or JPG). File names are case-sensitive on arXiv. Paths in `\includegraphics` and `\input` are relative.
