import { USER_POSTS_PAGE, POSTS_PAGE, AUTH_PAGE } from "../routes.js"; // Добавлен импорт POSTS_PAGE
import { renderHeaderComponent } from "./header-component.js";
import { getPosts, toggleLike } from "../api.js";
import { goToPage, posts, getToken, user } from "../index.js"; // Импорт функции getToken

export function renderPostsPageComponent({ appEl }) {
    console.log("Актуальный список постов:", posts);

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

    const postsHtml = posts.map(post => `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
          <img src="${post.user.imageUrl}" class="post-header__user-image">
          <p class="post-header__user-name">${post.user.name.replace(/<.*?>/g, '')}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" class="like-button">
            <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${post.likes.length}</strong>
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${post.user.name.replace(/<.*?>/g, '')}</span>
          ${post.description.replace(/<.*?>/g, '')}
        </p>
        <p class="post-date">
          ${formatDistanceToNow(new Date(post.createdAt))}
        </p>
      </li>
    `).join('');
    

    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
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
        if (!user) {
          return goToPage(AUTH_PAGE); // Перенаправление на страницу авторизации
        }
        const postId = likeButton.dataset.postId;
        const post = posts.find(post => post.id === postId);
        await toggleLike(postId, post.isLiked, getToken());
        goToPage(POSTS_PAGE); // Обновляем страницу после изменения лайка
      });
    });
}