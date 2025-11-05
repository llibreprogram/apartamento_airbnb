'use client';

import { useState, useEffect } from 'react';
// @ts-ignore
import { apiClient } from '@/services/api';

interface Reservation {
  id: string;
  propertyId: string;
  propertyName?: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
  pricePerNight?: number;
  deposit?: number;
}

export function ReservationsPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterProperty, setFilterProperty] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const itemsPerPage = 10;

  // Formulario de nueva reservación
  const [formData, setFormData] = useState({
    propertyId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
    totalPrice: 0,
    notes: '',
  });

  const fetchReservations = async (page = 1, status = '', propertyId = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      if (status) params.append('status', status);
      if (propertyId) params.append('propertyId', propertyId);

      const response = await apiClient.get('/reservations', { params });
      setReservations(response.data.data || response.data);
      setCurrentPage(page);
      setTotalPages(response.data.pageCount || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar reservaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/properties');
      setProperties(response.data.data || response.data);
    } catch (err: any) {
      console.error('Error loading properties:', err);
    }
  };

  useEffect(() => {
    fetchReservations(1, filterStatus, filterProperty);
    fetchProperties();
  }, []);

  // Calcular precio automáticamente cuando cambian fechas o propiedad
  useEffect(() => {
    if (formData.checkIn && formData.checkOut && formData.propertyId) {
      const property = properties.find(p => p.id === formData.propertyId);
      if (property && property.pricePerNight) {
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
        const basePrice = nights * property.pricePerNight;
        const deposit = property.deposit || 0;
        const totalPrice = basePrice + deposit;
        setFormData(prev => ({ ...prev, totalPrice: Math.round(totalPrice * 100) / 100 }));
      }
    }
  }, [formData.checkIn, formData.checkOut, formData.propertyId, properties]);

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    fetchReservations(1, status, filterProperty);
  };

  const handlePropertyFilter = (propertyId: string) => {
    setFilterProperty(propertyId);
    fetchReservations(1, filterStatus, propertyId);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      let endpoint = `/reservations/${id}`;
      if (newStatus === 'confirmed') endpoint += '/confirm';
      else if (newStatus === 'completed') endpoint += '/complete';
      else if (newStatus === 'cancelled') endpoint += '/cancel';

      await apiClient.post(endpoint, {});
      fetchReservations(currentPage, filterStatus, filterProperty);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar reservación');
    }
  };

  // Funciones para el calendario
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getReservationsForDay = (day: number) => {
    const dayDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    return reservations.filter(res => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      return dayDate >= checkIn && dayDate < checkOut &&
        (!filterProperty || res.propertyId === filterProperty);
    });
  };

  const previousMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1));
  };

  const monthName = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  };

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validar campos
      if (!formData.propertyId || !formData.guestName || !formData.guestEmail || 
          !formData.checkIn || !formData.checkOut || !formData.numberOfGuests || !formData.totalPrice) {
        setError('Por favor completa todos los campos requeridos');
        setSubmitting(false);
        return;
      }

      // Convertir fechas a ISO 8601
      const checkInDate = new Date(formData.checkIn + 'T00:00:00Z').toISOString();
      const checkOutDate = new Date(formData.checkOut + 'T00:00:00Z').toISOString();

      // Crear reservación
      await apiClient.post('/reservations', {
        propertyId: formData.propertyId,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        numberOfGuests: parseInt(formData.numberOfGuests.toString()),
        totalPrice: parseFloat(formData.totalPrice.toString()),
        notes: formData.notes || undefined,
      });

      // Limpiar formulario y cerrar modal
      setFormData({
        propertyId: '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        checkIn: '',
        checkOut: '',
        numberOfGuests: 1,
        totalPrice: 0,
        notes: '',
      });
      setShowModal(false);

      // Recargar reservaciones
      fetchReservations(1, filterStatus);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear reservación');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  if (loading && reservations.length === 0) {
    return <div className="text-center py-8">Cargando reservaciones...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Reservaciones</h2>
          <p className="text-gray-500">Total: {reservations.length} reservaciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          ✓ Agregar Reservación
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${
            viewMode === 'list'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📋 Vista de Lista
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg font-semibold text-sm ${
            viewMode === 'calendar'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📅 Vista de Calendario
        </button>
      </div>

      {/* Property Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filtrar por Propiedad:
        </label>
        <select
          value={filterProperty}
          onChange={(e) => handlePropertyFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las propiedades</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      {viewMode === 'list' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusFilter('')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filterStatus === ''
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filterStatus === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => handleStatusFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filterStatus === 'confirmed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filterStatus === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completadas
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* VISTA DE LISTA */}
      {viewMode === 'list' && (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Propiedad</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Huésped</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-in</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Huéspedes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      No hay reservaciones en este filtro.
                    </td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{res.propertyName || res.propertyId}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{res.guestName}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{res.guestEmail}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(res.checkIn).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(res.checkOut).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-center">{res.numberOfGuests}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">${res.totalPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(res.status)}`}>
                          {getStatusLabel(res.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {res.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(res.id, 'confirmed')}
                            className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                          >
                            Confirmar
                          </button>
                        )}
                        {res.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(res.id, 'completed')}
                            className="text-green-500 hover:text-green-700 font-semibold text-sm"
                          >
                            Completar
                          </button>
                        )}
                        {(res.status === 'pending' || res.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusChange(res.id, 'cancelled')}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm ml-2"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchReservations(page, filterStatus, filterProperty)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* VISTA DE CALENDARIO */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={previousMonth}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              ← Anterior
            </button>
            <h3 className="text-xl font-bold capitalize">
              {monthName(calendarDate)}
            </h3>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Siguiente →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-700 py-2 bg-gray-100 rounded">
                {day}
              </div>
            ))}

            {/* Empty cells for first days */}
            {Array.from({ length: getFirstDayOfMonth(calendarDate) - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50 rounded p-2 min-h-24"></div>
            ))}

            {/* Days with reservations */}
            {Array.from({ length: getDaysInMonth(calendarDate) }).map((_, i) => {
              const day = i + 1;
              const dayReservations = getReservationsForDay(day);
              const today = new Date();
              const isToday = day === today.getDate() && 
                calendarDate.getMonth() === today.getMonth() &&
                calendarDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`rounded p-2 min-h-24 border-2 ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  } overflow-y-auto`}
                >
                  <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayReservations.map((res) => (
                      <div
                        key={res.id}
                        className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${
                          res.status === 'confirmed' ? 'bg-green-500' :
                          res.status === 'pending' ? 'bg-yellow-500' :
                          res.status === 'completed' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}
                        title={`${res.guestName} - ${res.propertyName || res.propertyId}`}
                      >
                        {res.guestName.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h4 className="font-bold text-sm mb-2">Leyenda:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Completada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Cancelada</span>
              </div>
            </div>
          </div>

          {/* Reservations in selected month */}
          {reservations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-sm mb-3">Reservaciones en este período:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reservations
                  .filter(res => {
                    const checkIn = new Date(res.checkIn);
                    return checkIn.getMonth() === calendarDate.getMonth() &&
                      checkIn.getFullYear() === calendarDate.getFullYear();
                  })
                  .map((res) => (
                    <div key={res.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{res.guestName}</p>
                          <p className="text-xs text-gray-600">{res.propertyName || res.propertyId}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(res.checkIn).toLocaleDateString('es-ES')} - {new Date(res.checkOut).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(res.status)}`}>
                          {getStatusLabel(res.status)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para agregar reservación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">Agregar Nueva Reservación</h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleAddReservation} className="space-y-4">
              {/* Propiedad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Propiedad *
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Selecciona una propiedad</option>
                  {properties.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre del Huésped */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre del Huésped *
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="juan@email.com"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="+34 600 123 456"
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Check-in *
                </label>
                <input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Check-out *
                </label>
                <input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Número de Huéspedes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Número de Huéspedes *
                </label>
                <input
                  type="number"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Precio Total */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Precio Total ($) * 
                  <span className="text-xs font-normal text-gray-500 ml-2">
                    {formData.checkIn && formData.checkOut && formData.propertyId ? 
                      `(Calculado automáticamente: $${formData.totalPrice.toFixed(2)})`
                      : '(Se calculará al seleccionar fechas y propiedad)'}
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.totalPrice}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
                  required
                  readOnly
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Crear Reservación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
