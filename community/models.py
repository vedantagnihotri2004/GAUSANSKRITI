from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    farm_name = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    interests = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(default='default.jpg', upload_to='profile_pics')

    def __str__(self):
        return f'{self.user.username} Profile'

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('community:article-detail', kwargs={'pk': self.pk})

class Discussion(models.Model):
    topic = models.CharField(max_length=200)
    description = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    icon = models.CharField(max_length=50, default='fa-leaf') # Font Awesome icon name

    def __str__(self):
        return self.topic

    def get_absolute_url(self):
        return reverse('community:discussion-detail', kwargs={'pk': self.pk})

class Comment(models.Model):
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Comment by {self.author.username} on {self.discussion.topic}'

class CommunityMember(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    farm_name = models.CharField(max_length=100, blank=True)
    interests = models.TextField()
    date_joined = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name
