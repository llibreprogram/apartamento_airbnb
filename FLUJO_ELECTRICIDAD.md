# 💡 Flujo de Gestión de Electricidad

## 📋 Resumen

Sistema completo para gestionar el cobro de electricidad a huéspedes y el seguimiento del costo real pagado por los propietarios, incluyendo cálculo automático de diferencias y contribuciones.

---

## 🔄 Flujo Completo

### **Paso 1: Huésped completa su estadía**
1. Admin ve reserva en estado "Confirmada"
2. Clic en botón **"✓ Completar"**
3. Se abre modal de completar reserva con electricidad

### **Paso 2: Registrar consumo de electricidad del huésped**
En el modal, ingresar:
- **Lectura inicial del medidor** (ej: 1000 kWh)
- **Lectura final del medidor** (ej: 1150 kWh)
- **Tarifa por kWh** (ej: $0.15/kWh)
- **Método de pago** (efectivo, depósito, factura, exonerado)
- **Notas** (opcional)

El sistema calcula automáticamente:
```
Consumo = 1150 - 1000 = 150 kWh
Cargo = 150 × $0.15 = $22.50
```

Opciones:
- **"Completar Sin Electricidad"**: Marca como completada sin registrar electricidad
- **"Completar y Cobrar $22.50"**: Registra electricidad y marca como completada

### **Paso 3: Visualizar datos de electricidad**
Una vez completada, la reserva muestra:
- Fila expandida en color azul debajo de la reserva
- Detalles: lecturas, consumo, tarifa, cargo al huésped
- Botón: **"📋 Registrar Costo Real"** (si aún no se ha registrado)

### **Paso 4: Registrar costo real pagado por propietario**
1. Clic en **"📋 Registrar Costo Real"**
2. Se abre modal para registrar factura del propietario
3. Ingresar:
   - **Costo Real Pagado** (ej: $18.50) - Lo que el propietario pagó a la compañía eléctrica
   - **Fecha de Factura** (opcional)
   - **Notas** (opcional, ej: "Factura #12345")

El sistema calcula en tiempo real:
```
Diferencia = $22.50 (cobrado) - $18.50 (costo real) = $4.00
Resultado: Ganancia Admin = $4.00
```

**Escenarios posibles:**

#### ✅ **Caso 1: Ganancia para Admin**
```
Cobrado al huésped: $22.50
Costo real pagado:  $18.50
Diferencia:         +$4.00
Resultado: ✅ Ganancia Admin: $4.00
```

#### ⚠️ **Caso 2: Propietario debe contribuir**
```
Cobrado al huésped: $15.00
Costo real pagado:  $20.00
Diferencia:         -$5.00
Resultado: ⚠️ Propietario debe contribuir: $5.00
```

#### ✓ **Caso 3: Sin diferencia (exacto)**
```
Cobrado al huésped: $18.50
Costo real pagado:  $18.50
Diferencia:         $0.00
Resultado: ✓ Exacto (sin diferencia)
```

### **Paso 5: Ver reporte completo**
En la tabla de reservas, la fila expandida ahora muestra:

**⚡ Detalles de Electricidad:**
- Lectura Inicial: 1000 kWh
- Lectura Final: 1150 kWh
- Consumo: 150 kWh
- Tarifa: $0.15/kWh
- Cobrado al Huésped: $22.50
- Método Pago: efectivo

**💰 Factura del Propietario:**
- Costo Real Pagado: $18.50
- Fecha Factura: 15/11/2025
- Notas Factura: Factura completa del mes
- **✅ Ganancia Admin: $4.00**

---

## 📊 Reporte Financiero de Electricidad

### **Endpoint disponible:**
```http
GET /api/financials/electricity-report?propertyId=xxx&period=2025-11
```

### **Parámetros:**
- `propertyId` (opcional): Filtrar por propiedad específica
- `period` (opcional): Filtrar por período en formato `YYYY-MM`

