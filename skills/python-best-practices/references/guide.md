# Python

Applies to every Python codebase: services, scripts, notebooks that get committed, and tooling.

## Toolchain

**uv runs everything.** No exceptions, including one-off scripts and Dockerfiles.

| Task | Use | Never |
|---|---|---|
| New project | `uv init` | `python -m venv`, cookiecutter templates with their own tooling |
| Python version | `uv python pin 3.13` (writes `.python-version`) | pyenv, system Python, conda |
| Add a dependency | `uv add <pkg>`, `uv add --dev <pkg>` | `pip install`, editing `requirements.txt` |
| Install | `uv sync`; `uv sync --locked` in CI and Docker | `pip install -r`, `poetry install` |
| Run anything | `uv run pytest`, `uv run python -m app` | activating the venv by hand in scripts |
| One-off tools | `uvx <tool>` | `pipx`, global installs |
| Single-file scripts | inline metadata (`uv add --script`), run with `uv run script.py` | a shared global environment |

- Dependencies live in `pyproject.toml`. Commit `uv.lock`; never edit it by hand.
- No `requirements.txt`, `setup.py`, `setup.cfg`, Poetry, Pipenv, or conda files. If one exists, migrate it to `pyproject.toml` in its own PR.
- **Ruff** formats and lints (`uv run ruff format`, `uv run ruff check`), configured in `pyproject.toml` with `line-length = 100`. No Black, isort, or flake8.
- **Type checking** with Astral's `ty` (`uv run ty check`) is part of the check command. No mypy or Pyright.
- **Tests** with pytest.

The check command is:

```sh
uv sync --locked && uv run ruff format --check && uv run ruff check && uv run ty check && uv run pytest
```

## Style

- Type hints on every function signature. No `Any` without a comment saying why it's safe.
- Validate at the boundary with Pydantic (or `pydantic-settings` for the environment), and pass typed models inward.
- Read the environment in one settings module, loaded once at startup.
- `pathlib` for paths, `logging` (not `print`) in anything that isn't a script's output.
- Async code takes timeouts on every external call.

## Docker

Copy uv from its official image and install from the lockfile:

```dockerfile
# Pin uv to the version the lockfile was made with.
COPY --from=ghcr.io/astral-sh/uv:<version> /uv /bin/uv
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project
COPY . .
RUN uv sync --locked --no-dev
```

Run as a non-root user with a fixed UID, as in [deploy.md](deploy.md).

## Tests

`test_*.py` files beside the code or in `tests/`, following the repository's existing layout. Use fixtures and `tmp_path` instead of touching real files, and inject clients instead of hitting the network. See [testing.md](testing.md).
