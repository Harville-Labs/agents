# Review

Two checks run on the full draft. A reviewer panel attacks the argument, and a citation audit checks every ledger row against its source. Run each check with fresh subagents. You verify every finding yourself before you change the paper.

## Reviewer panel

Spawn one reviewer for each model in the `panel` line (see Models in the **go** skill). Give each one the paths to `main.tex`, `claim.md`, `sources.tsv`, and the run artifacts, and this brief:

> Review this paper as a reviewer for an IEEE conference would. Write a three-sentence summary, the claim as you understand it, the strengths, the weaknesses ranked major or minor, the questions for the authors, and a verdict (accept, weak accept, weak reject, or reject). For each weakness, name the sentence, figure, or table, and say what evidence would fix it. Check that the claim stays within the evidence. Check that each number in the text appears in the evidence table in `claim.md`. Check that each baseline was tuned and compared fairly. Check that a reader could rerun the work from the setup section. Check that each figure reads in grayscale at print size. Rerun the evidence commands you can. Name any prior work the paper misses, with a DOI or arXiv id that you found by searching, not from memory.

Verify each finding:

- Keep a major finding only when you can see it in the draft or the artifacts. A finding that a rerun disproves is dropped.
- Missing prior work goes through the literature review like any other source: search, read, add a ledger row, and update `related-work.md`.
- A finding that the claim goes too far is fixed by narrowing the claim, not by adding words.

Log each finding with its verdict and its fix. A finding that needs a new experiment goes into `suggestions.md` with its priority. A blocking one stops the review until the user decides, as in stage 3 of the skill.

## Citation audit

Split the ledger into batches of about ten rows, and give each batch to a subagent on the `medium` size. Each one opens the source at `where` and reports each row as `confirmed`, `wrong where`, or `does not support`, with the passage it read. Audit every row.

Fix a `wrong where` row in the ledger. For a `does not support` row, rewrite the sentence or find a source that supports it. Then run `citations build` again.

## Rounds

Run the panel again after the fixes. Stop when a round finds nothing new at the major level, or after three rounds. List the findings still open in the reply.
