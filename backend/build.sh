#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r SideDuit/SideDuit/requirements.txt

# Collect static files
cd SideDuit
python manage.py collectstatic --no-input

# Run migrations (if needed)
python manage.py migrate --no-input
