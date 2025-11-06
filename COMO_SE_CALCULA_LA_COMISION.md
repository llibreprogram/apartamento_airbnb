# 📊 ¿Cómo se Calcula la Comisión?

## 📋 Resumen Rápido

```
┌─────────────────────────────────┐
│      COMISIÓN = 10% x INGRESOS  │
└─────────────────────────────────┘
```

**Ejemplo:**
- Ingresos del mes: $1,000
- Comisión (10%): $100
- Ganancia neta final: $900 (después de gastos y comisión)

---

## 🔢 Fórmula Completa

```
GANANCIA NETA = INGRESOS BRUTOS - GASTOS - COMISIÓN

Donde:
  COMISIÓN = INGRESOS BRUTOS × 10%
```

---

## 📊 Ejemplo Detallado

### Escenario: Propiedad "Apartamento Centro" en Noviembre 2025

**Paso 1: Calcular Ingresos Brutos**
```
Reservas confirmadas y completadas en Noviembre:
  - Reserva 1: $500 (Check-in 5 Nov, Check-out 10 Nov) ✅ 
  - Reserva 2: $750 (Check-in 12 Nov, Check-out 20 Nov) ✅
  - Reserva 3: $400 (Check-in 22 Nov, Check-out 28 Nov) ✅
  ──────────────────────────────────────────────────
  INGRESOS BRUTOS = $1,650
```

**Paso 2: Calcular Gastos Totales**
```
Gastos en Noviembre:
  - Servicios (agua, luz): $150
  - Mantenimiento: $80
  - Limpieza: $120
  ──────────────────────────────────────────────────
  GASTOS TOTALES = $350
```

**Paso 3: Calcular Comisión (10%)**
```
COMISIÓN = $1,650 × 10%
COMISIÓN = $1,650 × 0.1
COMISIÓN = $165.00
```

**Paso 4: Calcular Ganancia Neta**
```
GANANCIA NETA = INGRESOS - GASTOS - COMISIÓN
GANANCIA NETA = $1,650 - $350 - $165
GANANCIA NETA = $1,135.00
```

---

## 💻 Código Backend (NestJS)

### Ubicación del Código
**Archivo:** `backend/src/modules/financials/financials.service.ts`
**Líneas:** 66-68

```typescript
// 3. Calcular comisión (10% del ingreso bruto)
const commissionRate = 0.1; // 10%
const commissionAmount = parseFloat((grossIncome * commissionRate).toFixed(2));

// 4. Calcular ganancias netas
const netProfit = parseFloat((grossIncome - totalExpenses - commissionAmount).toFixed(2));
```

### Pasos en el Código

**1. Obtener Ingresos Brutos (Líneas 38-50)**
```typescript
// Sumar todas las reservas confirmadas y completadas en el período
const reservationsResult = await this.reservationsRepository
  .createQueryBuilder('reservation')
  .select('COALESCE(SUM(reservation.totalPrice), 0)', 'total')
  .where('reservation.propertyId = :propertyId', { propertyId })
  .andWhere('reservation.status IN (:...statuses)', {
    statuses: ['confirmed', 'completed'],  // ← Solo estas cuentan
  })
  .andWhere('reservation.checkIn >= :startDate', { startDate })
  .andWhere('reservation.checkOut <= :endDate', { endDate })
  .getRawOne();

const grossIncome = parseFloat(reservationsResult?.total || 0);
```

**2. Obtener Gastos Totales (Líneas 52-60)**
```typescript
// Sumar todos los gastos registrados en el período
const expensesResult = await this.expensesRepository
  .createQueryBuilder('expense')
  .select('COALESCE(SUM(expense.amount), 0)', 'total')
  .where('expense.propertyId = :propertyId', { propertyId })
  .andWhere('expense.date >= :startDate', { startDate })
  .andWhere('expense.date <= :endDate', { endDate })
  .getRawOne();

const totalExpenses = parseFloat(expensesResult?.total || 0);
```

