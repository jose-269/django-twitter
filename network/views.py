import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.paginator import Paginator

from .models import *


def index(request):
    posts = Post.objects.all().order_by('-timestamp')
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    
    return render(request, "network/index.html", {
        "posts": page_obj,
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        nickname = request.POST["nickname"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.nickname = nickname
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")

def allPosts(request):
    posts = Post.objects.all().order_by('-timestamp')
    
    paginator = Paginator(posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    
    return render(request, "network/posts.html", {
        "posts": page_obj,
    })
    
def following(request, user):
    
    user = User.objects.get(username=user)
    following = user.following.all()
    # print(following)
    
    following_posts = []
    
    for post in following:
        following_post = post.posts.all()
        following_posts.extend(following_post)
        
    paginator = Paginator(following_posts, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
        
    
    return render(request, 'network/following.html', {
        "posts":  page_obj
    })
    
def profile(request, profile):
    # print(request.user)
    user_profile = User.objects.filter(username=profile).first()
    userPost = Post.objects.filter(user=user_profile).order_by('-timestamp')
    followers = user_profile.followers.all()
    following = user_profile.following.all()
    
    
    # print(len(following))
    
    return render(request, "network/profile.html", {
       "user_profile": user_profile,
       "userPost": userPost,
       "len_followers": len(followers),
       "len_following": len(following)
    })
 
@csrf_exempt    
def addFollower(request):
   if request.method == "POST":
       
       try:
            follower_data = json.loads(request.body)
            userPost = User.objects.get(username=follower_data['userPost'])
            
            user = request.user
            userDB = User.objects.get(username=user.username)
            if user not in userPost.followers.all() and user != userPost:
                userPost.followers.add(user)
                userDB.following.add(userPost)
                followers = userPost.followers.all()
                response = {'followers': len(followers)}
                return JsonResponse(response)
            # for f in userPost.followers.all():
            #     print(f.username)
                # print(userPost.followers.all())
            return JsonResponse({"message": "Follower recibida exitosamente"})
       except:
        return JsonResponse({"message": "Follower no recibida"})

@csrf_exempt 
def removeFollower(request):
    if request.method == 'POST':
        try:
            follower_data = json.loads(request.body)
            userPost = User.objects.get(username=follower_data['userPost'])
            
            user = request.user
            userDB = User.objects.get(username=user.username)
            if user in userPost.followers.all() and user != userPost:
                userPost.followers.remove(user)
                userDB.following.remove(userPost)
                followers = userPost.followers.all()
                response = {'followers': len(followers)}
                return JsonResponse(response)
            # for f in userPost.followers.all():
            #     print(f.username)
                print(userPost.followers.all())
                return JsonResponse({"message": "Follower removed succesfully"})
            else:
                return JsonResponse({"message": "User is not a follower"})
        
        except:
            return JsonResponse({"message": "Follower no recibida"})
        
    

@csrf_exempt
def getAuthenticatedUser(request):
    if request.method == "GET":
        authenticated_user = {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "nickname": request.user.nickname,
        }
        
        return JsonResponse(authenticated_user)
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

@csrf_exempt
def post(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user = request.user
            comment = data.get('post')
            if comment:
                posting = Post(user=user, newPost=comment)
                posting.save()    
                print(posting)
                return JsonResponse({"post": {
                    "id": posting.id,
                    "user": posting.user.username,
                    "nickname": posting.user.nickname,
                    "timestamp": posting.timestamp 
                    }
                })
                # return JsonResponse({"message": "Publication received successfully"})
            else:
                return JsonResponse({"error": "Comment not provided."}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)

@csrf_exempt
def getFollowers(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # print(data)
            userPost = User.objects.get(username=data['userPost'])
            followers = userPost.followers.all()
            print(len(followers))
            response = {'followers': [{'username': follower.username, 'nickname': follower.nickname} for follower in followers]}
            return JsonResponse(response)
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)
    
    
@csrf_exempt
def getFollowing(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # print(data)
            userPost = User.objects.get(username=data['userPost'])
            following = userPost.following.all()
            response = {'following': [{'username': follow.username, 'nickname': follow.nickname} for follow in following]}
            return JsonResponse(response)
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)
   
   
@csrf_exempt    
def getPost(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            post = Post.objects.get(id = data)
            response = {"post": post.newPost}
            
            return JsonResponse(response)
            # return JsonResponse({"message": "Follower removed succesfully"})
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)
    

@csrf_exempt      
def saveEditedPost(request):
    if request.method == "POST":
        
        try:
            data = json.loads(request.body)
            post_user = Post.objects.get(id=data['id'])
            user= request.user
            # print(post_user.user)
            
            if(user == post_user.user):
                post_user.newPost = data['newPost']
                post_user.save()
            return JsonResponse({"message": "Post saved succesfully"})
            
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)
        
        

@csrf_exempt 
def liked(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            user_post = User.objects.get(username=data['userPost'])
            post_id = Post.objects.get(id=data['postId'])
            
            user_post.liked_posts.add(post_id)
            
            return JsonResponse({"message": "Post saved succesfully"})
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)
    

@csrf_exempt 
def unlike(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            
            user_post = User.objects.get(username=data['userPost'])
            post_id = data['postId']
            post = Post.objects.get(id=post_id)
            
            user_post.liked_posts.remove(post)
            
            # liked_post = user_post.liked_posts.filter(id=post_id)
            # if liked_post.exists():
            #     liked_post.first().delete()
            
            return JsonResponse({"message": "Post saved succesfully"})
        except:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
    
    else:
        return JsonResponse({"error": "A POST request is required."}, status=400)