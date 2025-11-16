# 🔌 Flujo de Electricidad - Sistema Basado en Gastos Mensuales

Este documento describe el flujo completo de gestión de electricidad en el sistema, desde el cobro a los huéspedes hasta el registro del costo real pagado mensualmente por el propietario.

## 📋 Visión General

El sistema permite:
1. **Registrar lecturas** de contador al check-in y check-out de cada huésped
2. **Calcular y cobrar** el consumo individual a cada huésped
3. **Crear gasto mensual** de electricidad con resumen automático
4. **Comparar automáticamente** total cobrado vs. factura real del mes
5. **Generar reportes** de diferencias (ganancia o pérdida mensual)

## 🏗️ Arquitectura Nueva (Sistema Basado en Gastos)

### ¿Por qué este cambio?
**Realidad:** El propietario recibe UNA factura de electricidad al mes, no una por cada huésped.

**Solución:** 
- Se cobra a cada huésped individualmente (permanece igual)
- Se crea UN gasto mensual de "Electricidad" que agrupa todas las reservas del período
- El sistema calcula automáticamente: `Diferencia = Total Cobrado - Factura Real`

---

## 🔄 Flujo Paso a Paso

### 1️⃣ Completar Reserva con Electricidad

**Acción:** Admin/Usuario navega a la reserva y presiona **"Completar Reserva"**

**Formulario incluye:**
- ✅ Lectura inicial del medidor (ejemplo: 1000 kWh)
- ✅ Lectura final del medidor (ejemplo: 1150 kWh)
- ✅ Tarifa de electricidad (ejemplo: $0.15/kWh)
- ✅ Método de pago: cash, deposit, invoice, waived
- ✅ Notas opcionales

**Cálculo Automático:**
```
Consumo = LecturaFinal - LecturaInicial
        = 1150 - 1000
        = 150 kWh

Cargo = Consumo × Tarifa
      = 150 × 0.15
      = $22.50
```

**Backend:** POST `/api/reservations/:id/complete`

**Resultado:** 
- Reserva completada con electricidad cobrada al huésped
- Datos guardados en `reservations` table
- ⚠️ El costo real NO se registra aquí (ver paso 2)

---

### 2️⃣ Crear Gasto Mensual de Electricidad

**Cuándo:** Cuando el propietario recibe y paga la factura eléctrica mensual

**Acción:** Admin navega a **Gastos** → selecciona propiedad → presiona **"⚡ Electricidad"**

**El sistema automáticamente:**
1. Detecta el período actual (YYYY-MM)
2. Busca todas las reservas completadas con electricidad en ese mes
3. Calcula: `Total Cobrado = Σ electricityCharge de todas las reservas`
4. Muestra resumen con desglose de cada reserva

**Formulario incluye:**
- 📊 **Resumen automático:** Total cobrado, consumo total, # reservas
- 📋 **Detalle expandible:** Lista de reservas con su electricidad
- ✅ **Monto pagado** (factura real del propietario)
- ✅ Fecha de pago
- ✅ Descripción y notas

**Backend:** 
- GET `/api/expenses/electricity-summary/:propertyId/:period` (muestra resumen)
- POST `/api/expenses` (crea el gasto)

**Cálculo Automático:**
```
Total Cobrado:  $450.75  (suma de 12 reservas)
Factura Real:   $380.25  (monto ingresado)
Diferencia:     $70.50   → ✅ Ganancia neta del mes
```

Si `Diferencia < 0`, significa que el propietario debe contribuir la diferencia.

**Resultado:** 
- Gasto creado en tabla `expenses` con campos de electricidad:
  - `electricityPeriod`: "2025-11"
  - `electricityTotalCharged`: 450.75
  - `electricityDifference`: 70.50
  - `electricityReservationsCount`: 12

---

### 3️⃣ Ver Reporte de Electricidad (Por Implementar)

**Acción:** Admin navega a **Reportes Financieros** → sección **Electricidad**

**Backend:** GET `/api/financials/electricity-report?period=YYYY-MM&propertyId=X`

**El reporte mostrará:**
- Total cobrado a huéspedes en el período
- Total pagado en facturas (suma de gastos de electricidad)
- Diferencia neta
- Desglose por propiedad
- Tendencias mensuales

---

## 🗄️ Campos en Base de Datos

### **Tabla: `reservations`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `electricityConsumed` | decimal(10,2) | kWh consumidos (calculado) |
| `electricityCharge` | decimal(10,2) | Monto cobrado al huésped en USD |
| `electricityRate` | decimal(6,4) | Tarifa aplicada por kWh |
| `meterReadingStart` | integer | Lectura inicial del medidor |
| `meterReadingEnd` | integer | Lectura final del medidor |
| `electricityPaymentMethod` | varchar(50) | cash, deposit, invoice, waived |
| `electricityNotes` | text | Notas sobre el cobro |

