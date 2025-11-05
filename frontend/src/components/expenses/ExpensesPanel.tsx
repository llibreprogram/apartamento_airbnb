import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface Expense {
  id: string;
  propertyId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receiptUrl?: string;
  createdAt: string;
}

interface Property {
  id: string;
  name: string;
}

export const ExpensesPanel: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const itemsPerPage = 10;

  const categories = [
    'maintenance',
    'utilities',
    'cleaning',
    'insurance',
    'taxes',
    'repairs',
    'supplies',
    'other',
  ];

  const categoryLabels: Record<string, string> = {
    maintenance: 'Mantenimiento',
    utilities: 'Servicios',
    cleaning: 'Limpieza',
    insurance: 'Seguros',
    taxes: 'Impuestos',
    repairs: 'Reparaciones',
    supplies: 'Suministros',
    other: 'Otros',
  };

  const fetchExpenses = async (page = 1, category = '', propertyId = '') => {
    setLoading(true);
    setError(null);
    try {
      let response;
      
      // Si hay una propiedad seleccionada, usar endpoint específico
      if (propertyId) {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });
        if (category) params.append('category', category);

        response = await apiClient.get(`/expenses/property/${propertyId}`, { params });
      } else {
        // Si no, obtener todos los gastos
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });
        if (category) params.append('category', category);

        response = await apiClient.get('/expenses', { params });
      }
      
      setExpenses(response.data.data || response.data);
      setCurrentPage(page);
      setTotalPages(response.data.pages || response.data.pageCount || 1);

      // Calculate category stats
      const stats: Record<string, number> = {};
      (response.data.data || response.data).forEach((exp: Expense) => {
        const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount as any) || 0;
        stats[exp.category] = (stats[exp.category] || 0) + amount;
      });
      setCategoryStats(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar gastos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/properties');
      const propsData = response.data.data || response.data;
      setProperties(Array.isArray(propsData) ? propsData : []);
    } catch (err: any) {
      console.error('Error loading properties:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchExpenses(1, filterCategory, selectedProperty);
  }, []);

  const handleCategoryFilter = (category: string) => {
    setFilterCategory(category);
    fetchExpenses(1, category, selectedProperty);
  };

  const handlePropertyFilter = (propertyId: string) => {
    setSelectedProperty(propertyId);
    setFilterCategory('');
    fetchExpenses(1, '', propertyId);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;

    try {
      await apiClient.delete(`/expenses/${id}`);
      fetchExpenses(currentPage, filterCategory, selectedProperty);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar gasto');
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      await apiClient.post('/expenses', formData);
      setShowForm(false);
      fetchExpenses(1, filterCategory, selectedProperty);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear gasto');
    }
  };

  const totalExpenses = Object.values(categoryStats).reduce((a, b) => {
    const numA = typeof a === 'number' ? a : 0;
    const numB = typeof b === 'number' ? b : 0;
    return numA + numB;
  }, 0) as number;

  if (loading && expenses.length === 0) {
    return <div className="text-center py-8">Cargando gastos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Gastos</h2>
          <p className="text-gray-500">Total: ${(totalExpenses || 0).toFixed(2)}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Agregar Gasto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">{categoryLabels[cat]}</p>
            <p className="text-2xl font-bold text-green-600">
              ${(categoryStats[cat] || 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Property Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filtrar por Propiedad:
        </label>
        <select
          value={selectedProperty}
          onChange={(e) => handlePropertyFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las Propiedades</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter */}
      <div className="space-y-3">
        {selectedProperty && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              Mostrando gastos de: <span className="font-bold">{properties.find(p => p.id === selectedProperty)?.name || 'Propiedad'}</span>
            </p>
          </div>
        )}
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              filterCategory === ''
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                filterCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay gastos registrados.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{exp.description}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {categoryLabels[exp.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">${(typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount as any) || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(exp.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(exp.id)}
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
              onClick={() => fetchExpenses(page, filterCategory, selectedProperty)}
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

// Expense Form Component
interface ExpenseFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    propertyId: '',
    description: '',
    amount: '',
    category: 'maintenance',
    date: new Date().toISOString().split('T')[0],
  });
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/properties/my-properties');
      // Handle both { data: [...] } and direct array formats
      const propsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProperties(Array.isArray(propsData) ? propsData : []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Descripción requerida';
    if (!formData.amount || parseFloat(formData.amount as any) <= 0) newErrors.amount = 'Monto debe ser > 0';
    if (!formData.propertyId) newErrors.propertyId = 'Propiedad requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Nuevo Gasto</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Propiedad *
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.propertyId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una propiedad</option>
              {Array.isArray(properties) && properties.map(prop => (
                <option key={prop.id} value={prop.id}>{prop.name}</option>
              ))}
            </select>
            {errors.propertyId && <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Reparación de tubería"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Categoría
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="maintenance">Mantenimiento</option>
              <option value="utilities">Servicios</option>
              <option value="cleaning">Limpieza</option>
              <option value="insurance">Seguros</option>
              <option value="taxes">Impuestos</option>
              <option value="repairs">Reparaciones</option>
              <option value="supplies">Suministros</option>
              <option value="other">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Monto *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
