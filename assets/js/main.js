const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

lucide.createIcons();
$("#year").textContent = new Date().getFullYear();
if (window.AOS) AOS.init({ duration: 700, once: true, offset: 80 });

const typingWords = ["ventaja competitiva.", "experiencias memorables.", "resultados medibles."];
let typingIndex = 0;
let typingPosition = 0;
let deleting = false;
const typingTarget = $("#typing-text");
const type = () => {
  const word = typingWords[typingIndex];
  typingTarget.textContent = word.slice(0, typingPosition);
  typingPosition += deleting ? -1 : 1;
  if (typingPosition === word.length + 1) { deleting = true; setTimeout(type, 1400); return; }
  if (typingPosition === 0) { deleting = false; typingIndex = (typingIndex + 1) % typingWords.length; }
  setTimeout(type, deleting ? 45 : 85);
};
type();

const particleCanvas = $("#particle-canvas");
const particleContext = particleCanvas.getContext("2d");
const particles = [];
const resizeParticles = () => {
  const bounds = particleCanvas.getBoundingClientRect();
  particleCanvas.width = bounds.width * window.devicePixelRatio;
  particleCanvas.height = bounds.height * window.devicePixelRatio;
  particleContext.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
};
const createParticles = () => {
  const bounds = particleCanvas.getBoundingClientRect();
  for (let index = 0; index < 48; index += 1) particles.push({ x: Math.random() * bounds.width, y: Math.random() * bounds.height, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 });
};
const drawParticles = () => {
  const bounds = particleCanvas.getBoundingClientRect();
  particleContext.clearRect(0, 0, bounds.width, bounds.height);
  particles.forEach((particle, index) => {
    particle.x += particle.vx; particle.y += particle.vy;
    if (particle.x < 0 || particle.x > bounds.width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > bounds.height) particle.vy *= -1;
    particleContext.fillStyle = "#38bdf899"; particleContext.fillRect(particle.x, particle.y, 2, 2);
    particles.slice(index + 1).forEach((other) => {
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 125) { particleContext.strokeStyle = `rgba(56,189,248,${.18 - distance / 900})`; particleContext.beginPath(); particleContext.moveTo(particle.x, particle.y); particleContext.lineTo(other.x, other.y); particleContext.stroke(); }
    });
  });
  requestAnimationFrame(drawParticles);
};
resizeParticles(); createParticles(); drawParticles(); window.addEventListener("resize", resizeParticles);
if (window.VanillaTilt) VanillaTilt.init($$("[data-tilt]"), { max: 5, speed: 500, glare: true, "max-glare": .16 });

const counters = $$(".counter");
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.target);
    const decimals = target % 1 ? 1 : 0;
    let start = 0;
    const tick = () => {
      start += target / 45;
      counter.textContent = `${counter.dataset.prefix || ""}${Math.min(start, target).toFixed(decimals)}${counter.dataset.suffix || ""}`;
      if (start < target) requestAnimationFrame(tick);
    };
    tick(); observer.unobserve(counter);
  });
}, { threshold: .7 });
counters.forEach((counter) => counterObserver.observe(counter));

$("#menu-toggle").addEventListener("click", () => {
  const menu = $("#nav-links");
  const expanded = menu.classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(expanded));
});
$$(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  $("#nav-links").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}));

const modal = $("#project-modal");
const modalClose = modal?.querySelector(".modal-close");
let modalTrigger = null;
const openProjectModal = (projectId) => {
  const project = (window.projectsData || []).find((item) => item.id === projectId);
  if (!project || !modal) return;
  $("#modal-title").textContent = project.title;
  $("#modal-tag").textContent = project.categoryLabel;
  $("#modal-description").textContent = project.description;
  $("#modal-problem").textContent = project.problem;
  $("#modal-solution").textContent = project.solution;
  $("#modal-image").src = project.image;
  $("#modal-image").alt = `Vista previa ampliada de ${project.title}`;
  $("#modal-url").textContent = project.demoUrl.replace(/^https?:\/\//, "");
  const tech = $("#modal-tech");
  tech.replaceChildren(...project.stack.map((technology) => {
    const badge = document.createElement("span");
    badge.textContent = technology;
    return badge;
  }));
  const metrics = $("#modal-metrics");
  metrics.replaceChildren(...project.metrics.map((metric) => {
    const card = document.createElement("div");
    card.className = "modal-metric";
    const value = document.createElement("strong");
    value.textContent = metric;
    card.append(value);
    return card;
  }));
  $("#modal-whatsapp").href = `https://wa.me/51985725930?text=${encodeURIComponent(`Hola DevMatte, quiero conocer una solución similar a ${project.title}.`)}`;
  modalTrigger = document.activeElement;
  modal.classList.add("visible");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose?.focus();
};
$("#portfolio-grid").addEventListener("portfolio:open", (event) => openProjectModal(event.detail.projectId));
const closeProjectModal = () => {
  if (!modal || !modal.classList.contains("visible")) return;
  modal.classList.remove("visible");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
  modalTrigger = null;
};
modalClose?.addEventListener("click", closeProjectModal);
modal?.addEventListener("click", (event) => { if (event.target === modal) closeProjectModal(); });
$("#modal-contact").addEventListener("click", closeProjectModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("visible")) closeProjectModal();
});

const form = $("#contact-form");
const validateField = (field) => {
  const message = field.value.trim() ? "" : "Este campo es obligatorio.";
  if (field.type === "email" && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    field.classList.add("invalid");
    field.nextElementSibling.textContent = "Ingresa un correo válido.";
    return false;
  }
  field.classList.toggle("invalid", Boolean(message));
  field.nextElementSibling.textContent = message;
  return !message;
};
$$("input, textarea", form).forEach((field) => field.addEventListener("input", () => validateField(field)));
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const valid = $$("input, textarea", form).every(validateField);
  const status = $(".form-status", form);
  if (!valid) {
    status.textContent = "Revisa los campos marcados para continuar.";
    status.className = "form-status error";
    return;
  }
  const button = $("button[type=submit]", form);
  button.disabled = true;
  $("span", button).textContent = "Procesando...";
  status.textContent = "";
  try {
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "No se pudo enviar el formulario.");
    }
    form.reset();
    status.textContent = "¡Gracias! Recibimos tu mensaje y te responderemos pronto.";
    status.className = "form-status";
  } catch (error) {
    status.textContent = error.message || "No pudimos enviar el mensaje. Escríbenos a luis.yslao@devmatte.com.";
    status.className = "form-status error";
  } finally {
    window.setTimeout(() => {
      button.disabled = false;
      $("span", button).textContent = "Enviar mensaje";
    }, 60000);
  }
});
