(() => {
  const calculator = document.querySelector("[data-roi-calculator]");
  if (!calculator) return;
  const fields = Object.fromEntries(["employees", "weeklyHours", "monthlySalary", "currency", "automation"].map((name) => [name, calculator.querySelector(`[name="${name}"]`)]));
  const outputs = Object.fromEntries(["employees", "weeklyHours", "automation"].map((name) => [name, calculator.querySelector(`[data-roi-output="${name}"]`)]));
  const results = Object.fromEntries(["savings", "hours", "efficiency", "payback", "solution"].map((name) => [name, calculator.querySelector(`[data-roi-result="${name}"]`)]));
  const cta = calculator.querySelector("[data-roi-cta]");
  const status = calculator.querySelector(".roi-status");
  const sendButton = calculator.querySelector("[data-roi-send]");
  const emailModal = document.querySelector("[data-roi-email-modal]");
  const emailForm = emailModal?.querySelector("[data-roi-email-form]");
  const emailInput = emailModal?.querySelector("[name='email']");
  const emailError = emailModal?.querySelector("[data-roi-email-error]");
  let modalTrigger = null;
  const exchangeRate = 3.75;
  const solutions = {
    web: ["Web Enterprise / Sistema Web", 3500],
    mobile: ["App Móvil (iOS / Android)", 9000],
    custom: ["Software a Medida / Backend Architecture", 7500],
    cloud: ["Migración e Infraestructura Cloud", 6500]
  };
  const money = (amount, currency) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

  const calculate = () => {
    const employees = Number(fields.employees.value);
    const weeklyHours = Number(fields.weeklyHours.value);
    const monthlySalary = Number(fields.monthlySalary.value) || 0;
    const currency = fields.currency.value;
    const automation = Number(fields.automation.value) / 100;
    const salaryInUsd = currency === "PEN" ? monthlySalary / exchangeRate : monthlySalary;
    const annualCostUsd = employees * weeklyHours * 4 * (salaryInUsd / 160) * 12;
    const annualSavingsUsd = annualCostUsd * automation;
    const annualHours = employees * weeklyHours * 52 * automation;
    const selectedType = document.querySelector("input[name='solutionType']:checked")?.value || "custom";
    const [solutionLabel, solutionCostUsd] = solutions[selectedType];
    const savingsInCurrency = currency === "PEN" ? annualSavingsUsd * exchangeRate : annualSavingsUsd;
    const payback = annualSavingsUsd > 0 ? solutionCostUsd / annualSavingsUsd * 12 : 0;
    outputs.employees.textContent = employees;
    outputs.weeklyHours.textContent = weeklyHours;
    outputs.automation.textContent = `${Math.round(automation * 100)}%`;
    results.savings.textContent = money(savingsInCurrency, currency);
    results.hours.textContent = `${Math.round(annualHours).toLocaleString("en-US")} h`;
    results.efficiency.textContent = `+${Math.round(automation * 100)}%`;
    results.payback.textContent = `${payback.toFixed(1)} meses`;
    results.solution.textContent = `Según: ${solutionLabel}`;
    const message = `Hola Luis, quiero revisar este diagnóstico ROI para ${solutionLabel}: ahorro anual estimado ${money(savingsInCurrency, currency)}, ${Math.round(annualHours)} horas recuperadas al año y payback de ${payback.toFixed(1)} meses.`;
    cta.href = `https://wa.me/51985725930?text=${encodeURIComponent(message)}`;
    return { employees, weeklyHours, monthlySalary, currency, automation, annualSavings: savingsInCurrency, savedHours: annualHours, paybackMonths: payback, solutionLabel };
  };

  calculator.querySelectorAll("input, select").forEach((field) => field.addEventListener("input", calculate));
  document.querySelectorAll("input[name='solutionType']").forEach((field) => field.addEventListener("change", calculate));
  const closeEmailModal = () => {
    if (!emailModal) return;
    emailModal.hidden = true;
    document.body.classList.remove("modal-open");
    emailError.textContent = "";
    emailInput.classList.remove("invalid");
    if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
    modalTrigger = null;
  };

  sendButton?.addEventListener("click", () => {
    const diagnostic = calculate();
    if (!emailModal) return;
    modalTrigger = document.activeElement;
    emailModal.hidden = false;
    document.body.classList.add("modal-open");
    emailInput.focus();
    emailModal.dataset.diagnostic = JSON.stringify(diagnostic);
  });
  emailModal?.querySelectorAll("[data-roi-email-close]").forEach((button) => button.addEventListener("click", closeEmailModal));
  emailModal?.addEventListener("click", (event) => { if (event.target === emailModal) closeEmailModal(); });
  emailForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = "Ingresa un correo corporativo válido.";
      emailInput.classList.add("invalid");
      emailInput.focus();
      return;
    }
    emailError.textContent = "";
    emailInput.classList.remove("invalid");
    const submit = emailForm.querySelector("[type='submit']");
    submit.disabled = true;
    submit.querySelector("span").textContent = "Preparando informe...";
    status.textContent = "Estamos preparando tu diagnóstico...";
    try {
      const diagnostic = JSON.parse(emailModal.dataset.diagnostic || "{}");
      const response = await fetch("/api/roi-diagnostic", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...diagnostic, email }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo registrar el diagnóstico.");
      closeEmailModal();
      status.textContent = "Diagnóstico enviado. Revisa tu correo para consultar el resumen.";
    } catch (error) {
      status.textContent = error.message || "No se pudo enviar el diagnóstico.";
    } finally {
      submit.disabled = false;
      submit.querySelector("span").textContent = "Enviar informe";
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && emailModal && !emailModal.hidden) closeEmailModal();
  });
  calculate();
})();
