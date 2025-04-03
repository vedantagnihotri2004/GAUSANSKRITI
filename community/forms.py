from django import forms
from .models import CommunityMember, Comment

class CommunityMemberForm(forms.ModelForm):
    class Meta:
        model = CommunityMember
        fields = ['name', 'email', 'farm_name', 'interests']
        widgets = {
            'interests': forms.Textarea(attrs={'rows': 4}),
        }

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['content']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Join the discussion...'}),
        }
        labels = {
            'content': 'Your Comment',
        }
