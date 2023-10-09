from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser, models.Model):
    nickname = models.CharField(max_length=50, blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='following_users')
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers_users')
    liked_posts = models.ManyToManyField('Post', related_name='liking_users')
    
    def __str__(self):
        follower_names = [follower.username for follower in self.followers.all()]
        following_names = [following.username for following in self.following.all()]
        liked_posts_str = [str(post) for post in self.liked_posts.all()]

        liked_posts_str = ', '.join(liked_posts_str)
        
        return f"{self.username}  Liked Posts: {liked_posts_str}"
        # return f"{self.nickname} | Followers: {', '.join(follower_names)} | Following: {', '.join(following_names)}"
    

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    newPost = models.CharField(max_length=512)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.id} {self.newPost} {self.timestamp}"
