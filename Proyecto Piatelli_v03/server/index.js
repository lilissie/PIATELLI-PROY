// server.js - Backend integrado: Gmail API + MercadoPago
// INSTALACIÓN: npm install express cors googleapis dotenv mercadopago

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { google } from "googleapis";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { sendPaymentConfirmation } from "./services/emailService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




// ============================================
// CONFIGURACIÓN GMAIL API
// ============================================

const oauth2Client = new google.auth.OAuth2(
  "920700430061-tkp95n27u1j3uh1ferm4vug5171c6g41.apps.googleusercontent.com",
  "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",
  "http://localhost:5000/oauth2callback"
);

let currentTokens = null;

// ============================================
// CONFIGURACIÓN MERCADOPAGO
// ============================================

const mercadoPagoClient = new MercadoPagoConfig({
  accessToken:
    "APP_USR-8297248310775041-100321-177180cd6b116f5e070e47a1c785ca22-2901561229",
});

// ============================================
// RUTAS GMAIL API
// ============================================

// RUTA 1: Iniciar autenticación con Gmail
app.get("/auth/gmail", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
    prompt: "consent",
  });

  res.json({ authUrl });
});

// RUTA 2: Callback OAuth - Aquí llega Google después de autenticar
app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("❌ Código de autorización no recibido");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    currentTokens = tokens;

    console.log("✅ Tokens Gmail obtenidos");

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autenticación Exitosa</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          h1 { color: #4CAF50; margin-bottom: 20px; }
          p { color: #666; font-size: 16px; }
          .emoji { font-size: 60px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">✅</div>
          <h1>¡Autenticación Exitosa!</h1>
          <p>Gmail conectado correctamente.</p>
          <p>Ahora puedes cerrar esta ventana y volver a la aplicación.</p>
        </div>
        <script>
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error obteniendo tokens Gmail:", error);
    res.status(500).send("❌ Error en la autenticación: " + error.message);
  }
});

// RUTA 3: Obtener correos no respondidos de Gmail
app.get("/api/correos/gmail", async (req, res) => {
  if (!currentTokens) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Debes autenticarte primero con Gmail",
    });
  }

  try {
    oauth2Client.setCredentials(currentTokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      q: "in:inbox -from:me is:unread",
      maxResults: 50,
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      return res.json([]);
    }

    const correosDetallados = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        return parsearCorreo(msg.data);
      })
    );

    res.json(correosDetallados);
  } catch (error) {
    console.error("❌ Error obteniendo correos:", error);
    res.status(500).json({
      error: "Error obteniendo correos",
      details: error.message,
    });
  }
});

// RUTA 4: Marcar correo como leído
app.post("/api/correos/:id/marcar-leido", async (req, res) => {
  if (!currentTokens) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    oauth2Client.setCredentials(currentTokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    await gmail.users.messages.modify({
      userId: "me",
      id: req.params.id,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    res.json({ success: true, message: "Correo marcado como leído" });
  } catch (error) {
    console.error("❌ Error marcando correo:", error);
    res.status(500).json({ error: "Error marcando correo como leído" });
  }
});

// RUTA 5: Verificar estado de autenticación Gmail
app.get("/api/auth/status", (req, res) => {
  res.json({
    autenticado: !!currentTokens,
    expiracion: currentTokens ? currentTokens.expiry_date : null,
  });
});

// ============================================
// RUTAS MERCADOPAGO
// ============================================

// RUTA 6: Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor funcionando - Gmail API + MercadoPago");
});

// RUTA 7: Crear preferencia de MercadoPago
app.post("/create_preference", async (req, res) => {
  try {
    if (!req.body.title || !req.body.quantity || !req.body.price) {
      return res.status(400).json({
        error: "Faltan datos requeridos: title, quantity o price",
      });
    }

    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://www.google.com/",
        failure: "https://www.google.com/",
        pending: "https://www.google.com/",
      },
      auto_return: "approved",
      notification_url:
        "https://discountable-violently-roselle.ngrok-free.dev/webhook",
      metadata: req.body.metadata || {},
    };

    const preference = new Preference(mercadoPagoClient);
    const result = await preference.create({ body });

    res.json({
      id: result.id,
    });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).json({
      error: "Error al crear la preferencia",
      message: error.message,
    });
  }
});

