# 📅 Sistema de Precios Dinámicos (Seasonal Pricing)

## Descripción

Se ha implementado un sistema completo de **precios dinámicos por período** que permite definir precios especiales para fechas específicas. Ideal para capturar demanda estacional, fines de semana, eventos especiales, etc.

## Características Principales

✅ **Precios por período:** Define precios especiales para rangos de fechas  
✅ **Tipos de precio:** Estacional, fin de semana, festivo, personalizado  
✅ **Validación de conflictos:** Detecta solapamientos de precios  
✅ **Retrocompatibilidad:** Las propiedades sin precios especiales usan el precio base  
✅ **API completa:** CRUD + búsqueda inteligente  

## Estructura de Datos

### Entity: SeasonalPrice

```typescript
@Entity('seasonal_prices')
export class SeasonalPrice {
  id: UUID                           // Identificador único
  propertyId: UUID (FK)              // Referencia a propiedad
  name: string                       // Ej: "Verano 2025", "Navidad"
  description: string (opcional)     // Descripción
  pricePerNight: decimal(10,2)       // Precio especial
  startDate: date (YYYY-MM-DD)       // Inicio del período
  endDate: date (YYYY-MM-DD)         // Fin del período
  type: enum                         // SEASONAL | WEEKEND | HOLIDAY | CUSTOM
  isActive: boolean (default: true)  // Activar/desactivar sin borrar
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Tipos de Precio

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **SEASONAL** | Precios de temporada | Verano, invierno |
| **WEEKEND** | Fin de semana especial | Incremento viernes-domingo |
| **HOLIDAY** | Festivos/vacaciones | Navidad, Año Nuevo |
| **CUSTOM** | Personalizado | Evento específico |

## API Endpoints

### Crear Precio Especial
```http
POST /api/seasonal-prices/property/:propertyId
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Verano 2025",
  "description": "Precios de temporada alta",
  "pricePerNight": 200,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "type": "seasonal",
  "isActive": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "name": "Verano 2025",
  "pricePerNight": 200,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "type": "seasonal",
  "isActive": true,
  "createdAt": "2025-11-05T...",
  "updatedAt": "2025-11-05T..."
}
```

### Obtener Precios de una Propiedad
```http
GET /api/seasonal-prices/property/:propertyId
Authorization: Bearer <token>
```

### Obtener Precios Activos
```http
GET /api/seasonal-prices/property/:propertyId/active
Authorization: Bearer <token>
```

### Obtener Precio Específico
```http
GET /api/seasonal-prices/:id
Authorization: Bearer <token>
```

### Actualizar Precio Especial
```http
PUT /api/seasonal-prices/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "pricePerNight": 220,
  "endDate": "2025-09-15"
}
```

### Eliminar Precio Especial
```http
DELETE /api/seasonal-prices/:id
Authorization: Bearer <token>
```

### Obtener Precio para una Fecha
```http
GET /api/seasonal-prices/property/:propertyId/price-for-date?date=2025-07-15
Authorization: Bearer <token>
```

**Response:**
```json
{
  "price": 200
}
```

### Detectar Conflictos
```http
POST /api/seasonal-prices/property/:propertyId/check-conflicts
Content-Type: application/json
Authorization: Bearer <token>

{
  "startDate": "2025-07-01",
  "endDate": "2025-07-31"
}
```

**Response:**
```json
{
  "hasConflicts": false,
  "conflicts": []
}
```

## Ejemplos de Uso

### Ejemplo 1: Crear Precio de Verano

```bash
curl -X POST http://localhost:3001/api/seasonal-prices/property/abc-123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Verano 2025",
    "description": "Temporada alta - junio a agosto",
    "pricePerNight": 200,
    "startDate": "2025-06-01",
    "endDate": "2025-08-31",
    "type": "seasonal"
  }'
```

### Ejemplo 2: Precio de Navidad

```json
{
  "name": "Navidad 2025",
  "description": "Período festivo",
  "pricePerNight": 250,
  "startDate": "2025-12-20",
  "endDate": "2026-01-02",
  "type": "holiday",
  "isActive": true
}
```

### Ejemplo 3: Fin de Semana Premium

```json
{
  "name": "Fin de semana + 25%",
  "pricePerNight": 180,
  "startDate": "2025-11-07",
  "endDate": "2025-11-09",
  "type": "weekend"
}
```

## Lógica de Precios en Reservas

### Búsqueda de Precio para Fecha

```typescript
// En SeasonalPricingService
async getPriceForDate(propertyId: string, date: string): Promise<number | null> {
  // Busca un precio activo que contenga la fecha
  // Retorna el pricePerNight si encuentra, null si no
  
  // Si multiple precios se superponen, usa el más reciente
}
```

### Cálculo de Precio Promedio para Rango

```typescript
// En SeasonalPricingService
async getAveragePriceForDateRange(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<number>

// Itera cada día del rango y busca precios especiales
// Retorna el promedio de precios para el período
```

## Validaciones

### Fechas

```typescript
// startDate debe ser menor que endDate
if (new Date(startDate) >= new Date(endDate)) {
  throw new BadRequestException('startDate must be before endDate');
}
```

### Conflictos

```typescript
// Detecta períodos que se superponen
const conflicts = await detectConflicts(
  propertyId,
  startDate,
  endDate,
  excludeId // para editar sin compararse a sí mismo
);

if (conflicts.length > 0) {
  // Hay conflictos: mostrar advertencia al usuario
}
```

## Base de Datos

### Migración SQL

```sql
CREATE TABLE seasonal_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propertyId UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pricePerNight DECIMAL(10,2) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  type seasonal_prices_type_enum NOT NULL DEFAULT 'custom',
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices para queries frecuentes
  INDEX idx_propertyId (propertyId),
  INDEX idx_propertyId_startEnd (propertyId, startDate, endDate),
  INDEX idx_propertyId_active (propertyId, isActive)
);

