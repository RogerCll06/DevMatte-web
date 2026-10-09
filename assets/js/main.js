const projects = {
  gomedic: { title: "GoMedic", tag: "Salud digital · En producción", description: "Una experiencia de salud digital que conecta pacientes y profesionales mediante una plataforma confiable, simple y accesible.", result: "99.9% Uptime", tech: ["React", "Node.js", "AWS"] },
  creuza: { title: "Portal Creuza", tag: "E-commerce · Plataforma cloud", description: "Un portal comercial preparado para centralizar el catálogo, mejorar la conversión y acompañar el crecimiento de la operación.", result: "+50k usuarios", tech: ["React", "Node.js", "Cloud"] },
  sprrai: { title: "SprrAI", tag: "IA aplicada · Innovación", description: "Inteligencia artificial aplicada para convertir información compleja en recomendaciones claras y decisiones accionables.", result: "3x decisiones más rápidas", tech: ["Python", "AI", "Azure"] },
  etour: { title: "eTour", tag: "Turismo · Experiencia digital", description: "Una plataforma que transforma la planificación de viajes en una experiencia visual, ágil y memorable para cada visitante.", result: "+42% conversión", tech: ["Flutter", "Node.js", "Cloud"] }
};

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

const priceTable = { web: { simple: [3000, 6000], medium: [6000, 12000], complex: [12000, 25000] }, mobile: { simple: [5000, 9000], medium: [9000, 18000], complex: [18000, 35000] }, cloud: { simple: [2500, 5000], medium: [5000, 12000], complex: [12000, 25000] }, consulting: { simple: [800, 1500], medium: [1500, 3500], complex: [3500, 7000] } };
const updateEstimate = () => {
  const typeValue = $("#project-type").value;
  const complexity = $("#project-complexity").value;
  const [minimum, maximum] = priceTable[typeValue][complexity];
  const featureCount = $$(".feature-options input:checked").length;
  const multiplier = 1 + featureCount * .1;
  const estimate = [Math.round(minimum * multiplier), Math.round(maximum * multiplier)];
  const estimateLabel = `${estimate[0].toLocaleString("en-US")} — ${estimate[1].toLocaleString("en-US")}`;
  $("#estimate-value").textContent = `US$ ${estimateLabel}`;
  const features = $$(".feature-options input:checked").map((input) => input.parentElement.textContent.trim()).join(", ") || "Sin características adicionales";
  $("#estimate-whatsapp").href = `https://wa.me/51985725930?text=${encodeURIComponent(`Hola DevMatte, quiero cotizar ${$("#project-type").selectedOptions[0].textContent}, complejidad ${$("#project-complexity").selectedOptions[0].textContent}, lanzamiento ${$("#project-time").selectedOptions[0].textContent}. Características: ${features}. Estimación referencial: US$ ${estimateLabel}.`)}`;
};
$("#project-type").addEventListener("change", updateEstimate);
$("#project-complexity").addEventListener("change", updateEstimate);
$("#project-time").addEventListener("change", updateEstimate);
$$(".feature-options input").forEach((input) => input.addEventListener("change", updateEstimate));

$("#menu-toggle").addEventListener("click", () => {
  const menu = $("#nav-links");
  const expanded = menu.classList.toggle("open");
  $("#menu-toggle").setAttribute("aria-expanded", String(expanded));
});
$$(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  $("#nav-links").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
}));

$$(".filter").forEach((filter) => filter.addEventListener("click", () => {
  $$(".filter").forEach((item) => item.classList.remove("active"));
  filter.classList.add("active");
  const selected = filter.dataset.filter;
  $$(".project-card").forEach((card) => {
    card.hidden = selected !== "all" && card.dataset.category !== selected;
  });
}));

const modal = $("#project-modal");
$$(".open-project").forEach((button) => button.addEventListener("click", () => {
  const project = projects[button.closest(".project-card").dataset.project];
  $("#modal-title").textContent = project.title;
  $("#modal-tag").textContent = project.tag;
  $("#modal-description").textContent = project.description;
  $("#modal-result").textContent = project.result;
  $("#modal-tech").innerHTML = project.tech.map((technology) => `<span>${technology}</span>`).join("");
  modal.classList.add("visible");
  modal.setAttribute("aria-hidden", "false");
  $(".modal-close").focus();
}));
const closeModal = () => {
  modal.classList.remove("visible");
  modal.setAttribute("aria-hidden", "true");
};
$(".modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });

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
  $("span", button).textContent = "Enviando...";
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
    button.disabled = false;
    $("span", button).textContent = "Enviar mensaje";
  }
});
