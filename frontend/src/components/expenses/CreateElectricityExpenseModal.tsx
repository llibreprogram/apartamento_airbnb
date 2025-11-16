import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface Reservation {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  electricityConsumed: number;
  electricityRate: number;
  electricityCharge: number;
}

interface ElectricitySummary {
  propertyId: string;
  propertyName: string;
  period: string;
  totalCharged: number;
  totalConsumed: number;
  reservationsCount: number;
  reservations: Reservation[];
}

interface CreateElectricityExpenseModalProps {
  propertyId: string;
  propertyName: string;
  period: string; // YYYY-MM format
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateElectricityExpenseModal: React.FC<CreateElectricityExpenseModalProps> = ({
  propertyId,
  propertyName,
  period,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summary, setSummary] = useState<ElectricitySummary | null>(null);
  const [error, setError] = useState('');

  // Formulario
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('Pago factura electricidad');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchElectricitySummary();
  }, [propertyId, period]);

  const fetchElectricitySummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await api.get(`/expenses/electricity-summary/${propertyId}/${period}`);
      setSummary(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar resumen de electricidad');
    } finally {
      setLoadingSummary(false);
    }
  };

  const calculateDifference = () => {
    if (!summary || !amount) return 0;
    return summary.totalCharged - parseFloat(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (!date) {
      setError('La fecha es requerida');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const difference = calculateDifference();

      await api.post('/expenses', {
        propertyId,
        description,
        amount: parseFloat(amount),
        category: 'utilities',
        date,
        notes,
        // Campos de electricidad
        electricityPeriod: period,
        electricityTotalCharged: summary?.totalCharged || 0,
        electricityDifference: difference,
        electricityReservationsCount: summary?.reservationsCount || 0,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el gasto');
    } finally {
      setLoading(false);
    }
  };

  const difference = calculateDifference();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚡ Registrar Gasto de Electricidad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Información del período */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold text-blue-800">{propertyName}</div>
                <div className="text-sm text-blue-600">Período: {period}</div>
              </div>
            </div>
          </div>

          {/* Resumen de electricidad cobrada */}
          {loadingSummary ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando resumen...</p>
            </div>
          ) : summary ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-3">
                💰 Total Cobrado a Huéspedes en {period}
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${summary.totalCharged.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Cobrado</div>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.totalConsumed.toFixed(0)} kWh
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Consumo Total</div>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.reservationsCount}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Reservas</div>
                </div>
              </div>

              {/* Detalle de reservas */}
              {summary.reservations.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800">
                    Ver detalle de {summary.reservations.length} reserva(s)
                  </summary>
                  <div className="mt-2 space-y-2">
                    {summary.reservations.map((res) => (
                      <div key={res.id} className="bg-white rounded p-2 text-xs">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{res.guestName}</span>
                            <span className="text-gray-500 ml-2">
                              ({new Date(res.checkIn).toLocaleDateString()} - {new Date(res.checkOut).toLocaleDateString()})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${res.electricityCharge.toFixed(2)}</div>
                            <div className="text-gray-500">{res.electricityConsumed} kWh × ${res.electricityRate}/kWh</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ No se encontraron reservas con electricidad en este período
              </p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Pagado (Factura Real) *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Pago *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales sobre la factura..."
              />
            </div>

            {/* Cálculo de diferencia */}
            {amount && summary && (
              <div className={`rounded-lg p-4 ${
                difference > 0 
                  ? 'bg-green-100 border border-green-300'
                  : difference < 0
                  ? 'bg-red-100 border border-red-300'
                  : 'bg-gray-100 border border-gray-300'
              }`}>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Diferencia</div>
                  <div className={`text-3xl font-bold ${
                    difference > 0 
                      ? 'text-green-700'
                      : difference < 0
                      ? 'text-red-700'
                      : 'text-gray-700'
                  }`}>
                    {difference > 0 ? '+' : ''}{difference.toFixed(2)} USD
                  </div>
                  <div className="text-sm mt-2">
                    {difference > 0 ? (
                      <span className="text-green-700">
                        ✅ Ganancia para el propietario
                      </span>
                    ) : difference < 0 ? (
                      <span className="text-red-700">
                        ⚠️ El propietario debe contribuir ${Math.abs(difference).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        ✓ Exacto (sin diferencia)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !date}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Registrar Gasto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
