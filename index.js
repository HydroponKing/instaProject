import { getPosts, getUserPosts, toggleLike } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { renderHeaderComponent } from "./components/header-component.js"; // Импорт функции для рендеринга заголовка

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          console.log("Posts loaded:", posts); // Логирование постов
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      console.log("Открываю страницу пользователя: ", data.userId);
      page = LOADING_PAGE;
      renderApp();

      return getUserPosts({ userId: data.userId, token: getToken() })
        .then((userPosts) => {
          page = USER_POSTS_PAGE;
          posts = userPosts;
          console.log("User posts loaded:", posts); // Логирование постов пользователя
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // TODO: реализовать добавление поста в API
        console.log("Добавляю пост...", { description, imageUrl });
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderUserPostsPageComponent({
      appEl,
      posts,
    });
  }
};

const calculateTotalLikes = (posts) => {
  return posts.reduce((total, post) => total + post.likes, 0);
};

const formatDistanceToNow = (date) => {
  const now = new Date();
  const diff = Math.abs(now - date);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} минут назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} часов назад`;
  const days = Math.floor(hours / 24);
  return `${days} дней назад`;
};

const renderUserPostsPageComponent = ({ appEl, posts }) => {
  const user = posts.length > 0 ? posts[0].user : null;
  const lastPostDateElement = posts.length > 0 ? posts[0].createdAt : 'нет постов';
  const lastPostDate = formatDistanceToNow(new Date(lastPostDateElement));

  const userHtml = user ? `
    <div class="user-profile">
      <img src="${user.imageUrl}" class="user-profile__avatar">
      <div class="user-profile__info">
        <p class="user-profile__name"><strong>${user.name}</strong></p>
        <p class="user-profile__last-post">Последний пост был: <strong>${lastPostDate}</strong></p>
      </div>
    </div>
  ` : '';

  const postsHtml = posts.map(post => `
    <li class="post">
      <div class="post-header" data-user-id="${post.user.id}">
        <img src="${post.user.imageUrl}" class="post-header__user-image">
        <p class="post-header__user-name">${post.user.name}</p>
      </div>
      <div class="post-image-container">
        <img class="post-image" src="${post.imageUrl}">
      </div>
      <div class="post-likes">
        <button data-post-id="${post.id}" class="like-button">
          <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
        </button>
        <p class="post-likes-text">
          Нравится: <strong>${post.likes}</strong>
        </p>
      </div>
      <p class="post-text">
        <span class="user-name">${post.user.name}</span>
        ${post.description}
      </p>
      <p class="post-date">
        ${formatDistanceToNow(new Date(post.createdAt))}
      </p>
    </li>
  `).join('');

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      ${userHtml}
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  document.querySelectorAll(".post-header").forEach(userEl => {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, { userId: userEl.dataset.userId });
    });
  });

  document.querySelectorAll(".like-button").forEach(likeButton => {
    likeButton.addEventListener("click", async () => {
      const postId = likeButton.dataset.postId;
      await toggleLike(postId, getToken());
      renderUserPostsPageComponent({ appEl, posts });
    });
  });
};

goToPage(POSTS_PAGE);
