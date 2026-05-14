import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ isAuthLoading, activeUser, children }) => {
    const location = useLocation();

    if (isAuthLoading) {
        return (
            <div className="fixed inset-0 min-h-screen bg-slate-50 flex flex-col items-center justify-center z-[100]">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-slate-800 font-bold text-xl tracking-widest animate-pulse">VERIFICANDO SEGURIDAD</h2>
                <p className="text-slate-500 text-xs mt-2 font-mono">Conectando con el servidor...</p>
            </div>
        );
    }

    if (!activeUser) {
        // Redirigir al login guardando la ruta original
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
