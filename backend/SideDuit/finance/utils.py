from django.db.models import Sum, F
from django.db.models.functions import Coalesce
from decimal import Decimal

class FinancialCalculator:
    def __init__(self, user):
        self.user = user

    def get_summary(self, start_date=None, end_date=None):
        """
        Calculate key financial metrics for the user within a date range.
        If no dates provided, calculates for all time.
        """
        incomes = self.user.incomes.all()
        expenses = self.user.expenses.all()

        if start_date:
            incomes = incomes.filter(date__gte=start_date)
            expenses = expenses.filter(date__gte=start_date)
        
        if end_date:
            incomes = incomes.filter(date__lte=end_date)
            expenses = expenses.filter(date__lte=end_date)

        # 1. Total Aggregates
        total_income = incomes.aggregate(total=Coalesce(Sum('amount'), Decimal('0.00')))['total']
        total_expenses = expenses.aggregate(total=Coalesce(Sum('amount'), Decimal('0.00')))['total']
        total_hours = incomes.aggregate(total=Coalesce(Sum('hours_worked'), Decimal('0.00')))['total']

        # 2. Net Income
        net_income = total_income - total_expenses

        # 3. Net Hourly Rate (The "True Wage")
        # Avoid division by zero
        net_hourly_rate = (net_income / total_hours) if total_hours > 0 else Decimal('0.00')

        # 4. Expense Ratio (How much of earnings is eaten by costs)
        expense_ratio = (total_expenses / total_income * 100) if total_income > 0 else Decimal('0.00')

        # 5. Projected Monthly Income (Fix: Only use current month's data)
        from datetime import datetime
        today = datetime.now()
        current_month_income = incomes.filter(date__year=today.year, date__month=today.month).aggregate(total=Coalesce(Sum('amount'), Decimal('0.00')))['total']
        
        projected_income = self.get_projected_monthly_income(current_month_income)

        # 6. Tax Estimation (Simple Tiered)
        # Use projected monthly * 12 to estimate annual
        estimated_tax = self.estimate_tax(projected_income * 12) 

        return {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "net_income": round(net_income, 2),
            "total_hours_worked": round(total_hours, 1),
            "net_hourly_rate": round(net_hourly_rate, 2),
            "expense_ratio_percentage": round(expense_ratio, 1),
            "projected_monthly_income": round(projected_income, 2),
            "estimated_annual_tax": round(estimated_tax, 2)
        }

    def get_projected_monthly_income(self, current_income):
        """
        Predict end-of-month income based on current progress.
        Formula: (Income / Days Passed) * Total Days in Month
        """
        from datetime import datetime
        import calendar

        today = datetime.now()
        # total days in current month
        _, num_days = calendar.monthrange(today.year, today.month)
        days_passed = today.day

        if days_passed == 0: return Decimal('0.00')

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
        # 0 - 5,000: 0%
        # 5,001 - 20,000: 1%
        # 20,001 - 35,000: 3%
        # 35,001 - 50,000: 6%
        # 50,001 - 70,000: 11%
        # 70,001 - 100,000: 19%
        # > 100,000: 25% (Capped for simplicity)

        brackets = [
            (5000, 0.00),
            (15000, 0.01), # Next 15k
            (15000, 0.03), # Next 15k
            (15000, 0.06), # Next 15k
            (20000, 0.11), # Next 20k
            (30000, 0.19), # Next 30k
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

    def get_platform_breakdown(self):
        """
        Compare performance across different platforms (Grab vs FoodPanda etc)
        """
        # This is a bit more complex, we need to group by platform
        from django.db.models import Avg
        
        breakdown = self.user.incomes.values('platform').annotate(
            total_earned=Sum('amount'),
            total_hours=Sum('hours_worked'),
            avg_hourly_raw=Avg(F('amount') / F('hours_worked'))
        ).order_by('-total_earned')

        return list(breakdown)
