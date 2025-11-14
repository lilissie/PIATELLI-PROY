import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Email,
  Reply,
  Delete,
  MarkEmailRead,
  Refresh,
  AutoAwesome,
  Add,
  CloudSync,
  CheckCircle,
  Error as ErrorIcon,
} from "@mui/icons-material";
import emailjs from "@emailjs/browser";
import axios from "axios";

const API_URL = "http://localhost:5000";

const CorreosNoRespondidos = () => {
  const [correos, setCorreos] = useState([]);
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [notificacion, setNotificacion] = useState({
    abierta: false,
    mensaje: "",
    tipo: "success",
  });
  const [autoRespuesta, setAutoRespuesta] = useState(true);
  const [gmailAutenticado, setGmailAutenticado] = useState(false);
  const [dialogoGmail, setDialogoGmail] = useState(false);

  const [plantilla, setPlantilla] = useState({
    asunto: "Re: {asunto}",
    contenido: `Hola {nombre},\n\nGracias por contactarnos. Hemos recibido tu mensaje:\n\n"{mensaje}"\n\nNos pondremos en contacto contigo a la brevedad.\n\nSaludos cordiales,\nEquipo Bodega Piattelli\n{fecha}`,
  });

  // Inicializar EmailJS
  useEffect(() => {
    emailjs.init("jrr6s1PQZc5btC1f0");
    verificarAutenticacionGmail();
  }, []);

  // Verificar si Gmail está autenticado
  const verificarAutenticacionGmail = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/status`);
      setGmailAutenticado(response.data.autenticado);
    } catch (error) {
      console.error("Error verificando autenticación:", error);
    }
  };

  // Conectar con Gmail
  const conectarGmail = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/gmail`);
      const authUrl = response.data.authUrl;

      // Abrir ventana de autenticación
      const authWindow = window.open(
        authUrl,
        "Gmail Auth",
        "width=600,height=700"
      );

      // Verificar cada 2 segundos si ya se autenticó
      const interval = setInterval(async () => {
        try {
          const status = await axios.get(`${API_URL}/api/auth/status`);
          if (status.data.autenticado) {
            clearInterval(interval);
            setGmailAutenticado(true);
            setDialogoGmail(false);
            mostrarNotificacion("✅ Gmail conectado exitosamente", "success");
            obtenerCorreosGmail();
          }
        } catch (error) {
          console.error("Error verificando estado:", error);
        }
      }, 2000);

      // Limpiar intervalo después de 5 minutos
      setTimeout(() => clearInterval(interval), 300000);
    } catch (error) {
      console.error("Error conectando Gmail:", error);
      mostrarNotificacion("❌ Error al conectar Gmail", "error");
    }
  };

  // Obtener correos de Gmail
  const obtenerCorreosGmail = async () => {
    if (!gmailAutenticado) {
      setDialogoGmail(true);
      return;
    }

    setCargando(true);
    try {
      const response = await axios.get(`${API_URL}/api/correos/gmail`);
      const correosGmail = response.data;

      setCorreos(correosGmail);
      mostrarNotificacion(
        `📧 ${correosGmail.length} correos sincronizados de Gmail`,
        "success"
      );
    } catch (error) {
      console.error("Error obteniendo correos:", error);
      if (error.response?.status === 401) {
        setGmailAutenticado(false);
        mostrarNotificacion(
          "⚠️ Debes autenticarte con Gmail primero",
          "warning"
        );
        setDialogoGmail(true);
      } else {
        mostrarNotificacion("❌ Error al obtener correos de Gmail", "error");
      }
    } finally {
      setCargando(false);
    }
  };

  const generarRespuestaAutomatica = (correo) => {
    if (!autoRespuesta) return "";

    const nombre = extraerNombre(correo.remitente);
    const fecha = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let contenido = plantilla.contenido
      .replace(/{nombre}/g, nombre)
      .replace(/{asunto}/g, correo.asunto)
      .replace(/{fecha}/g, fecha)
      .replace(/{mensaje}/g, correo.mensaje.substring(0, 200));

    return contenido;
  };

  const seleccionarCorreo = (correo) => {
    setCorreoSeleccionado(correo);
    if (autoRespuesta && !correo.respondido) {
      const respuestaAuto = generarRespuestaAutomatica(correo);
      setRespuesta(respuestaAuto);
    } else {
      setRespuesta("");
    }
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim() || !correoSeleccionado) return;
    setEnviando(true);

    try {
      const emailDestinatario = extraerEmail(correoSeleccionado.remitente);
      const nombreDestinatario = extraerNombre(correoSeleccionado.remitente);

      const params = {
        email: emailDestinatario,
        name: nombreDestinatario,
        title: `Re: ${correoSeleccionado.asunto}`,
        time: new Date().toLocaleString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: respuesta,
      };

      await emailjs.send("service_dvcne6o", "template_qld1cdw", params);

      // Si es un correo de Gmail, marcarlo como leído
      if (correoSeleccionado.tipo === "gmail") {
        await marcarComoLeidoGmail(correoSeleccionado.id);
      }

      marcarComoRespondido(correoSeleccionado.id);
      mostrarNotificacion(
        `✅ Correo enviado a ${emailDestinatario}`,
        "success"
      );
    } catch (err) {
      console.error("❌ Error enviando correo:", err);
      mostrarNotificacion(
        "❌ Error al enviar correo: " + (err.text || err.message),
        "error"
      );
    } finally {
      setEnviando(false);
    }
  };

  const marcarComoLeidoGmail = async (messageId) => {
    try {
      await axios.post(`${API_URL}/api/correos/${messageId}/marcar-leido`);
    } catch (error) {
      console.error("Error marcando como leído en Gmail:", error);
    }
  };

  const extraerEmail = (remitente) => {
    const matchCorreo = remitente.match(/<(.+?)>/);
    if (matchCorreo && matchCorreo[1]) {
      return matchCorreo[1].trim();
    }
    if (remitente.includes("@")) {
      return remitente.trim();
    }
    return remitente;
  };

  const extraerNombre = (remitente) => {
    const matchNombre = remitente.match(/(.*?)</);
    if (matchNombre && matchNombre[1]) {
      return matchNombre[1].trim();
    }
    if (remitente.includes("@")) {
      const nombreParte = remitente.split("@")[0];
      return nombreParte
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return remitente;
  };

  const marcarComoRespondido = (id) => {
    setCorreos(
      correos.map((correo) =>
        correo.id === id
          ? {
              ...correo,
              respondido: true,
              fechaRespuesta: new Date().toISOString(),
            }
          : correo
      )
    );
    setCorreoSeleccionado(null);
    setRespuesta("");
  };

  const eliminarCorreo = (id) => {
    setCorreos(correos.filter((correo) => correo.id !== id));
    if (correoSeleccionado && correoSeleccionado.id === id) {
      setCorreoSeleccionado(null);
    }
    mostrarNotificacion("🗑️ Correo eliminado", "info");
  };

  const aplicarPlantilla = () => {
    if (correoSeleccionado) {
      const respuestaAuto = generarRespuestaAutomatica(correoSeleccionado);
      setRespuesta(respuestaAuto);
      mostrarNotificacion("📝 Plantilla aplicada", "info");
    }
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ abierta: true, mensaje, tipo });
  };

  const cerrarNotificacion = () => {
    setNotificacion({ ...notificacion, abierta: false });
  };

  const correosNoRespondidos = correos.filter((correo) => !correo.respondido);

  const obtenerTiempoTranscurrido = (fecha) => {
    const ahora = new Date();
    const fechaCorreo = new Date(fecha);
    const diffMs = ahora - fechaCorreo;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHoras < 1) return "Hace unos minutos";
    if (diffHoras < 24)
      return `Hace ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;

    const diffDias = Math.floor(diffHoras / 24);
    return `Hace ${diffDias} día${diffDias > 1 ? "s" : ""}`;
  };

  const obtenerColorPrioridad = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "#f44336";
      case "media":
        return "#ff9800";
      case "baja":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <motion.div
      style={{
        padding: "20px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: '"DM Sans", sans-serif',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Email sx={{ mr: 1, color: "#1976d2" }} />
          <Typography
            variant="h6"
            sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
          >
            Bandeja de Entrada ({correosNoRespondidos.length})
          </Typography>
          {gmailAutenticado && (
            <Chip
              icon={<CheckCircle />}
              label="Gmail Conectado"
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRespuesta}
                onChange={(e) => setAutoRespuesta(e.target.checked)}
                size="small"
              />
            }
            label="Auto-Respuesta"
          />

          <Button
            startIcon={
              cargando ? <CircularProgress size={20} /> : <CloudSync />
            }
            onClick={obtenerCorreosGmail}
            variant="contained"
            size="small"
            disabled={cargando}
          >
            {gmailAutenticado ? "Sincronizar Gmail" : "Conectar Gmail"}
          </Button>
        </Box>
      </Box>

      {/* Lista de correos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: correoSeleccionado ? "1fr 1fr" : "1fr",
          gap: "20px",
        }}
      >
        <div>
          {correosNoRespondidos.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                📭 No hay correos sin responder
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {gmailAutenticado
                  ? "Sincroniza con Gmail para ver tus correos"
                  : "Conecta tu cuenta de Gmail para comenzar"}
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudSync />}
                onClick={obtenerCorreosGmail}
                sx={{ mt: 2 }}
              >
                {gmailAutenticado ? "Sincronizar Gmail" : "Conectar Gmail"}
              </Button>
            </Card>
          ) : (
            correosNoRespondidos.map((correo) => (
              <motion.div
                key={correo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => seleccionarCorreo(correo)}
                  sx={{
                    mb: 1,
                    cursor: "pointer",
                    border:
                      correoSeleccionado?.id === correo.id
                        ? "2px solid #1976d2"
                        : "none",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontFamily: '"DM Sans", sans-serif',
                          }}
                        >
                          {extraerNombre(correo.remitente)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {extraerEmail(correo.remitente)}
                        </Typography>
                        {correo.tipo === "gmail" && (
                          <Chip
                            label="Gmail"
                            size="small"
                            color="primary"
                            sx={{
                              height: 20,
                              fontSize: "0.6rem",
                              mt: 0.5,
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                      <Chip
                        label={correo.prioridad}
                        size="small"
                        sx={{
                          backgroundColor: obtenerColorPrioridad(
                            correo.prioridad
                          ),
                          color: "white",
                          fontWeight: "bold",
                          height: 20,
                          fontSize: "0.6rem",
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {correo.asunto}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.8rem",
                        mb: 1,
                      }}
                    >
                      {correo.mensaje.length > 100
                        ? correo.mensaje.substring(0, 100) + "..."
                        : correo.mensaje}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {obtenerTiempoTranscurrido(correo.fecha)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(correo.fecha).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Panel de respuesta */}
        {correoSeleccionado && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card sx={{ p: 2 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontFamily: '"DM Sans", sans-serif' }}
              >
                Responder a {extraerNombre(correoSeleccionado.remitente)}
              </Typography>

              <Box
                sx={{
                  mb: 2,
                  p: 1,
                  backgroundColor: "#e3f2fd",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  📧 Enviando respuesta a:{" "}
                  <strong>{extraerEmail(correoSeleccionado.remitente)}</strong>
                </Typography>
              </Box>

              <Card sx={{ backgroundColor: "#f8f9fa", mb: 2, p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  <strong>De:</strong> {correoSeleccionado.remitente}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  <strong>Asunto:</strong> {correoSeleccionado.asunto}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    p: 1,
                    backgroundColor: "white",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  {correoSeleccionado.mensaje}
                </Typography>
              </Card>

              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                label="Tu respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                sx={{ mb: 2 }}
                placeholder={
                  autoRespuesta
                    ? "La respuesta automática ha sido generada. Puedes editarla."
                    : "Escribe tu respuesta aquí..."
                }
              />

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                {autoRespuesta && (
                  <Button
                    startIcon={<AutoAwesome />}
                    onClick={aplicarPlantilla}
                    variant="outlined"
                    size="small"
                  >
                    Aplicar Plantilla
                  </Button>
                )}
                <Button
                  startIcon={
                    enviando ? <CircularProgress size={20} /> : <Reply />
                  }
                  variant="contained"
                  onClick={enviarRespuesta}
                  disabled={!respuesta.trim() || enviando}
                  size="small"
                >
                  {enviando ? "Enviando..." : `Enviar`}
                </Button>
                <Button
                  startIcon={<MarkEmailRead />}
                  onClick={() => marcarComoRespondido(correoSeleccionado.id)}
                  disabled={enviando}
                  size="small"
                >
                  Marcar Leído
                </Button>
                <IconButton
                  color="error"
                  onClick={() => eliminarCorreo(correoSeleccionado.id)}
                  disabled={enviando}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Diálogo de conexión Gmail */}
      <Dialog open={dialogoGmail} onClose={() => setDialogoGmail(false)}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Email color="primary" />
            <Typography variant="h6">Conectar con Gmail</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para acceder a tus correos de Gmail, necesitas autorizar el acceso a
            tu cuenta.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ✅ Lectura de correos no leídos
            <br />
            ✅ Marcar correos como leídos
            <br />✅ Acceso seguro mediante OAuth 2.0
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Se abrirá una ventana de Google para autorizar el acceso. Asegúrate
            de permitir las ventanas emergentes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoGmail(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={conectarGmail}
            startIcon={<CloudSync />}
          >
            Conectar Gmail
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={notificacion.abierta}
        autoHideDuration={4000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={cerrarNotificacion}
          severity={notificacion.tipo}
          sx={{ width: "100%" }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CorreosNoRespondidos;
