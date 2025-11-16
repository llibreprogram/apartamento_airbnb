import React, { useState } from 'react';
import api from '@/services/api';

interface RegisterElectricityCostModalProps {
  reservation: {
    id: string;
    guestName: string;
    electricityCharge: number;
    electricityConsumed: number;
    electricityRate: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterElectricityCostModal: React.FC<RegisterElectricityCostModalProps> = ({
  reservation,
  onClose,
  onSuccess,
}) => {
  const [actualCost, setActualCost] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billNotes, setBillNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateDifference = () => {
    if (!actualCost) return null;
    const cost = parseFloat(actualCost);
    const charged = reservation.electricityCharge;
    const diff = charged - cost;
    return {
      difference: diff,
      ownerMustPay: diff < 0 ? Math.abs(diff) : 0,
      adminProfit: diff > 0 ? diff : 0,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post(`/reservations/${reservation.id}/register-electricity-cost`, {
        electricityActualCost: parseFloat(actualCost),
        electricityBillDate: billDate,
        electricityBillNotes: billNotes || undefined,
      });

      setResult(response.data.data);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar costo');
    } finally {
      setLoading(false);
    }
  };

  const diff = calculateDifference();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          📋 Registrar Costo Real de Electricidad
        </h3>

        {/* Info de lo cobrado al huésped */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Reserva: {reservation.guestName}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div>
              <span className="font-medium">Consumo:</span> {reservation.electricityConsumed} kWh
            </div>
            <div>
              <span className="font-medium">Tarifa aplicada:</span> ${reservation.electricityRate}/kWh
            </div>
            <div className="col-span-2">
              <span className="font-medium">Cobrado al huésped:</span>{' '}
              <span className="text-lg font-bold text-blue-600">
                ${reservation.electricityCharge.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-4">
            <p className="font-semibold text-green-900 mb-2">✅ Costo registrado exitosamente</p>
            <div className="text-sm text-green-800 space-y-1">
              <div>Cobrado: ${result.electricityCharged.toFixed(2)}</div>
              <div>Costo real: ${result.electricityActualCost.toFixed(2)}</div>
              <div className="font-semibold pt-2 border-t border-green-300">
                {result.difference >= 0 ? (
                  <span className="text-green-700">
                    ✅ Ganancia admin: ${result.adminProfit.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-red-700">
                    ⚠️ Propietario debe contribuir: ${result.ownerContribution.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Costo Real */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Costo Real Pagado (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Ej: 18.50"
              required
              disabled={loading || !!result}
            />
            <p className="text-xs text-gray-500 mt-1">
              Monto que el propietario pagó a la compañía eléctrica
            </p>
          </div>

          {/* Fecha de Factura */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha de Factura
            </label>
            <input
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading || !!result}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              value={billNotes}
              onChange={(e) => setBillNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Ej: Factura #12345, período completo del mes..."
              rows={3}
              disabled={loading || !!result}
            />
          </div>

          {/* Cálculo en tiempo real */}
          {diff && !result && (
            <div className={`rounded-lg p-4 ${
              diff.difference >= 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className="text-sm font-semibold mb-2">
                {diff.difference >= 0 ? '✅ Resultado' : '⚠️ Resultado'}
              </p>
              <div className="text-sm space-y-1">
                <div>Diferencia: ${Math.abs(diff.difference).toFixed(2)}</div>
                {diff.ownerMustPay > 0 && (
                  <div className="font-semibold text-yellow-700">
                    El propietario debe contribuir: ${diff.ownerMustPay.toFixed(2)}
                  </div>
                )}
                {diff.adminProfit > 0 && (
                  <div className="font-semibold text-green-700">
                    Ganancia para admin: ${diff.adminProfit.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition"
              disabled={loading}
            >
              {result ? 'Cerrar' : 'Cancelar'}
            </button>
            {!result && (
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                disabled={loading || !actualCost}
              >
                {loading ? 'Registrando...' : 'Registrar Costo'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
