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
    
    # DEPRECATED: Old Django models endpoint (kept for backwards compatibility)
    path('dashboard/', views.dashboard_summary, name='dashboard-summary-deprecated'),
]
