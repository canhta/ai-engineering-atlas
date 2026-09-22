validate:
	python scripts/validate_repo.py

status:
	python scripts/render_status.py --check

links:
	python scripts/validate_links.py

labs:
	python scripts/validate_labs.py

check: validate status links labs
