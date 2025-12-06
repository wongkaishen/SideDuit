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
from datetime import datetime
import sys


@api_view(['GET'])
@permission_classes([AllowAny])
def root_view(request):
    """
    Root endpoint - Backend health check.
    Returns system information and status.
    """
    return Response({
        'status': 'success',
        'message': 'Backend is running perfectly! 🚀',
        'service': 'SideDuit Financial API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'python_version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        'endpoints': {
            'dashboard': '/finance/api/dashboard/',
            'upload': '/finance/upload/',
            'chat': '/finance/api/chat/',
            'conversations': '/finance/api/conversations/',
            'retirement_advisor': '/finance/retirement-advisor/',
            'all_transactions': '/finance/api/all-transactions/',
        },
        'documentation': 'https://github.com/wongkaishen/SideDuit',
    })


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
    except Exception as e:
        return Response({"error": str(e)}, status=500)
        
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


# Chat Conversation Management Endpoints

@api_view(['POST'])
@permission_classes([AllowAny])
def create_conversation(request):
    """
    Create a new conversation.
    
    POST body:
    {
        "user_id": "optional_user_id",
        "title": "New Chat" (optional)
    }
    
    Returns:
    {
        "conversation_id": "uuid",
        "created_at": "timestamp"
    }
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        user_id = request.data.get('user_id', None)
        title = request.data.get('title', 'New Chat')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO conversations (user_id, title)
            VALUES (%s, %s)
            RETURNING id, created_at
        """, [user_id, title])
        
        result = cur.fetchone()
        conn.commit()
        
        release_db_connection(conn)
        
        return Response({
            "conversation_id": str(result[0]),
            "created_at": result[1].isoformat()
        })
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversations(request):
    """
    Get all conversations for a user.
    
    Query params:
    - user_id: Filter by user (optional)
    - limit: Number of conversations to return (default: 50)
    - include_archived: Include archived conversations (default: false)
    
    Returns:
    {
        "conversations": [
            {
                "id": "uuid",
                "title": "Chat title",
                "created_at": "timestamp",
                "updated_at": "timestamp",
                "message_count": 10,
                "last_message_at": "timestamp"
            }
        ]
    }
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        user_id = request.GET.get('user_id', None)
        limit = int(request.GET.get('limit', 50))
        include_archived = request.GET.get('include_archived', 'false').lower() == 'true'
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT 
                c.id,
                c.user_id,
                c.title,
                c.created_at,
                c.updated_at,
                c.is_archived,
                COUNT(m.id) as message_count,
                MAX(m.created_at) as last_message_at
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            WHERE 1=1
        """
        params = []
        
        if user_id:
            query += " AND c.user_id = %s"
            params.append(user_id)
        
        if not include_archived:
            query += " AND c.is_archived = false"
        
        query += """
            GROUP BY c.id, c.user_id, c.title, c.created_at, c.updated_at, c.is_archived
            ORDER BY c.updated_at DESC
            LIMIT %s
        """
        params.append(limit)
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        conversations = []
        for row in results:
            conversations.append({
                "id": str(row[0]),
                "user_id": row[1],
                "title": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
                "is_archived": row[5],
                "message_count": row[6],
                "last_message_at": row[7].isoformat() if row[7] else None
            })
        
        release_db_connection(conn)
        
        return Response({"conversations": conversations})
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_conversation_messages(request, conversation_id):
    """
    Get all messages for a specific conversation.
    
    Returns:
    {
        "messages": [
            {
                "id": "uuid",
                "role": "user|assistant",
                "content": "message text",
                "created_at": "timestamp",
                "sources": []
            }
        ]
    }
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, role, content, created_at, sources
            FROM messages
            WHERE conversation_id = %s
            ORDER BY created_at ASC
        """, [conversation_id])
        
        results = cur.fetchall()
        
        messages = []
        for row in results:
            messages.append({
                "id": str(row[0]),
                "role": row[1],
                "content": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "sources": row[4] if row[4] else []
            })
        
        release_db_connection(conn)
        
        return Response({"messages": messages})
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def save_message(request):
    """
    Save a message to a conversation.
    
    POST body:
    {
        "conversation_id": "uuid",
        "role": "user|assistant",
        "content": "message text",
        "sources": [] (optional)
    }
    
    Returns:
    {
        "message_id": "uuid",
        "created_at": "timestamp"
    }
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        conversation_id = request.data.get('conversation_id')
        role = request.data.get('role')
        content = request.data.get('content')
        sources = request.data.get('sources', [])
        
        if not all([conversation_id, role, content]):
            return Response({"error": "conversation_id, role, and content are required"}, status=400)
        
        if role not in ['user', 'assistant']:
            return Response({"error": "role must be 'user' or 'assistant'"}, status=400)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO messages (conversation_id, role, content, sources)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        """, [conversation_id, role, content, json.dumps(sources)])
        
        result = cur.fetchone()
        conn.commit()
        
        release_db_connection(conn)
        
        return Response({
            "message_id": str(result[0]),
            "created_at": result[1].isoformat()
        })
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_conversation(request, conversation_id):
    """
    Update a conversation (title, archive status, etc.).
    
    PUT body:
    {
        "title": "New title" (optional),
        "is_archived": true|false (optional)
    }
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        title = request.data.get('title')
        is_archived = request.data.get('is_archived')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        updates = []
        params = []
        
        if title is not None:
            updates.append("title = %s")
            params.append(title)
        
        if is_archived is not None:
            updates.append("is_archived = %s")
            params.append(is_archived)
        
        if not updates:
            return Response({"error": "No fields to update"}, status=400)
        
        params.append(conversation_id)
        query = f"UPDATE conversations SET {', '.join(updates)} WHERE id = %s RETURNING updated_at"
        
        cur.execute(query, params)
        result = cur.fetchone()
        conn.commit()
        
        release_db_connection(conn)
        
        return Response({
            "updated_at": result[0].isoformat() if result else None
        })
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_conversation(request, conversation_id):
    """
    Delete a conversation and all its messages.
    """
    from .db_pool import get_db_connection, release_db_connection
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("DELETE FROM conversations WHERE id = %s", [conversation_id])
        conn.commit()
        
        release_db_connection(conn)
        
        return Response({"success": True})
    except Exception as e:
        if conn:
            release_db_connection(conn)
        return Response({"error": str(e)}, status=500)
