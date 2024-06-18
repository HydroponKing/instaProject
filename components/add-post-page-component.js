export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    // TODO: Реализовать добавления поста в апи
    const appHtml = `
    <div class="page-container">
        <div class="header-container"></div>
        <div class="page-header">
          <h1 class="logo">instapro</h1>
          <button class="header-button add-or-login-button"></button>
          <button title="Админ" class="header-button logout-button">Выйти</button>  
        </div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="form-inputs">
            <div class="upload-image-container">
              <div class="upload-image">
                <label class="file-upload-label secondary-button">
                  <input type="file" class="file-upload-input" style="display:none">
                  Выберите фото
                </label>
              </div>
            </div>
            <label>
              Опишите фотографию:
              <textarea class="input textarea" rows="4"></textarea>
            </label>
            <button class="button" id="add-button">Добавить</button>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    document.getElementById("add-button").addEventListener("click", () => {
      onAddPostClick({
        description: "Описание картинки",
        imageUrl: "https://image.png",
      });
    });
  };

  render();
}
