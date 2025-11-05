# 📐 Arquitectura del Sistema

## Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                  HTTP/HTTPS │ API REST
                            │
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Components │ Pages │ Services │ Hooks │ Context       │ │
│  │ Tailwind CSS, Recharts, Zustand                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                   JSON/REST │ API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Controllers │ Services │ Guards │ Decorators        │ │
│  │ 6 Módulos principales                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ TypeORM │ Validación │ JWT │ Error Handling         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                    Driver  │ SQL
                            │
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ users │ properties │ reservations │ expenses │ etc.   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Capas de la Aplicación

### 1. Capa de Presentación (Frontend)
**Responsabilidad:** Interfaz visual y experiencia del usuario

- **Componentes:** Reutilizables y modulares
- **Páginas:** Vistas principales de la aplicación
- **Estilos:** Tailwind CSS para diseño responsive
- **Estado:** Zustand para estado global
- **Enrutamiento:** React Router v6

**Estructura:**
```
src/
├── components/
│   ├── common/          # Header, Footer, Navigation
│   ├── dashboard/       # Dashboard components
│   ├── properties/      # Property-related components
│   ├── reservations/    # Reservation components
│   └── financials/      # Financial reports
├── pages/
│   ├── Dashboard.tsx
│   ├── Properties.tsx
│   ├── Reservations.tsx
│   ├── Financials.tsx
│   └── Settings.tsx
└── services/
    ├── api.ts           # Configuración de Axios
    ├── propertyService.ts
    ├── reservationService.ts
    └── financialService.ts
```

### 2. Capa de API (Backend)
**Responsabilidad:** Lógica de negocio y gestión de datos

#### Módulo: Auth
```
controllers/
  - auth.controller.ts
    - POST /auth/login
    - POST /auth/register
    - POST /auth/refresh-token

services/
  - auth.service.ts
    - validateCredentials()
    - generateTokens()
    - refreshToken()

guards/
  - jwt.guard.ts
  - roles.guard.ts
```

#### Módulo: Users
```
controllers/
  - users.controller.ts
    - GET /users
    - GET /users/:id
    - POST /users (admin)
    - PUT /users/:id
    - DELETE /users/:id

services/
  - users.service.ts
    - findAll()
    - findById()
    - create()
    - update()
    - delete()

entities/
  - user.entity.ts
    - id: UUID
    - email: string
    - password: string (hashed)
    - role: enum (admin, owner)
    - fullName: string
```

#### Módulo: Properties
```
controllers/
  - properties.controller.ts
    - GET /properties
    - GET /properties/:id
    - POST /properties
    - PUT /properties/:id
    - DELETE /properties/:id

services/
  - properties.service.ts
    - findAll()
    - findById()
    - create()
    - update()
    - delete()
    - getByOwner()

entities/
  - property.entity.ts
    - id: UUID
    - name: string
    - address: string
    - owner_id: UUID (FK)
    - bedrooms: number
    - bathrooms: number
    - capacity: number
    - amenities: string[]
    - photos: string[]
    - createdAt: timestamp
```

#### Módulo: Reservations
```
controllers/
  - reservations.controller.ts
    - GET /reservations
    - GET /reservations/:id
    - POST /reservations
    - PUT /reservations/:id
    - DELETE /reservations/:id (cancel)
    - GET /reservations/property/:propertyId

services/
  - reservations.service.ts
    - findAll()
    - findById()
    - create()
    - update()
    - cancel()
    - getAvailability()
    - checkConflicts()

entities/
  - reservation.entity.ts
    - id: UUID
    - property_id: UUID (FK)
    - guest_name: string
    - guest_email: string
    - check_in: date
    - check_out: date
    - num_guests: number
    - total_price: decimal
    - status: enum (pending, confirmed, completed, cancelled)
    - notes: string
    - createdAt: timestamp
```

#### Módulo: Expenses
```
controllers/
  - expenses.controller.ts
    - GET /expenses
    - GET /expenses/property/:propertyId
    - POST /expenses
    - PUT /expenses/:id
    - DELETE /expenses/:id
    - GET /expenses/category/:category

services/
  - expenses.service.ts
    - findAll()
    - findById()
    - create()
    - update()
    - delete()
    - getByProperty()
    - getByCategory()
    - getByDateRange()

entities/
  - expense.entity.ts
    - id: UUID
    - property_id: UUID (FK)
    - description: string
    - amount: decimal
    - category: enum (maintenance, utilities, cleaning, insurance, etc.)
    - date: date
    - receipt_url: string
    - notes: string
    - createdAt: timestamp

  - expense-category.entity.ts
    - id: UUID
    - name: string
    - description: string
```

#### Módulo: Financials
```
controllers/
  - financials.controller.ts
    - GET /financials/summary
    - GET /financials/property/:propertyId
    - GET /financials/report/:period
    - GET /financials/owner-statement/:ownerId
    - POST /financials/calculate

services/
  - financials.service.ts
    - calculatePropertyROI()
    - generateOwnerStatement()
    - calculateCommission()
    - generateReport()
    - reconcileAccounts()

entities/
  - financial-report.entity.ts
    - id: UUID
    - property_id: UUID (FK)
    - period: string (2025-01)
    - gross_income: decimal
    - total_expenses: decimal
    - commission_amount: decimal
    - net_profit: decimal
    - generated_at: timestamp

  - owner-statement.entity.ts
    - id: UUID
    - owner_id: UUID (FK)
    - period: string
    - total_income: decimal
    - total_expenses: decimal
    - net_gain: decimal
    - admin_commission: decimal
    - final_payment: decimal
    - generated_at: timestamp
```

