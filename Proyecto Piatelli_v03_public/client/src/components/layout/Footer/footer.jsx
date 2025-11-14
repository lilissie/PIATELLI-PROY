import { useState } from "react";
import {
  FaArrowRight,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./footer.css";

const Footer = () => {
  const location = useLocation();

  // Estados para el formulario de consultas
  const [consultaEmail, setConsultaEmail] = useState("");
  const [consultaMensaje, setConsultaMensaje] = useState("");
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // Definir en qué rutas quieres el color especial
  const paginasConColorEspecial = ["/vinos", "/"];
  const no_footer = ["/dashG", "/dashOp", "/login"];

  const noTieneFotter = no_footer.includes(location.pathname);
  const tieneColorEspecial = paginasConColorEspecial.includes(
    location.pathname
  );

  // Función para manejar el envío de consultas con EmailJS
  const handleEnviarConsulta = async (e) => {
    e?.preventDefault();

    // Limpiar mensajes previos
    setMensajeError("");
    setMensajeExito("");

    // Validaciones
    if (!consultaEmail || !consultaMensaje) {
      setMensajeError("Por favor completá todos los campos");
      setTimeout(() => setMensajeError(""), 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(consultaEmail)) {
      setMensajeError("Por favor ingresá un email válido");
      setTimeout(() => setMensajeError(""), 3000);
      return;
    }

    if (consultaMensaje.length < 10) {
      setMensajeError("La consulta debe tener al menos 10 caracteres");
      setTimeout(() => setMensajeError(""), 3000);
      return;
    }

    setEnviandoConsulta(true);

    try {
      // Configuración de EmailJS
      const templateParams = {
        email: consultaEmail,
        message: consultaMensaje,
        title: "Consulta de Cliente",
        name: consultaEmail,
        time: "",
      };

      // IMPORTANTE: Reemplaza estos valores con los tuyos de EmailJS
      const result = await emailjs.send(
        "service_dvcne6o", // Reemplazar con tu Service ID
        "template_eqge4sm", // Reemplazar con tu Template ID
        templateParams,
        "jrr6s1PQZc5btC1f0" // Reemplazar con tu Public Key
      );

      if (result.status === 200) {
        setMensajeExito("¡Consulta enviada exitosamente!");
        setConsultaEmail("");
        setConsultaMensaje("");

        setTimeout(() => {
          setMensajeExito("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error enviando email:", error);
      setMensajeError(
        "Hubo un error al enviar la consulta. Intenta nuevamente."
      );
      setTimeout(() => setMensajeError(""), 5000);
    } finally {
      setEnviandoConsulta(false);
    }
  };

  return (
    <footer
      className={`footer ${
        tieneColorEspecial ? "footer-especial" : "footer-default"
      } ${noTieneFotter ? "sin-footer" : "footer-default"}`}
    >
      <div className="footer__container">
        {/* Sección principal del footer */}
        <div className="footer__sections">
          {/* Columna 1: Información del hotel */}
          <div className="footer__section">
            <h3 className="footer__title">PIATELLI</h3>
            <p className="footer__description">
              Tu escape adulto en Cafayate: vino, paisajes y descanso.
            </p>
            <div className="footer__contact-info">
              <div className="contact__item">
                <FaMapMarkerAlt className="contact__icon" />
                <span>Ruta Provincial N°2, Cafayate Salta</span>
              </div>
              <div className="contact__item">
                <FaPhone className="contact__icon" />
                <span>0261 405-8333</span>
              </div>
              <div className="contact__item">
                <FaEnvelope className="contact__icon" />
                <span>reservas@piattelli.com.ar</span>
              </div>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div className="footer__section">
            <h4 className="footer__subtitle">Descubre más</h4>
            <ul className="footer__links">
              <li>
                <Link to="/actividades" className="footer__link">
                  <FaArrowRight className="link__icon" /> Actividades
                </Link>
              </li>
              <li>
                <Link to="/vinos" className="footer__link">
                  <FaArrowRight className="link__icon" /> Vinos disponibles
                </Link>
              </li>
              <li>
                <Link to="/actividades" className="footer__link">
                  <FaArrowRight className="link__icon" /> Spa & Wellness
                </Link>
              </li>
              <li>
                <Link to="/actividades" className="footer__link">
                  <FaArrowRight className="link__icon" /> Eventos
                </Link>
              </li>
              <li>
                <Link to="/ubicacion" className="footer__link">
                  <FaArrowRight className="link__icon" /> Ubicacion
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Servicios */}
          <div className="footer__section">
            <h4 className="footer__subtitle">Servicios</h4>
            <ul className="footer__links">
              <li>
                <Link to="/Habitaciones" className="footer__link">
                  <FaArrowRight className="link__icon" /> Reservacion
                </Link>
              </li>
              <li>
                <Link to="/Habitaciones" className="footer__link">
                  <FaArrowRight className="link__icon" /> Habitaciones y
                  disponibilidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: sección de consulta */}
          <div className="footer__section">
            <h4 className="footer__subtitle">Consultas</h4>
            <p className="footer__newsletter-text">
              ¿Tenés dudas? Escribinos y te responderemos a la brevedad
            </p>
            <form className="newsletter__form" onSubmit={handleEnviarConsulta}>
              <input
                type="email"
                placeholder="Tu email"
                className="newsletter__input"
                value={consultaEmail}
                onChange={(e) => setConsultaEmail(e.target.value)}
                disabled={enviandoConsulta}
              />
              <textarea
                placeholder="Escribí tu consulta aquí..."
                className="newsletter__textarea"
                value={consultaMensaje}
                onChange={(e) => setConsultaMensaje(e.target.value)}
                rows="3"
                disabled={enviandoConsulta}
              />
              <button
                type="submit"
                className="newsletter__button"
                disabled={enviandoConsulta}
              >
                {enviandoConsulta ? "Enviando..." : "Enviar Consulta"}
              </button>
              {mensajeExito && (
                <p className="mensaje-exito">✓ {mensajeExito}</p>
              )}
              {mensajeError && (
                <p className="mensaje-error">✗ {mensajeError}</p>
              )}
            </form>

            <div className="social__media">
              <h4 className="footer__subtitle">Síguenos</h4>
              <div className="social__icons">
                <a
                  href="https://facebook.com"
                  className="social__link"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook className="social__icon" />
                </a>
                <a
                  href="https://instagram.com"
                  className="social__link"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="social__icon" />
                </a>
                <a
                  href="https://twitter.com"
                  className="social__link"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter className="social__icon" />
                </a>
                <a
                  href="https://linkedin.com"
                  className="social__link"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="social__icon" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="footer__divider"></div>

        {/* Sección inferior */}
        <div className="footer__bottom">
          <div className="footer__copyright">
            <p>
              &copy; {new Date().getFullYear()} Bodega Piatelli. All rights
              reserved.
            </p>
          </div>
          <div className="footer__legal-links">
            <Link to="/privacy" className="legal__link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="legal__link">
              Terms of Service
            </Link>
            <Link to="/cookies" className="legal__link">
              Cookie Policy
            </Link>
            <Link to="/accessibility" className="legal__link">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
