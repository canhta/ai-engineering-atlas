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

check: schemas validate status learning-sources links labs
