import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaMountain,
  FaRoute,
  FaCompass,
} from "react-icons/fa";
import "./ubicacion.css";

/* componentes */
import Valoracion from "../../components/componentes/valoracion/valoraciones";

function Ubicacion() {
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);
  const BodegaUbi = [-26.045251223540525, -65.99689424018364];

  useEffect(() => {
    if (mapInitialized.current || !mapRef.current) return;

    const loadMap = () => {
      if (!window.L || mapInitialized.current) return;

      try {
        const map = window.L.map(mapRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
        }).setView(BodegaUbi, 16);

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
          }
        ).addTo(map);

        // Marcador personalizado
        const customIcon = window.L.divIcon({
          className: "custom-marker",
          html: `
            <div class="marker-pin">
              <div class="marker-icon">🍷</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        window.L.marker(BodegaUbi, { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `
            <div class="custom-popup">
              <h3>PIATTELLI</h3>
              <p>Bodega y Viñedos</p>
              <p>Cafayate, Salta</p>
              <p>Argentina</p>
            </div>
          `
          )
          .openPopup();

        mapInitialized.current = true;

        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.log("Error al cargar el mapa:", error);
      }
    };

    if (window.L) {
      loadMap();
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = loadMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInitialized.current && window.L && mapRef.current) {
        const map = window.L.map(mapRef.current);
        if (map && map.remove) {
          map.remove();
          mapInitialized.current = false;
        }
      }
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const infoItems = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Dirección",
      content: "Ruta Provincial N°2, Cafayate, Salta",
    },
    {
      icon: <FaClock />,
      title: "Horarios",
      content: "Lunes a Domingo: 8:00 – 21:00",
    },
    {
      icon: <FaPhone />,
      title: "Teléfono",
      content: "0261 405-8333",
    },
    {
      icon: <FaMountain />,
      title: "Altitud",
      content: "1,683 metros sobre el nivel del mar",
    },
  ];

  return (
    <div className="ubicacion-page">
      {/* Hero Section */}
      <motion.div
        className="ubicacion-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-overlay"></div>
        <motion.div
          className="hero-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.div
            className="hero-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <FaCompass />
          </motion.div>
          <h1 className="hero-title">UBICACIÓN</h1>
          <p className="hero-subtitle">
            En el corazón de los Valles Calchaquíes
          </p>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="ubicacion-content">
        {/* Información Principal */}
        <motion.section
          className="info-section"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div className="section-header" variants={itemVariants}>
            <h2 className="section-title">Cómo Llegar</h2>
            <div className="title-divider"></div>
            <p className="section-description">
              Nos encontramos en el corazón de los Valles Calchaquíes, Cafayate,
              Salta. Rodeados de viñedos centenarios y paisajes únicos que te
              cautivarán desde el primer momento.
            </p>
          </motion.div>

          <div className="info-grid">
            {infoItems.map((item, index) => (
              <motion.div
                key={index}
                className="info-card"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="info-card-icon">{item.icon}</div>
                <div className="info-card-content">
                  <h3 className="info-card-title">{item.title}</h3>
                  <p className="info-card-text">{item.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Mapa Interactivo */}
        <motion.section
          className="map-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="map-header">
            <FaRoute className="map-header-icon" />
            <h2 className="map-title">Mapa Interactivo</h2>
          </div>
          <div className="map-wrapper">
            <div ref={mapRef} className="map">
              <div className="map-loader">
                <div className="loader-spinner"></div>
                <p>Cargando mapa...</p>
              </div>
            </div>
          </div>
          <motion.a
            href={`https://www.google.com/maps?q=${BodegaUbi[0]},${BodegaUbi[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Abrir en Google Maps
          </motion.a>
        </motion.section>

        {/* Indicaciones de Acceso */}
        <motion.section
          className="directions-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title">Indicaciones de Acceso</h2>
          <div className="title-divider"></div>
          <div className="directions-grid">
            <motion.div className="direction-card" whileHover={{ scale: 1.03 }}>
              <div className="direction-number">1</div>
              <h3>Desde Salta Capital</h3>
              <p>Tomar Ruta Nacional 68 hacia el sur por 189 km</p>
            </motion.div>
            <motion.div className="direction-card" whileHover={{ scale: 1.03 }}>
              <div className="direction-number">2</div>
              <h3>Llegada a Cafayate</h3>
              <p>Ingresar a Cafayate y tomar Ruta Provincial N°2</p>
            </motion.div>
            <motion.div className="direction-card" whileHover={{ scale: 1.03 }}>
              <div className="direction-number">3</div>
              <h3>Destino Final</h3>
              <p>La bodega se encuentra a 5 km del centro de Cafayate</p>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Valoraciones */}
      <Valoracion />
    </div>
  );
}

export default Ubicacion;
