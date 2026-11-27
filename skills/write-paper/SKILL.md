---
name: write-paper
description: "Turn an experiment's result into an arXiv-ready paper in the IEEE conference template, delivered as a PDF: vet the result, review the literature with a checked citation ledger, report the experiments the paper still needs, outline, make the figures and tables, draft, run a reviewer panel, and package the source for arXiv. Use for /write-paper, or when asked to write up a result, experiment, or finding as a paper or preprint."
disable-model-invocation: true
---

# Write a paper

The paper argues one claim the evidence supports. Every number and figure traces to a run, and every citation traces to a source someone read. The output is `paper/paper.pdf`, which you build and look at page by page. The human authors submit it. You never submit to arXiv or any venue, because a submission is public and permanent.

Most of these papers go to arXiv and nowhere else. So write for arXiv: authors named, no page limit enforced, no anonymizing. Still keep the body near eight IEEE pages, plus references and appendices, so a venue submission later needs no rewrite.

## Set up

1. Copy `template/` from this skill's folder into the repository that holds the experiment, as `paper/`. If that repository is not the user's to change, ask where the paper goes.
2. Open a decision log in `paper/` with the **show-me-your-work** skill. Log each scope cut, each source dropped, and each reviewer finding with its fix.
3. Ask the user once for the authors, their affiliations, and the arXiv category. Don't wait for the answer. Leave the template's placeholders in place and list them in the reply.

## 1. Vet the result

Fill in `paper/claim.md` before you write any paper prose.

- Write the claim as one sentence that names the quantity, the comparison, and the conditions.
- List at most three contributions.
- Map every number the paper will use to the artifact it came from and the command that regenerates it.
- Vet each measured number with the **principle-explain-the-number** skill, and each performance number with the **benchmark-checklist** skill.
- Rerun every command in the evidence table and confirm it prints the value in the table.

Stop and report when the verdict is inconclusive, a baseline ran untuned, or a command does not reproduce its number. A paper written around an unvetted result does more harm than no paper. Narrow the claim to what holds, and tell the user what it would take to support the original one.

## 2. Review the literature

Follow `references/literature-review.md`. It ends with `paper/sources.tsv` filled in, a `references.bib` built from that file, and `paper/related-work.md` naming the closest prior work and how this result differs from each.

If a prior paper already reports this result, stop and tell the user. Name the paper and what it shows. That finding is worth more than the draft.

## 3. Find the gaps

Read `claim.md` and `related-work.md` the way a reviewer would, and write `paper/suggestions.md`: every experiment or change the paper needs before it can defend its claim. Look for these:

- **Baselines.** A close paper in `related-work.md` that the experiments don't compare against.
- **Benchmarks and metrics.** A dataset, workload, or metric that the closest work reports and this work doesn't, so a reader can't compare the two.
- **Ablations.** Each component the claim credits, with a run that removes it. A claim that X improves because of Y needs a run without Y.
- **Configurations.** Each setting the result could depend on, such as scale, data size, hardware, hyperparameters, or the standard configuration prior work uses, and a run that varies it.
- **Repeats.** Too few runs or seeds to separate the effect from the noise, per the **benchmark-checklist** skill.
- **Limits.** A limit in `claim.md` that a cheap run would remove.
- **Reproducibility.** Code, data, or settings that a reader needs and that aren't released or recorded.

Give each suggestion an id, a priority, the exact run (configuration, data, baseline, seeds, and the command when you can write it), the reason with a ledger key or the part of the claim it tests, the result that would change the paper, and a rough cost. Set the priority to one of these:

- `blocking`: a reviewer would reject the claim as written without it. Also give the narrower claim the paper can make without it.
- `strengthens`: the claim holds, but a reviewer would ask for it.
- `optional`: nice to have.

Report the list to the user, blocking items first. When an item is `blocking`, stop here. Don't outline or draft until the user runs the experiments or tells you to narrow the claim. When the new runs come in, add them to the evidence table, vet them as in stage 1, and mark each suggestion `done`, `narrowed`, or `declined` with a line on what changed. With no blocking items, keep going and list the open `strengthens` items in the reply.

