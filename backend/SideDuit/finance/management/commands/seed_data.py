import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from finance.models import Income, Expense

class Command(BaseCommand):
    help = 'Seeds the database with mock financial data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create a Test User
        user, created = User.objects.get_or_create(username='testuser')
        if created:
            user.set_password('password123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created user: testuser (password: password123)'))
        else:
            self.stdout.write('User testuser already exists')

        # Clear old data for this user
        Income.objects.filter(user=user).delete()
        Expense.objects.filter(user=user).delete()

        # 2. Generate Mock Income (Last 30 Days)
        platforms = ['GRAB', 'FOODPANDA', 'LALAMOVE']
        start_date = datetime.now().date() - timedelta(days=30)

        for i in range(30):
            current_date = start_date + timedelta(days=i)
            
            # Randomly decide if they worked today (80% chance)
            if random.random() > 0.2:
                # Maybe they did 1 or 2 shifts
                num_shifts = random.randint(1, 2)
                for _ in range(num_shifts):
                    platform = random.choice(platforms)
                    hours = random.uniform(3.0, 8.0) # 3 to 8 hours
                    
                    # Earnings calculation (roughly RM15-25 per hour)
                    hourly_rate = random.uniform(15.0, 25.0)
                    amount = round(hours * hourly_rate, 2)
                    
                    Income.objects.create(
                        user=user,
                        amount=amount,
                        platform=platform,
                        date=current_date,
                        hours_worked=round(hours, 1),
                        description=f"Earnings from {platform}"
                    )

        self.stdout.write(self.style.SUCCESS(f'Created Income entries for {user.username}'))

        # 3. Generate Mock Expenses
        expense_categories = ['PETROL', 'FOOD', 'MAINTENANCE', 'PHONE']
        
        for i in range(30):
            current_date = start_date + timedelta(days=i)
            
            # Daily Expenses (Petrol & Food) - if they worked
            # We can just add some random expenses regardless
            if random.random() > 0.3: # 70% chance of expense
                category = random.choice(expense_categories)
                
                amount = 0
                if category == 'PETROL':
                    amount = random.uniform(10.0, 30.0)
                elif category == 'FOOD':
                    amount = random.uniform(10.0, 25.0)
                elif category == 'PHONE':
                    # Monthly bill, maybe only once? Let's just make it random small topups
                    amount = random.uniform(5.0, 30.0)
                elif category == 'MAINTENANCE':
                    # Rare but expensive
                    if random.random() > 0.95: # 5% chance
                        amount = random.uniform(50.0, 200.0)
                    else:
                        continue # Skip if not the lucky day

                Expense.objects.create(
                    user=user,
                    amount=round(amount, 2),
                    category=category,
                    date=current_date,
                    description=f"Spent on {category}"
                )

        self.stdout.write(self.style.SUCCESS(f'Created Expense entries for {user.username}'))
        self.stdout.write(self.style.SUCCESS('Data seeding completed!'))
