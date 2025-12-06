from django.shortcuts import render
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .services import process_document, save_transactions_to_supabase, log_upload, generate_retirement_plan
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from .utils import FinancialCalculator



@csrf_exempt
def upload_view(request):
    """
    Handle file upload and processing.
    
    For multi-user apps, add @login_required decorator and pass request.user.id
    """
    if request.method == 'POST':
        files = request.FILES.getlist('documents')
        
        if not files:
            messages.error(request, "No files selected.")
            return render(request, 'finance/upload.html')
            
        total_processed = 0
        errors = []
        
        # Get user_id if authenticated, otherwise None for testing
        user_id = request.user.id if request.user.is_authenticated else None
        
        for f in files:
            try:
                # Log the upload first and get the ID
                upload_id = log_upload(f, f.name, user_id)
                
                # Process with LLM
                transactions = process_document(f, f.name)
                
                # Save to DB with user_id and upload_id
                if transactions:
                    count = save_transactions_to_supabase(transactions, user_id=user_id, upload_id=upload_id)
                    total_processed += count
                else:
                    errors.append(f"{f.name}: No transactions found or parsing failed.")
                    
            except Exception as e:
                errors.append(f"{f.name}: {str(e)}")
        
        if total_processed > 0:
            messages.success(request, f"Successfully processed {total_processed} transactions.")
        
        if errors:
            for err in errors:
                messages.error(request, err)
                
    return render(request, 'finance/upload.html')

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

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def retirement_advisor_view(request):
    """
    Generate AI retirement advice based on user input.
    """
    try:
        data = json.loads(request.body)
        age = data.get('age')
        current_savings = data.get('current_savings')
        monthly_contribution = data.get('monthly_contribution')
        retirement_age = data.get('retirement_age')
        
        advice = generate_retirement_plan(age, current_savings, monthly_contribution, retirement_age)
        
        return Response({"advice": advice})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
