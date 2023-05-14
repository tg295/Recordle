SHELL := /bin/bash

.PHONY: deps

deps:
	python3 -m venv venv; \
	source venv/bin/activate; \
	pip install --upgrade pip; \
	pip install --upgrade pip-tools; \
	pip-compile --upgrade --output-file requirements.txt requirements.in && \
	pip install --upgrade -r requirements.txt
ifneq ("","$(wildcard package.json)")
	npm install
endif
