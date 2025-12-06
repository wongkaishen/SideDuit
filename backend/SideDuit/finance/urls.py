from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_view, name='upload'),
    path('hello/', views.hello_world, name='hello_world'),
    path('dashboard/', views.dashboard_summary, name='dashboard-summary'),
]