### **Tabla: `expenses`** (Nuevos Campos)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `electricityPeriod` | varchar(7) | Período YYYY-MM |
| `electricityTotalCharged` | decimal(10,2) | Total cobrado ese mes a huéspedes |
| `electricityDifference` | decimal(10,2) | Diferencia (cobrado - pagado) |
| `electricityReservationsCount` | integer | Número de reservas en ese período |

---

## 🔧 API Endpoints

### **1. Completar reserva con electricidad**
```http
POST /api/reservations/:id/complete
Authorization: Bearer <token>

Body:
{
  "meterReadingStart": 1000,
  "meterReadingEnd": 1150,
  "electricityRate": 0.15,
  "electricityPaymentMethod": "cash",
  "electricityNotes": "Consumo normal"
}

Response:
{
  "id": "uuid",
  "electricityConsumed": 150,
  "electricityCharge": 22.50,
  "status": "completed"
}
```

### **2. Obtener resumen de electricidad del mes**
```http
GET /api/expenses/electricity-summary/:propertyId/:period
Authorization: Bearer <token>

Example:
GET /api/expenses/electricity-summary/uuid-propiedad/2025-11

Response:
{
  "propertyId": "uuid",
  "propertyName": "Apartamento Centro",
  "period": "2025-11",
  "totalCharged": 450.75,
  "totalConsumed": 3005,
  "reservationsCount": 12,
  "reservations": [
    {
      "id": "uuid",
      "guestName": "Juan Pérez",
      "checkIn": "2025-11-01",
      "checkOut": "2025-11-05",
      "electricityConsumed": 150,
      "electricityRate": 0.15,
      "electricityCharge": 22.50
    }
  ]
}
```

### **3. Crear gasto de electricidad**
```http
POST /api/expenses
Authorization: Bearer <token>

Body:
{
  "propertyId": "uuid",
  "description": "Pago factura electricidad",
  "amount": 380.25,
  "category": "utilities",
  "date": "2025-11-15",
  "notes": "Factura completa del mes",
  "electricityPeriod": "2025-11",
  "electricityTotalCharged": 450.75,
  "electricityDifference": 70.50,
  "electricityReservationsCount": 12
}

Response:
{
  "id": "uuid",
  "amount": 380.25,
  "electricityDifference": 70.50,
  "message": "Expense created successfully"
}
```

---

## 📊 Ejemplo de Flujo Completo

### Escenario: Noviembre 2025

**Reservas completadas:**
1. Juan Pérez (Nov 1-5): 150 kWh → $22.50
2. María García (Nov 6-10): 200 kWh → $30.00
3. Pedro López (Nov 11-15): 180 kWh → $27.00
4. Ana Martínez (Nov 16-20): 250 kWh → $37.50
5. ... (8 reservas más)

**Total cobrado a huéspedes:** $450.75

**El propietario recibe factura:** $380.25

**Admin crea gasto:**
1. Va a Gastos → Selecciona propiedad → "⚡ Electricidad"
2. Sistema muestra resumen: "$450.75 cobrados en 12 reservas"
3. Admin ingresa: Monto pagado = $380.25
4. Sistema calcula: Diferencia = $70.50 (ganancia)
5. Admin guarda

**Resultado:**
- Gasto registrado en la BD
- Propietario ve que hubo ganancia de $70.50 ese mes
- En reportes financieros aparece la diferencia

---

## ✅ Ventajas del Nuevo Sistema

1. **Realista:** Refleja cómo funciona en la vida real (una factura/mes)
2. **Simple:** Un solo registro mensual vs. muchos registros por reserva
3. **Claro:** Comparación directa de ingresos vs. gastos
4. **Escalable:** Funciona con cualquier cantidad de reservas
5. **Auditable:** Rastro claro de diferencias mes a mes

---

## 🚀 Estado Actual

- ✅ Backend: Campos en `expenses` agregados
- ✅ Backend: Endpoint GET `/expenses/electricity-summary`
- ✅ Backend: Migración creada
- ✅ Frontend: Modal `CreateElectricityExpenseModal`
- ✅ Frontend: Integración en `ExpensesPanel`
- ✅ Frontend: Limpieza de UI obsoleta en `ReservationsPanel`
- ⏳ Pendiente: Reporte financiero de electricidad
- ⏳ Pendiente: Testing completo del flujo

---

**Última actualización:** 16 de Noviembre, 2025
**Autor:** Rafael Llibre
