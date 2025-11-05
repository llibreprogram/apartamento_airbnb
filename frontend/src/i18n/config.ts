import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      // Common
      property: 'Propiedad',
      period: 'Período',
      income: 'Ingresos',
      expenses: 'Gastos',
      commission: 'Comisión',
      profit: 'Ganancia Neta',
      roi: 'ROI',
      language: 'Idioma',

      // Financial Report
      financialReport: 'Reporte Financiero',
      propertyFinancialReport: 'Reporte Financiero - Por Propiedad',
      generalView: 'Vista General',
      propertyView: 'Por Propiedad',
      selectProperty: 'Seleccionar Propiedad',
      selectLanguage: 'Seleccionar Idioma',
      filterByProperty: 'Filtrar por Propiedad',
      allProperties: 'Todas las propiedades',
      totalIncome: 'Ingresos Totales',
      totalExpenses: 'Gastos Totales',
      totalProfit: 'Ganancia Neta',
      averageROI: 'ROI Promedio',

      // Expense Breakdown
      expenseBreakdown: 'Desglose de Gastos por Categoría',
      category: 'Categoría',
      amount: 'Monto',
      totalExpensesAmount: 'Total de Gastos',

      // Metrics
      profitabilityMetrics: 'Métricas de Rentabilidad',
      profitMargin: 'Margen de Ganancia',
      expenseRatio: 'Gasto/Ingreso',
      adminCommission: 'Comisión Admin',
      returnOnInvestment: 'Retorno de Inversión',

      // Export Options
      exportReport: 'Exportar Reporte',
      calculate: 'Calcular',
      downloadCSV: 'Descargar CSV',
      downloadPDF: 'Descargar PDF',
      print: 'Imprimir',
      printReport: 'Imprimir Reporte',

      // PDF Report
      generatedOn: 'Generado el',
      reportDate: 'Fecha del Reporte',
      propertyAddress: 'Dirección de Propiedad',
      reportSummary: 'Resumen del Reporte',
      incomeDetails: 'Detalle de Ingresos',
      expenseDetails: 'Detalle de Gastos',
      profitabilityAnalysis: 'Análisis de Rentabilidad',

      // Calculations
      calculatedAs: 'Calculado como',
      percentOfIncome: 'del total de ingresos',

      // Messages
      noDataAvailable: 'No hay datos disponibles',
      noExpensesRegistered: 'No hay gastos registrados',
      selectPeriod: 'Selecciona un período',
    },
  },
  en: {
    translation: {
      // Common
      property: 'Property',
      period: 'Period',
      income: 'Income',
      expenses: 'Expenses',
      commission: 'Commission',
      profit: 'Net Profit',
      roi: 'ROI',
      language: 'Language',

      // Financial Report
      financialReport: 'Financial Report',
      propertyFinancialReport: 'Financial Report - By Property',
      generalView: 'General View',
      propertyView: 'By Property',
      selectProperty: 'Select Property',
      selectLanguage: 'Select Language',
      filterByProperty: 'Filter by Property',
      allProperties: 'All properties',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      totalProfit: 'Net Profit',
      averageROI: 'Average ROI',

      // Expense Breakdown
      expenseBreakdown: 'Expense Breakdown by Category',
      category: 'Category',
      amount: 'Amount',
      totalExpensesAmount: 'Total Expenses',

      // Metrics
      profitabilityMetrics: 'Profitability Metrics',
      profitMargin: 'Profit Margin',
      expenseRatio: 'Expense/Income',
      adminCommission: 'Admin Commission',
      returnOnInvestment: 'Return on Investment',

      // Export Options
      exportReport: 'Export Report',
      calculate: 'Calculate',
      downloadCSV: 'Download CSV',
      downloadPDF: 'Download PDF',
      print: 'Print',
      printReport: 'Print Report',

      // PDF Report
      generatedOn: 'Generated on',
      reportDate: 'Report Date',
      propertyAddress: 'Property Address',
      reportSummary: 'Report Summary',
      incomeDetails: 'Income Details',
      expenseDetails: 'Expense Details',
      profitabilityAnalysis: 'Profitability Analysis',

      // Calculations
      calculatedAs: 'Calculated as',
      percentOfIncome: 'of total income',

      // Messages
      noDataAvailable: 'No data available',
      noExpensesRegistered: 'No expenses registered',
      selectPeriod: 'Select a period',
    },
  },
  ru: {
    translation: {
      // Common
      property: 'Собственность',
      period: 'Период',
      income: 'Доход',
      expenses: 'Расходы',
      commission: 'Комиссия',
      profit: 'Чистая Прибыль',
      roi: 'ROI',
      language: 'Язык',

      // Financial Report
      financialReport: 'Финансовый Отчет',
      propertyFinancialReport: 'Финансовый Отчет - По Имущество',
      generalView: 'Общий Вид',
      propertyView: 'По Имущество',
      selectProperty: 'Выберите Имущество',
      selectLanguage: 'Выберите Язык',
      filterByProperty: 'Фильтровать по Имущество',
      allProperties: 'Все имущества',
      totalIncome: 'Общий Доход',
      totalExpenses: 'Общие Расходы',
      totalProfit: 'Чистая Прибыль',
      averageROI: 'Средний ROI',

      // Expense Breakdown
      expenseBreakdown: 'Разбор Расходов по Категориям',
      category: 'Категория',
      amount: 'Сумма',
      totalExpensesAmount: 'Всего Расходов',

      // Metrics
      profitabilityMetrics: 'Метрики Прибыльности',
      profitMargin: 'Маржа Прибыли',
      expenseRatio: 'Расходы/Доход',
      adminCommission: 'Административная Комиссия',
      returnOnInvestment: 'Возврат Инвестиций',

      // Export Options
      exportReport: 'Экспортировать Отчет',
      calculate: 'Рассчитать',
      downloadCSV: 'Скачать CSV',
      downloadPDF: 'Скачать PDF',
      print: 'Печать',
      printReport: 'Распечатать Отчет',

      // PDF Report
      generatedOn: 'Создано',
      reportDate: 'Дата Отчета',
      propertyAddress: 'Адрес Имущества',
      reportSummary: 'Сводка Отчета',
      incomeDetails: 'Детали Доходов',
      expenseDetails: 'Детали Расходов',
      profitabilityAnalysis: 'Анализ Прибыльности',

      // Calculations
      calculatedAs: 'Рассчитано как',
      percentOfIncome: 'от общего дохода',

      // Messages
      noDataAvailable: 'Данные недоступны',
      noExpensesRegistered: 'Расходы не зарегистрированы',
      selectPeriod: 'Выберите период',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
