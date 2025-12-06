from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from .utils import FinancialCalculator

@api_view(['GET'])
@permission_classes([AllowAny]) # For hackathon demo simplicity, allowing any (or use IsAuthenticated if you login)
def dashboard_summary(request):
    # For demo purposes, if no user is logged in, use the 'testuser' we seeded
    if request.user.is_authenticated:
        user = request.user
    else:
        user = User.objects.filter(username='testuser').first()
        if not user:
            return Response({"error": "No test user found. Run seed_data first."}, status=404)

    calculator = FinancialCalculator(user)
    summary = calculator.get_summary()
    
    return Response(summary)

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django SideDuit Backend!"})
