require("dotenv").config();

const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3000);
const destinationEmail = "fitdeskdev@gmail.com";
const senderEmail = process.env.EMAIL_USER || destinationEmail;

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
    html: `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
      body{font-family:'Segoe UI',Arial,sans-serif;background:#050a14;color:#e2e8f0;margin:0;padding:40px 20px}
      .container{max-width:650px;margin:0 auto;background:#0b132b;border:1px solid #1e293b;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px #0008}
      .header{background:linear-gradient(135deg,#070d1d,#1c2541);padding:30px;border-bottom:2px solid #38bdf8}
      h1{color:#fff;font-size:20px;margin:0 0 6px;letter-spacing:1px}.header p{color:#38bdf8;font-size:13px;margin:0}
      .body-content{padding:30px}.section-title{font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:15px;border-bottom:1px solid #1e293b;padding-bottom:6px}
      .info-grid{width:100%;border-collapse:collapse;margin-bottom:25px}.info-grid td{padding:10px 0;vertical-align:top;font-size:14px}
      .label{color:#94a3b8;width:35%;font-weight:600}.value{color:#f8fafc;width:65%}.value a{color:#38bdf8;text-decoration:none}
      .message-box{background:#1c2541;border-left:4px solid #38bdf8;padding:20px;border-radius:0 8px 8px 0;font-size:14px;line-height:1.7;color:#f1f5f9;white-space:pre-line}
      .footer{background:#070d1d;padding:20px 30px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #1e293b}
    </style></head><body><div class="container"><div class="header"><h1>DEVMATTE CONSULTING</h1><p>Notificación de Registro de Cliente — Notificación Automática</p></div>
      <div class="body-content"><div class="section-title">Información del Solicitante</div><table class="info-grid">
      <tr><td class="label">Nombres y Apellidos:</td><td class="value"><strong>${safeName}</strong></td></tr>
      <tr><td class="label">Correo Electrónico:</td><td class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
      <tr><td class="label">Teléfono / WhatsApp:</td><td class="value">${safePhone}</td></tr>
      <tr><td class="label">Empresa / Organización:</td><td class="value">${safeCompany}</td></tr>
      ${safeService ? `<tr><td class="label">Servicio de Interés:</td><td class="value" style="color:#38bdf8;font-weight:600">${safeService}</td></tr>` : ""}
      <tr><td class="label">Fecha de Recepción:</td><td class="value">${escapeHtml(fechaActual)}</td></tr></table>
      <div class="section-title">Detalle de la Consulta / Requerimiento</div><div class="message-box">${safeMessage}</div></div>
      <div class="footer"><p style="margin:0 0 4px">Este mensaje fue enviado desde el formulario de contacto oficial de <strong>www.devmatte.com</strong>.</p><p style="margin:0">Responda directamente a este correo para ponerse en contacto con el cliente.</p></div>
    </div></body></html>`
  };

  try {
    await createTransporter().sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Su mensaje ha sido enviado exitosamente." });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    if (error.code === "EAUTH" || error.responseCode === 534 || error.responseCode === 535) {
      return res.status(503).json({ error: "Gmail rechazó la autenticación SMTP. Verifica la verificación en dos pasos y genera una nueva contraseña de aplicación para esta cuenta." });
    }
    return res.status(500).json({ error: "Ocurrió un inconveniente al procesar su solicitud." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.listen(port, () => console.log(`Servidor iniciado en http://localhost:${port}`));
