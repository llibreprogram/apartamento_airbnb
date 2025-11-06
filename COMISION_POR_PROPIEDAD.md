# 💰 Comisión Variable por Propiedad

## Descripción

Se ha implementado un sistema flexible de comisiones donde **cada propiedad puede tener su propia tasa de comisión**. Esto permite mayor control y configurabilidad en la gestión de rentabilidad.

## Cambios Implementados

### 1. **Backend - Entity**

**Archivo:** `backend/src/modules/properties/entities/property.entity.ts`

```typescript
@Column({ type: 'decimal', precision: 5, scale: 3, default: 0.1 })
commissionRate: number; // Ej: 0.1 = 10%, 0.15 = 15%
```

- **Tipo:** `decimal` con precisión de 5 dígitos y 3 decimales
- **Valor por defecto:** `0.1` (10%)
- **Rango:** 0 a 1 (0% a 100%)

### 2. **Backend - DTOs**

**Archivo:** `backend/src/modules/properties/dto/create-property.dto.ts`

Se agregó validación para `commissionRate`:

```typescript
@IsNumber()
@IsOptional()
@Min(0)
commissionRate: number; // Ej: 0.1 = 10%, default 0.1
```

- ✅ Campo opcional en creación
- ✅ Por defecto se asigna 10% (0.1)
- ✅ Validación mínima de 0

### 3. **Backend - Cálculo de Comisión**

**Archivo:** `backend/src/modules/financials/financials.service.ts`

**Antes:**
```typescript
const commissionRate = 0.1; // 10% fijo
```

**Después:**
```typescript
const commissionRate = parseFloat(property.commissionRate?.toString() || '0.1');
```

Ahora el cálculo utiliza la tasa de comisión de la propiedad:

```typescript
const commissionAmount = parseFloat((grossIncome * commissionRate).toFixed(2));
```

### 4. **Frontend - Formulario**

**Archivo:** `frontend/src/components/properties/PropertyForm.tsx`

Se agregó un nuevo campo al formulario de crear/editar propiedad:

```typescript
{/* Commission Rate */}
<div>
  <label className="block text-sm font-semibold text-gray-900 mb-1">
    Comisión (decimal, ej: 0.1 = 10%)
  </label>
  <input
    type="number"
    name="commissionRate"
    value={formData.commissionRate}
    onChange={handleChange}
    step="0.01"
    min="0"
    max="1"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    placeholder="0.1"
  />
  <p className="text-gray-500 text-xs mt-1">
    {((formData.commissionRate || 0) * 100).toFixed(1)}% de comisión
  </p>
</div>
```

**Características:**
- Campo decimal con step de 0.01
- Mínimo 0, máximo 1
- Preview en tiempo real mostrando el porcentaje
- Validación en el handleChange

### 5. **Frontend - Tabla de Propiedades**

**Archivo:** `frontend/src/components/properties/PropertiesTable.tsx`

Se agregó una nueva columna en la tabla mostrando la comisión:

```typescript
<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Comisión</th>
```

```typescript
<td className="px-6 py-4 font-semibold text-blue-600">
  {((prop.commissionRate || 0.1) * 100).toFixed(1)}%
</td>
```

- Muestra el porcentaje con 1 decimal
- Usa color azul para diferenciarlo
- Si no tiene valor, asume 10% (default)

## Ejemplos de Uso

### Crear Propiedad con Comisión Personalizada

```json
{
  "name": "Apartamento Premium",
  "city": "Madrid",
  "address": "Calle Mayor 123",
  "bedrooms": 3,
  "bathrooms": 2,
  "capacity": 6,
  "pricePerNight": 150,
  "commissionRate": 0.15,
  // ... otros campos
}
```

**Resultado:** 15% de comisión en lugar del 10% por defecto

### Cálculo de Comisión

Si una propiedad tiene:
- `commissionRate: 0.15` (15%)
- Ingresos brutos: $1,000

**Comisión:** $1,000 × 0.15 = $150

### Crear Propiedad sin Especificar Comisión

```json
{
  "name": "Apartamento Estándar",
  "city": "Madrid",
  // ... campos
  // NO incluir commissionRate
}
```

**Resultado:** Se asigna por defecto 10% (0.1)

