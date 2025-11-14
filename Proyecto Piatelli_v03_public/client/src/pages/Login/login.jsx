import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDatabase,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaWineBottle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const navigate = useNavigate();

  // Verificar conexión con Supabase
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const { error } = await supabase
          .from("profiles")
          .select("rol_perfil")
          .limit(1);

        if (error) {
          console.error("Error de conexión:", error);
          setConnectionStatus("error");
        } else {
          setConnectionStatus("connected");
        }
      } catch (err) {
        console.error("Error verificando conexión:", err);
        setConnectionStatus("error");
      }
    };

    checkDatabaseConnection();
  }, []);

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "El correo electrónico es requerido";
    }
    if (!emailRegex.test(email)) {
      return "Ingrese un correo electrónico válido";
    }
    if (email.length > 255) {
      return "El correo electrónico es demasiado largo";
    }
    return null;
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    if (!password) {
      return "La contraseña es requerida";
    }
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (password.length > 100) {
      return "La contraseña es demasiado larga";
    }
    return null;
  };

  // Sanitización de entrada (prevención de XSS)
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Limpiar errores al escribir
    if (error) setError("");
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = null;

    if (name === "email") {
      errorMsg = validateEmail(value);
    } else if (name === "password") {
      errorMsg = validatePassword(value);
    }

    if (errorMsg) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    // Validaciones del lado del cliente
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Autenticación con Supabase (protegida contra SQL injection)
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (authError) {
        throw new Error(
          "Credenciales incorrectas. Verifique su email y contraseña."
        );
      }

      if (data.user) {
        // Obtener rol del usuario usando prepared statement (protegido contra SQL injection)
        const userRole = await getUserRole(data.user.email);

        // Guardar información de sesión
        localStorage.setItem("authToken", data.session.access_token);
        localStorage.setItem("userType", userRole);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userId", data.user.id);

        // Redirección según rol
        if (userRole === "admin") {
          navigate("/dashG");
        } else if (userRole === "operario") {
          navigate("/dashOp");
        } else {
          throw new Error("Rol de usuario no reconocido");
        }
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Error en la autenticación. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener rol (protegida contra SQL injection por Supabase)
  const getUserRole = async (userEmail) => {
    try {
      // Supabase usa prepared statements internamente, previene SQL injection
      const { data, error } = await supabase
        .from("profiles")
        .select("rol_perfil")
        .eq("email_perfil", userEmail)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Usuario no encontrado en el sistema");
        }
        throw new Error("Error al verificar permisos de usuario");
      }

      if (!data || !data.rol_perfil) {
        throw new Error("No se encontró rol asignado para el usuario");
      }

      return data.rol_perfil;
    } catch (err) {
      console.error("Error en getUserRole:", err);
      throw err;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="login-header">
          <motion.div
            className="logo-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaWineBottle className="logo-icon" />
            <h1>Piattelli</h1>
          </motion.div>
          <p className="login-subtitle">Sistema de Gestión</p>

          {/* Estado de conexión */}
          <div className={`connection-status ${connectionStatus}`}>
            <FaDatabase className="status-icon" />
            <span>
              {connectionStatus === "checking" && "Verificando conexión..."}
              {connectionStatus === "connected" && (
                <>
                  <FaCheckCircle style={{ marginRight: "6px" }} />
                  Conectado de forma segura
                </>
              )}
              {connectionStatus === "error" && "Error de conexión"}
            </span>
          </div>
        </div>

        {/* Mensaje de error general */}
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <FaExclamationTriangle className="error-icon" />
            {error}
          </motion.div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Campo Email */}
          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="input-label">
              <FaEnvelope style={{ marginRight: "8px" }} />
              Correo electrónico
            </label>
            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder="usuario@piattelli.com"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`login-input ${fieldErrors.email ? "error" : ""}`}
                disabled={isLoading}
                autoComplete="email"
                maxLength={255}
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </motion.div>

          {/* Campo Contraseña */}
          <motion.div
            className="input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="input-label">
              <FaLock style={{ marginRight: "8px" }} />
              Contraseña
            </label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Micontraseña1234!"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`login-input ${fieldErrors.password ? "error" : ""}`}
                disabled={isLoading}
                autoComplete="current-password"
                maxLength={100}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
                disabled={isLoading}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </motion.div>

          {/* Información de seguridad */}
          <motion.div
            className="security-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="security-text">
              🔒 Conexión segura. El sistema detectará automáticamente tu rol y
              te dirigirá al dashboard correspondiente.
            </p>
          </motion.div>

          {/* Botón de Login */}
          <motion.button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading || connectionStatus === "error"}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Autenticando...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="footer-text">
            Sistema protegido contra inyecciones SQL y validación de datos
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
