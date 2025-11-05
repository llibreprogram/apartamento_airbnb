# Backend - API NestJS

## Estructura de Carpetas

```
src/
├── modules/
│   ├── auth/              # Autenticación y JWT
│   ├── users/             # Usuarios y roles
│   ├── properties/        # Propiedades/apartamentos
│   ├── reservations/      # Reservas
│   ├── expenses/          # Gastos e inversiones
│   └── financials/        # Reportes y cálculos financieros
├── common/                # Guards, decoradores, excepciones
├── database/              # Migrations y seeds
└── main.ts
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run start:dev
```

## Swagger
Documentación interactiva en `http://localhost:3001/api/docs`
