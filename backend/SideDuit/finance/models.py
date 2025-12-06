 # NOTE: We use Supabase PostgreSQL database directly for all data storage
# Django models are not used for Income/Expense tracking
# All data is stored in Supabase tables: transactions, update_logs
#
# This file is kept for Django migrations compatibility but models are not actively used

from django.db import models

# Placeholder - not used in production
# All transaction data is stored directly in Supabase
