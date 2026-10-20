require("dotenv").config();

const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3000);
const destinationEmail = "fitdeskdev@gmail.com";
const senderEmail = process.env.EMAIL_USER || destinationEmail;
const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID || "1323595967510535";
const whatsappApiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";
const whatsappVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
const leadMagnetProjects = new Map([
  ["gomedic", { title: "Plataforma GoMedic", category: "Salud", summary: "Sistema integral de gestión médica, telemedicina y control de citas en tiempo real.", problem: "La operación médica estaba fragmentada entre canales de atención y herramientas sin sincronización.", solution: "Plataforma centralizada con agenda en tiempo real, telemedicina y flujos operativos integrados.", stack: ["Node.js", "React", "AWS", "WebSockets", "MySQL"], metrics: ["99.9% Uptime", "40% menos espera", "+15k consultas/mes"] }],
  ["creuza", { title: "Portal Creuza", category: "Enterprise", summary: "Plataforma empresarial para la gestión operativa, analítica de datos y automatización de procesos.", problem: "Los equipos dependían de procesos manuales y reportes dispersos para coordinar la operación.", solution: "Portal empresarial modular con automatizaciones, analítica operativa y una capa de datos preparada para crecer.", stack: ["Node.js", "Vue.js", "PostgreSQL", "Docker"], metrics: ["+60% eficiencia", "Tiempo real", "ISO-compliant"] }],
  ["sprrai", { title: "Plataforma SprrAI", category: "Inteligencia artificial", summary: "Solución basada en inteligencia artificial para análisis predictivo y procesamiento automatizado.", problem: "El análisis de información requería revisión manual y no permitía detectar patrones con suficiente anticipación.", solution: "Solución de IA con procesamiento automatizado, servicios especializados e interfaz para explorar resultados.", stack: ["Python", "Node.js", "OpenAI API", "React"], metrics: ["85% automatización", "<200ms respuesta", "Modelos propios"] }],
  ["etour", { title: "Plataforma eTour", category: "Turismo", summary: "Portal turístico interactivo con gestión de itinerarios, reservas inteligentes y mapas dinámicos.", problem: "La planificación turística estaba repartida entre múltiples herramientas sin conectar inspiración, itinerario y reserva.", solution: "Experiencia multiplataforma con itinerarios personalizados, mapas dinámicos y pagos integrados.", stack: ["Node.js", "React Native", "MongoDB", "Mapbox API"], metrics: ["+100k descargas", "4.8/5 rating", "Pagos integrados"] }]
]);

app.use(express.json({ limit: "25kb" }));
app.use(cors());
app.use(express.static(__dirname));

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const createTransporter = () => nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: senderEmail,
    pass: process.env.EMAIL_PASS
  }
});

const logoPath = path.join(__dirname, "assets", "images", "logo_DevMatte.webp");
const logoAttachment = {
  filename: "logo-devmatte.webp",
  path: logoPath,
  cid: "devmatte-logo"
};

