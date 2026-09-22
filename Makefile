validate:
	python scripts/validate_repo.py

links:
	python scripts/validate_links.py

check: validate links
