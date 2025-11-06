# 💰 Gestión de Precios Especiales - Guía de Usuario

## ¿Dónde cambiar los precios?

Ahora puedes gestionar precios especiales directamente desde la interfaz. Aquí te mostramos cómo:

---

## 📍 Ubicación en la Interfaz

### 1. **Ir a Propiedades**
```
Menu → Propiedades (o Dashboard)
```

### 2. **Editar una Propiedad**
```
En la tabla de propiedades:
└─ Click en botón "✎ Editar" de la propiedad
```

### 3. **Acceder a Precios Especiales**
```
En el formulario de edición, ABAJO del formulario:
└─ Verás la sección: "💰 Precios Especiales"
```

---

## 🎯 Gestionar Precios Especiales

### ✨ Agregar Nuevo Precio Especial

1. **Click en "+ Agregar Precio"**
   ```
   Se abrirá un formulario
   ```

2. **Completar los campos:**
   ```
   ├─ Nombre *: "Verano 2025", "Navidad", etc
   ├─ Tipo: Elige entre:
   │  ├─ 🌞 Temporal (épocas del año)
   │  ├─ 🏖️ Fin de Semana (sábado-domingo)
   │  ├─ 🎉 Festivo (días festivos)
   │  └─ ⚙️ Personalizado (casos especiales)
   │
   ├─ Fecha Inicio: YYYY-MM-DD (ej: 2025-06-01)
   ├─ Fecha Fin: YYYY-MM-DD (ej: 2025-08-31)
   ├─ Precio por Noche: € (ej: 150)
   ├─ Estado: ✓ Activo / ✗ Inactivo
   └─ Descripción (opcional): Notas sobre el precio
   ```

3. **Validación automática:**
   - ✅ Las fechas se validan automáticamente
   - ✅ El precio diferencial se muestra en tiempo real
   - ✅ Se detectan automáticamente períodos superpuestos

4. **Ejemplo con diferencia visual:**
   ```
   Precio Base: €100/noche
   Nuevo Precio: €150/noche
   ├─ Diferencia: +€50 (mostrado en azul)
   ```

5. **Click en "Crear Precio"**
   ```
   Se agregará a la tabla
   ```

---

### ✎ Editar Precio Existente

1. En la tabla de precios especiales
2. **Click en "✎ Editar"**
   ```
   Se cargará el formulario con los datos
   ```
3. **Modifica los campos** que necesites
4. **Click en "Actualizar Precio"**

---

### ✕ Eliminar Precio

1. En la tabla de precios especiales
2. **Click en "✕ Eliminar"**
   ```
   Se pedirá confirmación
   ```
3. **Confirma** en el diálogo
   ```
   El precio será eliminado
   ```

---

## 📊 Tabla de Precios Especiales

La tabla muestra todos los precios configurados:

| Columna | Descripción |
|---------|-------------|
| **Nombre** | Nombre del precio especial |
| **Tipo** | Categoría (Temporal, Fin de Semana, etc) |
| **Período** | Rango de fechas (formato YYYY-MM-DD) |
| **Precio** | Precio por noche en € |
| **Diferencia** | Comparación con precio base |
| **Estado** | ✓ Activo o ✗ Inactivo |
| **Acciones** | Botones Editar / Eliminar |

---

## ⚙️ Tipos de Precios

### 🌞 Temporal
**Uso:** Temporadas (verano, invierno, semana santa)
```
Ejemplo:
  Nombre: Verano 2025
  Periodo: 01/06/2025 - 31/08/2025
  Precio: €150/noche
```

### 🏖️ Fin de Semana
**Uso:** Precios especiales solo viernes-domingo
```
Ejemplo:
  Nombre: Fin de Semana Especial
  Período: Todo el año
  Precio: €120/noche
```

### 🎉 Festivo
**Uso:** Días festivos especiales
```
Ejemplo:
  Nombre: Navidad 2025
  Período: 15/12/2025 - 31/12/2025
  Precio: €200/noche
```

### ⚙️ Personalizado
**Uso:** Casos especiales (eventos, promotions, etc)
```
Ejemplo:
  Nombre: Promoción Cumpleaños
  Período: 10/11/2025 - 20/11/2025
  Precio: €99/noche
```

---

## ⚠️ Detección de Conflictos

El sistema **automáticamente detecta** períodos superpuestos:

```
Ejemplo de Conflicto:
├─ Precio 1: 01/06 - 31/08 (Verano)
└─ Precio 2: 15/07 - 31/07 (Festival)
           ↑
        ❌ SE SUPERPONEN
        
✓ Sistema muestra: "Conflictos Detectados: 'Verano...' y 'Festival...'"
```

**Solución:**
- Ajusta las fechas para que no se superpongan
- O elimina uno de los períodos

---

## 🔄 Integración con Reservas

Cuando se crea una **nueva reserva**, el sistema:

```
1. Busca si existe un precio especial para esas fechas
2. Si existe → Usa el precio especial
3. Si NO existe → Usa el precio base de la propiedad
```

**Ejemplo:**
```
Propiedad "Apartamento Centro"
├─ Precio base: €100/noche
├─ Precios especiales:
│  └─ Verano (01/06-31/08): €150/noche
│
Reserva del 01/06 al 15/06:
├─ Días en período especial: 15 noches
├─ Precio aplicado: €150/noche × 15 = €2.250
```

