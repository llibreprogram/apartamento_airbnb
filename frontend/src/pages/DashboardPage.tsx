import React, { useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { PropertiesTable } from '@/components/properties/PropertiesTable';
import { ReservationsPanel } from '@/components/reservations/ReservationsPanel';
import { ExpensesPanel } from '@/components/expenses/ExpensesPanel';
import { FinancialsPanel } from '@/components/financials/FinancialsPanel';

type TabType = 'overview' | 'properties' | 'reservations' | 'expenses' | 'financials';

export function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if authenticated
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-blue-100 sticky top-20 z-30 shadow-sm">
        <div className="pl-16 sm:pl-20 lg:pl-24 pr-16 sm:pr-20 lg:pr-24">
          <div className="flex gap-12 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold border-b-3 transition-all duration-200 whitespace-nowrap text-base ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 font-semibold border-b-3 transition-all duration-200 whitespace-nowrap text-base ${
                activeTab === 'properties'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              🏠 Propiedades
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-4 font-semibold border-b-3 transition-all duration-200 whitespace-nowrap text-base ${
                activeTab === 'reservations'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📅 Reservaciones
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-4 font-semibold border-b-3 transition-all duration-200 whitespace-nowrap text-base ${
                activeTab === 'expenses'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💰 Gastos
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`px-6 py-4 font-semibold border-b-3 transition-all duration-200 whitespace-nowrap text-base ${
                activeTab === 'financials'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📈 Financieros
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Propiedades</p>
                    <p className="text-4xl font-bold text-blue-600 mt-3">0</p>
                  </div>
                  <div className="text-4xl">🏠</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Reservaciones</p>
                    <p className="text-4xl font-bold text-green-600 mt-3">0</p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-amber-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Gastos Totales</p>
                    <p className="text-4xl font-bold text-amber-600 mt-3">$0</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Rentabilidad</p>
                    <p className="text-4xl font-bold text-purple-600 mt-3">0%</p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-lg p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                👤 Información de Perfil
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="flex flex-col space-y-2">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-lg font-medium text-gray-900 break-all">{user.email}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Nombre Completo</p>
                  <p className="text-lg font-medium text-gray-900">{user.fullName}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Rol</p>
                  <p className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm capitalize w-fit">
                    {user.role === 'admin' ? '👨‍💼 Administrador' : '👤 Propietario'}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Estado</p>
                  <p className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm w-fit">
                    ✓ Activo
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <PropertiesTable onRefresh={() => {}} />
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ReservationsPanel />
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ExpensesPanel />
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="bg-white rounded-lg shadow p-6">
            <FinancialsPanel />
          </div>
        )}
      </div>
    </>
  );
}
