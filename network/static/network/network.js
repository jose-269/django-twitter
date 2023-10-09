

document.addEventListener('DOMContentLoaded', function () {

  document.querySelector('#postBtn').addEventListener('click', sendPost);
  document.querySelector('#mainPost').addEventListener('keypress', handleKeyPress);
  
  document.querySelectorAll('.editPost').forEach(el => {
    el.addEventListener('click', () => {
      const postId = el.getAttribute('data-post');
      editPost(postId); 
    });
  });

  document.querySelectorAll('.closeEdit').forEach(el => {
    el.addEventListener('click', () => {
      const postId = el.getAttribute('data-post');
      closeEdit(postId); 
    });
  });

  document.querySelectorAll('.editPostBtn').forEach(el => {
      el.addEventListener('click', () => {
        const postId = el.getAttribute('data-post');
        saveEdited(postId); 
      });
    });
});

  document.querySelectorAll('.addLike').forEach(el => {
    el.addEventListener('click', () => {
      const user = el.getAttribute('data-user');
      const postId = el.getAttribute('data-post');

      addLike(user, postId)
    })

  })

  document.querySelectorAll('.removeLike').forEach(el => {
    el.addEventListener('click', () => {
      const user = el.getAttribute('data-user');
      const postId = el.getAttribute('data-post');

      unlike(user, postId)
    })

  })


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


const sendPost = async () => {
  let post = document.querySelector('#mainPost').value;
  const currentPosted = document.querySelector('#currentPosted');
  // const url = window.location.origin + '/post';
  const url = document.querySelector('#postBtn').getAttribute('data-url');
  const csrfToken = document.querySelector('input[name=csrfmiddlewaretoken]').value;
  
  if (!post.length > 0) return;
  const data = JSON.stringify({
    post,
  })
  try {
    const user = await getUser();

    const newPost = await fetch(url, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/json',
      },
      body: data
    })


    const newPostData = await newPost.json();
    const jsonDate = newPostData.post.timestamp;
    const date = new Date(jsonDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    let formattedDate = date.toLocaleString(undefined, options);
    formattedDate = formattedDate.replace('PM', 'pm');

    const newDiv = document.createElement('div')

    newDiv.innerHTML = `
                        <div class="row no-gutters">
                          <div class="col-12 post-wrapper my-4">
                            <div class="d-flex justify-content-between">
                              <div>
                                <span class="mr-2 font-weight-bold">${newPostData.post.nickname}</span>
                                <span class="username-text">@${newPostData.post.user}</span>
                              </div>
                              <span class="date-info">${formattedDate}</span>
                            </div>
                            <p class="mt-3" id="edit_${newPostData.post.id}">${post}</p>
                            <div id="editContent${newPostData.post.id}" class="d-none mt-2">
                              <div class="d-flex justify-content-end">
                                <i
                                  class="fa-solid fa-circle-xmark mb-2 pointer closeEdit"
                                  data-post="${newPostData.post.id}"
                                ></i>
                              </div>
                              <textarea class="form-control edit-post-textarea" id="textArea${newPostData.post.id}" rows="3"></textarea>

                              <button type="button" class="btn d-block ml-auto mt-4 editPostBtn" data-post="${newPostData.post.id}" >
                                save
                              </button>
                            
                            </div>

                            <i class="fa-solid fa-heart like-heart mr-3"></i>
                            <i class="fa-regular fa-heart like-heart mr-3"></i>
                            <i
                              class="fa-regular fa-pen-to-square pointer editPost"
                              data-post="${newPostData.post.id}" 
                            ></i>
                          </div>
                        </div>
                      `;
    currentPosted.append(newDiv);

      const editPostIcons = newDiv.querySelectorAll('.editPost');
      editPostIcons.forEach(icon => {
        icon.addEventListener('click', () => {
          const postId = icon.getAttribute('data-post');
          editPost(postId);
        });
      });
    
    const closePostIcon = newDiv.querySelectorAll('.closeEdit');
    closePostIcon.forEach(icon => {
        icon.addEventListener('click', () => {
          const postId = icon.getAttribute('data-post');
          closeEdit(postId);
        });
      });

    document.querySelector('#mainPost').value = '';
    
  } catch (error) {
    console.log(error)
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // prevent salto de linea enter 
    sendPost();
  }
};


const editPost = async (id) => {
  const url = window.location.origin;
  if (!id) return;

  try {
    const edit = await fetch(`${url}/get_post`, {
      method: 'POST',
      body: id
    })
    const post = await edit.json();
    document.querySelector(`#edit_${id}`).classList.add('d-none');
    document.querySelector(`#editContent${id}`).classList.remove('d-none');
    document.querySelector(`#editContent${id}`).classList.add('d-block');
    document.querySelector(`#textArea${id}`).innerHTML = post.post;
    // console.log(post)
  } catch (error) {
    console.log(error)
  }
};


const closeEdit = (id) => {
  // console.log(id)
  document.querySelector(`#edit_${id}`).classList.remove('d-none');
  document.querySelector(`#editContent${id}`).classList.remove('d-block');
  document.querySelector(`#editContent${id}`).classList.add('d-none');
}

const saveEdited = async (id) => {
  // console.log(id)
  const url = window.location.origin;
  const newPost = document.querySelector(`#textArea${id}`).value;
  if (!newPost) return;
  
  const data = JSON.stringify({
    newPost,
    id
  })

  try {
    const saved = await fetch(`${url}/save_edited_post`, {
      method: 'POST',
      body: data
    });

    document.querySelector(`#edit_${id}`).classList.remove('d-none');
    document.querySelector(`#editContent${id}`).classList.remove('d-block');
    document.querySelector(`#editContent${id}`).classList.add('d-none');
    document.querySelector(`#edit_${id}`).innerHTML = newPost
    
  } catch (error) {
    console.log(error)
  }
};

const addLike = async (userPost, postId) => {
  const url = window.location.origin;

  let likeElement = document.querySelector(`#nPost-${postId}`);
  let like = Number(likeElement.innerText); 

  like = like + 1;

  likeElement.innerText = like.toString(); 

  try {
    const body = JSON.stringify({
      postId,
      userPost,
    });

    const liked = await fetch(`${url}/like`, {
      method: 'POST',
      body
    });

    document.querySelector(`#removeLike-${postId}`).classList.remove('d-inline-block')
    document.querySelector(`#removeLike-${postId}`).classList.remove('d-none')
    document.querySelector(`#addLike-${postId}`).classList.remove('d-inline-block')
    document.querySelector(`#addLike-${postId}`).classList.add('d-none')
  } catch (error) {
    console.log(error)
  }

}

const unlike = async (userPost, postId) => {

  const url = window.location.origin;

  let likeElement = document.querySelector(`#nPost-${postId}`);
  let like = Number(likeElement.innerText); 
  
  if (like === 0) return;

  console.log(like)
  like = like - 1;

  likeElement.innerText = like.toString(); 

  try {
    const body = JSON.stringify({
      postId,
      userPost,
    });

    const unliked = await fetch(`${url}/unlike`, {
      method: 'POST',
      body
    });

    document.querySelector(`#removeLike-${postId}`).classList.remove('d-inline-block')
    document.querySelector(`#removeLike-${postId}`).classList.add('d-none')
    document.querySelector(`#addLike-${postId}`).classList.remove('d-none')
    document.querySelector(`#addLike-${postId}`).classList.add('d-inline-block')
  } catch (error) {
    console.log(error)
  }

}
