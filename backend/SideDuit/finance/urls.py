from django.urls import path
from . import views

urlpatterns = [
    # Document upload and processing
    path('upload/', views.upload_view, name='upload'),
    
    # Health check
    path('hello/', views.hello_world, name='hello_world'),
    
    # Supabase API endpoints (PRIMARY - used by frontend)
    path('api/dashboard-summary/', views.supabase_dashboard_summary, name='supabase-dashboard-summary'),
    path('api/recent-activities/', views.recent_activities, name='recent-activities'),
    
    # RAG-powered chat
    path('api/chat/', views.chat_rag, name='chat-rag'),
    
    # Chat conversation management
    path('api/conversations/', views.get_conversations, name='get-conversations'),
    path('api/conversations/create/', views.create_conversation, name='create-conversation'),
    path('api/conversations/<str:conversation_id>/', views.update_conversation, name='update-conversation'),
    path('api/conversations/<str:conversation_id>/messages/', views.get_conversation_messages, name='get-conversation-messages'),
    path('api/conversations/<str:conversation_id>/delete/', views.delete_conversation, name='delete-conversation'),
    path('api/messages/save/', views.save_message, name='save-message'),
    
    # DEPRECATED: Old Django models endpoint (kept for backwards compatibility)
    path('dashboard/', views.dashboard_summary, name='dashboard-summary-deprecated'),
    path('retirement-advisor/', views.retirement_advisor_view, name='retirement_advisor'),
    path('dashboard/', views.dashboard_summary, name='dashboard-summary'),
]