### 3. Capa de Datos (Database)
**Responsabilidad:** Persistencia y consistencia de datos

#### Esquema ER Principal

```sql
users
├── id (PK)
├── email (UNIQUE)
├── password (ENCRYPTED)
├── fullName
├── role (admin, owner)
├── bankAccount
├── taxId
└── timestamps

properties
├── id (PK)
├── owner_id (FK → users)
├── name
├── address
├── bedrooms
├── bathrooms
├── capacity
├── amenities (JSON)
├── photos (JSON)
└── timestamps

reservations
├── id (PK)
├── property_id (FK → properties)
├── guest_name
├── guest_email
├── check_in
├── check_out
├── num_guests
├── total_price
├── status
└── timestamps

expenses
├── id (PK)
├── property_id (FK → properties)
├── category_id (FK → expense_categories)
├── description
├── amount
├── date
├── receipt_url
└── timestamps

financial_reports
├── id (PK)
├── property_id (FK → properties)
├── period
├── gross_income
├── total_expenses
├── commission_amount
└── timestamps

owner_statements
├── id (PK)
├── owner_id (FK → users)
├── period
├── total_income
├── total_expenses
├── net_gain
└── timestamps
```

## Flujos de Datos

### Flujo 1: Crear Reserva

```
Usuario (Frontend)
    │
    ├─→ Selecciona propiedad y fechas
    │
    ├─→ Envía POST /api/reservations
    │
    └─→ Backend: ReservationsController
            │
            ├─→ Validación de DTOs
            │
            ├─→ ReservationsService.create()
            │   ├─→ Verificar disponibilidad
            │   ├─→ Calcular precio
            │   └─→ Guardar en BD
            │
            └─→ Respuesta JSON
                    │
                    └─→ Frontend: mostrar confirmación
```

### Flujo 2: Calcular Rentabilidad

```
Admin (Frontend)
    │
    ├─→ Navega a Reportes Financieros
    │
    ├─→ Selecciona período
    │
    ├─→ GET /api/financials/report/2025-01
    │
    └─→ Backend: FinancialsController
            │
            ├─→ FinancialsService.generateReport()
            │   ├─→ Obtener todas las propiedades
            │   │
            │   ├─→ Para cada propiedad:
            │   │   ├─→ Sumar ingresos de reservas
            │   │   ├─→ Sumar gastos asignados
            │   │   ├─→ Calcular comisión admin
            │   │   └─→ Calcular ganancia neta
            │   │
            │   ├─→ Generar estado por propietario
            │   │   ├─→ Sumar ingresos totales
            │   │   ├─→ Restar gastos
            │   │   ├─→ Restar comisión
            │   │   └─→ Guardar statement
            │   │
            │   └─→ Retornar datos
            │
            └─→ Frontend: mostrar gráficos
```

## Patrones de Diseño

### 1. MVC (Model-View-Controller)
- **Model:** Entities de TypeORM
- **View:** Componentes React
- **Controller:** Controllers de NestJS

### 2. Service Layer
Cada módulo tiene un servicio que contiene la lógica de negocio:
```typescript
@Injectable()
export class PropertiesService {
  constructor(private repo: Repository<Property>) {}
  
  findAll() { /* lógica */ }
  create(dto) { /* lógica */ }
  // ...
}
```

### 3. DTO (Data Transfer Objects)
Validación y transformación de datos:
```typescript
export class CreatePropertyDto {
  @IsString() name: string;
  @IsNumber() bedrooms: number;
  // ...
}
```

### 4. Guards (Autenticación y Autorización)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
create(@Body() dto: CreatePropertyDto) { }
```

## Consideraciones de Escalabilidad

### Performance
1. **Índices en BD:** En campos frecuentemente consultados
2. **Caché:** Redis para dashboards
3. **Pagination:** Resultados en sets pequeños
4. **Lazy loading:** Cargar datos bajo demanda

### Seguridad
1. **Encriptación:** Contraseñas con bcryptjs
2. **Validación:** DTOs + class-validator
3. **Rate limiting:** Proteger endpoints públicos
4. **CORS:** Configurado apropiadamente
5. **Auditoría:** Log de cambios financieros

### Mantenibilidad
1. **Separación de responsabilidades:** Cada clase hace una cosa
2. **Testing:** Tests unitarios y de integración
3. **Documentación:** Swagger + comentarios de código
4. **Versionado:** API versioning en futuro

## Despliegue

### Desarrollo
```bash
npm run dev          # Ambas aplicaciones
```

### Producción
```bash
# Backend
npm run build
npm start:prod

# Frontend
npm run build
# Servir /dist con Nginx o similar
```

### Docker (Futuro)
```dockerfile
# Backend Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

---

**Última actualización:** Octubre 2025
