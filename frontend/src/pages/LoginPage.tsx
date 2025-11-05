import { LoginForm } from '@/components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl p-4 mb-4 shadow-xl">
            <span className="text-5xl">🏢</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Apartamentos</h1>
          <p className="text-blue-100 text-lg">Gestión de Propiedades en Alquiler</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <LoginForm />
        </div>

        {/* Footer Info */}
        <p className="text-center text-blue-100 mt-6 text-sm">
          © 2025 Sistema de Gestión. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
