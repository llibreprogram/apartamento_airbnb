import React, { useState, useEffect } from 'react';

interface CompleteReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (electricityData: ElectricityData) => void;
  reservationId: string;
  guestName: string;
}

interface ElectricityData {
  meterReadingStart?: number;
  meterReadingEnd?: number;
  electricityRate?: number;
  electricityPaymentMethod?: string;
  electricityNotes?: string;
}

export const CompleteReservationModal: React.FC<CompleteReservationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  reservationId,
  guestName,
}) => {
  const [meterReadingStart, setMeterReadingStart] = useState<string>('');
  const [meterReadingEnd, setMeterReadingEnd] = useState<string>('');
  const [electricityRate, setElectricityRate] = useState<string>('0.15'); // Tarifa por defecto
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [notes, setNotes] = useState<string>('');

  // Cálculos automáticos
  const consumed = 
    meterReadingStart && meterReadingEnd
      ? Math.max(0, parseFloat(meterReadingEnd) - parseFloat(meterReadingStart))
      : 0;

  const charge = consumed * (parseFloat(electricityRate) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const electricityData: ElectricityData = {};

    // Solo incluir datos si se ingresaron lecturas del medidor
    if (meterReadingStart && meterReadingEnd && electricityRate) {
      electricityData.meterReadingStart = parseFloat(meterReadingStart);
      electricityData.meterReadingEnd = parseFloat(meterReadingEnd);
      electricityData.electricityRate = parseFloat(electricityRate);
      electricityData.electricityPaymentMethod = paymentMethod;
      
      if (notes.trim()) {
        electricityData.electricityNotes = notes.trim();
      }
    }

    onComplete(electricityData);
  };

  const handleCompleteWithoutElectricity = () => {
    onComplete({});
  };

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setMeterReadingStart('');
      setMeterReadingEnd('');
      setElectricityRate('0.15');
      setPaymentMethod('cash');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold">Check-out de Reserva</h2>
          <p className="text-sm text-blue-100 mt-1">Huésped: {guestName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Sección de Electricidad */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Cobro de Electricidad (Opcional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Si deseas cobrar electricidad, ingresa las lecturas del medidor. 
              Si no, puedes omitir esta sección.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lectura Inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lectura Inicial (kWh)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={meterReadingStart}
                  onChange={(e) => setMeterReadingStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1500"
                />
              </div>

              {/* Lectura Final */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lectura Final (kWh)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={meterReadingEnd}
                  onChange={(e) => setMeterReadingEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1650"
                />
              </div>

              {/* Tarifa por kWh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarifa por kWh (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 0.15"
                />
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Efectivo</option>
                  <option value="deposit">Depósito de Garantía</option>
                  <option value="invoice">Factura Separada</option>
                  <option value="waived">Exonerado</option>
                </select>
              </div>
            </div>

            {/* Resumen del Cálculo */}
            {consumed > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Consumo</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {consumed.toFixed(0)} kWh
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tarifa</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${parseFloat(electricityRate).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total a Cobrar</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${charge.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Cobro realizado en efectivo al momento del check-out"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleCompleteWithoutElectricity}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              Check-out Sin Electricidad
            </button>

            <button
              type="submit"
              disabled={
                (!!meterReadingStart && !meterReadingEnd) ||
                (!meterReadingStart && !!meterReadingEnd) ||
                (!!meterReadingStart && !!meterReadingEnd && parseFloat(meterReadingEnd) < parseFloat(meterReadingStart))
              }
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {meterReadingStart && meterReadingEnd
                ? `Check-out y Cobrar $${charge.toFixed(2)}`
                : 'Check-out'}
            </button>
          </div>

          {/* Validación de errores */}
          {meterReadingStart && meterReadingEnd && parseFloat(meterReadingEnd) < parseFloat(meterReadingStart) && (
            <p className="text-red-600 text-sm mt-2 text-center">
              La lectura final debe ser mayor o igual a la lectura inicial
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