const brandedEmail = ({ eyebrow, title, intro, content }) => `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{margin:0;padding:32px 16px;background:#eef3f5;color:#17313d;font-family:Arial,'Segoe UI',sans-serif}
  .shell{max-width:680px;margin:0 auto;background:#fff;border:1px solid #dce7eb;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(13,59,76,.12)}
  .header{padding:28px 32px;background:linear-gradient(135deg,#082f3d,#0d5668);border-bottom:4px solid #d5b56b}
  .brand{display:inline-block;background:#fff;border-radius:8px;padding:6px 10px}.brand img{display:block;width:150px;height:auto}
  .eyebrow{margin:24px 0 8px;color:#d5b56b;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase}
  h1{margin:0;color:#fff;font-size:25px;line-height:1.2}.intro{margin:10px 0 0;color:#c9dfe5;font-size:14px;line-height:1.6}
  .content{padding:30px 32px}.section-title{margin:0 0 12px;color:#0d3b4c;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
  table{width:100%;border-collapse:collapse}.data td{padding:11px 0;border-bottom:1px solid #e6eef0;font-size:14px;vertical-align:top}
  .label{width:36%;color:#6d838c;font-weight:700}.value{color:#17313d}.value a{color:#16758b;text-decoration:none}
  .panel{margin:24px 0;padding:18px 20px;background:#f4f8f9;border:1px solid #dce9ec;border-left:4px solid #d5b56b;border-radius:10px;color:#294650;font-size:14px;line-height:1.7}
  .metric-table td{width:50%;padding:15px;background:#f8faf9;border:6px solid #fff}.metric-label{display:block;color:#6d838c;font-size:11px}.metric-value{display:block;margin-top:5px;color:#0d5668;font-size:19px;font-weight:700}
  ul{margin:0;padding-left:20px;color:#294650;line-height:1.8}.footer{padding:20px 32px;background:#f4f8f9;color:#71858d;font-size:11px;line-height:1.6;text-align:center}
</style></head>
<body><div class="shell"><div class="header"><div class="brand"><img src="cid:devmatte-logo" alt="DevMatte"></div>
<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="intro">${intro}</p></div>
<div class="content">${content}</div><div class="footer"><strong>DevMatte</strong> · Ingeniería digital para negocios ambiciosos<br>
Este mensaje fue generado desde www.devmatte.com · Responde directamente a este correo para continuar la conversación.</div>
</div></body></html>`;

const normalizePhoneNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
};

