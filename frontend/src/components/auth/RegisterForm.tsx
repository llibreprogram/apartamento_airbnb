import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null);
    if (error) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    if (formData.password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setValidationError('La contraseña debe contener al menos una mayúscula');
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setValidationError('La contraseña debe contener al menos una minúscula');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setValidationError('La contraseña debe contener al menos un número');
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      setValidationError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">🏢 Apartamentos</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Juan Pérez"
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-600">
              Mínimo 8 caracteres, con mayúscula, minúscula y número
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800">{validationError}</p>
            </div>
          )}

          {/* API error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">{error.message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
