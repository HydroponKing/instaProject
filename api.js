const personalKey = "pro228";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function addPosts({ imageUrl, description, token }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      imageUrl, description
    })
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data;
    });
}

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export async function getUserPosts({ userId, token }) {
  const response = await fetch(`${postsHost}/user-posts/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: token,
    }
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении постов пользователя');
  }
  const data = await response.json();
  return data.posts;
}

export async function likePost(postId, token) {
  const response = await fetch(`${postsHost}/${postId}/like`, {
    method: 'POST',
    headers: {
      Authorization: token,
    }
  });
  if (!response.ok) {
    throw new Error('Ошибка при установке лайка');
  }
  return response.json();
}

export async function dislikePost(postId, token) {
  const response = await fetch(`${postsHost}/${postId}/dislike`, {
    method: 'POST',
    headers: {
      Authorization: token,
    }
  });
  if (!response.ok) {
    throw new Error('Ошибка при удалении лайка');
  }
  return response.json();
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Ошибка при загрузке изображения');
    }
    return response.json();
  });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

export async function toggleLike(postId, token) {
  const response = await fetch(`${postsHost}/${postId}/toggle-like`, {
    method: 'POST',
    headers: {
      Authorization: token,
    },
  });
  if (!response.ok) {
    throw new Error('Ошибка при установке лайка');
  }
  return response.json();
}
