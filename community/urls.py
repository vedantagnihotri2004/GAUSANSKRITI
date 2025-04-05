from django.urls import path
from . import views
from .views import (
    ArticleListView, ArticleDetailView, ArticleCreateView, ArticleUpdateView, 
    ArticleDeleteView, DiscussionListView, DiscussionDetailView, DiscussionCreateView
)

app_name = 'community'

urlpatterns = [
    path('', views.home, name='home'),
    path('join/', views.join_community, name='join'),
    path('search/', views.search_results, name='search'),
    
    # Article URLs
    path('articles/', ArticleListView.as_view(), name='articles'),
    path('article/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
    path('article/new/', ArticleCreateView.as_view(), name='article-create'),
    path('article/<int:pk>/update/', ArticleUpdateView.as_view(), name='article-update'),
    path('article/<int:pk>/delete/', ArticleDeleteView.as_view(), name='article-delete'),
    
    # Discussion URLs
    path('discussions/', DiscussionListView.as_view(), name='discussions'),
    path('discussion/<int:pk>/', DiscussionDetailView.as_view(), name='discussion-detail'),
    path('discussion/new/', DiscussionCreateView.as_view(), name='discussion-create'),
]
