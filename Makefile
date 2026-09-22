# `schemas` and `labs` are also directory names; without .PHONY make skips them as up to date.
.PHONY: schemas validate status learning-sources links labs site-data agent-docs site-check check format lint hooks

schemas:
	python scripts/validate_schemas.py

validate:
	python scripts/validate_repo.py

status:
	python scripts/render_status.py --check

learning-sources:
	python scripts/render_learning_sources.py --check

links:
	python scripts/validate_links.py

labs:
	python scripts/validate_labs.py

site-data:
	python scripts/build_site_data.py --check

agent-docs:
	python scripts/validate_agent_docs.py

# Formatting and linting. Python: ruff. Everything else: prettier and eslint from site/node_modules,
# run from here so one config at the repository root covers the whole tree.
PRETTIER = site/node_modules/.bin/prettier

format:
	ruff check --fix .
	ruff format .
	$(PRETTIER) --write .
	cd site && pnpm exec eslint . --fix

lint:
	ruff check .
	ruff format --check .
	$(PRETTIER) --check .
	cd site && pnpm exec eslint .

# Git hooks: ruff, prettier, and eslint on commit; `make check` on push.
hooks:
	pre-commit install --install-hooks

# Web atlas (Node 26 + pnpm). Separate from `check` so curriculum work needs only Python.
site-check:
	cd site && pnpm install --frozen-lockfile && pnpm run check && pnpm run test:labs && pnpm run test:e2e

check: schemas validate status learning-sources links labs site-data agent-docs
