# Literature review

The review answers two questions. Has someone already shown this result? And what is the closest work, and how does this paper differ from it? Every source the paper cites goes through the ledger, `paper/sources.tsv`, and the script turns the ledger into `references.bib`.

## Search

These APIs need no key. Your harness's web search works too.

- Semantic Scholar: `https://api.semanticscholar.org/graph/v1/paper/search?query=<words>&fields=title,year,externalIds,abstract`. Its `/paper/<id>/references` and `/paper/<id>/citations` endpoints walk the citation graph. The unauthenticated rate limit is shared, so back off on HTTP 429.
- arXiv: `https://export.arxiv.org/api/query?search_query=all:<words>`.
- OpenAlex: `https://api.openalex.org/works?search=<words>`.

If the environment's network blocks a host, say which one and use the others.

1. Write three to six queries from `claim.md`: the task, the method, the metric, and the words a competing approach would use. Log the queries.
2. Pick the three to five closest papers from the results.
3. Walk the graph from each one. Its references find older work, and its citations find newer work. Do the same for any new paper that is as close.
4. Stop when two rounds add nothing to the closest set. Log the stop.

## Read

Hand the reading to subagents, a few sources each, on the `medium` size (see Models in the **go** skill). Each returns ledger rows, not summaries. Read the full text from arXiv or an open-access copy. When only the abstract is open, set `read` to `abstract`.

The ledger has one row per claim a source backs. A source can have several rows.

| Column | Holds |
|---|---|
| `key` | The BibTeX key, such as `vaswani2017`. Every row for one source uses the same key. |
| `source` | `doi:<doi>`, `arxiv:<id>`, or `manual`. |
| `title` | The title, copied from the source itself. |
| `supports` | The sentence or claim in this paper that the source backs, in one line. |
| `where` | The section, page, table, or figure in the source that says it. |
| `read` | `full` or `abstract`. |

- Cite the version you read. When a paper has both an arXiv version and a published version with the same content, cite the published DOI. Semantic Scholar's `externalIds.DOI` gives it.
- A claim about a source's specific number or finding needs `read` set to `full`. An abstract only supports "X studied Y".
- Never cite from memory. Every key comes from a search result. Never cite paper A for what paper B says about A. Read A, or cite B.
- For a source with no DOI (a web page, a standard, or software without a Zenodo DOI), add a `@misc` entry to `manual.bib` with `howpublished = {\url{...}}` and `note = {Accessed <date>}`. Set its `source` to `manual`. A human checks these by hand.

## Build the bibliography

```sh
bun <this skill's folder>/scripts/citations.ts build paper
```

It resolves each `doi:` and `arxiv:` source through doi.org, checks the title against the ledger, writes `references.bib`, and then runs `check`. The ledger title must equal the resolved title apart from case, punctuation, accents, and a subtitle left off after a colon or dash. A title mismatch means the DOI is wrong. Look the DOI up again. Never edit the title to make it match. `references.bib` is generated, so never edit it by hand. Its stamp records the ledger and the entries it was built from, and `check` fails when either has changed since.

`check` runs offline. It fails when `references.bib` is missing, stale, or edited by hand, when a `\cite` key is missing from the ledger or from a `.bib` file, and it lists the uncited sources, the `manual` sources, and the abstract-only rows. Run it before every build of the PDF.

## Write up the position

Write `paper/related-work.md` with one row per paper in the closest set: its key, what it does, how this paper differs in one sentence, and whether the experiments compare against it. A close paper that the experiments leave out is the first thing a reviewer asks about. Add it as a baseline, or tell the user why it can't be one. If a paper already reports the result, stop and report it, as the skill says.
