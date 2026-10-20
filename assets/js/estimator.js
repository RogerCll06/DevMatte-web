(() => {
  const form = document.querySelector("#estimator-form");
  const wizard = document.querySelector(".estimator-wizard");
  if (!form || !wizard) return;

  const steps = [...wizard.querySelectorAll(".wizard-step")];
  const progress = [...wizard.querySelectorAll(".wizard-progress-step")];
  const success = wizard.querySelector(".wizard-success");
  const status = wizard.querySelector(".wizard-status");
  const estimates = {
    web: { base: [1500, 3500], weeks: "4 — 6 semanas", label: "Web Enterprise / Sistema Web" },
    mobile: { base: [4000, 9000], weeks: "8 — 12 semanas", label: "App Móvil (iOS / Android)" },
    custom: { base: [3000, 7500], weeks: "6 — 10 semanas", label: "Software a Medida / Backend Architecture" },
    cloud: { base: [2500, 6500], weeks: "4 — 8 semanas", label: "Migración e Infraestructura Cloud" }
  };
  const featureLabels = { auth: "Autenticación y roles avanzados", payments: "Pasarelas de pago en línea", analytics: "Dashboard y reportes en tiempo real", ai: "Integración con Inteligencia Artificial", admin: "Panel administrativo" };
  let currentStep = 1;

  const formatMoney = (amount) => amount.toLocaleString("en-US");
  const selectedType = () => form.querySelector("input[name='solutionType']:checked")?.value;
  const selectedFeatures = () => [...form.querySelectorAll("input[name='features']:checked")].map((input) => input.value);
  const updateEstimate = () => {
    const estimate = estimates[selectedType()] || estimates.web;
    const multiplier = 1 + selectedFeatures().length * .15;
    const minimum = Math.round(estimate.base[0] * multiplier);
    const maximum = Math.round(estimate.base[1] * multiplier);
    wizard.querySelector("#wizard-estimate-value").textContent = `US$ ${formatMoney(minimum)} — ${formatMoney(maximum)}`;
    wizard.querySelector("#wizard-estimate-time").textContent = estimate.weeks;
    return { minimum, maximum, weeks: estimate.weeks, label: estimate.label };
  };
  const showStep = (stepNumber) => {
    currentStep = stepNumber;
    steps.forEach((step) => {
      const active = Number(step.dataset.step) === stepNumber;
      step.hidden = !active;
      step.classList.toggle("active", active);
    });
    progress.forEach((item) => {
      const value = Number(item.dataset.progress);
      item.classList.toggle("active", value === stepNumber);
      item.classList.toggle("complete", value < stepNumber);
    });
  };
  const validateContact = () => {
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const message = !field.value.trim() ? "Este campo es obligatorio." : field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value) ? "Ingresa un correo válido." : "";
      field.classList.toggle("invalid", Boolean(message));
      field.nextElementSibling.textContent = message;
      valid = valid && !message;
    });
    return valid;
  };
  wizard.querySelectorAll(".wizard-next").forEach((button) => button.addEventListener("click", () => {
    if (currentStep === 1 && !selectedType()) {
      wizard.querySelector("[data-error='solutionType']").textContent = "Selecciona una solución para continuar.";
      return;
    }
    wizard.querySelector("[data-error='solutionType']").textContent = "";
    if (currentStep === 2) updateEstimate();
    showStep(Math.min(3, currentStep + 1));
  }));
  wizard.querySelectorAll(".wizard-back").forEach((button) => button.addEventListener("click", () => showStep(Math.max(1, currentStep - 1))));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateContact()) return;
    const estimate = updateEstimate();
    const payload = { solutionType: selectedType(), solutionLabel: estimate.label, features: selectedFeatures(), featureLabels: selectedFeatures().map((feature) => featureLabels[feature]), estimate, contact: Object.fromEntries(new FormData(form).entries()) };
    status.textContent = "Enviando tu solicitud...";
    status.className = "wizard-status";
    const submit = form.querySelector("[type='submit']");
    submit.disabled = true;
    const originalSubmitLabel = submit.firstChild;
    if (originalSubmitLabel) originalSubmitLabel.textContent = "Procesando... ";
    try {
      const response = await fetch("/api/estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo enviar la cotización.");
      wizard.querySelector("#wizard-whatsapp").href = `https://wa.me/51985725930?text=${encodeURIComponent(`Hola DevMatte, envié una solicitud de cotización para ${estimate.label}.`)}`;
      form.hidden = true;
      wizard.querySelector(".wizard-progress").hidden = true;
      success.hidden = false;
    } catch (error) {
      status.textContent = error.message;
      status.className = "wizard-status error";
    } finally {
      window.setTimeout(() => {
        submit.disabled = false;
        if (originalSubmitLabel) originalSubmitLabel.textContent = "Enviar Solicitud de Cotización Oficial ";
      }, 60000);
    }
  });
  wizard.querySelector(".wizard-reset").addEventListener("click", () => {
    form.reset(); form.hidden = false; success.hidden = true; wizard.querySelector(".wizard-progress").hidden = false; status.textContent = ""; showStep(1);
  });
  form.querySelectorAll("input[name='solutionType'], input[name='features']").forEach((input) => input.addEventListener("change", updateEstimate));
  if (window.lucide) lucide.createIcons({ root: wizard });
})();
