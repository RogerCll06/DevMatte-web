(() => {
  const grid = document.querySelector("#portfolio-grid");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const projects = window.projectsData || [];

  if (!grid) return;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));

  const renderProject = (project) => `
    <article class="project-card portfolio-card" data-tilt data-category="${escapeHtml(project.category)}" data-project="${escapeHtml(project.id)}">
      <div class="sandbox-window">
        <div class="sandbox-toolbar" aria-hidden="true">
          <span class="window-dot red"></span><span class="window-dot yellow"></span><span class="window-dot green"></span>
          <span class="sandbox-address">${escapeHtml(project.demoUrl)}</span>
        </div>
        <div class="project-art">
          <img class="project-image" src="${escapeHtml(project.image)}" alt="Vista previa de ${escapeHtml(project.title)}" />
        </div>
      </div>
      <div class="project-info portfolio-info">
        <div>
          <span class="tag">${escapeHtml(project.categoryLabel)}</span>
          <h3>${escapeHtml(project.title)}</h3>
          <p class="portfolio-description">${escapeHtml(project.description)}</p>
          <div class="tech-badges">${project.stack.map((technology) => `<span>${escapeHtml(technology)}</span>`).join("")}</div>
          <span class="metric-badge">${escapeHtml(project.metrics[0])}</span>
        </div>
        <div class="portfolio-actions">
          <button class="open-project" type="button" aria-label="Explorar ${escapeHtml(project.title)}" data-project-id="${escapeHtml(project.id)}">EXPLORAR CASO</button>
          <button class="download-case-study" type="button" data-lead-project="${escapeHtml(project.id)}">DESCARGAR FICHA TÉCNICA EN PDF</button>
        </div>
      </div>
    </article>`;

  const render = (filter = "all") => {
    const visibleProjects = filter === "all" ? projects : projects.filter((project) => project.category === filter);
    grid.classList.add("portfolio-grid-transition");
    window.setTimeout(() => {
      grid.innerHTML = visibleProjects.length
        ? visibleProjects.map(renderProject).join("")
        : `<div class="portfolio-empty" role="status"><strong>Estamos actualizando este sector.</strong><p>Aún no hay casos publicados para este filtro. Conoce todos nuestros proyectos o <a href="#contacto">conversemos sobre tu desafío</a>.</p></div>`;
      grid.classList.remove("portfolio-grid-transition");
      if (window.VanillaTilt && visibleProjects.length) VanillaTilt.init(grid.querySelectorAll("[data-tilt]"), { max: 5, speed: 500, glare: true, "max-glare": .16 });
      if (window.lucide) lucide.createIcons({ root: grid });
    }, 120);
  };

  filters.forEach((filter) => filter.addEventListener("click", () => {
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render(filter.dataset.filter);
  }));

  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".open-project");
    if (!button) return;
    grid.dispatchEvent(new CustomEvent("portfolio:open", { bubbles: true, detail: { projectId: button.dataset.projectId } }));
  });

  render();
})();
