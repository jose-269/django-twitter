document.addEventListener('DOMContentLoaded', function () {

  document.querySelector("#posts").addEventListener('click', showPost);
  document.querySelector("#followers").addEventListener('click', showFollowers);
  document.querySelector("#following").addEventListener('click', showFollowing);
  document.querySelector("#following").addEventListener('click', showFollowing);

  const addFollow = document.querySelector("#addFollower");
  const removeFollow = document.querySelector("#removeFollower")
  if (addFollow) document.querySelector("#addFollower").addEventListener('click', addFollower);
  if (removeFollow) document.querySelector("#removeFollower").addEventListener('click', removeFollower);

});

const getUser = async () => {
  const url = window.location.origin;

  try {
    const response = await fetch(`${url}/authenticated_user`);
    const authenticatedUser = await response.json();
    return authenticatedUser;
    
  } catch (error) {
    console.log(error)
  }
}

const addFollower = async () => {
  const url = window.location.origin;
  const userPost = document.querySelector('#addFollower').getAttribute('data-user');
  try {
    const user = await getUser();
    const data = JSON.stringify({
      user,
      userPost
  })
    const req = await fetch(`${url}/add_follower/`, {
      method: 'POST',
      body: data
    })
    if (req.status === 200) {
      const followers = await req.json();
      document.querySelector("#addFollower").classList.remove('d-block');
      document.querySelector("#addFollower").classList.add('d-none');
      document.querySelector("#removeFollower").classList.remove('d-none');
      document.querySelector("#removeFollower").classList.add('d-block');

      document.querySelector("#fetchFollowerLength").classList.remove('d-none');
      document.querySelector("#fetchFollowerLength").classList.add('d-block');
      document.querySelector("#fetchFollowerLength").innerHTML = `${followers.followers} Followers`;

      document.querySelector("#followerLength").classList.add('d-none');

    }
    showFollowers()
    
  } catch (error) {
    console.log(error)
  }
};

const removeFollower = async () => {
  const url = window.location.origin;
  const userPost = document.querySelector('#addFollower').getAttribute('data-user');
  try {
    const user = await getUser();
    const data = JSON.stringify({
      user,
      userPost
    })
    const req = await fetch(`${url}/remove_follower/`, {
      method: 'POST',
      body: data
    });

    if (req.status === 200) {
      const followers = await req.json();
      document.querySelector("#addFollower").classList.remove('d-none');
      document.querySelector("#addFollower").classList.add('d-block');
      document.querySelector("#removeFollower").classList.remove('d-block');
      document.querySelector("#removeFollower").classList.add('d-none');

      document.querySelector("#fetchFollowerLength").classList.remove('d-none');
      document.querySelector("#fetchFollowerLength").classList.add('d-block');
      document.querySelector("#fetchFollowerLength").innerHTML = `${followers.followers} Followers`;

      document.querySelector("#followerLength").classList.add('d-none');
      
    }
    showFollowers()

  } catch (error) {
    console.log(error)
  }
}


const showPost = async () => { 
  document.querySelector('#posts').classList.add('active');
  document.querySelector('#followers').classList.remove('active');
  document.querySelector('#following').classList.remove('active');
  document.querySelector('#postRow').classList.add('d-block');
  document.querySelector('#followersWarpper').classList.remove('d-block');
  document.querySelector('#followingWarpper').classList.remove('d-block');
  document.querySelector('#followersWarpper').classList.add('d-none');
  document.querySelector('#followingWarpper').classList.add('d-none');

}

const showFollowers = async () => {
  document.querySelector('#followers').classList.add('active');
  document.querySelector('#posts').classList.remove('active');
  document.querySelector('#following').classList.remove('active');
  document.querySelector('#followersWarpper').classList.add('d-block');
  document.querySelector('#postRow').classList.remove('d-block');
  document.querySelector('#followingWarpper').classList.remove('d-block');
  document.querySelector('#postRow').classList.add('d-none');
  document.querySelector('#followingWarpper').classList.add('d-none');

  const url = window.location.origin;
  const userPost = document.querySelector('#followers').getAttribute('data-user');
    document.querySelector('#followersSpinner').classList.remove('d-none');
    document.querySelector('#followersSpinner').classList.add('d-inline-block');

  try {
    const data = JSON.stringify({
      userPost
    });
    const req = await fetch(`${url}/get_followers/`, {
      method: 'POST',
      body: data
    });
    const res = await req.json();
    const followers = document.querySelector('#followersInnerWarpper');
    
     followers.innerHTML = ''
    
    
    res.followers.forEach(el => {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = `
        <div class="row no-gutters">
          <div class="col-12 post-wrapper my-4">
            <div class="d-flex ">
            <a href="${url}/profile/${el.username}" class="mr-3 font-weight-bold profile-link">${el.nickname}</a>
            <span class="username-text">@${el.username}</span>
            
            </div>
          </div>
        </div>

      `
      followers.appendChild(newDiv)
    })
    document.querySelector('#followersSpinner').classList.remove('d-inline-block');
    document.querySelector('#followersSpinner').classList.add('d-none');
    // console.log(res.followers)
    
  } catch (error) {
    console.log(error)
  }
  
}

const showFollowing = async () => {
  document.querySelector('#following').classList.add('active');
  document.querySelector('#followers').classList.remove('active');
  document.querySelector('#posts').classList.remove('active');
  document.querySelector('#followersWarpper').classList.add('d-none');
  document.querySelector('#followersWarpper').classList.remove('d-block');
  document.querySelector('#postRow').classList.add('d-none');
  document.querySelector('#postRow').classList.remove('d-block');
  document.querySelector('#followingWarpper').classList.add('d-block');
  document.querySelector('#followingWarpper').classList.remove('d-none');

  const url = window.location.origin;
  const userPost = document.querySelector('#followers').getAttribute('data-user');
    document.querySelector('#followingSpinner').classList.remove('d-none');
    document.querySelector('#followingSpinner').classList.add('d-inline-block');

  try {
    const data = JSON.stringify({
      userPost
    });
    const req = await fetch(`${url}/get_following/`, {
      method: 'POST',
      body: data
    });
    const res = await req.json();
    const followers = document.querySelector('#followingInnerWarpper');
    
     followers.innerHTML = ''
    
    
    res.following.forEach(el => {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = `
        <div class="row no-gutters">
          <div class="col-12 post-wrapper my-4">
            <div class="d-flex ">
            <a href="${url}/profile/${el.username}" class="mr-3 font-weight-bold profile-link">${el.nickname}</a>
            <span class="username-text">@${el.username}</span>
            
            </div>
          </div>
        </div>

      `
      followers.appendChild(newDiv)
    })
    document.querySelector('#followingSpinner').classList.remove('d-inline-block');
    document.querySelector('#followingSpinner').classList.add('d-none');

    console.log(res)
    
  } catch (error) {
    console.log(error)
  }
  
}