class ProjectCard extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const image = this.getAttribute("image") || "";
    const link = this.getAttribute("link") || "#";
    const title = this.getAttribute("title") || "Untitled";
    const date = this.getAttribute("date") || "";
    const tags = (this.getAttribute("tags") || "").split(",");

    this.innerHTML = `
      <a class="card-link" href="${link}">
        <img class="card-image" src="${image}" alt="Project image">
        <div class="card-info">
          <div class="card-tags">
            ${tags
              .map((tag) => `<div class="card-tag">${tag.trim()}</div>`)
              .join("")}
          </div>
          <div class="card-header">
            <div class="card-title">${title}</div>
            <div class="card-date">${date}</div>
          </div>
        </div>
      </a>
    `;
  }
}

customElements.define("project-card", ProjectCard);