---

## 📱 Ejemplo Paso a Paso

### Escenario: Configurar precio especial para Navidad

**Paso 1:** Ve a Propiedades → Click "✎ Editar" en tu apartamento

**Paso 2:** Baja hasta la sección "💰 Precios Especiales"

**Paso 3:** Click en "+ Agregar Precio"

**Paso 4:** Completa el formulario:
```
├─ Nombre: "Navidad 2025"
├─ Tipo: "🎉 Festivo"
├─ Fecha Inicio: "2025-12-15"
├─ Fecha Fin: "2025-12-31"
├─ Precio: "200"
├─ Estado: ✓ Activo
└─ Descripción: "Período de Navidades"
```

**Paso 5:** Click en "Crear Precio"

**Resultado:** ✅ Las reservas en esas fechas usarán €200/noche

---

## 🎨 Visual de la Interfaz

```
┌────────────────────────────────────────────────┐
│ 💰 Precios Especiales         [+ Agregar Precio]│
├────────────────────────────────────────────────┤
│                                                │
│ [Formulario - Mostrado al hacer click]         │
│ ├─ Nombre: [__________________]                │
│ ├─ Tipo: [Dropdown ▼]                          │
│ ├─ Inicio: [YYYY-MM-DD]   Fin: [YYYY-MM-DD]   │
│ ├─ Precio: [___] € (+€50 diferencia)          │
│ └─ Activo: [✓]  [Crear] [Cancelar]            │
│                                                │
│ TABLA DE PRECIOS:                              │
│ ┌───────────────────────────────────────────┐  │
│ │ Nombre  │ Tipo      │ Período  │ Precio  │  │
│ ├───────────────────────────────────────────┤  │
│ │ Verano  │ 🌞 Temp.  │ 06-08   │ €150    │  │
│ │ Navidad │ 🎉 Fest.  │ 12-12/31│ €200    │  │
│ └───────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Setup

- [ ] Accedí a una propiedad existente (click en "✎ Editar")
- [ ] Ví la sección "💰 Precios Especiales" al final
- [ ] Creé al menos un precio especial de prueba
- [ ] Configuré el tipo, fecha y precio
- [ ] Verificué que se muestra en la tabla
- [ ] Intenté editar y eliminar (opcional)

---

## 🆘 Preguntas Frecuentes

### ❓ ¿Dónde veo los precios especiales?
**Respuesta:** En el formulario de edición de propiedad, al final, en la sección "💰 Precios Especiales"

### ❓ ¿Puedo crear precios especiales para propiedades nuevas?
**Respuesta:** No, primero debes crear la propiedad, luego editarla para agregar precios especiales

### ❓ ¿Qué pasa si dos precios se superponen?
**Respuesta:** El sistema detecta automáticamente el conflicto y te lo mostrará. Debes ajustar las fechas

### ❓ ¿El precio especial se aplica automáticamente a reservas?
**Respuesta:** Sí, cuando se crea una reserva dentro del período, usa automáticamente el precio especial

### ❓ ¿Puedo inactivar un precio sin borrarlo?
**Respuesta:** Sí, usa el toggle "Activo/Inactivo" - si está inactivo no se usa

### ❓ ¿Cuántos precios especiales puedo crear?
**Respuesta:** Sin límite, pero evita que se superpongan

---

## 📚 Información Técnica

### Estructura de Datos (Backend)

```typescript
SeasonalPrice {
  id: string;              // UUID único
  propertyId: string;      // Referencia a propiedad
  name: string;            // "Verano", "Navidad", etc
  description?: string;    // Notas adicionales
  pricePerNight: number;   // Precio en €
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  type: enum;              // SEASONAL | WEEKEND | HOLIDAY | CUSTOM
  isActive: boolean;       // true/false
  createdAt: timestamp;    // Fecha de creación
}
```

### API Endpoints

```bash
# Crear nuevo precio
POST /seasonal-prices/property/:propertyId
Body: { name, pricePerNight, startDate, endDate, type, isActive }

# Listar todos los precios de una propiedad
GET /seasonal-prices/property/:propertyId

# Listar solo precios activos
GET /seasonal-prices/property/:propertyId/active

# Obtener precio específico
GET /seasonal-prices/:id

# Actualizar precio
PUT /seasonal-prices/:id
Body: { name, pricePerNight, startDate, endDate, type, isActive }

# Eliminar precio
DELETE /seasonal-prices/:id

# Detectar conflictos
POST /seasonal-prices/check-conflicts
Body: { propertyId, startDate, endDate, excludeId? }

# Obtener precio para una fecha específica
GET /seasonal-prices/property/:propertyId/price-for-date?date=YYYY-MM-DD
```

---

## 🚀 Próximas Mejoras Planeadas

- [ ] Vista de calendario para precios especiales
- [ ] Importar/exportar precios como Excel
- [ ] Plantillas de precios (aplicar a varias propiedades)
- [ ] Automatización de precios por temporada
- [ ] Historial de cambios de precios

---

**Última actualización:** 5 Noviembre, 2025  
**Versión:** 1.0 - Sistema Inicial de Precios Especiales
