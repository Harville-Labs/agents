---
name: python-best-practices
description: Python best practices. Use when reading or editing any .py file or pyproject.toml.
paths: ["**/*.py", "**/pyproject.toml"]
disable-model-invocation: true
---

# Python best practices

Apply the **type-system-discipline** principle skill first.

| Rule | Summary |
|------|---------|
| uv runs everything | Python versions, environments, dependencies, the lockfile, and every command go through uv. Never `pip install`, `requirements.txt`, `setup.py`, Poetry, Pipenv, or conda. |
| One manifest | Dependencies live in `pyproject.toml`. Commit `uv.lock` and never edit it by hand. Migrate any other manifest in its own PR. |
| Ruff and ty | `ruff format` and `ruff check` with `line-length = 100`, and `ty check` for types. No Black, isort, flake8, mypy, or Pyright. |
| One check command | `uv sync --locked && uv run ruff format --check && uv run ruff check && uv run ty check && uv run pytest`. |
| Typed signatures | Type hints on every function signature. `Any` needs a comment saying why it's safe. |
| Pydantic at the boundary | Parse external input with Pydantic, and the environment with `pydantic-settings` in one settings module loaded at startup. Pass typed models inward. |
| Standard tools | `pathlib` for paths. `logging`, not `print`, outside a script's output. A timeout on every external async call. |
| Docker from the lockfile | Copy uv from its pinned image and `uv sync --locked --no-dev`. Run as a non-root user with a fixed UID. |
| Hermetic pytest | `test_*.py` beside the code or in `tests/`. Use fixtures and `tmp_path`, and inject clients instead of touching the network. |

Toolchain table, Dockerfile, and details: `references/guide.md`.