-- Enum type
CREATE TYPE seasonal_prices_type_enum AS ENUM (
  'seasonal',
  'weekend',
  'holiday',
  'custom'
);
```

### Índices

```
1. propertyId (FK lookup)
2. (propertyId, startDate, endDate) - búsqueda por período
3. (propertyId, isActive) - filtrar activos
```

## Integración con Reservas

### En Reservations Service

Cuando se crea una reserva, se debe:

```typescript
// 1. Obtener precio para cada día de la reserva
const startDate = new Date(checkIn);
const endDate = new Date(checkOut);
let totalPrice = 0;
let daysCount = 0;

for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
  const dateStr = d.toISOString().split('T')[0];
  
  // Buscar precio especial para esta fecha
  const specialPrice = await seasonalPricingService.getPriceForDate(
    propertyId,
    dateStr
  );
  
  // Usar precio especial o precio base
  const priceForDay = specialPrice || property.pricePerNight;
  totalPrice += priceForDay;
  daysCount++;
}

// 2. Guardar en reserva
reservation.totalPrice = totalPrice;
reservation.averagePricePerNight = totalPrice / daysCount;
```

## Casos de Uso

### 1️⃣ Temporada Alta/Baja
```
Verano: $200/noche
Invierno: $120/noche
```

### 2️⃣ Fin de Semana Premium
```
Entre semana: $100/noche
Fin de semana: $150/noche
```

### 3️⃣ Festivos
```
Navidad (20-dic a 2-ene): $250/noche
Año Nuevo: $280/noche
```

### 4️⃣ Eventos Especiales
```
Festival de música (15-16 ago): $300/noche
Feria local (1-7 sep): $220/noche
```

## Ventajas

✅ **Maximizar ingresos:** Precios dinámicos según demanda  
✅ **Flexible:** Crear múltiples precios sin límite  
✅ **Historial:** Mantener registro de todos los precios  
✅ **Control:** Activar/desactivar sin borrar datos  
✅ **Reportes:** Fácil calcular ingresos por período  
✅ **Compatible:** Funciona con el sistema de comisiones por propiedad  

## Limitaciones Actuales

⚠️ No hay automatización de fin de semanas (TODO)  
⚠️ No hay integración con calendario Airbnb (TODO - Fase 2)  
⚠️ No hay predicción automática de precios (TODO - Fase 3)  

## Roadmap

### Fase 1 (MVP - Ahora)
- ✅ CRUD de precios especiales
- ✅ Validación de conflictos
- ✅ Búsqueda de precio por fecha
- ✅ Cálculo de promedio

### Fase 2 (Próximo)
- ⬜ Automatización de fin de semanas
- ⬜ Template de precios (reutilizar patrones)
- ⬜ Integración con Airbnb

### Fase 3 (Futuro)
- ⬜ ML para predicción de demanda
- ⬜ Recomendaciones automáticas de precio
- ⬜ A/B testing de precios

## Testing

```typescript
// Crear precio especial
it('should create seasonal price', async () => {
  const dto: CreateSeasonalPriceDto = {
    name: 'Test',
    pricePerNight: 200,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    type: 'seasonal',
  };
  
  const result = await service.create(propertyId, dto);
  expect(result.pricePerNight).toBe(200);
});

// Detectar conflictos
it('should detect overlapping prices', async () => {
  // Crear precio 1: 01-06 to 31-08
  // Crear precio 2: 15-06 to 30-09
  
  const conflicts = await service.detectConflicts(
    propertyId,
    '2025-06-15',
    '2025-09-30'
  );
  
  expect(conflicts.length).toBe(1);
});
```

## Commit

```
feat(properties): implement seasonal/dynamic pricing system

- Add SeasonalPrice entity with SEASONAL, WEEKEND, HOLIDAY, CUSTOM types
- Implement SeasonalPricingService with full CRUD operations
- Add methods for price lookup by date and date range
- Add conflict detection for overlapping price periods
- Create SeasonalPricingController with REST endpoints
- Integrate SeasonalPrice into PropertiesModule
- Support for per-property seasonal pricing with backward compatibility
- Database auto-migration: CREATE TABLE seasonal_prices with proper indices
```

---

**Última actualización:** 5 de Noviembre, 2025  
**Status:** ✅ Backend implementado y compilado
