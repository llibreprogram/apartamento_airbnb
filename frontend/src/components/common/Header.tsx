import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<Record<string, never>> = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Apartamentos</h1>
              <p className="text-xs text-blue-100">Gestión de Propiedades</p>
            </div>
          </div>

          {/* Welcome Message and User Actions */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-white font-semibold">¡Hola, {user?.fullName}! 👋</p>
              <p className="text-xs text-blue-100">{user?.email}</p>
            </div>

            {/* User Avatar */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-md">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
