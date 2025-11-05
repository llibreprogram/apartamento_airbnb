import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancialsPanel } from './FinancialsPanel';

jest.mock('@/services/api', () => ({
  financialService: {
    getAll: jest.fn(),
    getSummary: jest.fn(),
    getPropertySummary: jest.fn(),
    getComparative: jest.fn(),
    generateReport: jest.fn(),
  },
}));

describe('FinancialsPanel', () => {

  const mockPropertyFinancials = [
    {
      id: 'fin-1',
      propertyId: 'prop-1',
      period: '2025-11',
      grossIncome: 5000,
      totalExpenses: 1200,
      netProfit: 3800,
      commissionAmount: 500,
    },
    {
      id: 'fin-2',
      propertyId: 'prop-2',
      period: '2025-11',
      grossIncome: 6000,
      totalExpenses: 1300,
      netProfit: 4700,
      commissionAmount: 600,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render financials panel', async () => {
    render(<FinancialsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/financiero/i)).toBeInTheDocument();
    });
  });

  it('should display key performance indicators', async () => {
    render(<FinancialsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/ingresos brutos/i)).toBeInTheDocument();
      expect(screen.getByText(/gastos totales/i)).toBeInTheDocument();
      expect(screen.getByText(/ganancia neta/i)).toBeInTheDocument();
      expect(screen.getByText(/roi promedio/i)).toBeInTheDocument();
    });
  });

  it('should display financial data for all properties', async () => {
    render(<FinancialsPanel />);

    await waitFor(() => {
      mockPropertyFinancials.forEach((fin) => {
        expect(screen.queryByText(fin.period)).toBeInTheDocument();
        expect(screen.queryByText(`$${fin.grossIncome}`)).toBeInTheDocument();
      });
    });
  });

  it('should filter financials by period', async () => {
    render(<FinancialsPanel />);

    const periodSelect = screen.getByDisplayValue(/2025-11/i);
    fireEvent.change(periodSelect, { target: { value: '2025-10' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue(/2025-10/i)).toBeInTheDocument();
    });
  });

  it('should filter financials by property', async () => {
    render(<FinancialsPanel />);

    const propertySelect = screen.getByDisplayValue(/todas las propiedades/i);
    fireEvent.change(propertySelect, { target: { value: 'prop-1' } });

    await waitFor(() => {
      expect(screen.queryByText(/prop-2/i)).not.toBeInTheDocument();
    });
  });

  it('should display comparative data between periods', async () => {
    render(<FinancialsPanel />);

    const compareButton = screen.getByRole('button', { name: /comparar/i });
    fireEvent.click(compareButton);

    await waitFor(() => {
      expect(screen.getByText(/comparativa/i)).toBeInTheDocument();
      expect(screen.getByText(/cambio/i)).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });

  it('should export report as PDF', async () => {
    render(<FinancialsPanel />);

    const exportButton = screen.getByRole('button', { name: /exportar pdf/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/reporte generado/i)).toBeInTheDocument();
    });
  });

  it('should export report as Excel', async () => {
    render(<FinancialsPanel />);

    const exportButton = screen.getByRole('button', { name: /exportar excel/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText(/reporte generado/i)).toBeInTheDocument();
    });
  });

  it('should display charts for income and expenses', async () => {
    render(<FinancialsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/gráfico de ingresos/i)).toBeInTheDocument();
      expect(screen.getByText(/gráfico de gastos/i)).toBeInTheDocument();
    });
  });

  it('should calculate and display ROI for each property', async () => {
    render(<FinancialsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/roi/i)).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    render(<FinancialsPanel />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