## 4. Outline

Write the outline in `paper/outline.md`, section by section. Give each section a one-line point and the evidence or sources it uses. The template's sections are the default.

- **Abstract.** The problem, the gap, what you did, the main number, and what follows from it.
- **Introduction.** The problem and why it matters, the gap, the claim, and the contributions as a bulleted list.
- **Related Work.** Group prior work by approach, and contrast each group with this paper. Don't just list papers.
- **Method** and **Experimental Setup.** Give enough detail for a reader to rerun the work: hardware, versions, data, seeds, baselines and how each was tuned.
- **Results.** One subsection per contribution. Each figure or table answers one question that its caption states.
- **Limitations.** Everything the claim does not cover, taken from `claim.md`.
- **Conclusion.** The claim again, and what to do next. Add nothing new.

List every figure and table in the outline: the question it answers, its kind (plot, diagram, table, or image), and the data or source it comes from. Most papers need a method diagram, one plot or table per result, and a setup table.

## 5. Make the figures and tables

Follow the figures section of `references/latex.md`. Each plot and table comes from a script that reads the run artifacts, so rerunning the script redraws it. Each diagram is TikZ source or an exported PDF. Never copy a figure from another paper. Redraw it from the published numbers and cite the paper, or leave it out.

When the data a figure needs is not in the artifacts, rerun or extend the experiment to get it, or drop the figure. Never draw from estimates or typed-in values. Add each figure's script and command to the evidence table in `claim.md`.

Build the PDF and look at each figure on its page before you write the prose around it.

## 6. Draft

Follow `references/latex.md` for the template, numbers, and builds. Write the prose with these rules:

- Apply the **unslop** skill to every paragraph. Sentence-level rules from the **technical-writing** skill apply, but write in the passive voice or first-person plural ("we"), as papers do.
- Scope each claim to what was measured. "On the 60k-row dataset, export is 30% faster" is right. "Export is faster" is not.
- Put caveats in Limitations, not as a hedge on every sentence.
- Don't call your own work novel, significant, or state of the art. Show the comparison and let the reader judge.
- Cite only through `\cite` keys that `sources.tsv` holds. A claim about a source's specific result needs a row with `read` set to `full`.
- Define each term and symbol once, at first use, and keep it the same after that.
- In Acknowledgment, say how an AI agent was used to write the paper. Never list an AI as an author. The human authors are responsible for every sentence.

Write the Abstract and Introduction last, from the finished Results.

Build the PDF after each section with the build script in `references/latex.md`, and run its visual check before you move on.

## 7. Review

Follow `references/review.md`. A reviewer panel on the `panel` models (see Models in the **go** skill) attacks the draft, and a citation audit checks the ledger against the sources. Fix every verified finding, log it, and run the review again until a round finds nothing new above the minor level.

## 8. Package for arXiv

Build the final PDF with pdflatex (latexmk or the TeX Live image, not Tectonic), and run the visual check on every page. Then follow the arXiv section of `references/latex.md`. It ends with `paper/paper.pdf` and `paper/arxiv.tar.gz`, and both build cleanly from a fresh folder.

If `paper/` is in a git repository, run the **go** skill's **Opening a PR** playbook for it.

## Reply

When the run stops at a gate, the reply is the reason it stopped. For stage 3, that's the suggestions list: blocking items first, each with its run, why it's needed, and the narrower claim the paper could make without it.

Otherwise, after the final stage:

Give the user `paper/paper.pdf` first. Give its absolute path, and open or attach it if your harness can show files. Then give the claim sentence, the main number with its evidence path, the suggestions still open in `suggestions.md`, and the source count with how many were read in full. Give the reviewer findings fixed and those left open. List each placeholder still in the paper, and the `manual` sources a human must check by hand. Give the path to `arxiv.tar.gz`. Then list what the human authors must do before they submit: read the whole paper, check the manual sources, pick the arXiv license, and get an endorsement if this is their first submission in the category.
