---
name: setup-recoder
description: Install Recoder's `recoder` command, pick the model its reviews run on, and check the machine, so the Reviewing PRs playbook can run Recoder reviews. Use for /hl:setup-recoder, $setup-recoder, "set up recoder", "install recoder", or when a Recoder readiness check failed.
---

# Setup recoder

Get `recoder doctor -p` to exit 0 on this machine. The **go** skill's Reviewing PRs playbook runs a Recoder review on each PR when that check passes. Each person runs this for themselves. `../go/references/recoder.md` has the commands the playbook runs.

Pass `-p` to every `recoder` command and read its JSON.

## Steps

### 1. Install or update

Run `command -v recoder`.

- Not found: the install script downloads a binary and checks it against the release's checksums. Ask once before you run it, because it runs a script from the network: `curl -fsSL https://recoder.dev/install.sh | sh`. It installs to `~/.local/bin`. If that folder is not on `PATH`, tell the user the line to add to their shell profile, and call the binary by its full path for the rest of this run.
- Found: run `recoder upgrade -p --check`. When `state` is `available`, offer once to run `recoder upgrade -p`.

### 2. Pick the review model

Run `recoder models -p`. `reviewer` is the saved pick, or null. Lines in `problems` name agents that could not list their models. Pass them on.

- `reviewer` is set: keep it unless the user asks to change it.
- `reviewer` is null: propose the strongest model in `models` and ask the user to accept it or pick another `id`. Don't favor a vendor. Never pass an id that is not in `models`.
- `models` is empty: Recoder can't see any model agent. Tell the user, pass on `problems`, and stop.

### 3. Set it up

Run `recoder init -p --global --yes`, with `--reviewer <id>` when step 2 picked a new one. It installs Recoder's own agent skill for the agents it finds, saves the review model, and checks the machine. When the user wants the setup committed with the current repository instead, run `--project` in place of `--global`. It also creates an empty `RECODER.md` for the repository's review rules.

Read `steps`. Each step with `state: "failed"` has a `fix`.

### 4. Check the machine

Run `recoder doctor -p`. On exit 4, give the user the `fix` of each check with `"ok": false` and `"required": true`, word for word, and stop. Don't sign in to providers or edit Recoder's settings yourself. A failed `sandbox` check is optional. Say that without it no code runs, so Recoder reports every bug as `unverified`.

### 5. Confirm

Tell the user the `recoder --version`, the review model, whether `doctor` passed, and each fix still open. Say that the Reviewing PRs playbook now runs a Recoder review on each PR.
