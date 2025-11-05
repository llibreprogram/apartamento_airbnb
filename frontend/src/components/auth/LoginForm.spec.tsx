import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import * as authStore from '@/stores/authStore';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
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
        <LoginForm />
      </BrowserRouter>,
    );
  };

  it('should render login form with email and password fields', () => {
    renderComponent();

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should update form state when user types', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/•••••••/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should call login with form data on submit', async () => {
    mockLogin.mockResolvedValue({ token: 'test-token' });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/•••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    mockLogin.mockResolvedValue({ token: 'test-token' });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/•••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message when login fails', async () => {
    const errorMessage = 'Invalid credentials';
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: { message: errorMessage },
      clearError: jest.fn(),
    });

    renderComponent();

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should disable inputs while loading', () => {
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: jest.fn(),
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/•••••••/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /iniciando sesión/i }) as HTMLButtonElement;

    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  it('should clear error when user starts typing', () => {
    const clearError = jest.fn();
    (authStore.useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: { message: 'Error occurred' },
      clearError,
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

    expect(clearError).toHaveBeenCalled();
  });

  it('should navigate to register page when register link is clicked', () => {
    renderComponent();

    const registerLink = screen.getByRole('button', { name: /regístrate aquí/i });
    fireEvent.click(registerLink);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
