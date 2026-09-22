validate:
	python scripts/validate_repo.py

status:
	python scripts/render_status.py --check

links:
	python scripts/validate_links.py

check: validate status links