### **Respuesta:**
```json
{
  "summary": {
    "totalCharged": 450.75,        // Total cobrado a huéspedes
    "totalActualCost": 380.25,     // Total pagado por propietarios
    "totalOwnerContribution": 25.00, // Total que propietarios deben pagar
    "totalAdminProfit": 95.50,     // Total ganancia del admin
    "netElectricityResult": 70.50, // Resultado neto (charged - actualCost)
    "pendingBills": 3,             // Reservas sin costo real registrado
    "completedBills": 12           // Reservas con costo real registrado
  },
  "details": [
    {
      "id": "uuid-reserva",
      "propertyId": "uuid-propiedad",
      "guestName": "Juan Pérez",
      "checkIn": "2025-11-01",
      "checkOut": "2025-11-05",
      "electricityConsumed": 150,
      "electricityCharge": 22.50,
      "electricityActualCost": 18.50,
      "electricityRate": 0.15,
      "difference": 4.00,
      "ownerMustPay": 0,           // Si difference < 0, aquí aparece el monto
      "adminProfit": 4.00,         // Si difference > 0, aquí aparece el monto
      "billStatus": "registered",  // "registered" o "pending"
      "electricityBillDate": "2025-11-10",
      "electricityPaymentMethod": "cash"
    }
  ]
}
```

---

## 🗄️ Campos en Base de Datos

### **Tabla: `reservations`**

#### Campos de cobro al huésped:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `electricityConsumed` | decimal(10,2) | kWh consumidos (calculado) |
| `electricityCharge` | decimal(10,2) | Monto cobrado al huésped en USD |
| `electricityRate` | decimal(6,4) | Tarifa aplicada por kWh |
| `meterReadingStart` | integer | Lectura inicial del medidor |
| `meterReadingEnd` | integer | Lectura final del medidor |
| `electricityPaymentMethod` | varchar(50) | cash, deposit, invoice, waived |
| `electricityNotes` | text | Notas sobre el cobro |

#### Campos de costo real (propietario):
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `electricityActualCost` | decimal(10,2) | Costo real pagado por propietario en USD |
| `electricityBillDate` | date | Fecha de la factura eléctrica |
| `electricityBillNotes` | text | Notas sobre la factura |

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
```

### **2. Registrar costo real de electricidad**
```http
POST /api/reservations/:id/register-electricity-cost
Authorization: Bearer <token>

Body:
{
  "electricityActualCost": 18.50,
  "electricityBillDate": "2025-11-10",
  "electricityBillNotes": "Factura completa del mes"
}

Response:
{
  "message": "Electricity cost registered successfully",
  "data": {
    "electricityCharged": 22.50,
    "electricityActualCost": 18.50,
    "difference": 4.00,
    "ownerContribution": 0,
    "adminProfit": 4.00
  }
}
```

### **3. Obtener reporte de electricidad**
```http
GET /api/financials/electricity-report?propertyId=xxx&period=2025-11
Authorization: Bearer <token>

Response: Ver sección "Reporte Financiero de Electricidad"
```

---

## 💼 Casos de Uso

### **Caso 1: Propietario paga menos que lo cobrado**
**Escenario:** Tarifa fija alta al huésped, factura real más baja

```
Huésped consume: 150 kWh
Tarifa cobrada: $0.20/kWh
Cobrado: 150 × $0.20 = $30.00

Factura real del propietario: $25.00
Diferencia: $30.00 - $25.00 = $5.00
Resultado: ✅ Admin gana $5.00
```

**Acción:** Admin retiene $5.00 como ganancia

---

### **Caso 2: Propietario paga más que lo cobrado**
**Escenario:** Tarifa fija baja al huésped, factura real más alta

```
Huésped consume: 200 kWh
Tarifa cobrada: $0.10/kWh
Cobrado: 200 × $0.10 = $20.00

