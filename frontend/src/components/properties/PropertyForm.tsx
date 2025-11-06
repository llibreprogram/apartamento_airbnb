import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { SeasonalPricingPanel } from './SeasonalPricingPanel';

interface PropertyFormProps {
  propertyId?: string | null;
  onClose: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    zipCode: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    capacity: 1,
    pricePerNight: 0,
    securityDeposit: 0,
    commissionRate: 0.1, // 10% por defecto
    amenities: '',
    photos: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}`);
      const data = response.data;
      
      // Convertir arrays a strings para los inputs
      const propertyData = {
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        zipCode: data.zipCode || '',
        type: data.type || 'apartment',
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        capacity: data.capacity || 1,
        pricePerNight: data.pricePerNight || 0,
        securityDeposit: data.securityDeposit || 0,
        commissionRate: data.commissionRate || 0.1,
        amenities: Array.isArray(data.amenities) ? data.amenities.join(', ') : (data.amenities || ''),
        photos: Array.isArray(data.photos) ? data.photos.join(', ') : (data.photos || ''),
      };
      setFormData(propertyData);
    } catch (err: any) {
      setErrors({ submit: 'Error al cargar propiedad' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bedrooms' || name === 'bathrooms' || name === 'capacity'
        ? parseInt(value) || 0
        : name === 'pricePerNight' || name === 'securityDeposit' || name === 'commissionRate'
        ? parseFloat(value) || 0
        : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.address?.trim()) newErrors.address = 'Dirección requerida';
    if (!formData.city?.trim()) newErrors.city = 'Ciudad requerida';
    if (formData.bedrooms < 1) newErrors.bedrooms = 'Mínimo 1 habitación';
    if (formData.bathrooms < 1) newErrors.bathrooms = 'Mínimo 1 baño';
    if (formData.pricePerNight < 1) newErrors.pricePerNight = 'Precio debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Asegurar que todos los números sean numbers, no strings
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        type: formData.type,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        capacity: Number(formData.capacity),
        pricePerNight: Number(formData.pricePerNight),
        securityDeposit: Number(formData.securityDeposit),
        commissionRate: Number(formData.commissionRate) || 0.1,
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(a => a),
        photos: formData.photos.split(',').map(p => p.trim()).filter(p => p),
      };

      if (propertyId) {
        await apiClient.put(`/properties/${propertyId}`, payload);
      } else {
        await apiClient.post('/properties', payload);
      }

      setSuccess(true);
      setTimeout(onClose, 1000);
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Error al guardar propiedad' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">
              {propertyId ? 'Editar Propiedad' : 'Nueva Propiedad'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✓ {propertyId ? 'Propiedad actualizada' : 'Propiedad creada'} exitosamente
            </div>
          )}

          {/* Error Messages */}
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Apartamento en Centro"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Madrid"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="villa">Villa</option>
                <option value="studio">Estudio</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Habitaciones *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bedrooms && <p className="text-red-500 text-xs mt-1">{errors.bedrooms}</p>}
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Baños *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bathrooms && <p className="text-red-500 text-xs mt-1">{errors.bathrooms}</p>}
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Capacidad (personas)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Precio/Noche *
              </label>
              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.pricePerNight ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pricePerNight && <p className="text-red-500 text-xs mt-1">{errors.pricePerNight}</p>}
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Depósito de Seguridad
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Comisión (decimal, ej: 0.1 = 10%)
              </label>
              <input
                type="number"
                name="commissionRate"
                value={formData.commissionRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="0.1"
              />
              <p className="text-gray-500 text-xs mt-1">
                {((formData.commissionRate || 0) * 100).toFixed(1)}% de comisión
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Calle Principal 123"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe tu propiedad..."
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Comodidades (separadas por comas)
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: WiFi, TV, Cocina, Aire acondicionado"
            />
          </div>

          {/* Photos URLs */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              URLs de Fotos (separadas por comas)
            </label>
            <input
              type="text"
              name="photos"
              value={formData.photos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            />
          </div>

          {/* Buttons */}
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

          {/* Seasonal Pricing Panel - Only show if editing existing property */}
          {propertyId && (
            <SeasonalPricingPanel 
              propertyId={propertyId} 
              basePrice={formData.pricePerNight}
            />
          )}
        </form>
      </div>
    </div>
  );
};
