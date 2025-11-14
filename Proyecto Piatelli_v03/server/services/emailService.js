import nodemailer from "nodemailer";

// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "panickrecord@gmail.com",
    pass: "ouhk lxdr bdmv vqsv",
  },
});

// Función para enviar email de confirmación de pago
export const sendPaymentConfirmation = async (
  paymentData,
  clientData = null
) => {
  // Determinar a quién enviar el email
  let toEmail = "pablocelayarios@gmail.com"; // Email por defecto (tú)
  let isClientEmail = false;

  if (clientData && clientData.email) {
    toEmail = clientData.email; // Email del cliente
    isClientEmail = true;
  } else if (paymentData.payer?.email) {
    toEmail = paymentData.payer.email; // Email de MercadoPago
    isClientEmail = true;
  }

  // Determinar el asunto según el destinatario
  const subject = isClientEmail
    ? "✅ Confirmación de Pago - Bodega Piattelli"
    : "✅ Nuevo pago recibido - MercadoPago";

  // Crear contenido del email según el destinatario
  let emailContent = "";

  if (isClientEmail) {
    // Email para el CLIENTE
    emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">¡Gracias por tu reserva en Bodega Piattelli!</h2>
        <p>Tu pago ha sido procesado exitosamente. Aquí tienes los detalles de tu reserva:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles de tu Reserva:</h3>
          <p><strong>ID de Pago:</strong> ${paymentData.id}</p>
          <p><strong>Estado:</strong> ${paymentData.status}</p>
          <p><strong>Monto Pagado:</strong> $${
            paymentData.transaction_amount
          } ${paymentData.currency_id}</p>
          <p><strong>Método de pago:</strong> ${
            paymentData.payment_method_id || "No especificado"
          }</p>
          <p><strong>Fecha:</strong> ${new Date(
            paymentData.date_created
          ).toLocaleString("es-AR")}</p>
        </div>

        ${
          clientData
            ? `
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Información de tu Reserva:</h3>
          <p><strong>Nombre:</strong> ${
            clientData.nombre || "No especificado"
          } ${clientData.apellido || ""}</p>
          <p><strong>DNI:</strong> ${clientData.dni || "No especificado"}</p>
          <p><strong>Personas:</strong> ${
            clientData.personas || "No especificado"
          }</p>
          ${
            clientData.fechas
              ? `<p><strong>Fechas:</strong> ${
                  clientData.fechas.inicio || ""
                } a ${clientData.fechas.fin || ""}</p>`
              : ""
          }
          ${
            clientData.alojamientos
              ? `<p><strong>Alojamientos:</strong> ${
                  Array.isArray(clientData.alojamientos)
                    ? clientData.alojamientos.join(", ")
                    : clientData.alojamientos
                }</p>`
              : ""
          }
          ${
            clientData.actividades
              ? `<p><strong>Actividades:</strong> ${
                  Array.isArray(clientData.actividades)
                    ? clientData.actividades.join(", ")
                    : clientData.actividades
                }</p>`
              : ""
          }
        </div>
        `
            : ""
        }

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h4>📞 Contacto</h4>
          <p>Si tienes alguna pregunta sobre tu reserva, no dudes en contactarnos:</p>
          <p>📧 BodegaPiattelli@gmail.com<br>📞 +54 11 1234-5678</p>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          ¡Esperamos verte pronto en Hotel Éxito!
        </p>
      </div>
    `;
  } else {
    // Email para TI (notificación interna)
    emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">¡Nuevo pago recibido!</h2>
        <p>Se ha recibido un nuevo pago a través de MercadoPago:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Detalles del Pago:</h3>
          <p><strong>ID de Pago:</strong> ${paymentData.id}</p>
          <p><strong>Estado:</strong> ${paymentData.status}</p>
          <p><strong>Monto:</strong> $${paymentData.transaction_amount} ${
      paymentData.currency_id
    }</p>
          <p><strong>Método de pago:</strong> ${
            paymentData.payment_method_id || "No especificado"
          }</p>
          <p><strong>Email del comprador:</strong> ${
            paymentData.payer?.email || "No disponible"
          }</p>
          <p><strong>Fecha:</strong> ${new Date(
            paymentData.date_created
          ).toLocaleString("es-AR")}</p>
        </div>

        ${
          paymentData.metadata
            ? `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Información del Cliente:</h3>
          <p><strong>Nombre:</strong> ${
            paymentData.metadata.nombre || "No especificado"
          } ${paymentData.metadata.apellido || ""}</p>
          <p><strong>DNI:</strong> ${
            paymentData.metadata.dni || "No especificado"
          }</p>
          <p><strong>Personas:</strong> ${
            paymentData.metadata.personas || "No especificado"
          }</p>
          ${
            paymentData.metadata.fechas
              ? `<p><strong>Fechas:</strong> ${
                  paymentData.metadata.fechas.inicio || ""
                } a ${paymentData.metadata.fechas.fin || ""}</p>`
              : ""
          }
          ${
            paymentData.metadata.alojamientos
              ? `<p><strong>Alojamientos:</strong> ${
                  Array.isArray(paymentData.metadata.alojamientos)
                    ? paymentData.metadata.alojamientos.join(", ")
                    : paymentData.metadata.alojamientos
                }</p>`
              : ""
          }
          ${
            paymentData.metadata.actividades
              ? `<p><strong>Actividades:</strong> ${
                  Array.isArray(paymentData.metadata.actividades)
                    ? paymentData.metadata.actividades.join(", ")
                    : paymentData.metadata.actividades
                }</p>`
              : ""
          }
        </div>
        `
            : ""
        }
        
        <p style="color: #666; font-size: 12px;">
          Este es un email automático. No responder.
        </p>
      </div>
    `;
  }

  const mailOptions = {
    from: '"Hotel Éxito" <panickrecord@gmail.com>',
    to: toEmail,
    subject: subject,
    html: emailContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email enviado exitosamente a: ${toEmail}`, info.messageId);
    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    return { success: false, error: error.message };
  }
};
