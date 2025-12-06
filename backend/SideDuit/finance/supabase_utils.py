from decimal import Decimal
from datetime import datetime
import calendar
from .db_pool import get_db_connection, release_db_connection


class SupabaseFinancialCalculator:
    """
    Financial calculator that queries Supabase transactions table directly.
    """

    def __init__(self, user_id=None):
        """
        Initialize calculator for a specific user.
        If user_id is None, calculates for all users (demo mode).
        """
        self.user_id = str(user_id) if user_id is not None else None

    def get_dashboard_summary(self):
        """
        Get financial summary for dashboard:
        - Total income
        - Total expenses
        - Estimated tax
        """
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            # Query to calculate total income and expenses
            query = """
            SELECT
                transaction_type,
                SUM(transaction_amount) as total
            FROM public.transactions
            WHERE 1=1
            """
            params = []

            # Filter by user if specified
            if self.user_id:
                query += " AND user_id = %s"
                params.append(self.user_id)

            query += " GROUP BY transaction_type"

            cur.execute(query, params)
            results = cur.fetchall()

            # Process results
            total_income = Decimal('0.00')
            total_expenses = Decimal('0.00')

            for row in results:
                transaction_type = row[0]
                amount = Decimal(str(row[1]))

                if transaction_type.lower() == 'income':
                    total_income = amount
                elif transaction_type.lower() == 'expense':
                    total_expenses = amount

            # Calculate projected monthly income
            projected_income = self.get_projected_monthly_income(cur, self.user_id)

            # Estimate tax based on projected annual income
            estimated_tax = self.estimate_tax(projected_income * 12)

            cur.close()

            return {
                "total_income": float(round(total_income, 2)),
                "total_expenses": float(round(total_expenses, 2)),
                "net_income": float(round(total_income - total_expenses, 2)),
                "projected_monthly_income": float(round(projected_income, 2)),
                "estimated_annual_tax": float(round(estimated_tax, 2))
            }

        except Exception as e:
            print(f"Error calculating dashboard summary: {e}")
            raise e
        finally:
            if conn:
                release_db_connection(conn)

    def get_projected_monthly_income(self, cur, user_id):
        """
        Calculate projected monthly income based on current month's data.
        Formula: (Income / Days Passed) * Total Days in Month
        """
        today = datetime.now()
        _, num_days = calendar.monthrange(today.year, today.month)
        days_passed = today.day

        if days_passed == 0:
            return Decimal('0.00')

        # Get income for current month only
        query = """
        SELECT SUM(transaction_amount) as current_income
        FROM public.transactions
        WHERE transaction_type = 'Income'
        AND EXTRACT(YEAR FROM date) = %s
        AND EXTRACT(MONTH FROM date) = %s
        """
        params = [today.year, today.month]

        if user_id:
            query += " AND user_id = %s"
            params.append(user_id)

        cur.execute(query, params)
        result = cur.fetchone()

        current_income = Decimal(str(result[0])) if result[0] else Decimal('0.00')

        # Calculate projection
        daily_average = current_income / Decimal(days_passed)
        projected = daily_average * Decimal(num_days)

        return projected

    def estimate_tax(self, annual_income):
        """
        Simple Malaysian Tax Estimator (2024 Rates - Simplified)
        """
        income = float(annual_income)
        tax = 0

        # Tax Relief (Standard Individual Relief)
        income -= 9000

        if income <= 0:
            return Decimal('0.00')

        # Progressive Tax Rates (Simplified)
        brackets = [
            (5000, 0.00),
            (15000, 0.01),  # Next 15k
            (15000, 0.03),  # Next 15k
            (15000, 0.06),  # Next 15k
            (20000, 0.11),  # Next 20k
            (30000, 0.19),  # Next 30k
            (float('inf'), 0.25)
        ]

        for bracket_size, rate in brackets:
            if income > 0:
                taxable_amount = min(income, bracket_size)
                tax += taxable_amount * rate
                income -= taxable_amount
            else:
                break

        return Decimal(str(tax))

    def get_recent_activities(self, limit=5):
        """
        Get recent transactions with upload information.
        Returns list of recent activities sorted by creation date.
        """
        conn = None
        try:
            conn = get_db_connection()
            cur = conn.cursor()

            query = """
            SELECT
                t.id,
                t.date,
                t.time,
                t.transaction_type,
                t.transaction_amount,
                t.created_at,
                ul.upload_document_name,
                ul.created_at as upload_date
            FROM public.transactions t
            LEFT JOIN public.update_logs ul ON t.upload_id = ul.upload_id
            WHERE 1=1
            """
            params = []

            # Filter by user if specified
            if self.user_id:
                query += " AND t.user_id = %s"
                params.append(self.user_id)

            query += """
            ORDER BY t.created_at DESC
            LIMIT %s
            """
            params.append(limit)

            cur.execute(query, params)
            results = cur.fetchall()

            activities = []
            for row in results:
                activity = {
                    "id": row[0],
                    "date": row[1].strftime("%Y-%m-%d") if row[1] else None,
                    "time": str(row[2]) if row[2] else None,
                    "transaction_type": row[3],
                    "amount": float(row[4]) if row[3].lower() == 'income' else -float(row[4]),
                    "created_at": row[5].isoformat() if row[5] else None,
                    "document_name": row[6],
                    "upload_date": row[7].isoformat() if row[7] else None,
                }
                activities.append(activity)

            cur.close()
            return activities

        except Exception as e:
            print(f"Error fetching recent activities: {e}")
            raise e
        finally:
            if conn:
                release_db_connection(conn)

