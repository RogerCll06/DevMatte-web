(() => {
  const modal = document.querySelector("#lead-magnet-modal");
  const form = document.querySelector("#lead-magnet-form");
  const grid = document.querySelector("#portfolio-grid");
  if (!modal || !form || !grid) return;

  const projectNames = Object.fromEntries((window.projectsData || []).map((project) => [project.id, project.title]));
  const status = form.querySelector(".lead-form-status");
  const close = () => { modal.hidden = true; form.reset(); status.textContent = ""; };

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lead-project]");
    if (!button) return;
    const projectId = button.dataset.leadProject;
    form.elements.projectId.value = projectId;
    modal.querySelector("#lead-modal-project").textContent = `Completa tus datos para recibir la ficha de ${projectNames[projectId] || "este caso"}.`;
    modal.hidden = false;
    form.elements.nombre.focus();
  });
  modal.querySelectorAll("[data-lead-close]").forEach((element) => element.addEventListener("click", close));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector("[type='submit']");
    submit.disabled = true;
    status.textContent = "Preparando tu ficha técnica...";
    try {
      const response = await fetch("/api/lead-magnet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "No se pudo generar la ficha técnica.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `devmatte-${form.elements.projectId.value}-ficha-tecnica.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      close();
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
})();
