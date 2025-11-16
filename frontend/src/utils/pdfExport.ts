import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions {
  filename: string;
  title?: string;
  propertyName?: string;
  period?: string;
  data?: any;
}

/**
 * Exporta el contenido HTML visible en PDF
 */
export const exportToPDF = async (
  elementId: string,
  options: PDFExportOptions
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(options.filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Genera un PDF con estructura profesional para reportes financieros
 * Usando renderizado HTML para soporte completo de Unicode
 */
export const generateFinancialReportPDF = (
  data: {
    propertyName: string;
    period: string;
    propertyAddress?: string;
    grossIncome: number;
    totalExpenses: number;
    commissionAmount: number;
    netProfit: number;
    roi: number;
    expenseBreakdown?: Array<{ category: string; amount: number }>;
    profitMargin?: number;
    expenseRatio?: number;
    electricityData?: {
      totalCharged: number;
      totalPaid: number;
      difference: number;
      reservationsCount: number;
      expensesCount: number;
    };
  },
  options: {
    filename: string;
    language?: 'es' | 'en' | 'ru';
  }
): void => {
  try {
    const language = options.language || 'es';

    // Ensure all numeric values are valid numbers
    const ensureNumber = (val: any, defaultVal: number = 0): number => {
      const num = Number(val);
      return isNaN(num) ? defaultVal : num;
    };

    const grossIncome = ensureNumber(data.grossIncome);
    const totalExpenses = ensureNumber(data.totalExpenses);
    const commissionAmount = ensureNumber(data.commissionAmount);
    const netProfit = ensureNumber(data.netProfit);
    const roi = ensureNumber(data.roi);
    const profitMargin = ensureNumber(data.profitMargin);
    const expenseRatio = ensureNumber(data.expenseRatio);

    // Traducciones
    const translations: Record<string, Record<string, string>> = {
      es: {
        title: 'Reporte Financiero',
        property: 'Propiedad',
        period: 'Período',
        address: 'Dirección',
        summary: 'Resumen',
        income: 'Ingresos',
        expenses: 'Gastos',
        commission: 'Comisión',
        profit: 'Ganancia Neta',
        roi: 'ROI',
        margin: 'Margen de Ganancia',
        expenseRatio: 'Gasto/Ingreso',
        breakdown: 'Desglose de Gastos',
        category: 'Categoría',
        amount: 'Monto',
        total: 'Total',
        generatedOn: 'Generado el',
        electricityReport: '⚡ Reporte de Electricidad',
        electricityCharged: 'Cobrado a Huéspedes',
        electricityPaid: 'Pagado en Facturas',
        electricityDifference: 'Diferencia',
        electricityMargin: 'Margen',
        electricityReservations: 'Reservas',
        electricityExpenses: 'Gastos',
        profitLabel: 'Ganancia',
        lossLabel: 'Pérdida',
      },
      en: {
        title: 'Financial Report',
        property: 'Property',
        period: 'Period',
        address: 'Address',
        summary: 'Summary',
        income: 'Income',
        expenses: 'Expenses',
        commission: 'Commission',
        profit: 'Net Profit',
        roi: 'ROI',
        margin: 'Profit Margin',
        expenseRatio: 'Expense/Income',
        breakdown: 'Expense Breakdown',
        category: 'Category',
        amount: 'Amount',
        total: 'Total',
        generatedOn: 'Generated on',
        electricityReport: '⚡ Electricity Report',
        electricityCharged: 'Charged to Guests',
        electricityPaid: 'Paid in Bills',
        electricityDifference: 'Difference',
        electricityMargin: 'Margin',
        electricityReservations: 'Reservations',
        electricityExpenses: 'Expenses',
        profitLabel: 'Profit',
        lossLabel: 'Loss',
      },
      ru: {
        title: 'Финансовый Отчет',
        property: 'Имущество',
        period: 'Период',
        address: 'Адрес',
        summary: 'Сводка',
        income: 'Доход',
        expenses: 'Расходы',
        commission: 'Комиссия',
        profit: 'Чистая Прибыль',
        roi: 'ROI',
        margin: 'Маржа Прибыли',
        expenseRatio: 'Расходы/Доход',
        breakdown: 'Разбор Расходов',
        category: 'Категория',
        amount: 'Сумма',
        total: 'Всего',
        generatedOn: 'Создано',
        electricityReport: '⚡ Отчет об Электроэнергии',
        electricityCharged: 'Взимано с Гостей',
        electricityPaid: 'Оплачено по Счетам',
        electricityDifference: 'Разница',
        electricityMargin: 'Маржа',
        electricityReservations: 'Бронирования',
        electricityExpenses: 'Расходы',
        profitLabel: 'Прибыль',
        lossLabel: 'Убыток',
      },
    };

    const t = translations[language] || translations.es;

    // Create HTML content with proper UTF-8 encoding
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h1 style="margin: 0 0 10px 0; font-size: 24px; text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">
          ${escapeHtml(t.title)}
        </h1>
        
        <div style="margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>${escapeHtml(t.property)}:</strong> ${escapeHtml(data.propertyName)}</p>
          <p style="margin: 5px 0;"><strong>${escapeHtml(t.period)}:</strong> ${escapeHtml(data.period)}</p>
          ${data.propertyAddress ? `<p style="margin: 5px 0;"><strong>${escapeHtml(t.address)}:</strong> ${escapeHtml(data.propertyAddress)}</p>` : ''}
        </div>

        <h2 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #666; padding-bottom: 5px;">
          ${escapeHtml(t.summary)}
        </h2>

        <table style="width: 100%; margin: 10px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.income)}:</td>
            <td style="padding: 5px; text-align: right;">$${grossIncome.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.expenses)}:</td>
            <td style="padding: 5px; text-align: right;">$${totalExpenses.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.commission)}:</td>
            <td style="padding: 5px; text-align: right;">$${commissionAmount.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.profit)}:</td>
            <td style="padding: 5px; text-align: right; color: ${netProfit >= 0 ? 'green' : 'red'};"><strong>$${netProfit.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.roi)}:</td>
            <td style="padding: 5px; text-align: right;">${roi.toFixed(2)}%</td>
          </tr>
          ${profitMargin !== 0 ? `
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.margin)}:</td>
            <td style="padding: 5px; text-align: right;">${profitMargin.toFixed(2)}%</td>
          </tr>
          ` : ''}
          ${expenseRatio !== 0 ? `
          <tr>
            <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.expenseRatio)}:</td>
            <td style="padding: 5px; text-align: right;">${expenseRatio.toFixed(2)}%</td>
          </tr>
          ` : ''}
        </table>

        ${data.electricityData ? `
          <h2 style="font-size: 14px; margin: 20px 0 10px 0; border-bottom: 1px solid #666; padding-bottom: 5px; color: #f59e0b;">
            ${escapeHtml(t.electricityReport)}
          </h2>

          <table style="width: 100%; margin: 10px 0; border-collapse: collapse;">
            <tr style="background-color: #dcfce7;">
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityCharged)}:</td>
              <td style="padding: 5px; text-align: right; color: #16a34a;"><strong>$${ensureNumber(data.electricityData.totalCharged).toFixed(2)}</strong></td>
            </tr>
            <tr style="background-color: #fee2e2;">
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityPaid)}:</td>
              <td style="padding: 5px; text-align: right; color: #dc2626;"><strong>$${ensureNumber(data.electricityData.totalPaid).toFixed(2)}</strong></td>
            </tr>
            <tr style="background-color: ${ensureNumber(data.electricityData.difference) >= 0 ? '#dbeafe' : '#fef3c7'};">
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityDifference)}:</td>
              <td style="padding: 5px; text-align: right; color: ${ensureNumber(data.electricityData.difference) >= 0 ? '#2563eb' : '#d97706'};"><strong>$${ensureNumber(data.electricityData.difference).toFixed(2)}</strong></td>
            </tr>
            ${ensureNumber(data.electricityData.totalPaid) > 0 ? `
            <tr>
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityMargin)}:</td>
              <td style="padding: 5px; text-align: right;">${(((ensureNumber(data.electricityData.totalCharged) / ensureNumber(data.electricityData.totalPaid)) - 1) * 100).toFixed(2)}%</td>
            </tr>
            ` : ''}
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityReservations)}:</td>
              <td style="padding: 5px; text-align: right;">${data.electricityData.reservationsCount || 0}</td>
            </tr>
            <tr>
              <td style="padding: 5px; font-weight: bold;">${escapeHtml(t.electricityExpenses)}:</td>
              <td style="padding: 5px; text-align: right;">${data.electricityData.expensesCount || 0}</td>
            </tr>
          </table>

          <div style="margin-top: 10px; padding: 8px; background-color: ${ensureNumber(data.electricityData.difference) >= 0 ? '#e0f2fe' : '#fef9c3'}; border-left: 3px solid ${ensureNumber(data.electricityData.difference) >= 0 ? '#0284c7' : '#ca8a04'}; font-size: 12px;">
            <strong>${ensureNumber(data.electricityData.difference) >= 0 ? escapeHtml(t.profitLabel) : escapeHtml(t.lossLabel)}:</strong>
            ${ensureNumber(data.electricityData.difference) >= 0 
              ? `Se cobró más de lo que se pagó. Ganancia de $${ensureNumber(data.electricityData.difference).toFixed(2)}` 
              : `Se cobró menos de lo que se pagó. El propietario debe $${Math.abs(ensureNumber(data.electricityData.difference)).toFixed(2)}`
            }
          </div>
        ` : ''}

        ${data.expenseBreakdown && Array.isArray(data.expenseBreakdown) && data.expenseBreakdown.length > 0 ? `
          <h2 style="font-size: 14px; margin: 15px 0 10px 0; border-bottom: 1px solid #666; padding-bottom: 5px;">
            ${escapeHtml(t.breakdown)}
          </h2>

          <table style="width: 100%; margin: 10px 0; border-collapse: collapse;">
            ${data.expenseBreakdown.map((expense, idx) => `
              <tr ${idx % 2 === 1 ? 'style="background-color: #f5f5f5;"' : ''}>
                <td style="padding: 5px;">${escapeHtml(expense.category)}</td>
                <td style="padding: 5px; text-align: right;">$${ensureNumber(expense.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold; border-top: 2px solid #333;">
              <td style="padding: 5px;">${escapeHtml(t.total)}</td>
              <td style="padding: 5px; text-align: right;">$${data.expenseBreakdown.reduce((sum, e) => sum + ensureNumber(e.amount), 0).toFixed(2)}</td>
            </tr>
          </table>
        ` : ''}

        <div style="margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
          <p>${escapeHtml(t.generatedOn)}: ${new Date().toLocaleDateString(
            language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US'
          )}</p>
        </div>
      </div>
    `;

    // Create temporary div to render HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = '#fff';
    document.body.appendChild(tempDiv);

    // Render HTML to canvas using html2canvas
    html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      canvas: undefined,
      allowTaint: true,
    }).then((canvas) => {
      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF from canvas
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(options.filename);
      console.log('PDF generado y descargado correctamente');
    }).catch((error) => {
      document.body.removeChild(tempDiv);
      console.error('Error al renderizar HTML:', error);
      throw error;
    });
  } catch (error) {
    console.error('Error generating financial PDF:', error);
    alert('Error al generar PDF. Ver consola para detalles.');
  }
};

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Formatea número como moneda
 */
export const formatCurrency = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Formatea porcentaje
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return value.toFixed(decimals);
};
