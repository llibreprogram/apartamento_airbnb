import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';
import * as authStore from '@/stores/authStore';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@/stores/authStore');

describe('RegisterForm', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <RegisterForm />
      </BrowserRouter>,
    );
  };

  it('should render register form with all required fields', () => {
    renderComponent();

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarse/i })).toBeInTheDocument();
  });

  it('should update form state when user types', () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText(/juan pérez/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
    const passwordInput = screen.getByDisplayValue('') as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
  });

  it('should call register with form data on submit', async () => {
    mockRegister.mockResolvedValue({ user: { id: '123' } });

    renderComponent();

    const nameInput = screen.getByPlaceholderText(/juan pérez/i);
    const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  it('should show error if passwords do not match', async () => {
    renderComponent();

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /registrarse/i });

    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
  });

  it('should display error message when registration fails', () => {
    const errorMessage = 'Email already exists';
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: { message: errorMessage },
      clearError: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should disable form while loading', () => {
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      clearError: jest.fn(),
    });

    renderComponent();

    const submitButton = screen.getByRole('button', { name: /registrándose/i }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should navigate to login page when login link is clicked', () => {
    renderComponent();

    const loginLink = screen.getByRole('button', { name: /inicia sesión aquí/i });
    fireEvent.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
