(() => {
  const chatbot = document.querySelector("#corporate-chatbot");
  if (!chatbot) return;
  const panel = chatbot.querySelector(".chatbot-panel");
  const toggle = chatbot.querySelector(".chatbot-toggle");
  const close = () => { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); };
  toggle.setAttribute("aria-expanded", "false");
  toggle.addEventListener("click", () => { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); });
  chatbot.querySelector("[data-chat-close]").addEventListener("click", close);
  chatbot.querySelectorAll("[data-chat-action]").forEach((button) => button.addEventListener("click", () => {
    if (button.disabled) return;
    button.disabled = true;
    const action = button.dataset.chatAction;
    window.setTimeout(() => {
      if (action === "estimate") document.querySelector("#estimator-section")?.scrollIntoView({ behavior: "smooth" });
      if (action === "portfolio") document.querySelector("#proyectos")?.scrollIntoView({ behavior: "smooth" });
      if (action === "whatsapp") window.open("https://wa.me/51985725930?text=Hola%20Luis%2C%20quiero%20conversar%20sobre%20un%20proyecto%20digital.", "_blank", "noopener,noreferrer");
      close();
      button.disabled = false;
    }, 1200);
  }));
  if (window.lucide) lucide.createIcons({ root: chatbot });
})();
