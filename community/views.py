from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (
    ListView, DetailView, CreateView, UpdateView, DeleteView
)
from .models import Article, Discussion, Comment, CommunityMember
from .forms import CommunityMemberForm, CommentForm

def home(request):
    featured_article = Article.objects.filter(is_featured=True).first()
    recent_articles = Article.objects.order_by('-date_posted')[:3]
    discussions = Discussion.objects.order_by('-date_posted')[:3]
    
    if request.method == 'POST':
        form = CommunityMemberForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thank you for joining our community! We will be in touch soon.')
            return redirect('community:home')
    else:
        form = CommunityMemberForm()
    
    context = {
        'featured_article': featured_article,
        'recent_articles': recent_articles,
        'discussions': discussions,
        'form': form
    }
    
    return render(request, 'community/community.html', context)

class ArticleListView(ListView):
    model = Article
    template_name = 'community/articles.html'
    context_object_name = 'articles'
    ordering = ['-date_posted']
    paginate_by = 6

class ArticleDetailView(DetailView):
    model = Article

class ArticleCreateView(LoginRequiredMixin, CreateView):
    model = Article
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

class ArticleUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Article
    fields = ['title', 'content']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

    def test_func(self):
        article = self.get_object()
        return self.request.user == article.author

class ArticleDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Article
    success_url = '/community/articles/'

    def test_func(self):
        article = self.get_object()
        return self.request.user == article.author

class DiscussionListView(ListView):
    model = Discussion
    template_name = 'community/discussions.html'
    context_object_name = 'discussions'
    ordering = ['-date_posted']
    paginate_by = 10

class DiscussionDetailView(DetailView):
    model = Discussion
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comment_form'] = CommentForm()
        return context
    
    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        discussion = self.get_object()
        comment_form = CommentForm(request.POST)
        
        if comment_form.is_valid():
            new_comment = comment_form.save(commit=False)
            new_comment.discussion = discussion
            new_comment.author = request.user
            new_comment.save()
            messages.success(request, 'Your comment has been posted!')
            return redirect('community:discussion-detail', pk=discussion.pk)
        
        return self.get(request, *args, **kwargs)

class DiscussionCreateView(LoginRequiredMixin, CreateView):
    model = Discussion
    fields = ['topic', 'description', 'icon']

    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)

@login_required
def join_community(request):
    if request.method == 'POST':
        form = CommunityMemberForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thank you for joining our community!')
            return redirect('community:home')
    else:
        form = CommunityMemberForm()
    return render(request, 'community/join.html', {'form': form})

def search_results(request):
    query = request.GET.get('q')
    if query:
        articles = Article.objects.filter(title__icontains=query) | Article.objects.filter(content__icontains=query)
        discussions = Discussion.objects.filter(topic__icontains=query) | Discussion.objects.filter(description__icontains=query)
    else:
        articles = Article.objects.none()
        discussions = Discussion.objects.none()
    
    context = {
        'articles': articles,
        'discussions': discussions,
        'query': query
    }
    return render(request, 'community/search_results.html', context)