// Webhook de MercadoPago
app.post("/webhook", async (req, res) => {
  try {
    console.log("🔔 Webhook recibido:", req.body);

    const { type, data } = req.body;

    // Solo procesar notificaciones de pago
    if (type === "payment") {
      const paymentId = data.id;

      // Obtener información completa del pago
      const payment = new Payment(mercadoPagoClient);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log("💰 Información del pago:", {
        id: paymentInfo.id,
        status: paymentInfo.status,
        amount: paymentInfo.transaction_amount,
        email: paymentInfo.payer?.email,
        // Agregar metadata si existe
        metadata: paymentInfo.metadata,
      });

      // Si el pago fue aprobado, enviar email
      if (paymentInfo.status === "approved") {
        // Enviar email al cliente (si tenemos su email en metadata)
        if (paymentInfo.metadata && paymentInfo.metadata.email) {
          await sendPaymentConfirmation(paymentInfo, paymentInfo.metadata);
          console.log("✅ Email de confirmación enviado al cliente");
        } else {
          // Si no hay metadata, usar el email del payer de MercadoPago
          await sendPaymentConfirmation(paymentInfo);
          console.log("✅ Email de confirmación enviado (sin metadata)");
        }
      }
    }

    // Siempre responder 200 OK a MercadoPago
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    res.status(500).send("Error");
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Función para enviar email de confirmación de pago
async function enviarEmailConfirmacion(paymentInfo) {
  try {
    const axios = (await import("axios")).default;

    const emailCliente =
      paymentInfo.metadata?.email || paymentInfo.payer?.email;

    if (!emailCliente) {
      console.warn("⚠️ No se encontró email del cliente");
      return;
    }

    // Extraer información del pago
    const nombreCliente =
      paymentInfo.metadata?.nombre ||
      paymentInfo.payer?.first_name ||
      "Cliente";

    const producto =
      paymentInfo.additional_info?.items?.[0]?.title || "Producto";

    const monto = `${paymentInfo.transaction_amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const fecha = new Date().toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Enviar email usando EmailJS
    const emailData = {
      service_id: "service_dvcne6o",
      template_id: "template_qld1cdw", // Usa el template que tengas para confirmaciones
      user_id: "jrr6s1PQZc5btC1f0",
      template_params: {
        email: emailCliente,
        name: nombreCliente,
        title: `Confirmación de Pago - Bodega Piattelli`,
        time: fecha,
        message: `¡Tu pago ha sido confirmado exitosamente!

Detalles de la compra:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Producto: ${producto}
• Monto: ${monto}
• ID de pago: ${paymentInfo.id}
• Fecha: ${fecha}
• Estado: Aprobado ✅

Gracias por tu compra en Bodega Piattelli.

Saludos cordiales,
Equipo Bodega Piattelli`,
      },
    };

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      emailData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Email de confirmación enviado a ${emailCliente}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error enviando email de confirmación:",
      error.response?.data || error.message
    );
    throw error;
  }
}

function parsearCorreo(data) {
  const headers = data.payload.headers;

  const obtenerHeader = (nombre) => {
    const header = headers.find(
      (h) => h.name.toLowerCase() === nombre.toLowerCase()
    );
    return header ? header.value : "";
  };

  let body = "";

  function extraerTexto(payload) {
    if (payload.body.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
        if (part.parts) {
          const texto = extraerTexto(part);
          if (texto) return texto;
        }
      }
    }

    return "";
  }

  body = extraerTexto(data.payload);

  body = body
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    id: data.id,
    threadId: data.threadId,
    remitente: obtenerHeader("From"),
    asunto: obtenerHeader("Subject") || "(Sin asunto)",
    mensaje: body.substring(0, 1000),
    fecha: new Date(parseInt(data.internalDate)),
    etiquetas: data.labelIds || [],
    leido: !data.labelIds.includes("UNREAD"),
    prioridad: "media",
    respondido: false,
    tipo: "gmail",
  };
}

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Servidor Integrado Iniciado             ║
╠═══════════════════════════════════════════════╣
║   Puerto: ${PORT}                                ║
║   URL: http://localhost:${PORT}                 ║
╠═══════════════════════════════════════════════╣
║   📧 Gmail API - Endpoints:                   ║
║   GET  /auth/gmail                            ║
║   GET  /api/correos/gmail                     ║
║   POST /api/correos/:id/marcar-leido          ║
║   GET  /api/auth/status                       ║
╠═══════════════════════════════════════════════╣
║   💳 MercadoPago - Endpoints:                 ║
║   POST /create_preference                     ║
║   POST /webhook                               ║
║   GET  /check-payment/:paymentId              ║
║   POST /test-email (TESTING)                  ║
╠═══════════════════════════════════════════════╣
║   ✉️  Emails automáticos activados           ║
║   Webhook Key: 225e56d6a3cb...               ║
╚═══════════════════════════════════════════════╝
  `);
});
