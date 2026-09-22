schemas:
	python scripts/validate_schemas.py

validate:
	python scripts/validate_repo.py

status:
	python scripts/render_status.py --check

links:
	python scripts/validate_links.py

labs:
	python scripts/validate_labs.py

check: schemas validate status links labs