**3. Calcular Comisión 10% (Línea 66-68)**
```typescript
const commissionRate = 0.1; // 10% = 0.1
const commissionAmount = parseFloat((grossIncome * commissionRate).toFixed(2));
// .toFixed(2) = redondea a 2 decimales
// parseFloat() = convierte a número
```

**4. Calcular Ganancia Neta (Línea 71)**
```typescript
const netProfit = parseFloat((grossIncome - totalExpenses - commissionAmount).toFixed(2));
```

---

## 📈 Estructura de Datos

### Entidad Financial
```typescript
@Entity('financial_reports')
export class Financial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyId: string;

  @Column()
  period: string; // YYYY-MM

  @Column('decimal', { precision: 10, scale: 2 })
  grossIncome: number; // Ingresos totales

  @Column('decimal', { precision: 10, scale: 2 })
  totalExpenses: number; // Gastos totales

  @Column('decimal', { precision: 10, scale: 2 })
  commissionAmount: number; // Admin commission (10% of gross income) ← 10%

  @Column('decimal', { precision: 10, scale: 2 })
  netProfit: number; // Gross Income - Total Expenses - Commission

  @Column('decimal', { precision: 10, scale: 2 })
  roi: number; // Return on Investment
}
```

---

## 🖥️ Vista en Frontend

### Cálculo de Comisión Mostrado (React)
**Archivo:** `frontend/src/components/financials/FinancialsPanel.tsx`

```tsx
// Mostrar comisión
<p className="text-sm text-gray-600 mb-1">Comisión</p>
<p className="text-lg font-bold text-red-600">
  ${formatCurrency(report?.commissionAmount || 0)}
</p>

// Mostrar porcentaje de comisión
<p className="text-sm text-gray-600 mb-2">Comisión Admin</p>
<p className="text-lg font-bold">
  {report.commissionAmount && report.grossIncome
    ? formatCurrency((report.commissionAmount / report.grossIncome) * 100, 1)
    : formatCurrency(0, 1)}
  %
</p>
```

---

## 🧮 Cálculos Derivados

### % de Comisión sobre Ingresos
```
% COMISIÓN = (COMISIÓN / INGRESOS) × 100

Ejemplo:
  Comisión: $165
  Ingresos: $1,650
  % = ($165 / $1,650) × 100
  % = 0.1 × 100
  % = 10%
```

### Margen de Ganancia
```
MARGEN = (GANANCIA NETA / INGRESOS) × 100

Ejemplo:
  Ganancia Neta: $1,135
  Ingresos: $1,650
  Margen = ($1,135 / $1,650) × 100
  Margen = 68.8%
```

### ROI (Retorno sobre Inversión)
```
ROI = (GANANCIA NETA / INVERSIÓN INICIAL) × 100

Ejemplo (asumiendo depósito de seguridad de $5,000):
  Ganancia Neta: $1,135
  Inversión: $5,000
  ROI = ($1,135 / $5,000) × 100
  ROI = 22.7%
```

---

## 🔄 Período de Cálculo

### Formato
```
Período: YYYY-MM (Año-Mes)

Ejemplos:
  - 2025-11 = Noviembre 2025
  - 2025-12 = Diciembre 2025
  - 2026-01 = Enero 2026
```

### Rangos de Fechas
```
Para período 2025-11 (Noviembre):

  Start Date: 2025-11-01 (1 de Noviembre)
  End Date:   2025-11-30 (30 de Noviembre)

Se incluyen:
  ✅ Reservas con check-in >= 2025-11-01
  ✅ Reservas con check-out <= 2025-11-30
  ✅ Gastos registrados entre estas fechas
```

---

## 📋 Filtros Importantes

### Estados de Reserva que Cuentan
Solo se incluyen en el cálculo:
- ✅ `confirmed` - Reserva confirmada
- ✅ `completed` - Reserva completada

**NO se incluyen:**
- ❌ `pending` - Pendiente de confirmación
- ❌ `cancelled` - Cancelada