const sendWhatsAppMessage = async (recipient, body) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumber = normalizePhoneNumber(recipient);

  if (!token || !whatsappPhoneId) {
    console.warn("WhatsApp no está configurado; se omitió la notificación.");
    return { sent: false, skipped: true };
  }
  if (!phoneNumber) {
    console.warn("WhatsApp no recibió un número internacional válido; se omitió la notificación.");
    return { sent: false, skipped: true };
  }

  const response = await fetch(`https://graph.facebook.com/${whatsappApiVersion}/${encodeURIComponent(whatsappPhoneId)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "text",
      text: { preview_url: false, body: String(body).slice(0, 4096) }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Meta rechazó la notificación de WhatsApp:", response.status, errorBody.slice(0, 1000));
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
};

const notifyWhatsApp = async (recipient, body) => {
  try {
    return await sendWhatsAppMessage(recipient, body);
  } catch (error) {
    console.error("Error al enviar la notificación de WhatsApp:", error);
    return { sent: false, skipped: false };
  }
};

const createLeadMagnetPdf = (project) => new Promise((resolve) => {
  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `${project.title} | DevMatte`, Author: "DevMatte" } });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => resolve(Buffer.concat(chunks)));
  const teal = "#0c3844";
  const darkTeal = "#004459";
  const cyan = "#5e99aa";
  const silver = "#cbd5e1";
  const charcoal = "#0f172a";
  const light = "#f8fafc";
  const margin = 42.52;
  const width = 511;
  const logoPath = path.join(__dirname, "assets", "images", "logo_DevMatte.png");
  const text = (value, x, y, options = {}) => doc.font(options.font || "Helvetica").fontSize(options.size || 10).fillColor(options.color || charcoal).text(value, x, y, { width: options.width, lineGap: options.lineGap || 2, align: options.align || "left" });
  const card = (x, y, w, h, color = "#ffffff") => doc.roundedRect(x, y, w, h, 8).fillAndStroke(color, silver);
  const sectionTitle = (value, x, y) => text(value.toUpperCase(), x, y, { size: 8, font: "Helvetica-Bold", color: darkTeal, width: 220 });
  const drawPill = (value, x, y, w) => { doc.roundedRect(x, y, w, 20, 10).fill("#e4f0f3"); text(value, x + 8, y + 6, { size: 8, font: "Helvetica-Bold", color: darkTeal, width: w - 16 }); };

  doc.rect(0, 0, 595, 842).fill(light);
  doc.opacity(0.045).font("Helvetica-Bold").fontSize(42).fillColor(teal).text("DEVMATTE CONFIDENCIAL", 92, 410, { rotate: 45 });
  doc.opacity(1);
  doc.rect(0, 0, 595, 148).fill(teal);
  doc.rect(0, 0, 595, 74).fill(darkTeal);
  doc.rect(0, 144, 595, 4).fill(cyan);
  doc.image(logoPath, margin, 25, { fit: [145, 64], align: "left", valign: "center" });
  text("FICHA TÉCNICA | CASO DE ÉXITO", 360, 40, { size: 9, font: "Helvetica-Bold", color: "#ffffff", width: 190, align: "right", lineGap: 4 });
  text(project.title, margin, 93, { size: 24, font: "Helvetica-Bold", color: "#ffffff", width: 350 });
  drawPill(`Sector ${project.category}`, 415, 104, 138);
  text("Miembro Activo de la Cámara de Comercio de Lima (CCL)", margin, 158, { size: 8, color: "#64748b", width: width });
  sectionTitle("El desafío", margin, 187);
  sectionTitle("Solución e ingeniería aplicada", 309, 187);
  card(margin, 204, 244, 108, "#ffffff");
  card(309, 204, 244, 108, "#ffffff");
  text(project.problem, 56, 222, { size: 9.5, width: 216, lineGap: 3 });
  text(project.solution, 323, 222, { size: 9.5, width: 216, lineGap: 3 });
  sectionTitle("Stack tecnológico", margin, 337);
  card(margin, 354, width, 58, "#ffffff");
  project.stack.forEach((item, index) => drawPill(item, 56 + ((index % 4) * 116), 372 + (Math.floor(index / 4) * 0), 104));
  sectionTitle("Métricas de impacto", margin, 441);
  const metricWidth = 161;
  project.metrics.forEach((metric, index) => {
    const x = margin + (index * 175);
    card(x, 458, metricWidth, 74, index === 1 ? "#e4f0f3" : "#ffffff");
    text(metric, x + 12, 480, { size: 13, font: "Helvetica-Bold", color: teal, width: metricWidth - 24, align: "center", lineGap: 2 });
  });
  sectionTitle("Resumen ejecutivo", margin, 562);
  text(project.summary, margin, 580, { size: 10.5, width: width, lineGap: 4 });
  doc.rect(0, 720, 595, 122).fill(teal);
  text("¿Deseas implementar una arquitectura similar en tu organización?", margin, 744, { size: 15, font: "Helvetica-Bold", color: "#ffffff", width: 510 });
  text("Conversemos sobre el siguiente desafío de tu negocio.", margin, 770, { size: 10, color: "#bae6fd", width: 510 });
  text("Luis Yslao — CEO  |  luis.yslao@devmatte.com  |  +51 985 725 930  |  www.devmatte.com", margin, 795, { size: 8.5, color: "#ffffff", width: width });
  text("Miembro Activo de la Cámara de Comercio de Lima (CCL)", margin, 816, { size: 8, color: "#bae6fd", width: width });
  doc.end();
});

app.post("/api/lead-magnet", async (req, res) => {
  const { projectId, nombre, email, empresa } = req.body || {};
  const project = leadMagnetProjects.get(String(projectId || "").toLowerCase());

  if (!project || !nombre || !empresa || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""))) {
    return res.status(400).json({ error: "Completa nombre, correo válido, empresa y selecciona un caso de éxito." });
  }

  console.info("Lead magnet solicitado:", {
    projectId: String(projectId),
    nombre: String(nombre).trim().slice(0, 120),
    email: String(email).trim().slice(0, 160),
    empresa: String(empresa).trim().slice(0, 160)
  });

  const pdf = await createLeadMagnetPdf(project);
  const safeProjectName = project.title.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="DevMatte_Caso_De_Exito_${safeProjectName}.pdf"`,
    "Content-Length": pdf.length
  });
  return res.send(pdf);
});

