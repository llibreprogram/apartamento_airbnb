import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface SeasonalPrice {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  pricePerNight: number;
  startDate: string;
  endDate: string;
  type: 'SEASONAL' | 'WEEKEND' | 'HOLIDAY' | 'CUSTOM';
  isActive: boolean;
  createdAt: string;
}

interface SeasonalPricingPanelProps {
  propertyId: string;
  basePrice: number;
}

export const SeasonalPricingPanel: React.FC<SeasonalPricingPanelProps> = ({
  propertyId,
  basePrice,
}) => {
  const [prices, setPrices] = useState<SeasonalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerNight: basePrice,
    startDate: '',
    endDate: '',
    type: 'SEASONAL' as const,
    isActive: true,
  });

  // Load seasonal prices
  useEffect(() => {
    loadPrices();
  }, [propertyId]);

  const loadPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/seasonal-prices/property/${propertyId}`
      );
      setPrices(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar precios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as any;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'pricePerNight') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'El nombre es requerido';
    if (!formData.startDate) return 'La fecha de inicio es requerida';
    if (!formData.endDate) return 'La fecha de fin es requerida';
    if (new Date(formData.startDate) >= new Date(formData.endDate))
      return 'La fecha de fin debe ser posterior a la de inicio';
    if (formData.pricePerNight <= 0) return 'El precio debe ser mayor a 0';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check for conflicts first
      const conflictResponse = await apiClient.post(
        `/seasonal-prices/check-conflicts`,
        {
          propertyId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          excludeId: editingId || undefined,
        }
      );

      if (conflictResponse.data?.conflicts?.length > 0) {
        setConflicts(
          conflictResponse.data.conflicts.map(
            (c: SeasonalPrice) =>
              `"${c.name}" (${c.startDate} al ${c.endDate})`
          )
        );
        setError(
          'Existen períodos superpuestos. Revisa los conflictos listados.'
        );
        return;
      }

      if (editingId) {
        // Update existing
        const response = await apiClient.put(
          `/seasonal-prices/${editingId}`,
          {
            ...formData,
            propertyId,
          }
        );
        setPrices(prices.map((p) => (p.id === editingId ? response.data : p)));
        setEditingId(null);
      } else {
        // Create new
        const response = await apiClient.post(
          `/seasonal-prices/property/${propertyId}`,
          formData
        );
        setPrices([...prices, response.data]);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        pricePerNight: basePrice,
        startDate: '',
        endDate: '',
        type: 'SEASONAL',
        isActive: true,
      });
      setShowForm(false);
      setConflicts([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar precio');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (price: SeasonalPrice) => {
    setFormData({
      name: price.name,
      description: price.description || '',
      pricePerNight: Number(price.pricePerNight),
      startDate: price.startDate,
      endDate: price.endDate,
      type: price.type,
      isActive: price.isActive,
    });
    setEditingId(price.id);
    setShowForm(true);
    setConflicts([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este precio especial?')) return;

    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(
        `/seasonal-prices/${id}`
      );
      setPrices(prices.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar precio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      pricePerNight: basePrice,
      startDate: '',
      endDate: '',
      type: 'SEASONAL',
      isActive: true,
    });
    setConflicts([]);
    setError(null);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SEASONAL: '🌞 Temporal',
      WEEKEND: '🏖️ Fin de Semana',
      HOLIDAY: '🎉 Festivo',
      CUSTOM: '⚙️ Personalizado',
    };
    return labels[type] || type;
  };

  const getPriceDifference = (price: number) => {
    const diff = price - basePrice;
    if (diff > 0) return `+€${diff.toFixed(2)}`;
    if (diff < 0) return `€${diff.toFixed(2)}`;
    return 'Igual';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">💰 Precios Especiales</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded text-white ${
            showForm
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition`}
        >
          {showForm ? '✕ Cancelar' : '+ Agregar Precio'}
        </button>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded mb-4">
          <p className="font-semibold text-yellow-800 mb-2">⚠️ Conflictos Detectados:</p>
          <ul className="list-disc list-inside text-yellow-700">
            {conflicts.map((conflict, idx) => (
              <li key={idx}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ej: Verano 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SEASONAL">Temporal</option>
                <option value="WEEKEND">Fin de Semana</option>
                <option value="HOLIDAY">Festivo</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio por Noche (€) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-semibold text-sm">
                  {getPriceDifference(formData.pricePerNight)}
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  {formData.isActive ? '✓ Activo' : '✗ Inactivo'}
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="ej: Precio especial por temporada alta"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="mt-4 flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading
                ? 'Guardando...'
                : editingId
                  ? 'Actualizar Precio'
                  : 'Crear Precio'}
            </button>
          </div>
        </div>
      )}

      {/* Prices List */}
      <div>
        {loading && !showForm ? (
          <p className="text-center text-gray-500 py-4">Cargando...</p>
        ) : prices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No hay precios especiales configurados</p>
            <p className="text-sm">
              Haz clic en "+ Agregar Precio" para crear uno
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">
                    Período
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">
                    Precio
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr
                    key={price.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-2">
                      <p className="font-semibold text-gray-800">
                        {price.name}
                      </p>
                      {price.description && (
                        <p className="text-xs text-gray-600">
                          {price.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-2">{getTypeLabel(price.type)}</td>
                    <td className="py-3 px-2 text-gray-700">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {price.startDate} → {price.endDate}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <p className="font-bold text-lg text-green-600">
                        €{Number(price.pricePerNight).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getPriceDifference(Number(price.pricePerNight))}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {price.isActive ? (
                        <span className="text-green-600 font-semibold">
                          ✓ Activo
                        </span>
                      ) : (
                        <span className="text-gray-500 font-semibold">
                          ✗ Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(price)}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                          disabled={loading}
                        >
                          ✎ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(price.id)}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
                          disabled={loading}
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>ℹ️ Información:</strong> Los precios especiales se aplicarán
          automáticamente a las reservas dentro de los períodos definidos.
          Puedes crear múltiples períodos sin que se superpongan.
        </p>
      </div>
    </div>
  );
};
