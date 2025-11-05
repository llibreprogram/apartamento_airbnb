import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { PropertyForm } from './PropertyForm';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  createdAt: string;
}

interface PropertiesTableProps {
  onRefresh?: () => void;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ onRefresh }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cityFilter, setCityFilter] = useState('');
  const itemsPerPage = 10;

  const fetchProperties = async (page = 1, city = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });
      if (city) params.append('city', city);

      const response = await apiClient.get('/properties', { params });
      setProperties(response.data.data);
      setCurrentPage(page);
      setTotalPages(response.data.pageCount || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar propiedades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(1, cityFilter);
  }, [cityFilter]);

  const handleCityFilter = (city: string) => {
    setCityFilter(city);
    fetchProperties(1, city);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta propiedad?')) return;

    try {
      await apiClient.delete(`/properties/${id}`);
      setProperties(properties.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar propiedad');
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    fetchProperties(currentPage, cityFilter);
    onRefresh?.();
  };

  if (loading && properties.length === 0) {
    return <div className="text-center py-8">Cargando propiedades...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Propiedades</h2>
          <p className="text-gray-500">Total: {properties.length} propiedades</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Agregar Propiedad
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Filtrar por ciudad..."
          value={cityFilter}
          onChange={(e) => handleCityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PropertyForm
          propertyId={editingId}
          onClose={handleFormClose}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ciudad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Habitaciones</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio/Noche</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay propiedades. ¡Crea una nueva!
                </td>
              </tr>
            ) : (
              properties.map((prop) => (
                <tr key={prop.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{prop.name}</td>
                  <td className="px-6 py-4 text-gray-600">{prop.city}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{prop.type}</td>
                  <td className="px-6 py-4 text-gray-600">{prop.bedrooms}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">${prop.pricePerNight}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      prop.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prop.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(prop.id)}
                      className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      Eliminar
                    </button>
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
              onClick={() => fetchProperties(page, cityFilter)}
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
    </div>
  );
};
