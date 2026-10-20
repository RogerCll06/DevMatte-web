(() => {
  const modal = document.querySelector("#booking-modal");
  const widget = document.querySelector("#booking-widget");
  const buttons = [...document.querySelectorAll(".btn-schedule")];
  const closeButton = modal?.querySelector(".booking-close");
  const calendlyUrl = document.body.dataset.calendlyUrl?.trim() || "";
  const cooldownKey = "devmatte-booking-last-opened";
  const cooldownMs = 5 * 60 * 1000;
  const inactivityMs = 10 * 60 * 1000;
  let trigger = null;
  let inactivityTimer = null;
  let cooldownToastTimer = null;

  if (!modal || !widget || !closeButton) return;

  const formatRemaining = (milliseconds) => {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const showToast = (message, remainingMs = 6000) => {
    let toast = document.querySelector("#booking-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "booking-toast";
      toast.className = "booking-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML = '<strong class="booking-toast-title"></strong><span class="booking-toast-detail"></span>';
      document.body.append(toast);
    }
    toast.querySelector(".booking-toast-title").textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toast.hideTimer);
    window.clearInterval(cooldownToastTimer);
    if (remainingMs > 6000) {
      const detail = toast.querySelector(".booking-toast-detail");
      const update = () => {
        const lastOpened = Number(sessionStorage.getItem(cooldownKey) || 0);
        const remaining = cooldownMs - (Date.now() - lastOpened);
        if (remaining <= 0) {
          window.clearInterval(cooldownToastTimer);
          detail.textContent = "Ya puedes solicitar una nueva sesión.";
          toast.hideTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
          return;
        }
        detail.textContent = `Podrás volver a agendar en ${formatRemaining(remaining)}.`;
      };
      update();
      cooldownToastTimer = window.setInterval(update, 1000);
    } else {
      toast.querySelector(".booking-toast-detail").textContent = "";
      toast.hideTimer = window.setTimeout(() => toast.classList.remove("visible"), remainingMs);
    }
  };

  const clearInactivityTimer = () => {
    window.clearTimeout(inactivityTimer);
    inactivityTimer = null;
  };

  const resetInactivityTimer = () => {
    if (!modal.classList.contains("visible")) return;
    clearInactivityTimer();
    inactivityTimer = window.setTimeout(() => window.closeBookingModal(), inactivityMs);
  };

  const renderWidget = () => {
    if (!calendlyUrl || widget.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = `${calendlyUrl}${calendlyUrl.includes("?") ? "&" : "?"}hide_landing_page_details=1&hide_gdpr_banner=1&background_color=0c3844&text_color=f8fafc&primary_color=5e99aa`;
    iframe.title = "Calendario para agendar una sesión técnica con DevMatte";
    iframe.loading = "lazy";
    iframe.allow = "fullscreen";
    widget.replaceChildren(iframe);
  };

  window.openBookingModal = () => {
    if (modal.classList.contains("visible")) {
      showToast("La agenda ya está abierta.", 5000);
      return;
    }
    const lastOpened = Number(sessionStorage.getItem(cooldownKey) || 0);
    const remaining = lastOpened ? cooldownMs - (Date.now() - lastOpened) : 0;
    if (remaining > 0) {
      showToast("Ya tienes un proceso de agendamiento activo o recientemente abierto.", remaining);
      return;
    }
    sessionStorage.removeItem(cooldownKey);
    sessionStorage.setItem(cooldownKey, String(Date.now()));
    trigger = document.activeElement;
    renderWidget();
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    resetInactivityTimer();
    closeButton.focus();
  };

  window.closeBookingModal = () => {
    if (!modal.classList.contains("visible")) return;
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    clearInactivityTimer();
    widget.replaceChildren();
    if (trigger instanceof HTMLElement) trigger.focus();
    trigger = null;
  };

  buttons.forEach((button) => button.addEventListener("click", window.openBookingModal));
  closeButton.addEventListener("click", window.closeBookingModal);
  modal.addEventListener("pointerdown", resetInactivityTimer);
  modal.addEventListener("keydown", resetInactivityTimer);
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://calendly.com" || event.data?.event !== "calendly.event_scheduled") return;
    sessionStorage.setItem(cooldownKey, String(Date.now()));
    window.closeBookingModal();
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) window.closeBookingModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("visible")) window.closeBookingModal();
  });
})();