### Gastos Incluidos
Se incluyen TODOS los gastos registrados:
- 💰 Servicios (agua, luz, internet)
- 🔧 Mantenimiento y reparaciones
- 🧹 Limpieza y sanitización
- 🏠 Seguros
- 📞 Otros gastos operativos

---

## 💡 Ejemplo de Cálculo Automático

### Cuando se Calcula
La comisión se calcula automáticamente cuando:

1. **El admin presiona el botón "Calculate"** en el dashboard de Financials
2. **Se crea/actualiza un reporte financiero** para una propiedad y período
3. **API llama a `POST /api/financials/calculate`**

### Respuesta API
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "propertyId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "period": "2025-11",
  "grossIncome": 1650.00,
  "totalExpenses": 350.00,
  "commissionAmount": 165.00,
  "netProfit": 1135.00,
  "roi": 22.70,
  "numberOfReservations": 3,
  "averageReservationValue": 550.00,
  "createdAt": "2025-11-05T14:30:00Z"
}
```

---

## 🔐 Precisión y Redondeo

### Redondeo a 2 Decimales
```typescript
// Usar .toFixed(2) para precisión monetaria
const amount = parseFloat((number * 0.1).toFixed(2));

Ejemplo:
  1650 × 0.1 = 165.0
  parseFloat("165.00".toFixed(2)) = 165.00

Otro ejemplo con decimales:
  1650.67 × 0.1 = 165.067
  parseFloat((165.067).toFixed(2)) = 165.07  // Redondeado
```

---

## 📱 Visualización en UI

### Dashboard Financiero
```
┌─────────────────────────────────────────┐
│     REPORTE FINANCIERO - NOV 2025       │
├─────────────────────────────────────────┤
│                                         │
│  Propiedad: Apartamento Centro         │
│  Período: Noviembre 2025                │
│                                         │
│  💰 Ingresos Brutos      $1,650.00      │
│  📉 Gastos Totales       $350.00        │
│  🔴 Comisión Admin       $165.00 (10%)  │
│  ✅ Ganancia Neta        $1,135.00      │
│  📈 ROI                  22.7%          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎓 Resumen Educativo

**¿Por qué 10%?**
- Es el porcentaje estándar para comisiones administrativas
- Se configura en el código: `const commissionRate = 0.1`
- Puede modificarse si es necesario (ej: cambiar a 15%: `0.15`)

**¿Cuándo se descuenta?**
- DESPUÉS de calcular ingresos y gastos
- ANTES de mostrar ganancia neta final

**¿Quién lo recibe?**
- El administrador/plataforma
- Como compensación por gestión

**¿Es configurable?**
- Actualmente: SÍ, en el código backend
- En el futuro: Podría ser configurable desde UI

---

## 🔧 Para Modificar la Comisión

Si necesitas cambiar el porcentaje de comisión:

**1. Localiza el archivo:**
```
backend/src/modules/financials/financials.service.ts
```

**2. Encuentra la línea:**
```typescript
const commissionRate = 0.1; // 10%
```

**3. Cambia el valor:**
```typescript
const commissionRate = 0.15; // Ahora es 15%
const commissionRate = 0.05; // Ahora es 5%
```

**4. Recompila y reinicia:**
```bash
cd backend
npm run start:dev
```

---

## 📞 Preguntas Frecuentes

**P: ¿Se calcula una sola vez?**
A: Se recalcula cada vez que presionas "Calculate". Si el reporte ya existe, se actualiza.

**P: ¿Qué pasa si no hay ingresos?**
A: Comisión = 0 (no se descuenta nada)

**P: ¿Incluye comisiones de Airbnb?**
A: No, son dos sistemas separados. Airbnb tiene su propia comisión.

**P: ¿Se puede excluir una reserva?**
A: Solo se incluyen "confirmed" y "completed". Las "pending" o "cancelled" no cuentan.

**P: ¿Se puede cambiar el 10%?**
A: Sí, modificando el código backend (ver sección "Para Modificar la Comisión")

---

**Última actualización:** 5 de Noviembre, 2025

**Responsabilidad:** Sistema automático en backend

**Precisión:** Hasta 2 decimales (centavos)