app.post("/api/roi-diagnostic", async (req, res) => {
  const { employees, weeklyHours, monthlySalary, currency, automation, annualSavings, savedHours, paybackMonths, solutionLabel, email } = req.body || {};
  const numericValues = [employees, weeklyHours, monthlySalary, automation, annualSavings, savedHours, paybackMonths];
  const validNumbers = numericValues.every((value) => Number.isFinite(Number(value)));

  if (!validNumbers || Number(employees) < 1 || Number(employees) > 50 ||
      Number(weeklyHours) < 1 || Number(weeklyHours) > 40 ||
      Number(monthlySalary) <= 0 || Number(automation) < 0.1 || Number(automation) > 1) {
    return res.status(400).json({ error: "Los datos del diagnóstico ROI no son válidos." });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: "Ingresa un correo electrónico válido." });
  }

  const diagnostic = {
    employees: Number(employees),
    weeklyHours: Number(weeklyHours),
    monthlySalary: Number(monthlySalary),
    currency: currency === "PEN" ? "PEN" : "USD",
    automation: Number(automation),
    annualSavings: Number(annualSavings),
    savedHours: Number(savedHours),
    paybackMonths: Number(paybackMonths),
    solutionLabel: String(solutionLabel || "No seleccionada").slice(0, 120)
  };
  console.info("Diagnóstico ROI solicitado:", diagnostic);

  if (!email) {
    return res.status(400).json({ error: "Ingresa un correo para recibir el diagnóstico ROI." });
  }
  if (!process.env.EMAIL_PASS) {
    console.error("EMAIL_PASS no está configurado; no se puede enviar el diagnóstico ROI.");
    return res.status(503).json({ error: "El servicio de correo no está configurado. Intenta nuevamente más tarde." });
  }

  try {
    await createTransporter().sendMail({
      from: `"DevMatte - Diagnóstico ROI" <${senderEmail}>`,
      replyTo: senderEmail,
      to: String(email),
      bcc: destinationEmail,
      subject: `Tu diagnóstico ROI | ${diagnostic.solutionLabel}`,
      html: brandedEmail({
        eyebrow: "Informe ejecutivo ROI",
        title: "Tu diagnóstico de eficiencia operativa",
        intro: "Gracias por explorar el potencial de tu operación con DevMatte. Aquí tienes un resumen de los resultados estimados.",
        content: `<p class="section-title">Resumen de tu escenario</p><table class="data">
          <tr><td class="label">Solución analizada</td><td class="value"><strong>${escapeHtml(diagnostic.solutionLabel)}</strong></td></tr>
          <tr><td class="label">Equipo involucrado</td><td class="value">${diagnostic.employees} personas · ${diagnostic.weeklyHours} h semanales</td></tr>
          <tr><td class="label">Sueldo mensual promedio</td><td class="value">${diagnostic.currency} ${diagnostic.monthlySalary.toFixed(2)}</td></tr>
          <tr><td class="label">Nivel de automatización</td><td class="value">${(diagnostic.automation * 100).toFixed(0)}%</td></tr>
        </table><table class="metric-table"><tr>
          <td><span class="metric-label">AHORRO ANUAL ESTIMADO</span><span class="metric-value">${diagnostic.currency} ${diagnostic.annualSavings.toFixed(2)}</span></td>
          <td><span class="metric-label">HORAS RECUPERADAS</span><span class="metric-value">${diagnostic.savedHours.toFixed(0)} h / año</span></td>
        </tr><tr><td><span class="metric-label">EFICIENCIA OPERATIVA</span><span class="metric-value">+${(diagnostic.automation * 100).toFixed(0)}%</span></td>
          <td><span class="metric-label">PAYBACK ESTIMADO</span><span class="metric-value">${diagnostic.paybackMonths.toFixed(1)} meses</span></td>
        </tr></table><div class="panel"><strong>¿Qué sigue?</strong><br>Estos valores son referenciales. Nuestro equipo puede ayudarte a convertir este escenario en un plan de automatización priorizado y medible.</div>`
      }),
      attachments: [logoAttachment],
    });
  } catch (error) {
    console.error("No se pudo enviar el diagnóstico ROI por correo:", error);
    if (error.code === "EAUTH" || error.responseCode === 534 || error.responseCode === 535) {
      return res.status(503).json({ error: "Gmail rechazó la autenticación SMTP. Verifica la contraseña de aplicación configurada." });
    }
    return res.status(502).json({ error: "No se pudo entregar el diagnóstico por correo. Intenta nuevamente." });
  }

  return res.status(200).json({ success: true, message: "Diagnóstico ROI enviado al correo indicado." });
});

