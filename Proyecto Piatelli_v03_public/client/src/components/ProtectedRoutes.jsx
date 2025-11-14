// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from "../supabase/client";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    userRole: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setAuthState({ isLoading: false, isAuthenticated: false, userRole: null });
          return;
        }

        // Verificar que el usuario aún sea válido
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          await supabase.auth.signOut();
          setAuthState({ isLoading: false, isAuthenticated: false, userRole: null });
          return;
        }

        // Obtener el rol del usuario desde localStorage o de la base de datos
        const userRole = localStorage.getItem('userType');
        
        // Verificar rol específico si se requiere
        if (requiredRole && userRole !== requiredRole) {
          await supabase.auth.signOut();
          localStorage.clear();
          setAuthState({ isLoading: false, isAuthenticated: false, userRole: null });
          return;
        }

        setAuthState({ 
          isLoading: false, 
          isAuthenticated: true, 
          userRole: userRole 
        });

      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setAuthState({ isLoading: false, isAuthenticated: false, userRole: null });
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (authState.isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;