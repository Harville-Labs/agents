---
name: control-cli
description: Drive a command-line tool or terminal UI the way a user does and capture proof that it works. Runs one-shot commands and checks their output and exit code, and drives interactive TUIs through tmux with keystrokes and screen captures. Use when shipping or fixing a CLI or TUI, to reproduce a bug on its real surface, or for "run the CLI", "drive the TUI", or "show it working".
---

# Control CLI

Prove a CLI or TUI change by running the real program, the way a user would, and keeping what it printed. A passing unit test is not this proof. If the project has its own `verify-*` skill or app harness, use that first and fall back to this skill only for what it doesn't cover.

## Before you start

- **Isolate state.** Point the program's home, config, and data directories at a fresh temporary directory (an env var such as `HOME`, `XDG_CONFIG_HOME`, or the tool's own, like `APP_HOME=$(mktemp -d)`). Never run against the user's real config, history, or data.
- **Avoid real cost and side effects.** Use the project's mock, dry-run, or offline mode when one exists. If the change only shows up against a real service, say so and ask before spending money or touching shared systems.
- **Build what you're testing.** Run the binary or script built from your working tree, not one installed globally. Print its version or path in the evidence so the reader can tell.
- **Keep evidence in one place.** Write output and captures to a directory under the scratchpad or a temp dir, never into the repository.

## One-shot commands

1. Run the command with the inputs a user would give. Capture stdout, stderr, and the exit code separately: `cmd >out.txt 2>err.txt; echo $? >code.txt`.
2. Check each against what the change promises: the text, the exit code, any file it writes. Check the failure path too: a bad flag or missing input should exit nonzero with an error that says what to fix.
3. For machine-readable output (JSON, NDJSON), parse it (`jq`) rather than eyeballing it.

## Interactive TUIs

Drive the TUI in a detached `tmux` session so you can send keys and read the screen.

```sh
tmux new-session -d -s proof -x 120 -y 40 '<command>'
tmux send-keys -t proof 'hello' Enter        # type, then press Enter
tmux capture-pane -t proof -p >screen-1.txt  # plain-text screen
tmux capture-pane -t proof -p -e >screen-1.ansi  # with colors, when color is the change
tmux kill-session -t proof
```

- **Wait for the screen, not the clock.** After each key, poll `capture-pane` until the expected text appears, with a timeout. A fixed `sleep` is flaky and slow.
- **Use the real keys.** Special keys are names: `Enter`, `Escape`, `Tab`, `Up`, `C-c`. Send text with `-l` when it might look like a key name.
- **Check resize and exit.** When layout is part of the change, resize with `tmux resize-window -t proof -x 80 -y 24` and capture again. Make sure the program exits cleanly and leaves the terminal usable.
- No `tmux`? Use the project's own pseudo-terminal test harness if it has one, or `script -q` to record a session. Say which you used.

## Report

Show the exact commands you ran, the relevant output or screen capture, and the exit codes, before and after when it's a bug fix. Name the paths of saved evidence. Say what you didn't drive (a platform, a real service, a terminal size) and why.
