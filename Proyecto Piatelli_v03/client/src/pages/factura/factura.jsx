import axios from "axios";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
} from "react-icons/fa";
import "./factura.css";

const Factura = () => {
  const [loading, setLoading] = useState(false);

  // Función con axios para crear la preferencia en el backend
  const createPreference = async () => {
    try {
      console.log("Enviando petición al backend...");

      // Crear objeto con todos los datos necesarios
      const preferenceData = {
        title: "Reserva Hotel - " + tipoAlojamiento.join(", "),
        quantity: 1,
        price: calcularTotal(),
        // Datos adicionales para el email y registro
        metadata: {
          nombre: datosPersona.nombre,
          apellido: datosPersona.apellido,
          email: datosPersona.email,
          dni: datosPersona.dni,
          personas: personas,
          fechas: fechas,
          alojamientos: tipoAlojamiento,
          actividades: actividades,
          total: calcularTotal(),
          diasReserva: calcularDiasReserva(), // Agregar días de reserva
        },
      };

      console.log("Datos enviados al backend:", preferenceData);

      const response = await axios.post(
        "http://localhost:5000/create_preference",
        preferenceData
      );

      console.log("Respuesta del backend:", response.data);
      const { id } = response.data;
      return id;
    } catch (error) {
      console.error("Error al crear la preferencia:", error);
      alert("Error al procesar la compra. Revisa la consola.");
      return null;
    }
  };

  // Manejo de compras con redirección
  const handleBuy = async () => {
    console.log("Botón comprar presionado");

    // Primero validar todos los campos
    if (!validarCampos()) {
      alert("Por favor, complete todos los campos requeridos correctamente.");
      return;
    }

    setLoading(true);

    const id = await createPreference();
    console.log("ID obtenido:", id);

    if (id) {
      // Redirigir directamente a MercadoPago
      window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${id}`;
    } else {
      alert("No se pudo crear la preferencia de pago");
      setLoading(false);
    }
  };

  const [personas, setPersonas] = useState(2);
  const [datosPersona, setDatosPersona] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
  });
  const [errores, setErrores] = useState({});
  const [fechas, setFechas] = useState({
    inicio: "",
    fin: "",
  });
  const [tipoAlojamiento, setTipoAlojamiento] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [fechasSalon, setFechasSalon] = useState({
    inicio: "",
    fin: "",
  });

  // Precios POR DÍA de cada alojamiento
  const preciosPorDia = {
    alojamientos: {
      "Glamping Matrimonial": 80,
      Ejecutiva: 60,
      "Suite Premium": 100,
      Familiar: 120,
    },
    actividades: {
      Spa: 15,
      Degustación: 80,
/*       "Alquilar salón de eventos": 30, */
      "Paseos 4x4": 12,
      Jacuzzi: 60,
    },
  };

  const capacidadesAlojamiento = {
    "Glamping Matrimonial": 2,
    Ejecutiva: 2,
    "Suite Premium": 3,
    Familiar: 4,
  };

  // Validaciones
  const validarCampos = () => {
    const nuevosErrores = {};

    // Validar datos personales
    if (!datosPersona.nombre.trim()) nuevosErrores.nombre = "Nombre requerido";
    if (!datosPersona.apellido.trim())
      nuevosErrores.apellido = "Apellido requerido";
    if (!datosPersona.dni.trim()) nuevosErrores.dni = "DNI requerido";
    else if (!/^\d{1,3}(\.\d{3})*$/.test(datosPersona.dni))
      nuevosErrores.dni = "Formato DNI inválido (ej: 45.111.222)";

    if (!datosPersona.email.trim()) nuevosErrores.email = "Email requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosPersona.email))
      nuevosErrores.email = "Email inválido";

    // Validar fechas de reserva
    if (!fechas.inicio) nuevosErrores.inicio = "Fecha de inicio requerida";
    if (!fechas.fin) nuevosErrores.fin = "Fecha de fin requerida";
    else if (fechas.inicio && fechas.fin) {
      const inicio = new Date(fechas.inicio);
      const fin = new Date(fechas.fin);
      const diferenciaDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

      if (fin <= inicio) {
        nuevosErrores.fin = "La fecha fin debe ser posterior a la fecha inicio";
      } else if (diferenciaDias < 1) {
        nuevosErrores.fin = "La estadía mínima es de 1 día completo";
      }
    }

    // Validar fechas del salón si está seleccionado
    if (actividades.includes("Alquilar salón de eventos")) {
      if (!fechasSalon.inicio) {
        nuevosErrores.inicioSalon = "Fecha de inicio del salón requerida";
      }
      if (!fechasSalon.fin) {
        nuevosErrores.finSalon = "Fecha de fin del salón requerida";
      } else if (fechasSalon.inicio && fechasSalon.fin) {
        const inicioSalon = new Date(fechasSalon.inicio);
        const finSalon = new Date(fechasSalon.fin);
        const inicioReserva = new Date(fechas.inicio);
        const finReserva = new Date(fechas.fin);

        // Validar que las fechas del salón sean válidas
        if (finSalon <= inicioSalon) {
          nuevosErrores.finSalon =
            "La fecha fin del salón debe ser posterior a la fecha inicio";
        }

        // Validar que el salón esté dentro del rango de hospedaje
        if (fechas.inicio && fechas.fin) {
          if (inicioSalon < inicioReserva) {
            nuevosErrores.inicioSalon =
              "El salón no puede empezar antes del inicio de la reserva";
          }
          if (finSalon > finReserva) {
            nuevosErrores.finSalon =
              "El salón no puede terminar después del fin de la reserva";
          }
        }

        // Validar duración mínima del salón (1 día)
        const diferenciaDiasSalon = Math.ceil(
          (finSalon - inicioSalon) / (1000 * 60 * 60 * 24)
        );
        if (diferenciaDiasSalon < 1) {
          nuevosErrores.finSalon =
            "El alquiler del salón debe ser de al menos 1 día completo";
        }
      }
    }

    // Validar alojamiento
    if (tipoAlojamiento.length === 0)
      nuevosErrores.alojamiento = "Seleccione al menos un alojamiento";

    // Validar capacidad
    if (!capacidadSuficiente) {
      nuevosErrores.capacidad = `Capacidad insuficiente: ${calcularCapacidadTotal()} personas (necesitas ${personas})`;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Función para calcular la capacidad total
  const calcularCapacidadTotal = () => {
    return tipoAlojamiento.reduce((total, alojamiento) => {
      return total + (capacidadesAlojamiento[alojamiento] || 0);
    }, 0);
  };

  // Función para cambiar personas con validación
  const cambiarPersonas = (nuevaCantidad) => {
    if (nuevaCantidad < 1 || nuevaCantidad > 50) return;
    setPersonas(nuevaCantidad);
  };

  // Calcular días entre fechas de reserva
  const calcularDiasReserva = () => {
    return calcularDias(fechas.inicio, fechas.fin);
  };

  // Calcular días entre fechas (función genérica)
  const calcularDias = (inicio, fin) => {
    if (!inicio || !fin) return 0;
    const start = new Date(inicio);
    const end = new Date(fin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcular precio total de un alojamiento considerando los días
  const calcularPrecioAlojamiento = (alojamiento) => {
    const dias = calcularDiasReserva();
    const precioPorDia = preciosPorDia.alojamientos[alojamiento] || 0;
    return precioPorDia * dias;
  };

  // Calcular precio total de todos los alojamientos
  const calcularTotalAlojamientos = () => {
    return tipoAlojamiento.reduce((total, alojamiento) => {
      return total + calcularPrecioAlojamiento(alojamiento);
    }, 0);
  };

  const calcularTotal = () => {
    let total = 0;

    // Calcular por alojamientos (considerando días)
    total += calcularTotalAlojamientos();

    // Calcular por actividades
    actividades.forEach((actividad) => {
      if (preciosPorDia.actividades[actividad]) {
        if (actividad === "Alquilar salón de eventos") {
          const dias = calcularDias(fechasSalon.inicio, fechasSalon.fin);
          total += preciosPorDia.actividades[actividad] * Math.max(1, dias);
        } else {
          total += preciosPorDia.actividades[actividad];
        }
      }
    });

    return total;
  };

  const handleActividadChange = (actividad) => {
    if (actividades.includes(actividad)) {
      setActividades(actividades.filter((a) => a !== actividad));
      // Limpiar errores del salón si se deselecciona
      if (actividad === "Alquilar salón de eventos") {
        setErrores((prev) => ({
          ...prev,
          inicioSalon: undefined,
          finSalon: undefined,
        }));
      }
    } else {
      setActividades([...actividades, actividad]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosPersona((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando se escribe
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFechaChange = (e) => {
    const { name, value } = e.target;
    setFechas((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFechaSalonChange = (e) => {
    const { name, value } = e.target;
    setFechasSalon((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errores[name + "Salon"]) {
      setErrores((prev) => ({
        ...prev,
        [name + "Salon"]: undefined,
      }));
    }
  };

  const capacidadSuficiente = calcularCapacidadTotal() >= personas;
  const diasSalon = calcularDias(fechasSalon.inicio, fechasSalon.fin);
  const diasReserva = calcularDiasReserva();

  return (
    <div className="reserva-factura">
      <div className="factura-container">
        {/* Header */}
        <header className="factura-header">
          <div className="paper-cut-top"></div>
          <h1 className="factura-titulo">RESERVAS</h1>
          <div className="factura-subtitulo">
            <h2>Estado</h2>
            <div className="estado-reserva estado-pendiente">A confirmar</div>
          </div>
        </header>

        {/* Datos Personales */}
        <section className="seccion-datos">
          <h3 className="seccion-titulo">Datos Personales</h3>
          <div className="formulario-grid">
            <div className="input-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={datosPersona.nombre}
                onChange={handleInputChange}
                placeholder="Pablo"
                className={errores.nombre ? "error" : ""}
              />
              {errores.nombre && (
                <span className="mensaje-error">{errores.nombre}</span>
              )}
            </div>
            <div className="input-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={datosPersona.apellido}
                onChange={handleInputChange}
                placeholder="Celaya"
                className={errores.apellido ? "error" : ""}
              />
              {errores.apellido && (
                <span className="mensaje-error">{errores.apellido}</span>
              )}
            </div>
            <div className="input-group">
              <label>DNI</label>
              <input
                type="text"
                name="dni"
                value={datosPersona.dni}
                onChange={handleInputChange}
                placeholder="45.111.222"
                className={errores.dni ? "error" : ""}
              />
              {errores.dni && (
                <span className="mensaje-error">{errores.dni}</span>
              )}
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={datosPersona.email}
                onChange={handleInputChange}
                placeholder="pablocelaya@gmail.com"
                className={errores.email ? "error" : ""}
              />
              {errores.email && (
                <span className="mensaje-error">{errores.email}</span>
              )}
            </div>
          </div>
        </section>

        <div className="divisor"></div>

        {/* Cantidad de Personas */}
        <section className="seccion-personas">
          <h3 className="seccion-titulo">Cantidad de Personas</h3>
          <div className="contador-personas">
            <FaUser className="persona-icono" />
            <button
              className="btn-contador"
              onClick={() => cambiarPersonas(personas - 1)}
              disabled={personas <= 1}
            >
              -
            </button>
            <span className="cantidad-personas">{personas}</span>
            <button
              className="btn-contador"
              onClick={() => cambiarPersonas(personas + 1)}
              disabled={personas >= 50}
            >
              +
            </button>
          </div>
          <div className="info-rango">Mínimo: 1 - Máximo: 50 personas</div>
          {errores.capacidad && (
            <span className="mensaje-error">{errores.capacidad}</span>
          )}
        </section>

        <div className="divisor"></div>

        {/* Fechas de Reserva */}
        <section className="seccion-fechas">
          <h3 className="seccion-titulo">Fechas de Reserva</h3>
          <div className="fechas-grid">
            <div className="input-group">
              <label>
                <FaCalendarAlt className="icono-fecha" />
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="inicio"
                value={fechas.inicio}
                onChange={handleFechaChange}
                className={errores.inicio ? "error" : ""}
              />
              {errores.inicio && (
                <span className="mensaje-error">{errores.inicio}</span>
              )}
            </div>
            <div className="input-group">
              <label>
                <FaCalendarAlt className="icono-fecha" />
                Fecha de Fin
              </label>
              <input
                type="date"
                name="fin"
                value={fechas.fin}
                onChange={handleFechaChange}
                className={errores.fin ? "error" : ""}
              />
              {errores.fin && (
                <span className="mensaje-error">{errores.fin}</span>
              )}
            </div>
          </div>
          {diasReserva > 0 && (
            <div className="info-dias-reserva">
              Duración de la reserva: {diasReserva} día
              {diasReserva !== 1 ? "s" : ""}
            </div>
          )}
        </section>

        <div className="divisor"></div>

        {/* Tipo de Alojamiento */}
        <section className="seccion-alojamiento">
          <h3 className="seccion-titulo">Tipo de Alojamiento</h3>
          {errores.alojamiento && (
            <span className="mensaje-error">{errores.alojamiento}</span>
          )}

          {/* Mensaje de capacidad */}
          {tipoAlojamiento.length > 0 && (
            <div
              className={`mensaje-capacidad ${
                capacidadSuficiente ? "suficiente" : "insuficiente"
              }`}
            >
              {capacidadSuficiente ? (
                <>
                  <FaCheckCircle /> Capacidad suficiente:{" "}
                  {calcularCapacidadTotal()} personas
                </>
              ) : (
                <>
                  <FaExclamationTriangle /> Capacidad insuficiente:{" "}
                  {calcularCapacidadTotal()} personas (necesitas {personas})
                </>
              )}
            </div>
          )}

          <div className="selector-alojamiento">
            <select
              value=""
              onChange={(e) => {
                if (
                  e.target.value &&
                  !tipoAlojamiento.includes(e.target.value)
                ) {
                  setTipoAlojamiento([...tipoAlojamiento, e.target.value]);
                  if (errores.alojamiento) {
                    setErrores((prev) => ({ ...prev, alojamiento: undefined }));
                  }
                }
              }}
              className="dropdown-alojamiento"
            >
              <option value="">Seleccione un alojamiento</option>
              {Object.entries(preciosPorDia.alojamientos).map(
                ([alojamiento, precioPorDia]) => (
                  <option key={alojamiento} value={alojamiento}>
                    {alojamiento} - ${precioPorDia}/día (Capacidad:{" "}
                    {capacidadesAlojamiento[alojamiento]} personas)
                  </option>
                )
              )}
            </select>
          </div>

          {/* Etiquetas de alojamientos seleccionados */}
          <div className="etiquetas-alojamiento">
            {tipoAlojamiento.map((alojamiento) => (
              <div key={alojamiento} className="etiqueta-alojamiento">
                <span className="etiqueta-texto">
                  {alojamiento} - ${preciosPorDia.alojamientos[alojamiento]}/día
                  {diasReserva > 0 && (
                    <span className="precio-total-alojamiento">
                      {" "}
                      (Total: ${calcularPrecioAlojamiento(alojamiento)})
                    </span>
                  )}
                  <span className="capacidad-info">
                    {" "}
                    (Cap: {capacidadesAlojamiento[alojamiento]})
                  </span>
                </span>
                <button
                  className="etiqueta-eliminar"
                  onClick={() =>
                    setTipoAlojamiento(
                      tipoAlojamiento.filter((a) => a !== alojamiento)
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="divisor"></div>

        {/* Actividades */}
        <section className="seccion-actividades">
          <h3 className="seccion-titulo">Actividades</h3>
          <div className="lista-actividades">
            {Object.entries(preciosPorDia.actividades).map(
              ([actividad, precio]) => (
                <div key={actividad} className="actividad-container">
                  <label className="actividad-item">
                    <input
                      type="checkbox"
                      checked={actividades.includes(actividad)}
                      onChange={() => handleActividadChange(actividad)}
                    />
                    <span className="checkmark"></span>
                    <span className="actividad-nombre">{actividad}</span>
                    <span className="actividad-precio">
                      {actividad === "Alquilar salón de eventos"
                        ? `$${precio}/día`
                        : `+$${precio}`}
                    </span>
                  </label>

                  {/* Calendario para salón de eventos */}
                  {actividad === "Alquilar salón de eventos" &&
                    actividades.includes(actividad) && (
                      <div
                        className="calendario-salon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4>Fechas del Salón de Eventos</h4>
                        <div className="fechas-grid">
                          <div className="input-group">
                            <label>Inicio del salón</label>
                            <input
                              type="date"
                              name="inicio"
                              value={fechasSalon.inicio}
                              onChange={handleFechaSalonChange}
                              className={errores.inicioSalon ? "error" : ""}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="mensaje-error">
                              {errores.inicioSalon}
                            </span>
                          </div>
                          <div className="input-group">
                            <label>Fin del salón</label>
                            <input
                              type="date"
                              name="fin"
                              value={fechasSalon.fin}
                              onChange={handleFechaSalonChange}
                              className={errores.finSalon ? "error" : ""}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {errores.finSalon && (
                              <span className="mensaje-error">
                                {errores.finSalon}
                              </span>
                            )}
                          </div>
                        </div>
                        {diasSalon > 0 && (
                          <div className="info-dias-salón">
                            Duración: {diasSalon} día
                            {diasSalon !== 1 ? "s" : ""}
                            (Total: $
                            {preciosPorDia.actividades[actividad] * diasSalon})
                          </div>
                        )}
                      </div>
                    )}
                </div>
              )
            )}
          </div>
        </section>

        <div className="divisor"></div>

        {/* Resumen de Pago */}
        <section className="seccion-resumen">
          <h3 className="seccion-titulo">Resumen de Pago</h3>
          <div className="resumen-detalles">
            {tipoAlojamiento.length > 0 && (
              <div className="resumen-linea">
                <span>Alojamientos ({diasReserva} días):</span>
                <div className="alojamientos-lista">
                  {tipoAlojamiento.map((alojamiento) => (
                    <div key={alojamiento} className="item-resumen">
                      <span>{alojamiento}</span>
                      <span>
                        ${preciosPorDia.alojamientos[alojamiento]} ×{" "}
                        {diasReserva} días = $
                        {calcularPrecioAlojamiento(alojamiento)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {actividades.length > 0 && (
              <div className="resumen-actividades">
                <span>Actividades:</span>
                <div className="actividades-lista">
                  {actividades.map((actividad) => (
                    <div key={actividad} className="item-resumen">
                      <span>{actividad}</span>
                      <span>
                        {actividad === "Alquilar salón de eventos"
                          ? `$${
                              preciosPorDia.actividades[actividad]
                            } × ${diasSalon} días = $${
                              preciosPorDia.actividades[actividad] * diasSalon
                            }`
                          : `$${preciosPorDia.actividades[actividad]}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="resumen-total">
              <span>Total a pagar:</span>
              <span className="total-monto">${calcularTotal()}</span>
            </div>
          </div>

          <div className="medio-pago">
            <span className="label">Medio de pago:</span>
            <div className="mercado-pago-badge">
              <span>Mercado Pago</span>
            </div>
          </div>
        </section>

        {/* Acciones */}
        <footer className="factura-actions">
          <button
            className="btn btn-primario btn-pagar"
            onClick={handleBuy}
            disabled={loading || !capacidadSuficiente}
          >
            {loading
              ? "Redirigiendo a MercadoPago..."
              : `Pagar: $${calcularTotal()}`}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Factura;