app.post("/api/contact", async (req, res) => {
  const { nombre, email, telefono, empresa, mensaje, servicioInteres } = req.body || {};

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "Por favor, complete todos los campos obligatorios." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ingrese un correo electrónico válido." });
  }

  if (!process.env.EMAIL_PASS) {
    console.error("EMAIL_PASS no está configurado; no se puede enviar el formulario.");
    return res.status(503).json({ error: "El servicio de correo no está configurado." });
  }

  const fechaActual = new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "full",
    timeStyle: "short"
  });

  const safeName = escapeHtml(nombre);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(telefono || "No especificado");
  const safeCompany = escapeHtml(empresa || "Particular / No especificada");
  const safeService = escapeHtml(servicioInteres || "");
  const safeMessage = escapeHtml(mensaje);
  const mailOptions = {
    from: `"DevMatte - Portal Web" <${senderEmail}>`,
    replyTo: email,
    to: destinationEmail,
    subject: `[DevMatte Web] Nueva Consulta Comercial - ${empresa ? `${empresa} (${nombre})` : nombre}`,
    html: brandedEmail({
      eyebrow: "Nueva oportunidad comercial",
      title: "Consulta recibida",
      intro: "Una persona ha enviado un nuevo mensaje desde el portal web de DevMatte.",
      content: `<p class="section-title">Información del solicitante</p><table class="data">
        <tr><td class="label">Nombre</td><td class="value"><strong>${safeName}</strong></td></tr>
        <tr><td class="label">Correo</td><td class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
        <tr><td class="label">Teléfono / WhatsApp</td><td class="value">${safePhone}</td></tr>
        <tr><td class="label">Empresa</td><td class="value">${safeCompany}</td></tr>
        ${safeService ? `<tr><td class="label">Servicio de interés</td><td class="value"><strong>${safeService}</strong></td></tr>` : ""}
        <tr><td class="label">Fecha de recepción</td><td class="value">${escapeHtml(fechaActual)}</td></tr>
      </table><div class="panel"><p class="section-title">Mensaje del cliente</p>${safeMessage}</div>`
    }),
    attachments: [logoAttachment]
  };

  try {
    await createTransporter().sendMail(mailOptions);
    await notifyWhatsApp(
      telefono,
      `Hola ${nombre}, recibimos tu consulta en DevMatte. Nuestro equipo revisará tu mensaje y se pondrá en contacto contigo pronto.`
    );
    return res.status(200).json({ success: true, message: "Su mensaje ha sido enviado exitosamente." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    if (error.code === "EAUTH" || error.responseCode === 534 || error.responseCode === 535) {
      return res.status(503).json({ error: "Gmail rechazó la autenticación SMTP. Verifica la verificación en dos pasos y genera una nueva contraseña de aplicación para esta cuenta." });
    }
    return res.status(500).json({ error: "Ocurrió un inconveniente al procesar su solicitud." });
  }
});

