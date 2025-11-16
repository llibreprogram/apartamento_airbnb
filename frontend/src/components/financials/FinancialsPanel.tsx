'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { apiClient } from '@/services/api';
import { generateFinancialReportPDF, exportToPDF } from '@/utils/pdfExport';

interface FinancialReport {
  id: string;
  propertyId: string;
  propertyName?: string;
  period: string;
  grossIncome: number;
  totalExpenses: number;
  commissionAmount: number;
  netProfit: number;
  roi: number;
}

interface Property {
  id: string;
  name: string;
  address?: string;
}

interface ExpenseCategory {
  category: string;
  amount: number;
}

interface ElectricityData {
  period: string;
  totalCharged: number;
  totalPaid: number;
  difference: number;
  reservationsCount: number;
  expensesCount: number;
}

// Helper function to safely format numbers
const formatCurrency = (value: any, decimals = 2): string => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return num.toFixed(decimals);
};

export function FinancialsPanel() {
  const { i18n, t } = useTranslation();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [viewMode, setViewMode] = useState<'general' | 'property'>('general');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [propertyExpenses, setPropertyExpenses] = useState<ExpenseCategory[]>([]);
  const [electricityData, setElectricityData] = useState<ElectricityData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'ru'>(
    (i18n.language.split('-')[0] as 'es' | 'en' | 'ru') || 'es'
  );

  const fetchReports = async (period = '') => {
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        // Intentar obtener resumen general
        response = await apiClient.get('/financials/summary');
        setSummaryData(response.data);
      } catch (summaryError) {
        console.warn('Summary endpoint error:', summaryError);
        // Si falla summary, intentar obtener lista general
        response = await apiClient.get('/financials');
        setSummaryData({
          totalIncome: 0,
          totalExpenses: 0,
          totalProfit: 0,
          avgROI: 0,
        });
      }
      
      // Obtener lista de reportes
      const listResponse = await apiClient.get('/financials');
      const allReports = Array.isArray(listResponse.data) 
        ? listResponse.data 
        : (listResponse.data?.data || []);
      
      if (period) {
        // Filtrar por período
        const filtered = allReports.filter((r: any) => r.period === period);
        setReports(filtered);
      } else {
        setReports(allReports);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Error al cargar reportes financieros');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      const period = selectedPeriod || getCurrentPeriod();
      fetchPropertyExpenses(selectedProperty, period);
      fetchElectricityData(selectedProperty, period);
    }
  }, [selectedProperty, selectedPeriod]);

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/properties');
      const propData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProperties(propData);
      if (propData.length > 0 && !selectedProperty) {
        setSelectedProperty(propData[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching properties:', err);
    }
  };

  const fetchPropertyExpenses = async (propertyId: string, period: string) => {
    try {
      // Parse period to get start and end dates (period format: YYYY-MM)
      const [year, month] = period.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      
      // Build ISO date strings directly without timezone conversion
      const startDateStr = `${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`;
      
      // Calculate last day of the month
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const endDateStr = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;
      
      console.log(`Fetching expenses for ${period}:`, {
        startDate: startDateStr,
        endDate: endDateStr,
      });
      
      // Use the correct endpoint with propertyId and date range filters
      const response = await apiClient.get(
        `/expenses/property/${propertyId}?startDate=${startDateStr}&endDate=${endDateStr}&limit=100`
      );
      
      // Handle both array and paginated response formats
      const expenses = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
      
      // Group expenses by category
      const grouped: { [key: string]: number } = {};
      expenses.forEach((exp: any) => {
        const category = exp.category || 'Otro';
        const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(exp.amount) || 0;
        grouped[category] = (grouped[category] || 0) + amount;
      });
      
      const expenseArray = Object.entries(grouped).map(([category, amount]) => ({
        category,
        amount: typeof amount === 'number' ? amount : 0,
      }));
      
      setPropertyExpenses(expenseArray);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setPropertyExpenses([]);
    }
  };

  const fetchElectricityData = async (propertyId: string, period: string) => {
    try {
      // Obtener resumen de electricidad para el período
      const summaryResponse = await apiClient.get(
        `/expenses/electricity-summary/${propertyId}/${period}`
      );
      
      // Obtener gastos de electricidad para el período
      const [year, month] = period.split('-');
      const startDateStr = `${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDateStr = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`;
      
      const expensesResponse = await apiClient.get(
        `/expenses/property/${propertyId}?startDate=${startDateStr}&endDate=${endDateStr}&category=utilities`
      );
      
      const expenses = Array.isArray(expensesResponse.data) 
        ? expensesResponse.data 
        : (expensesResponse.data?.data || []);
      
      // Filtrar solo gastos con electricidad
      const electricityExpenses = expenses.filter(
        (exp: any) => exp.electricityPeriod === period
      );
      
      const totalPaid = electricityExpenses.reduce(
        (sum: number, exp: any) => sum + (parseFloat(exp.amount) || 0),
        0
      );
      
      const summary = summaryResponse.data;
      
      setElectricityData({
        period,
        totalCharged: summary.totalCharged || 0,
        totalPaid,
        difference: (summary.totalCharged || 0) - totalPaid,
        reservationsCount: summary.reservationsCount || 0,
        expensesCount: electricityExpenses.length,
      });
    } catch (err: any) {
      console.error('Error fetching electricity data:', err);
      setElectricityData(null);
    }
  };

  const handleCalculate = async () => {
    try {
      const currentPeriod = getCurrentPeriod();
      // Necesitamos obtener las propiedades primero para calcular financieros de cada una
      const propertiesResponse = await apiClient.get('/properties');
      const properties = propertiesResponse.data.data || propertiesResponse.data;
      
      // Calcular financieros para cada propiedad
      for (const property of properties) {
        await apiClient.post('/financials/calculate', {
          propertyId: property.id,
          period: currentPeriod,
        });
      }
      
      fetchReports(selectedPeriod);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al calcular financieros');
    }
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getPropertyReport = () => {
    const period = selectedPeriod || getCurrentPeriod();
    return reports.find((r) => r.propertyId === selectedProperty && r.period === period);
  };

  const getPropertyName = () => {
    return properties.find((p) => p.id === selectedProperty)?.name || 'Propiedad no encontrada';
  };

  if (loading && !reports.length) {
    return <div className="text-center py-8">Cargando reportes financieros...</div>;
  }

  // Convertir strings a números usando parseFloat
  const totalIncome = reports.reduce((sum, r) => {
    const value = parseFloat(r.grossIncome?.toString() || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  const totalExpenses = reports.reduce((sum, r) => {
    const value = parseFloat(r.totalExpenses?.toString() || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  const totalProfit = reports.reduce((sum, r) => {
    const value = parseFloat(r.netProfit?.toString() || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
  
  const avgROI = reports.length > 0 
    ? reports.reduce((sum, r) => {
        const value = parseFloat(r.roi?.toString() || '0');
        return sum + (isNaN(value) ? 0 : value);
      }, 0) / reports.length
    : 0;

  console.log('📊 Financial Stats:', {
    reports: reports.length,
    totalIncome,
    totalExpenses,
    totalProfit,
    avgROI,
    reportsData: reports.map(r => ({
      property: r.propertyName,
      grossIncome: r.grossIncome,
      grossIncomeType: typeof r.grossIncome,
      totalExpenses: r.totalExpenses,
      totalExpensesType: typeof r.totalExpenses,
      netProfit: r.netProfit,
      roi: r.roi
    }))
  });

  return (
    <div className="h-[calc(100vh-12rem)] overflow-y-auto space-y-6 pr-2">
      {/* Header */}
      <div className="bg-white pb-4 mb-4 border-b">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('financialReport')}</h2>
          <p className="text-gray-500">{t('period')}: {getCurrentPeriod()}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const lang = e.target.value as 'es' | 'en' | 'ru';
              setSelectedLanguage(lang);
              i18n.changeLanguage(lang);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
            <option value="ru">🇷🇺 Русский</option>
          </select>
          <button
            onClick={handleCalculate}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            🔄 {t('calculate')}
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-white p-4 rounded-lg shadow">
        <button
          onClick={() => setViewMode('general')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'general'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Vista General
        </button>
        <button
          onClick={() => setViewMode('property')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'property'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🏢 Por Propiedad
        </button>
      </div>

      {/* Summary Stats */}
      {viewMode === 'general' && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-blue-600">${formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
            <p className="text-3xl font-bold text-red-600">${formatCurrency(totalExpenses)}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Ganancia Neta</p>
            <p className="text-3xl font-bold text-green-600">${formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">ROI Promedio</p>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(avgROI, 1)}%</p>
          </div>
        </div>
      )}

      {/* Property Report View */}
      {viewMode === 'property' && (
        <>
          {/* Property Selector */}
          <div className="bg-white p-4 rounded-lg shadow">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Propiedad:
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Property Summary Stats */}
          {(() => {
            const report = getPropertyReport();
            return (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Ingresos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${formatCurrency(report?.grossIncome || 0)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-1">Gastos</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${formatCurrency(report?.totalExpenses || 0)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 mb-1">Comisión</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${formatCurrency(report?.commissionAmount || 0)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Ganancia Neta</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${formatCurrency(report?.netProfit || 0)}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Electricity Report Section */}
          {electricityData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>⚡</span>
                <span>Reporte de Electricidad - {electricityData.period}</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Total Cobrado */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💰</span>
                    <span className="text-sm font-medium text-green-700">Cobrado a Huéspedes</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    ${formatCurrency(electricityData.totalCharged)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {electricityData.reservationsCount} reserva(s)
                  </div>
                </div>

                {/* Total Pagado */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🧾</span>
                    <span className="text-sm font-medium text-red-700">Factura Pagada</span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    ${formatCurrency(electricityData.totalPaid)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {electricityData.expensesCount} gasto(s)
                  </div>
                </div>

                {/* Diferencia */}
                <div className={`border rounded-lg p-4 ${
                  electricityData.difference > 0 
                    ? 'bg-blue-50 border-blue-200'
                    : electricityData.difference < 0
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {electricityData.difference > 0 ? '✅' : electricityData.difference < 0 ? '⚠️' : '✓'}
                    </span>
                    <span className={`text-sm font-medium ${
                      electricityData.difference > 0 
                        ? 'text-blue-700'
                        : electricityData.difference < 0
                        ? 'text-yellow-700'
                        : 'text-gray-700'
                    }`}>
                      {electricityData.difference > 0 
                        ? 'Ganancia'
                        : electricityData.difference < 0
                        ? 'Propietario debe pagar'
                        : 'Sin diferencia'}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${
                    electricityData.difference > 0 
                      ? 'text-blue-600'
                      : electricityData.difference < 0
                      ? 'text-yellow-600'
                      : 'text-gray-600'
                  }`}>
                    {electricityData.difference > 0 ? '+' : ''}${formatCurrency(Math.abs(electricityData.difference))}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {((electricityData.totalCharged / (electricityData.totalPaid || 1) - 1) * 100).toFixed(1)}% margen
                  </div>
                </div>
              </div>

              {/* Explicación */}
              <div className={`rounded-lg p-4 ${
                electricityData.difference > 0 
                  ? 'bg-blue-50 border border-blue-200'
                  : electricityData.difference < 0
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="text-sm">
                  {electricityData.difference > 0 ? (
                    <>
                      <span className="font-semibold text-blue-800">✅ Resultado Positivo:</span>
                      <span className="text-blue-700"> Se cobró más de lo que se pagó. El propietario tiene una ganancia de ${formatCurrency(electricityData.difference)} en electricidad este mes.</span>
                    </>
                  ) : electricityData.difference < 0 ? (
                    <>
                      <span className="font-semibold text-yellow-800">⚠️ Resultado Negativo:</span>
                      <span className="text-yellow-700"> Se cobró menos de lo que se pagó. El propietario debe contribuir ${formatCurrency(Math.abs(electricityData.difference))} para cubrir la diferencia.</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800">✓ Resultado Exacto:</span>
                      <span className="text-gray-700"> El monto cobrado coincide exactamente con el monto pagado.</span>
                    </>
                  )}
                </div>
              </div>

              {electricityData.reservationsCount === 0 && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    ℹ️ No hay reservas con electricidad registradas en este período. 
                    Las reservas deben ser completadas con datos de electricidad para aparecer en este reporte.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">📊 Desglose de Gastos por Categoría</h3>
            {propertyExpenses.length === 0 ? (
              <p className="text-gray-500">No hay gastos registrados para este período</p>
            ) : (
              <div className="space-y-3">
                {propertyExpenses.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">{exp.category}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-40 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (exp.amount /
                                (propertyExpenses.reduce((sum, e) => sum + e.amount, 0) || 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-red-600 w-24 text-right">
                        ${formatCurrency(exp.amount)}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total de Gastos</span>
                  <span className="font-bold text-red-600 text-lg">
                    ${formatCurrency(
                      propertyExpenses.reduce((sum, e) => sum + e.amount, 0)
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Property Metrics */}
          {(() => {
            const report = getPropertyReport();
            const marginPercent =
              report && report.grossIncome > 0
                ? ((report.netProfit / report.grossIncome) * 100)
                : 0;
            
            return (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">📈 Métricas de Rentabilidad</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Margen de Ganancia</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(marginPercent, 1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Ganancia / Ingresos</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">ROI</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(report?.roi || 0, 1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Retorno de Inversión</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Gasto / Ingreso</p>
                    <p className="text-2xl font-bold text-red-600">
                      {report && report.grossIncome > 0
                        ? formatCurrency((report.totalExpenses / report.grossIncome) * 100, 1)
                        : '0'}
                      %
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Proporción de gastos</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Comisión Admin</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {report && report.grossIncome > 0
                        ? formatCurrency((report.commissionAmount / report.grossIncome) * 100, 1)
                        : '0'}
                      %
                    </p>
                    <p className="text-xs text-gray-500 mt-1">De ingresos totales</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Period Filter */}
      {viewMode === 'general' && (
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              if (e.target.value) {
                fetchReports(e.target.value);
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => {
              setSelectedPeriod('');
              fetchReports('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Period Filter for Property View */}
      {viewMode === 'property' && (
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => {
              setSelectedPeriod('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* Table */}
      {viewMode === 'general' && (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Propiedad</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Período</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ingresos</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Gastos</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Comisión</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ganancia</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">ROI</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay reportes financieros generados.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{report.propertyName || report.propertyId}</td>
                  <td className="px-6 py-4 text-gray-600">{report.period}</td>
                  <td className="px-6 py-4 text-right text-blue-600 font-semibold">
                    ${formatCurrency(report.grossIncome)}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 font-semibold">
                    ${formatCurrency(report.totalExpenses)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">
                    ${formatCurrency(report.commissionAmount)}
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-semibold">
                    ${formatCurrency(report.netProfit)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (report.roi || 0) > 0 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formatCurrency(report.roi, 1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Export Section */}
      {viewMode === 'general' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">{t('exportReport')}</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                // Export as CSV
                const csv = [
                  ['Propiedad', 'Período', 'Ingresos', 'Gastos', 'Comisión', 'Ganancia', 'ROI'],
                ...reports.map((r: FinancialReport) => [
                    r.propertyName || r.propertyId,
                    r.period,
                    r.grossIncome,
                    r.totalExpenses,
                    r.commissionAmount,
                    r.netProfit,
                    r.roi,
                  ]),
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reportes-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              📥 {t('downloadCSV')}
            </button>
            <button
              onClick={() => {
                // Export as PDF - Ensure all values are numbers
                const commission = typeof reports === 'object' && Array.isArray(reports)
                  ? reports.reduce((sum, r) => {
                      const val = typeof r.commissionAmount === 'number' ? r.commissionAmount : 0;
                      return sum + val;
                    }, 0)
                  : 0;

                const profitValue = typeof totalProfit === 'number' ? totalProfit : 0;
                const incomeValue = typeof totalIncome === 'number' ? totalIncome : 0;
                const expensesValue = typeof totalExpenses === 'number' ? totalExpenses : 0;
                const roiValue = typeof avgROI === 'number' ? avgROI : 0;

                generateFinancialReportPDF(
                  {
                    propertyName: 'Todas las Propiedades',
                    period: selectedPeriod || getCurrentPeriod(),
                    grossIncome: incomeValue,
                    totalExpenses: expensesValue,
                    commissionAmount: commission,
                    netProfit: profitValue,
                    roi: roiValue,
                    profitMargin: incomeValue > 0 ? (profitValue / incomeValue) * 100 : 0,
                    expenseRatio: incomeValue > 0 ? (expensesValue / incomeValue) * 100 : 0,
                  },
                  {
                    filename: `reportes-general-${new Date().toISOString().split('T')[0]}.pdf`,
                    language: selectedLanguage,
                  }
                );
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              📄 {t('downloadPDF')}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              🖨️ {t('print')}
            </button>
          </div>
        </div>
      )}

      {/* Export Section - Property View */}
      {viewMode === 'property' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">{t('exportReport')} - {getPropertyName()}</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                // Export property report as CSV
                const report = getPropertyReport();
                if (!report) {
                  alert('No hay datos para exportar');
                  return;
                }
                
                const csv = `Propiedad,${getPropertyName()}
Período,${report.period}
Ingresos,${report.grossIncome}
Gastos,${report.totalExpenses}
Comisión,${report.commissionAmount}
Ganancia Neta,${report.netProfit}
ROI,${report.roi}%

Desglose de Gastos por Categoría
Categoría,Monto
${propertyExpenses.map(e => `${e.category},${e.amount}`).join('\n')}`;
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-${getPropertyName().replace(/\s+/g, '-')}-${report.period}.csv`;
                a.click();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              📥 {t('downloadCSV')}
            </button>
            <button
              onClick={() => {
                // Export property report as PDF - Ensure all values are numbers
                const report = getPropertyReport();
                if (!report) {
                  alert('No hay datos para exportar');
                  return;
                }

                // Ensure all values are valid numbers
                const ensureNumber = (val: any, defaultVal: number = 0): number => {
                  const num = Number(val);
                  return isNaN(num) ? defaultVal : num;
                };

                const grossIncome = ensureNumber(report.grossIncome);
                const netProfit = ensureNumber(report.netProfit);
                const totalExpenses = ensureNumber(report.totalExpenses);
                const roiValue = ensureNumber(report.roi);
                
                generateFinancialReportPDF(
                  {
                    propertyName: getPropertyName(),
                    period: report.period,
                    grossIncome: grossIncome,
                    totalExpenses: totalExpenses,
                    commissionAmount: ensureNumber(report.commissionAmount),
                    netProfit: netProfit,
                    roi: roiValue,
                    profitMargin: grossIncome > 0 
                      ? (netProfit / grossIncome) * 100 
                      : 0,
                    expenseRatio: grossIncome > 0 
                      ? (totalExpenses / grossIncome) * 100 
                      : 0,
                    expenseBreakdown: Array.isArray(propertyExpenses) ? propertyExpenses : [],
                    electricityData: electricityData ? {
                      totalCharged: ensureNumber(electricityData.totalCharged),
                      totalPaid: ensureNumber(electricityData.totalPaid),
                      difference: ensureNumber(electricityData.difference),
                      reservationsCount: electricityData.reservationsCount || 0,
                      expensesCount: electricityData.expensesCount || 0,
                    } : undefined,
                  },
                  {
                    filename: `reporte-${getPropertyName().replace(/\s+/g, '-')}-${report.period}.pdf`,
                    language: selectedLanguage,
                  }
                );
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              📄 {t('downloadPDF')}
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              🖨️ {t('print')}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
