from django.db import models
from django.contrib.auth.models import User

class Income(models.Model):
    PLATFORM_CHOICES = [
        ('GRAB', 'Grab'),
        ('FOODPANDA', 'FoodPanda'),
        ('LALAMOVE', 'Lalamove'),
        ('SHOPEEFOOD', 'ShopeeFood'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, default='OTHER')
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=4, decimal_places=1, help_text="Hours spent working for this income")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} - RM{self.amount} ({self.date})"

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('PETROL', 'Petrol'),
        ('MAINTENANCE', 'Vehicle Maintenance'),
        ('FOOD', 'Meals while working'),
        ('PHONE', 'Data/Phone Bill'),
        ('EQUIPMENT', 'Equipment/Gear'),
        ('OTHER', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - RM{self.amount} ({self.date})"
