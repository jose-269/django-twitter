
from django.urls import path

from . import views

app_name = 'network'

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.allPosts, name="allPosts"),
    path("profile/<str:profile>", views.profile, name="profile"),
    path("following/<str:user>", views.following, name="following"),
    
    
    
    #API Routes
    path('post', views.post, name="post"),
    path('authenticated_user/', views.getAuthenticatedUser, name='authenticated_user'),
    path('add_follower/', views.addFollower, name='add_follower'),
    path('remove_follower/', views.removeFollower, name='remove_follower'),
    path('get_followers/', views.getFollowers, name='get_followers'),
    path('get_following/', views.getFollowing, name='get_following'),
    path('get_post', views.getPost, name='get_post'),
    path('save_edited_post', views.saveEditedPost, name='save_edited_post'),
    path('like', views.liked, name='like'),
    path('unlike', views.unlike, name='unlike'),
    
]
