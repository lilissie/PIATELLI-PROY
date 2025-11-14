
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ScroollTop from "./components/componentes/ScrollTop";
import Footer from "./components/layout/Footer/footer";


import Actividades from "./pages/Actividades/actividades";
import DashBGerente from "./pages/DashBGerente/dashgerente";
import DashBOper from "./pages/DashBOper/dashoperario";
import Factura from "./pages/factura/factura";
import Habitaciones from "./pages/Habitaciones/habitaciones";
import Home from "./pages/home/home";
import Login from "./pages/Login/login";
import Ubicacion from "./pages/Ubicacion/ubicacion";
import Vinos from "./pages/Vinos/vinos";

import AppLayout from "./components/layout/appLayout";
import DashboardLayout from "./components/layout/dasgLayout";


function App() {
  return (
    <Router>
      <ScroollTop />
      <Routes>
        {/* Rutas públicas con AppLayout (con Header) */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vinos" element={<Vinos />} />
              <Route path="/actividades" element={<Actividades />} />
              <Route path="/ubicacion" element={<Ubicacion />} />
              <Route path="/Habitaciones" element={<Habitaciones />} />
              <Route path="/Factura" element={<Factura />} />
              <Route path="/login" element={<Login />} />

            </Routes>
          </AppLayout>
        } />
        
        {/* Rutas del dashboard con DashboardLayout (sin Header) */}
        <Route path="/dashG/*" element={
          <DashboardLayout>
            <Routes>
              <Route 
                path="/" 
                element={
                  <DashBGerente />
                } 
              />
            </Routes>
          </DashboardLayout>
        } />
        
        <Route path="/dashOp/*" element={
          <DashboardLayout>
            <Routes>
              <Route 
                path="/" 
                element={
                    <DashBOper />
                } 
              />
            </Routes>
          </DashboardLayout>
        } />

        {/* Ruta por defecto para páginas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;