# 🏢 Gestión de Apartamentos en Alquiler Vacacional

Sistema completo de gestión para administradores de propiedades de corta estancia (estilo Airbnb).

## 📋 Características Principales

### 🏠 Gestión de Propiedades
- Registro y administración de múltiples apartamentos
- Información detallada: ubicación, capacidad, amenities
- Galería de fotos e imágenes
- Datos de propietarios y contacto

### 📅 Reservas
- Calendario de disponibilidad
- Sincronización con Airbnb (futuro)
- Check-in/check-out automatizado
- Historial completo de huéspedes

### 💰 Control Financiero
- Registro de ingresos por reserva
- Tracking de gastos por categoría
- Gestión de depósitos de seguridad
- Cálculo automático de comisiones
- Estados de cuenta por período

### 📊 Reportes y Análisis
- Dashboard en tiempo real
- Rentabilidad por propiedad
- Comparativas período a período
- Exportación PDF/Excel
- Predicción de demanda

### 👥 Roles y Permisos
- **Admin:** Acceso total al sistema
- **Propietario:** Lectura de sus propiedades y estado de cuenta

## 🛠 Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** NestJS
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT + Passport
- **Validación:** class-validator, class-transformer

### Frontend
- **Librería:** React 18
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Rutas:** React Router
- **Estado:** Zustand
- **Gráficos:** Recharts
- **HTTP:** Axios

## 📁 Estructura del Proyecto

```
apartamento_airbnb/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Autenticación y JWT
│   │   │   ├── users/          # Usuarios y roles
│   │   │   ├── properties/     # Propiedades/apartamentos
│   │   │   ├── reservations/   # Reservas
│   │   │   ├── expenses/       # Gastos e inversiones
│   │   │   └── financials/     # Reportes financieros
│   │   ├── common/             # Guards, decoradores, excepciones
│   │   ├── database/           # Migrations y seeds
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── hooks/             # Hooks personalizados
│   │   ├── services/          # Llamadas a API
│   │   ├── types/             # Tipos TypeScript
│   │   ├── utils/             # Funciones auxiliares
│   │   ├── context/           # Context API
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── package.json (monorepo)
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### ⚡ En 30 Segundos

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend (en otra ventana)
cd frontend && npm run dev

# Luego abre: http://localhost:3000
```

**Credenciales de prueba:**
```
Email:    demo1761960285@apartamentos.com
Password: DemoPass123
```

👉 **Ver `QUICK_START.md` para más detalles**

---

### Requisitos Previos
- Node.js 18+
- npm o yarn
- PostgreSQL 12+

### Instalación Completa

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd apartamento_airbnb
```

2. **Instalar dependencias (monorepo)**
```bash
npm install
```

3. **Configurar variables de entorno**

Backend (`.env`):
```bash
cp backend/.env.example backend/.env
```

Frontend (`.env`):
```bash
cp frontend/.env.example frontend/.env
```

4. **Base de datos**
```bash
createdb apartamento_airbnb
```

### Desarrollo

Terminal 1 - Backend:
```bash
cd backend && npm run start:dev
# Servidor en http://localhost:3001
# Swagger en http://localhost:3001/api/docs
```

Terminal 2 - Frontend:
```bash
cd frontend && npm run dev
# Aplicación en http://localhost:3000
```

### Build para Producción

```bash
npm run build
```

Esto generará:
- `/backend/dist` - Aplicación NestJS compilada
- `/frontend/dist` - Aplicación React compilada

## 📚 Documentación

### 📖 Guías Principales

| Documento | Descripción |
|-----------|-------------|
| **[QUICK_START.md](./QUICK_START.md)** | ⚡ Inicia en 30 segundos |
| **[GET_STARTED.md](./GET_STARTED.md)** | 🎯 Primeros pasos detallados |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | 🛠️ Guía para desarrolladores |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 🏗️ Diseño técnico del sistema |
| **[ESTADO_SISTEMA.md](./ESTADO_SISTEMA.md)** | 📊 Estado actual del proyecto |
| **[ACCESO_EXTERNO.md](./ACCESO_EXTERNO.md)** | 🌐 Compartir por internet |
| **[POLICIES.md](./POLICIES.md)** | 📋 Estándares y seguridad |
| **[INTEGRATIONS.md](./INTEGRATIONS.md)** | 🔗 Guía de terceros |
| **[FAQ.md](./FAQ.md)** | ❓ Preguntas frecuentes |

### 🎯 Recomendación por Rol

**👤 Nuevo Developer:**
1. Lee `QUICK_START.md` (5 min)
2. Ejecuta el setup (10 min)
3. Lee `GET_STARTED.md` (15 min)
4. Lee `DEVELOPMENT.md` cuando necesites crear features

**🏗️ Architect/Lead:**
1. Lee `README.md` (este archivo)
2. Lee `ARCHITECTURE.md`
3. Lee `POLICIES.md`
4. Lee `ESTADO_SISTEMA.md`

**🔧 DevOps/Operations:**
1. Lee `DOCKER_QUICK_START.md`
2. Lee `ACCESO_EXTERNO.md`
3. Lee `ESTADO_SISTEMA.md`

### 🔗 API Documentation

La documentación de API está disponible en **Swagger** cuando corres el servidor:
- [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

### 🔧 Módulos Backend

| Módulo | Descripción |
|--------|-------------|
| **Auth** | Login/Register, JWT validation, Role-based access control |
| **Users** | Gestión de usuarios, perfiles, datos bancarios |
| **Properties** | CRUD de propiedades, información detallada, fotos |
| **Reservations** | Gestión de reservas, disponibilidad, cambios/cancelaciones |
| **Expenses** | Registro de gastos, categorización, seguimiento |
| **Financials** | Cálculo de rentabilidad, estados de cuenta, reportes |

## 🔐 Seguridad

- ✅ Encriptación de contraseñas (bcryptjs)
- ✅ JWT para autenticación
- ✅ Validación de datos con DTOs
- ✅ CORS configurado
- ✅ Auditoría de cambios financieros
- ⚠️ Implementar HTTPS en producción
- ⚠️ Usar variables de entorno para secretos

## 🧪 Testing

```bash
# Backend
npm run test

# Con cobertura
npm run test:cov
```

## 📝 Modelo de Datos

### Tablas Principales

**users**
- id, email, password, fullName, role (admin/owner)

**properties**
- id, name, address, capacity, bedrooms, bathrooms, owner_id

**reservations**
- id, property_id, guest_name, check_in, check_out, status

**expenses**
- id, property_id, description, amount, category, date

**financial_reports**
- id, property_id, period, gross_income, total_expenses, net_profit

## 🛣️ Roadmap

### MVP (Fase 1)
- ✅ Autenticación básica
- ✅ CRUD de propiedades
- ✅ Gestión de reservas manual
- ✅ Registro de gastos
- ✅ Dashboard básico
- ⬜ Cálculo de rentabilidad

### Fase 2
- ⬜ Integración Airbnb
- ⬜ Estados de cuenta PDF
- ⬜ Notificaciones por email
- ⬜ Dashboard mejorado

### Fase 3
- ⬜ Pasarela de pagos (Stripe)
- ⬜ Analytics avanzado
- ⬜ Machine Learning (predicción)
- ⬜ App móvil

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

## 📧 Soporte

Para reportar issues o sugerencias: [issues@project.com](mailto:issues@project.com)

---

**Última actualización:** Octubre 2025