## Conversión de Decimal a Porcentaje

| Decimal | Porcentaje |
|---------|-----------|
| 0.05    | 5%        |
| 0.10    | 10%       |
| 0.15    | 15%       |
| 0.20    | 20%       |
| 0.25    | 25%       |
| 0.50    | 50%       |
| 1.00    | 100%      |

## Base de Datos

### Migración Automática

Cuando se ejecute el servidor con los cambios, TypeORM aplicará automáticamente:

```sql
ALTER TABLE properties ADD COLUMN commissionRate DECIMAL(5,3) DEFAULT 0.1;
```

### Compatibilidad

- ✅ Las propiedades existentes heredarán el valor por defecto de 10%
- ✅ No se pierden datos
- ✅ Compatible con todas las versiones anteriores

## API Endpoints

### Crear Propiedad (POST /properties)

**Request:**
```json
{
  "name": "Mi Propiedad",
  "city": "Madrid",
  "commissionRate": 0.12,
  // ... otros campos
}
```

**Response:**
```json
{
  "id": "uuid-123",
  "name": "Mi Propiedad",
  "commissionRate": 0.12,
  // ... otros campos
}
```

### Obtener Propiedad (GET /properties/:id)

Incluirá el campo `commissionRate` en la respuesta

### Actualizar Propiedad (PUT /properties/:id)

Permite actualizar la comisión:

```json
{
  "commissionRate": 0.18
}
```

## Reportes Financieros

### Cálculo Automático

Cuando se calcula un reporte financiero, automáticamente usa la tasa de comisión de la propiedad:

```typescript
// financials.service.ts
const commissionRate = parseFloat(property.commissionRate?.toString() || '0.1');
const commissionAmount = parseFloat((grossIncome * commissionRate).toFixed(2));
```

### En el Dashboard

El panel de financieros mostrará la comisión exacta según la tasa de la propiedad.

## Ventajas

✅ **Flexibilidad:** Cada propiedad puede tener diferente comisión  
✅ **Control:** Ajusta comisiones según tipo de propiedad  
✅ **Precisión:** Hasta 3 decimales para cálculos exactos  
✅ **Compatibilidad:** Las propiedades antiguas heredan el default 10%  
✅ **Retrocompatibilidad:** Todo sigue funcionando con datos antiguos  

## Preguntas Frecuentes

### P: ¿Puedo cambiar la comisión de una propiedad existente?
**R:** Sí, edita la propiedad y modifica el campo "Comisión"

### P: ¿Qué pasa si no especifico comisión?
**R:** Se asigna automáticamente 10% (0.1)

### P: ¿Se recalculan los reportes anteriores?
**R:** No, los reportes generados mantienen sus valores. Solo los nuevos reportes usan la nueva comisión

### P: ¿Puede ser 0% (sin comisión)?
**R:** Sí, puedes establecer 0 como comisión. Solo asigna `commissionRate: 0`

### P: ¿Hay límite máximo?
**R:** No hay límite técnico, pero recomendamos mantenerlo entre 0 y 1 (0% a 100%)

### P: ¿Se ve en el UI?
**R:** Sí, aparece en:
- Formulario de crear/editar propiedad
- Tabla de propiedades (nueva columna)
- Dashboard financiero (en el cálculo)

## Testing

### Verificar los Cambios

1. **Backend compilado sin errores:**
```bash
npm run build  # ✅ 0 errores
```

2. **Frontend compilado sin errores:**
```bash
npm run build  # ✅ 525 módulos transformados
```

3. **Probar en UI:**
   - Ir a Propiedades
   - Crear nueva propiedad
   - Especificar comisión (ej: 0.15)
   - Verificar que aparece en tabla como 15%

4. **Verificar reporte:**
   - Crear reservas
   - Calcular financieros
   - Verificar que comisión = 15% del ingreso

## Commit

```
feat(properties): add variable commission rate per property

- Add commissionRate field to Property entity (default 0.1 = 10%)
- Update DTOs with commissionRate validation
- Modify financial calculations to use property commission rate
- Add commission field to property form in frontend
- Add commission column to properties table
- Support for flexible, per-property commission configuration
```

---

**Última actualización:** 5 de Noviembre, 2025  
**Status:** ✅ Implementado y compilado
