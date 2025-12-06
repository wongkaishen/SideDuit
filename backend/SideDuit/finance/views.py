from django.shortcuts import render
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from .services import process_document, save_transactions_to_supabase, log_upload, chat_with_retirement_advisor
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .supabase_utils import SupabaseFinancialCalculator
from .rag import generate_rag_response
import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from .utils import FinancialCalculator


@csrf_exempt
def upload_view(request):
    """
    Handle file upload and processing.
    Saves data directly to Supabase.
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
                
                # Check if logging succeeded
                if upload_id is None:
                    errors.append(f"{f.name}: Failed to log upload to database.")
                    continue
                
                # Process with LLM
                transactions = process_document(f, f.name)
                
                # Save to Supabase with user_id and upload_id
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
@permission_classes([AllowAny])
def hello_world(request):
    """Health check endpoint"""
    return Response({"message": "Hello from Django SideDuit Backend!"})

@api_view(['GET'])
@permission_classes([AllowAny])
def supabase_dashboard_summary(request):
    """
    Get dashboard summary from Supabase transactions table.
    Returns total income, expenses, and estimated tax.
    
    Query params:
    - user_id: Filter by user (optional, defaults to None for all users)
    """
    try:
        # For demo purposes, use user_id from query params or default to None (all users)
        user_id = request.GET.get('user_id', None)

        calculator = SupabaseFinancialCalculator(user_id=user_id)
        summary = calculator.get_dashboard_summary()

        return Response(summary)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_activities(request):
    """
    Get recent transactions from Supabase.
    
    Query params:
    - user_id: Filter by user (optional)
    - limit: Number of activities to return (default: 5)
    """
    try:
        user_id = request.GET.get('user_id', None)
        limit = int(request.GET.get('limit', 5))

        calculator = SupabaseFinancialCalculator(user_id=user_id)
        activities = calculator.get_recent_activities(limit=limit)

        return Response({"activities": activities})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# DEPRECATED ENDPOINT - Kept for backwards compatibility
@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary(request):
    """
    DEPRECATED: This endpoint used Django models (Income/Expense).
    Use /api/dashboard-summary/ instead (uses Supabase directly).
    """
    return Response({
        "error": "This endpoint is deprecated. Use /finance/api/dashboard-summary/ instead.",
        "message": "All data is now stored in Supabase, not Django models."
    }, status=410)  # 410 Gone


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_rag(request):
    """
    RAG-powered chat endpoint for financial insights.
    
    POST body:
    {
        "query": "How much did I spend on food last month?",
        "user_id": "0"  // optional
    }
    
    Returns:
    {
        "response": "AI-generated response",
        "sources": [list of relevant transactions],
        "total_sources": 10
    }
    """
    try:
        query = request.data.get('query', '')
        user_id = request.data.get('user_id', None)
        
        if not query:
            return Response({"error": "Query is required"}, status=400)
        
        # Generate RAG response
        result = generate_rag_response(query, user_id)
        
        return Response(result)
        
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def retirement_advisor_view(request):
    """
    Generate AI retirement advice based on user input and chat history.
    """
    try:
        data = json.loads(request.body)
        
        # User profile data
        user_profile = {
            'age': data.get('age'),
            'current_savings': data.get('current_savings'),
            'monthly_contribution': data.get('monthly_contribution'),
            'retirement_age': data.get('retirement_age')
        }
        
        # Chat history (list of {role: 'user'|'model', content: '...'})
        chat_history = data.get('messages', [])
        
        advice = chat_with_retirement_advisor(user_profile, chat_history)
        
        return Response({"advice": advice})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