app.post("/api/estimate", async (req, res) => {
  const { solutionType, solutionLabel, features, featureLabels, estimate, contact } = req.body || {};
  const { nombre, email, empresa, telefono } = contact || {};
  const featureList = Array.isArray(featureLabels) ? featureLabels : [];

  if (!solutionType || !solutionLabel || !nombre || !email || !empresa || !telefono) {
    return res.status(400).json({ error: "Completa todos los datos de contacto y selecciona una solución." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: "Ingresa un correo electrónico válido." });
  }
  if (!estimate || !Number.isFinite(Number(estimate.minimum)) || !Number.isFinite(Number(estimate.maximum))) {
    return res.status(400).json({ error: "No se pudo validar el estimado del proyecto." });
  }
  if (!process.env.EMAIL_PASS) {
    console.error("EMAIL_PASS no está configurado; no se puede enviar la cotización.");
    return res.status(503).json({ error: "El servicio de correo no está configurado. Intenta nuevamente más tarde." });
  }

  const safe = (value, fallback = "No especificado") => escapeHtml(value || fallback);
  const safeFeatures = featureList.length
    ? featureList.map((feature) => `<li>${safe(feature)}</li>`).join("")
    : "<li>No se seleccionaron módulos adicionales.</li>";
  const fechaActual = new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    dateStyle: "full",
    timeStyle: "short"
  });
  const mailOptions = {
    from: `"DevMatte - Cotizador Web" <${senderEmail}>`,
    replyTo: String(email),
    to: destinationEmail,
    subject: `[DevMatte Cotización] ${safe(empresa)} — ${safe(nombre)}`,
    html: brandedEmail({
      eyebrow: "Cotizador express",
      title: "Nueva solicitud de cotización",
      intro: "El siguiente proyecto está listo para una primera conversación técnica.",
      content: `<p class="section-title">Datos del solicitante</p><table class="data">
        <tr><td class="label">Nombre</td><td class="value"><strong>${safe(nombre)}</strong></td></tr>
        <tr><td class="label">Correo</td><td class="value"><a href="mailto:${safe(email)}">${safe(email)}</a></td></tr>
        <tr><td class="label">Empresa</td><td class="value">${safe(empresa)}</td></tr>
        <tr><td class="label">WhatsApp</td><td class="value">${safe(telefono)}</td></tr>
      </table><p class="section-title" style="margin-top:26px">Solución solicitada</p><div class="panel"><strong>${safe(solutionLabel)}</strong></div>
      <p class="section-title">Módulos seleccionados</p><ul>${safeFeatures}</ul>
      <p class="section-title" style="margin-top:26px">Estimación referencial</p><table class="metric-table"><tr>
        <td><span class="metric-label">INVERSIÓN APROXIMADA</span><span class="metric-value">US$ ${Number(estimate.minimum).toLocaleString("en-US")} — ${Number(estimate.maximum).toLocaleString("en-US")}</span></td>
        <td><span class="metric-label">TIEMPO ESTIMADO</span><span class="metric-value">${safe(estimate.weeks)}</span></td>
      </tr></table><p style="color:#71858d;font-size:12px">Recibida el ${safe(fechaActual)} desde el cotizador oficial.</p>`
    }),
    attachments: [logoAttachment]
  };

  try {
    await createTransporter().sendMail(mailOptions);
    await notifyWhatsApp(
      telefono,
      `Hola ${nombre}, recibimos tu solicitud de cotización para ${solutionLabel}. Rango referencial: US$ ${Number(estimate.minimum).toLocaleString("en-US")} — ${Number(estimate.maximum).toLocaleString("en-US")}. Nuestro equipo te contactará pronto.`
    );
    return res.status(200).json({ success: true, message: "La solicitud de cotización fue enviada." });
  } catch (error) {
    console.error("Error al enviar la cotización:", error);
    if (error.code === "EAUTH" || error.responseCode === 534 || error.responseCode === 535) {
      return res.status(503).json({ error: "Gmail rechazó la autenticación SMTP. Verifica la contraseña de aplicación." });
    }
    return res.status(500).json({ error: "Ocurrió un inconveniente al enviar la cotización." });
  }
});

app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === whatsappVerifyToken && challenge) {
    return res.status(200).send(String(challenge));
  }

  return res.sendStatus(403);
});

app.post("/api/whatsapp/webhook", (req, res) => {
  const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];
  console.info("Evento recibido desde WhatsApp:", {
    object: req.body?.object,
    entries: entries.length
  });

  for (const entry of entries) {
    for (const change of Array.isArray(entry.changes) ? entry.changes : []) {
      const value = change.value || {};
      for (const message of Array.isArray(value.messages) ? value.messages : []) {
        console.info("Mensaje entrante de WhatsApp:", {
          from: message.from,
          type: message.type,
          messageId: message.id
        });
      }
      for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
        console.info("Estado de mensaje WhatsApp:", {
          messageId: status.id,
          status: status.status,
          recipientId: status.recipient_id
        });
      }
    }
  }

  return res.sendStatus(200);
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.listen(port, () => console.log(`Servidor iniciado en http://localhost:${port}`));
