# Gestión de Apartamentos - Instrucciones para Copilot

**Status:** ✅ MVP en desarrollo

## Descripción del Proyecto
Sistema SaaS de gestión integral para administradores de propiedades en alquiler vacacional (estilo Airbnb):
- Gestión centralizada de múltiples propiedades
- Reservas y calendario de disponibilidad
- Control financiero y contabilidad detallada
- Cálculo automático de comisiones y rentabilidad
- Estados de cuenta para propietarios
- Dashboards analíticos
- Roles y permisos (admin/propietarios con RBAC)

## Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Tailwind CSS + Recharts
- **Backend:** NestJS 10 + TypeORM + PostgreSQL 15
- **Autenticación:** JWT + Passport + Role-Based Access Control
- **Integraciones:** Stripe (futuro), Airbnb, SendGrid, AWS S3

## Estructura del Proyecto
```
backend/          - NestJS API con 6 módulos core
frontend/         - React application
docs/
├── README.md                 - Inicio rápido
├── EXECUTIVE_SUMMARY.md      - Resumen estratégico
├── ARCHITECTURE.md           - Diseño técnico
├── DEVELOPMENT.md            - Guía para developers
├── POLICIES.md               - Estándares y security
├── INTEGRATIONS.md           - Guía de terceros
├── FAQ.md                    - Troubleshooting
├── GET_STARTED.md            - Primer día
└── PROJECT_STRUCTURE.md      - Árbol de archivos
```

## Módulos Backend

| Módulo | Responsabilidad |
|--------|-----------------|
| **auth** | Autenticación JWT, login/register |
| **users** | Gestión de usuarios y roles |
| **properties** | CRUD de apartamentos |
| **reservations** | Gestión de reservas |
| **expenses** | Registro de gastos por categoría |
| **financials** | Reportes, rentabilidad, estados de cuenta |

## Variables de Entorno

Backend (backend/.env):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=apartamento_airbnb
JWT_SECRET=dev-secret-key-change-in-prod
NODE_ENV=development
PORT=3001
```

Frontend (frontend/.env):
```
REACT_APP_API_URL=http://localhost:3001
```

## Comandos Esenciales

```bash
# Setup inicial
npm install

# Desarrollo
npm run dev                    # Ambas aplicaciones
npm run backend:dev           # Solo backend
npm run frontend:dev          # Solo frontend

# Build
npm run build                 # Build para producción

# Testing
npm test                      # Ejecutar tests
npm run test:cov              # Con cobertura

# Lint y format
npm run lint                  # ESLint
npm run format                # Prettier
```

## Estándares de Desarrollo

### Reglas Core
- ✅ TypeScript strict mode en ambos lados
- ✅ Validación de datos con DTOs + class-validator
- ✅ Testing obligatorio (80%+ cobertura)
- ✅ Commits con conventional commits (feat:, fix:, docs:)
- ✅ Code reviews antes de merge
- ✅ Documentación en Swagger + comentarios

### Seguridad
- ✅ JWT con 24h expiración
- ✅ Encriptación bcryptjs (10 rounds)
- ✅ RBAC en todos los endpoints sensibles
- ✅ Auditoría completa de cambios financieros
- ✅ CORS configurado
- ✅ Rate limiting en endpoints públicos

### Base de Datos
- ✅ PostgreSQL obligatorio (ACID transactions)
- ✅ TypeORM con migraciones
- ✅ Índices en campos frecuentes
- ✅ Foreign keys para integridad referencial
- ✅ Soft delete para datos financieros

## Flujo de Trabajo Git

```bash
git checkout -b feat/nombre-feature
# ... desarrollar ...
git commit -m "feat(module): description"
git push origin feat/nombre-feature
# → Crear Pull Request
# → Code review
# → Merge a main
```

## Próximos Hitos

**Fase 1 (MVP):** ▰▰▰▱▱ 35%
- ✅ Setup y estructura
- ✅ Auth básico
- ⬜ CRUD propiedades y reservas
- ⬜ Motor financiero
- ⬜ Reportes
- ⬜ QA y deploy

**Fase 2 (Integraciones):** ⬜
- Sincronización Airbnb
- Stripe Connect
- Email automático

**Fase 3 (Escala):** ⬜
- ML predicción demanda
- App móvil (React Native)
- Multi-idioma

## Recursos

- [Documentación Completa](../README.md)
- [Primeros Pasos](../GET_STARTED.md)
- [Arquitectura](../ARCHITECTURE.md)
- [Guía de Desarrollo](../DEVELOPMENT.md)
- [NestJS Docs](https://docs.nestjs.com)
- [React Docs](https://react.dev)

## Contacto

- 📧 dev@example.com
- 💬 Slack/Discord del equipo
- 📋 Weekly standup
