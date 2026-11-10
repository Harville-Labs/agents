---
name: deslop
description: Remove AI slop from a code diff before commit. Cuts defensive noise, needless abstraction, narrating comments, and style that doesn't match the file. Use before every commit, or for "deslop", "clean up this diff", or "remove the slop".
disable-model-invocation: true
---

# Deslop

Make the diff look like the best engineer on this codebase wrote it by hand. Remove what an agent added that a careful human would not, and change nothing else.

**unslop** cleans prose. This skill cleans code. **no-comments** audits comments in depth before review, so here you cut only the obvious ones.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch (default `main`), working tree included. Touch only lines the diff adds or changes. Slop that was there before you is a separate fix in its own commit, per the repository's rules.

## Steps

1. **Read the neighbors first.** For each file in the diff, read the unchanged code around the change. Its naming, error handling, comment density, and structure are the standard. Slop is whatever doesn't match it.
2. **Scan the diff for each pattern below.** Check every hunk, not a sample.
3. **Fix each hit with the smallest edit** that makes the code read like its neighbors. When removing a guard or a catch, first prove it can't fire: trace the caller, the type, or the schema that rules it out. If you can't prove it, keep it.
4. **Rerun the repository's check command.** A cleanup that breaks a test was not slop. Put it back.
5. **Report** what you removed, by pattern and count, and anything you kept because you couldn't prove it safe.

## Patterns

| Pattern | What it looks like | Fix |
|---|---|---|
| Defensive noise | `try`/`catch` around code that can't throw, null checks on values the type or a schema already guarantees, `?.` chains on required fields, re-validating data inside the boundary | Delete it. Trust validated input. |
| Swallowed errors | `catch {}`, `catch (e) { console.log(e) }`, returning a default on failure with no comment saying why that's safe | Let it propagate, or handle it specifically and say why. |
| Escape-hatch types | `any`, `as unknown as T`, `# type: ignore`, `unwrap()` on input, `@ts-expect-error` with no reason | Use the real type, or narrow it properly. |
| Speculative abstraction | A helper, interface, option, or config flag with one caller and no second in sight; a factory wrapping one constructor | Inline it. |
| Duplicated logic | A new helper that does what an existing one already does | Call the existing one. |
| Narrating comments | `// increment the counter`, `// loop over items`, docstrings that restate the signature, section-banner comments | Delete. Keep comments that explain why. |
| Leftovers | Debug prints, commented-out code, unused imports and variables, `TODO` with no issue, temporary files | Delete. |
| Off-style code | Different naming, quoting, or error style from the file; verbose loops where the file uses a library call; new patterns where an established one exists | Match the file. |
| Over-logging | Log lines at `info` or above for routine steps, or any log of prompts, file contents, personal data, or credentials | Remove, or drop to `debug` without the sensitive data. |
| Test slop | Tests that assert on mocks instead of behavior, snapshot everything, or sleep for timing; names like `test 2` | Assert on behavior, inject the clock, name the behavior. |

## Don't

- Don't refactor, rename, or reformat code the diff didn't touch.
- Don't change behavior. If a cleanup would, it isn't slop. Report it instead.
- Don't remove a guard or catch you can't prove is dead.
