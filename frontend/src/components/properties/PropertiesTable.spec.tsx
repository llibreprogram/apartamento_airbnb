import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PropertiesTable } from './PropertiesTable';

jest.mock('@/services/api', () => ({
  propertyService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PropertiesTable', () => {
  const mockProperties = [
    {
      id: 'prop-1',
      name: 'Apartment A',
      address: 'Calle Mayor 123',
      bedrooms: 2,
      bathrooms: 1,
      capacity: 4,
      owner_id: 'user-1',
    },
    {
      id: 'prop-2',
      name: 'Apartment B',
      address: 'Calle Principal 456',
      bedrooms: 3,
      bathrooms: 2,
      capacity: 6,
      owner_id: 'user-1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render properties table', async () => {
    render(<PropertiesTable />);

    await waitFor(() => {
      expect(screen.getByText(/propiedades/i)).toBeInTheDocument();
    });
  });

  it('should display properties in table', async () => {
    render(<PropertiesTable />);

    await waitFor(() => {
      mockProperties.forEach((prop) => {
        expect(screen.queryByText(prop.name)).toBeInTheDocument();
        expect(screen.queryByText(prop.address)).toBeInTheDocument();
      });
    });
  });

  it('should open add property modal when button is clicked', async () => {
    render(<PropertiesTable />);

    const addButton = screen.getByRole('button', { name: /agregar propiedad/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/nueva propiedad/i)).toBeInTheDocument();
    });
  });

  it('should open edit property modal when edit button is clicked', async () => {
    render(<PropertiesTable />);

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/editar propiedad/i)).toBeInTheDocument();
    });
  });

  it('should delete property when delete button is clicked', async () => {
    render(<PropertiesTable />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText(/propiedad eliminada/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no properties exist', async () => {
    render(<PropertiesTable />);

    await waitFor(() => {
      expect(screen.getByText(/no hay propiedades registradas/i)).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    render(<PropertiesTable />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
