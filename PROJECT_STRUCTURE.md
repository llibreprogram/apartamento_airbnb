apartamento_airbnb/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   └── refresh-token.dto.ts
│   │   │   │   ├── 📁 entities/
│   │   │   │   │   └── (user es mejor en users module)
│   │   │   │   └── 📁 guards/
│   │   │   │       └── jwt-auth.guard.ts
│   │   │   │
│   │   │   ├── 📁 users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   ├── update-user.dto.ts
│   │   │   │   │   └── user-profile.dto.ts
│   │   │   │   └── 📁 entities/
│   │   │   │       └── user.entity.ts
│   │   │   │
│   │   │   ├── 📁 properties/
│   │   │   │   ├── properties.controller.ts
│   │   │   │   ├── properties.service.ts
│   │   │   │   ├── properties.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── create-property.dto.ts
│   │   │   │   │   ├── update-property.dto.ts
│   │   │   │   │   └── property-query.dto.ts
│   │   │   │   └── 📁 entities/
│   │   │   │       └── property.entity.ts
│   │   │   │
│   │   │   ├── 📁 reservations/
│   │   │   │   ├── reservations.controller.ts
│   │   │   │   ├── reservations.service.ts
│   │   │   │   ├── reservations.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── create-reservation.dto.ts
│   │   │   │   │   ├── update-reservation.dto.ts
│   │   │   │   │   └── cancel-reservation.dto.ts
│   │   │   │   ├── 📁 entities/
│   │   │   │   │   └── reservation.entity.ts
│   │   │   │   └── reservations.service.spec.ts
│   │   │   │
│   │   │   ├── 📁 expenses/
│   │   │   │   ├── expenses.controller.ts
│   │   │   │   ├── expenses.service.ts
│   │   │   │   ├── expenses.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── create-expense.dto.ts
│   │   │   │   │   ├── update-expense.dto.ts
│   │   │   │   │   └── expense-query.dto.ts
│   │   │   │   └── 📁 entities/
│   │   │   │       ├── expense.entity.ts
│   │   │   │       └── expense-category.entity.ts
│   │   │   │
│   │   │   ├── 📁 financials/
│   │   │   │   ├── financials.controller.ts
│   │   │   │   ├── financials.service.ts
│   │   │   │   ├── financials.module.ts
│   │   │   │   ├── 📁 dto/
│   │   │   │   │   ├── financial-report.dto.ts
│   │   │   │   │   └── owner-statement.dto.ts
│   │   │   │   ├── 📁 entities/
│   │   │   │   │   ├── financial-report.entity.ts
│   │   │   │   │   └── owner-statement.entity.ts
│   │   │   │   └── 📁 calculators/
│   │   │   │       ├── roi.calculator.ts
│   │   │   │       ├── commission.calculator.ts
│   │   │   │       └── statement.calculator.ts
│   │   │   │
│   │   │   └── 📁 integrations/
│   │   │       ├── 📁 stripe/
│   │   │       ├── 📁 airbnb/
│   │   │       ├── 📁 email/
│   │   │       └── 📁 storage/
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── 📁 decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── user.decorator.ts
│   │   │   ├── 📁 filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── 📁 guards/
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── jwt-auth.guard.ts
│   │   │   ├── 📁 interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   └── 📁 pipes/
│   │   │       └── parse-uuid.pipe.ts
│   │   │
│   │   ├── 📁 database/
│   │   │   ├── 📁 migrations/
│   │   │   │   ├── 1000000000000-CreateUsersTable.ts
│   │   │   │   ├── 1000000000001-CreatePropertiesTable.ts
│   │   │   │   ├── 1000000000002-CreateReservationsTable.ts
│   │   │   │   └── ...
│   │   │   ├── 📁 seeds/
│   │   │   │   ├── users.seed.ts
│   │   │   │   └── properties.seed.ts
│   │   │   └── database.module.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── 📁 test/
│   │   ├── jest-e2e.json
│   │   └── app.e2e-spec.ts
│   │
│   ├── Dockerfile
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env (gitignored)
│   └── README.md
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── 📁 dashboard/
│   │   │   │   ├── DashboardCard.tsx
│   │   │   │   ├── MetricsGrid.tsx
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   └── OccupancyChart.tsx
│   │   │   ├── 📁 properties/
│   │   │   │   ├── PropertyCard.tsx
│   │   │   │   ├── PropertyForm.tsx
│   │   │   │   ├── PropertyList.tsx
│   │   │   │   └── PropertyModal.tsx
│   │   │   ├── 📁 reservations/
│   │   │   │   ├── ReservationCard.tsx
│   │   │   │   ├── ReservationForm.tsx
│   │   │   │   ├── ReservationCalendar.tsx
│   │   │   │   └── ReservationList.tsx
│   │   │   ├── 📁 financials/
│   │   │   │   ├── FinancialReport.tsx
│   │   │   │   ├── ROIChart.tsx
│   │   │   │   ├── ExpenseBreakdown.tsx
│   │   │   │   └── OwnerStatement.tsx
│   │   │   └── 📁 shared/
│   │   │       ├── Loading.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── Modal.tsx
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Properties.tsx
│   │   │   ├── Reservations.tsx
│   │   │   ├── Financials.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── useProperties.ts
│   │   │   ├── useReservations.ts
│   │   │   ├── useFinancials.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── api.ts (axios instance)
│   │   │   ├── propertyService.ts
│   │   │   ├── reservationService.ts
│   │   │   ├── expenseService.ts
│   │   │   ├── financialService.ts
│   │   │   └── authService.ts
│   │   │
│   │   ├── 📁 types/
│   │   │   ├── index.ts
│   │   │   ├── property.ts
│   │   │   ├── reservation.ts
│   │   │   ├── expense.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── storage.ts (localStorage helpers)
│   │   │   └── calculations.ts
│   │   │
│   │   ├── 📁 context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   │
│   │   ├── 📁 styles/
│   │   │   └── globals.css
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── 📁 public/
│   │   ├── logo.svg
│   │   └── index.html (symlink or moved)
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── package.json
│   ├── .env.example
│   ├── .env (gitignored)
│   └── README.md
│
├── 📁 .github/
│   ├── copilot-instructions.md
│   ├── 📁 workflows/
│   │   ├── ci.yml (GitHub Actions)
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docker-compose.yml
├── .gitignore
├── package.json (monorepo root)
├── README.md (Proyecto general)
├── ARCHITECTURE.md (Arquitectura técnica)
├── DEVELOPMENT.md (Guía de desarrollo)
├── POLICIES.md (Estándares y políticas)
├── INTEGRATIONS.md (Guía de integraciones)
├── FAQ.md (Preguntas frecuentes)
└── LICENSE

Legend:
📁 = Carpeta (directory)
📄 = Archivo (file)
.ts/.tsx = TypeScript files
.env = Environment variables
.json = Configuration files