Factura real del propietario: $28.00
Diferencia: $20.00 - $28.00 = -$8.00
Resultado: ⚠️ Propietario debe pagar $8.00
```

**Acción:** Propietario debe cubrir diferencia de $8.00

---

### **Caso 3: Huésped no paga, pero propietario sí**
**Escenario:** Electricidad exonerada al huésped

```
Cobrado al huésped: $0.00 (waived)
Factura real: $15.00
Diferencia: -$15.00
Resultado: ⚠️ Propietario debe pagar $15.00
```

**Acción:** Propietario cubre el costo completo

---

## 📈 Métricas y Reportes

### **Indicadores Clave:**
1. **Total Cobrado vs Total Pagado**: Ver rentabilidad del sistema de electricidad
2. **Ganancia Neta de Electricidad**: `totalCharged - totalActualCost`
3. **% de Facturas Completadas**: `completedBills / (completedBills + pendingBills)`
4. **Promedio de Contribución del Propietario**: Identificar propiedades con déficit
5. **Promedio de Ganancia Admin**: Identificar propiedades rentables

### **Dashboard sugerido:**
```
┌─────────────────────────────────────────────────┐
│  Resumen de Electricidad - Noviembre 2025      │
├─────────────────────────────────────────────────┤
│  Total cobrado a huéspedes:      $450.75       │
│  Total pagado por propietarios:  $380.25       │
│  Ganancia neta:                  $70.50        │
│                                                 │
│  Propietarios deben contribuir:  $25.00        │
│  Ganancia admin:                 $95.50        │
│                                                 │
│  Facturas pendientes:            3             │
│  Facturas completadas:           12            │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Testing

### **Flujo básico:**
- [ ] Completar reserva sin electricidad
- [ ] Completar reserva con electricidad (tarifa normal)
- [ ] Ver detalles de electricidad en tabla
- [ ] Registrar costo real igual al cobrado
- [ ] Registrar costo real menor (ganancia admin)
- [ ] Registrar costo real mayor (contribución propietario)

### **Reportes:**
- [ ] Obtener reporte general de electricidad
- [ ] Filtrar reporte por propiedad
- [ ] Filtrar reporte por período
- [ ] Verificar cálculos de totales
- [ ] Verificar conteo de facturas pendientes

### **Edge cases:**
- [ ] Completar con lecturas iguales (consumo 0)
- [ ] Registrar costo $0.00
- [ ] Intentar registrar costo sin haber completado con electricidad
- [ ] Actualizar costo real después de registrado

---

## 🚀 Próximas Mejoras

### **Frontend:**
1. ✅ **Vista de reporte de electricidad** - Página dedicada con gráficos
2. ⬜ **Exportar reporte a PDF/Excel**
3. ⬜ **Notificaciones de facturas pendientes**
4. ⬜ **Dashboard de electricidad por propiedad**

### **Backend:**
1. ⬜ **Integración con API de compañía eléctrica** (automático)
2. ⬜ **Alertas cuando diferencia > umbral**
3. ⬜ **Histórico de cambios en costos**
4. ⬜ **Predicción de consumo basado en histórico**

### **Negocio:**
1. ⬜ **Política de tarifas dinámicas** (verano vs invierno)
2. ⬜ **Margen de ganancia configurable**
3. ⬜ **Acuerdos con propietarios** (% de contribución)
4. ⬜ **Facturación automática a propietarios**

---

## 📞 Soporte

**Preguntas frecuentes:**
- ❓ ¿Qué pasa si no registro el costo real?
  - El reporte mostrará como "pendiente" y no se calculará diferencia
  
- ❓ ¿Puedo modificar el costo real después?
  - Sí, volver a llamar el endpoint con el ID de la reserva
  
- ❓ ¿Cómo se cobra la diferencia al propietario?
  - El sistema solo calcula, el proceso de cobro es manual (por ahora)

**Contacto:** dev@example.com

---

**Última actualización:** 15 de Noviembre, 2025
