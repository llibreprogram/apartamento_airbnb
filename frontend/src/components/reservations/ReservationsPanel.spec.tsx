import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReservationsPanel } from './ReservationsPanel';

jest.mock('@/services/api', () => ({
  reservationService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    checkAvailability: jest.fn(),
  },
}));

describe('ReservationsPanel', () => {
  const mockReservations = [
    {
      id: 'res-1',
      property_id: 'prop-1',
      guest_name: 'John Doe',
      guest_email: 'john@example.com',
      check_in: '2025-11-20',
      check_out: '2025-11-25',
      num_guests: 2,
      total_price: 500,
      status: 'confirmed',
    },
    {
      id: 'res-2',
      property_id: 'prop-2',
      guest_name: 'Jane Smith',
      guest_email: 'jane@example.com',
      check_in: '2025-12-01',
      check_out: '2025-12-05',
      num_guests: 4,
      total_price: 800,
      status: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reservations panel', async () => {
    render(<ReservationsPanel />);

    await waitFor(() => {
      expect(screen.getByText(/reservas/i)).toBeInTheDocument();
    });
  });

  it('should display list of reservations', async () => {
    render(<ReservationsPanel />);

    await waitFor(() => {
      mockReservations.forEach((res) => {
        expect(screen.queryByText(res.guest_name)).toBeInTheDocument();
        expect(screen.queryByText(res.guest_email)).toBeInTheDocument();
      });
    });
  });

  it('should filter reservations by status', async () => {
    render(<ReservationsPanel />);

    const filterButton = screen.getByRole('button', { name: /confirmadas/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.queryByText(/jane smith/i)).not.toBeInTheDocument();
    });
  });

  it('should open create reservation modal', async () => {
    render(<ReservationsPanel />);

    const addButton = screen.getByRole('button', { name: /nueva reserva/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/nueva reserva/i)).toBeInTheDocument();
    });
  });

  it('should confirm pending reservation', async () => {
    render(<ReservationsPanel />);

    await waitFor(() => {
      const confirmButtons = screen.getAllByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/reserva confirmada/i)).toBeInTheDocument();
    });
  });

  it('should cancel reservation', async () => {
    render(<ReservationsPanel />);

    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/reserva cancelada/i)).toBeInTheDocument();
    });
  });

  it('should check availability for date range', async () => {
    render(<ReservationsPanel />);

    const checkAvailButton = screen.getByRole('button', { name: /verificar disponibilidad/i });
    fireEvent.click(checkAvailButton);

    await waitFor(() => {
      expect(screen.getByText(/fechas disponibles/i)).toBeInTheDocument();
    });
  });

  it('should display unavailable dates', async () => {
    render(<ReservationsPanel />);

    const checkAvailButton = screen.getByRole('button', { name: /verificar disponibilidad/i });
    fireEvent.click(checkAvailButton);

    await waitFor(() => {
      expect(screen.getByText(/fechas no disponibles/i)).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    render(<ReservationsPanel />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
