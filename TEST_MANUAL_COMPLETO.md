# 🧪 TEST MANUAL COMPLETO - Flujo End-to-End

**Fecha:** 16 de Noviembre, 2025  
**Objetivo:** Verificar todos los procesos del sistema de gestión de apartamentos

---

## 📋 PREPARACIÓN

### ✅ Verificar que el sistema esté corriendo:

```bash
# Terminal 1: Backend
cd backend && npm run start:dev
# Debe estar en: http://localhost:3001

# Terminal 2: Frontend  
cd frontend && npm run dev
# Debe estar en: http://localhost:3000
```

### ✅ Verificar base de datos:
```bash
psql -U postgres -d apartamento_airbnb -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d apartamento_airbnb -c "SELECT COUNT(*) FROM properties;"
```

---

## 🔐 FASE 1: AUTENTICACIÓN

### Test 1.1: Login
- [ ] Ir a http://localhost:3000
- [ ] Ingresar credenciales:
  - Email: `demo1761960285@apartamentos.com`
  - Password: `DemoPass123`
- [ ] Click en "Iniciar Sesión"
- [ ] ✅ Debe redirigir a Dashboard
- [ ] ✅ Debe mostrar nombre del usuario arriba

### Test 1.2: Verificar permisos
- [ ] Verificar que el menú muestre todas las secciones (admin tiene acceso total)
- [ ] ✅ Dashboard, Propiedades, Reservas, Gastos, Reportes Financieros

---

## 🏠 FASE 2: GESTIÓN DE PROPIEDADES

### Test 2.1: Ver propiedades existentes
- [ ] Navegar a "Propiedades"
- [ ] ✅ Debe listar todas las propiedades
- [ ] ✅ Verificar que muestre: nombre, dirección, capacidad, habitaciones

### Test 2.2: Crear nueva propiedad (si necesitas)
- [ ] Click en "➕ Nueva Propiedad"
- [ ] Llenar formulario:
  ```
  Nombre: Apartamento Test E2E
  Dirección: Calle Test 123
  Capacidad: 4
  Habitaciones: 2
  Baños: 1
  Propietario: [Seleccionar uno existente]
  ```
- [ ] Click en "Crear Propiedad"
- [ ] ✅ Debe aparecer en la lista
- [ ] ✅ Debe mostrar notificación de éxito

### Test 2.3: Editar propiedad
- [ ] Click en "✏️ Editar" en una propiedad
- [ ] Cambiar capacidad de 4 a 5
- [ ] Click en "Guardar"
- [ ] ✅ Debe actualizar la información
- [ ] ✅ Verificar que el cambio persista al recargar

### Test 2.4: Ver detalles de propiedad
- [ ] Click en una propiedad
- [ ] ✅ Debe mostrar información completa
- [ ] ✅ Debe mostrar historial de reservas (si tiene)

---

## 📅 FASE 3: GESTIÓN DE RESERVAS

### Test 3.1: Crear reserva básica
- [ ] Navegar a "Reservas"
- [ ] Click en "➕ Nueva Reserva"
- [ ] Llenar formulario:
  ```
  Propiedad: [Seleccionar una]
  Nombre Huésped: Juan Pérez Test
  Email: juan.test@email.com
  Teléfono: +1234567890
  Check-in: [Fecha futura, ej: mañana]
  Check-out: [3 días después]
  Num. Huéspedes: 2
  Precio Total: 300.00
  Estado: Confirmada
  ```
- [ ] Click en "Crear Reserva"
- [ ] ✅ Debe aparecer en la lista de reservas
- [ ] ✅ Verificar que los datos sean correctos

### Test 3.2: Crear reserva con electricidad
- [ ] Click en "➕ Nueva Reserva"
- [ ] Llenar datos básicos (similar al anterior)
- [ ] Check-in: [Hoy]
- [ ] Check-out: [Pasado mañana]
- [ ] Estado: **Completada** (importante para cobrar electricidad)
- [ ] Click en "Crear Reserva"
- [ ] ✅ Debe aparecer en la lista

### Test 3.3: Completar reserva y cobrar electricidad
- [ ] Buscar la reserva recién creada (estado: Completada)
- [ ] Click en "⚡ Electricidad" o "Completar"
- [ ] Llenar datos de electricidad:
  ```
  Lectura inicial: 1000 kWh
  Lectura final: 1030 kWh
  Consumo: 30 kWh (auto-calculado)
  Tarifa: $0.15 / kWh
  Cobro total: $4.50 (auto-calculado)
  Método de pago: Efectivo
  Notas: Test consumo electricidad
  ```
- [ ] Click en "Guardar"
- [ ] ✅ Debe mostrar el cobro en la lista
- [ ] ✅ Verificar que muestre "⚡ $4.50" en la reserva

### Test 3.4: Editar reserva
- [ ] Click en "✏️ Editar" en una reserva
- [ ] Cambiar número de huéspedes
- [ ] Click en "Guardar"
- [ ] ✅ Debe actualizar correctamente

### Test 3.5: Cancelar reserva
- [ ] Click en "❌ Cancelar" en una reserva pendiente
- [ ] Confirmar cancelación
- [ ] ✅ Estado debe cambiar a "Cancelada"
- [ ] ✅ Debe aparecer en gris o marcada como cancelada

---

## 💰 FASE 4: GESTIÓN DE GASTOS

### Test 4.1: Ver gastos existentes
- [ ] Navegar a "Gastos"
- [ ] ✅ Debe listar todos los gastos
- [ ] ✅ Verificar filtros por propiedad

### Test 4.2: Crear gasto normal (NO electricidad)
- [ ] Click en "➕ Nuevo Gasto"
- [ ] Llenar formulario:
  ```
  Propiedad: [Seleccionar la misma de las reservas]
  Descripción: Limpieza profunda test
  Monto: 50.00
  Categoría: Limpieza
  Fecha: [Hoy]
  Notas: Test de gasto normal
  ```
- [ ] Click en "Crear Gasto"
- [ ] ✅ Debe aparecer en la lista
- [ ] ✅ Verificar monto y categoría

### Test 4.3: Crear gasto de electricidad (FLUJO ESPECIAL)
- [ ] Click en "➕ Nuevo Gasto"
- [ ] Seleccionar Propiedad (la misma que usaste en las reservas)
- [ ] Seleccionar Categoría: **⚡ Electricidad (con resumen automático)**
- [ ] ✅ Debe CERRAR el formulario genérico
- [ ] ✅ Debe ABRIR el modal especial de electricidad

### Test 4.4: Verificar resumen automático de electricidad
- [ ] En el modal de electricidad, verificar que muestre:
  - [ ] ✅ **Card verde** "💵 Cobrado a Huéspedes" con el total (ej: $4.50)
  - [ ] ✅ **Card roja** "⚡ Pagado en Facturas" (aún en $0.00)
  - [ ] ✅ **Card azul/amarilla** "📊 Diferencia" calculada
  - [ ] ✅ Lista de reservas con detalles:
    - Nombre huésped
    - Fechas (check-in - check-out)
    - Consumo (ej: 30 kWh)
    - Cobro (ej: $4.50)

### Test 4.5: Registrar factura de electricidad
- [ ] En el modal de electricidad, llenar:
  ```
  Descripción: Factura electricidad [Mes actual]
  Monto: 45.00 (lo que realmente pagaste)
  Fecha: [Hoy]
  Notas: Test factura electricidad
  ```
- [ ] ✅ Verificar que la diferencia se actualice en tiempo real
- [ ] ✅ Si cobraste $4.50 y pagaste $45.00, diferencia = -$40.50 (pérdida)
- [ ] Click en "Crear Gasto"
- [ ] ✅ Debe aparecer en la lista de gastos
- [ ] ✅ Debe tener categoría "Electricidad"

### Test 4.6: Verificar metadata del gasto de electricidad
- [ ] En la lista de gastos, buscar el gasto de electricidad
- [ ] ✅ Debe mostrar información adicional:
  - Período (YYYY-MM)
  - Total cobrado
  - Diferencia calculada
  - Número de reservas

### Test 4.7: Editar gasto
- [ ] Click en "✏️ Editar" en un gasto
- [ ] Cambiar monto
- [ ] Click en "Guardar"
- [ ] ✅ Debe actualizar correctamente

### Test 4.8: Eliminar gasto
- [ ] Click en "🗑️ Eliminar" en un gasto de prueba
- [ ] Confirmar eliminación
- [ ] ✅ Debe desaparecer de la lista

---

## 📊 FASE 5: REPORTES FINANCIEROS

### Test 5.1: Dashboard general
- [ ] Navegar a "Dashboard"
- [ ] ✅ Debe mostrar resumen de:
  - Total de propiedades
  - Reservas activas
  - Ingresos del mes
  - Gastos del mes

### Test 5.2: Reportes financieros - Vista general
- [ ] Navegar a "Reportes Financieros"
- [ ] Seleccionar "📊 Vista General"
- [ ] ✅ Debe mostrar:
  - Total de ingresos
  - Total de gastos
  - Ganancia neta
  - ROI promedio
  - Gráfico de resumen

### Test 5.3: Reportes por propiedad
- [ ] Cambiar a "🏠 Por Propiedad"
- [ ] Seleccionar la propiedad que usaste en los tests
- [ ] ✅ Debe mostrar:
  - Resumen financiero específico
  - Ingresos de esa propiedad
  - Gastos de esa propiedad
  - Ganancia neta

### Test 5.4: Verificar sección de electricidad en reportes
- [ ] En vista "Por Propiedad"
- [ ] Scroll hasta "⚡ Reporte de Electricidad"
- [ ] ✅ Debe mostrar:
  - **Card verde**: "💵 Cobrado a Huéspedes" (total de electricidad cobrada)
  - **Card roja**: "⚡ Pagado en Facturas" (total de facturas pagadas)
  - **Card azul/amarilla**: "📊 Diferencia" con color según resultado:
    - 🔵 Azul si es ganancia (cobrado > pagado)
    - 🟡 Amarillo si es pérdida (cobrado < pagado)
  - **Texto explicativo** del resultado
  - **Margen porcentual** calculado

### Test 5.5: Filtrar por período
- [ ] Cambiar selector de período (ej: mes anterior)
- [ ] ✅ Datos deben actualizarse
- [ ] ✅ Sección de electricidad debe mostrar datos del período seleccionado
- [ ] Volver al período actual

### Test 5.6: Exportar reporte a PDF
- [ ] Click en "📄 Descargar PDF"
- [ ] ✅ Debe descargar archivo PDF
- [ ] Abrir el PDF y verificar:
  - [ ] ✅ Título: "Reporte Financiero"
  - [ ] ✅ Información de la propiedad
  - [ ] ✅ Período correcto
  - [ ] ✅ Resumen financiero (ingresos, gastos, comisión, ganancia, ROI)
  - [ ] ✅ **Sección "⚡ Reporte de Electricidad"** con:
    - Cobrado a Huéspedes (verde)
    - Pagado en Facturas (rojo)
    - Diferencia (azul o amarillo según resultado)
    - Margen porcentual
    - Número de reservas
    - Número de gastos
    - Card explicativo con color dinámico
  - [ ] ✅ Desglose de gastos por categoría
  - [ ] ✅ Fecha de generación

### Test 5.7: Exportar a CSV
- [ ] Click en "📊 Exportar CSV"
- [ ] ✅ Debe descargar archivo CSV
- [ ] Abrir con Excel/LibreOffice
- [ ] ✅ Verificar que tenga todas las columnas de datos

### Test 5.8: Imprimir reporte
- [ ] Click en "🖨️ Imprimir"
- [ ] ✅ Debe abrir ventana de impresión del navegador
- [ ] Cancelar (no es necesario imprimir)

### Test 5.9: Comparar períodos
- [ ] Seleccionar dos períodos diferentes
- [ ] ✅ Verificar que los números cambien correctamente
- [ ] ✅ Verificar que la sección de electricidad refleje cada período

---

## 🌐 FASE 6: FUNCIONALIDADES ADICIONALES

### Test 6.1: Cambiar idioma
- [ ] Si hay selector de idioma, probar cambiar a Inglés
- [ ] ✅ Toda la interfaz debe traducirse
- [ ] ✅ PDF debe exportarse en el idioma seleccionado
- [ ] Volver a Español

### Test 6.2: Responsive Design
- [ ] Abrir DevTools (F12)
- [ ] Cambiar a vista móvil (375px)
- [ ] ✅ Verificar que la interfaz se adapte
- [ ] ✅ Menú debe convertirse en hamburguesa
- [ ] ✅ Tablas deben ser scrolleables
- [ ] Volver a vista desktop

### Test 6.3: Cerrar sesión
- [ ] Click en perfil de usuario
- [ ] Click en "Cerrar Sesión"
- [ ] ✅ Debe redirigir a login
- [ ] ✅ No debe permitir acceso sin autenticación

---

## 🔄 FASE 7: FLUJO COMPLETO INTEGRADO (CASO REAL)

### Escenario: "Gestión mensual completa de un apartamento"

**Situación:** Tienes un apartamento que alquilas por Airbnb. Vamos a simular un mes completo.

#### Paso 1: Nueva propiedad (si no existe)
- [ ] Crear propiedad "Apartamento Playa Vista"
- [ ] Capacidad: 4, Habitaciones: 2, Baños: 1

#### Paso 2: Reservas del mes
- [ ] Crear 3 reservas para el mes actual:
  
  **Reserva 1:**
  - Huésped: María García
  - Check-in: Día 1 del mes
  - Check-out: Día 5 del mes (4 noches)
  - Precio: $400
  - Estado: Completada
  - Electricidad: 40 kWh @ $0.15 = $6.00

  **Reserva 2:**
  - Huésped: Pedro López  
  - Check-in: Día 10 del mes
  - Check-out: Día 15 del mes (5 noches)
  - Precio: $500
  - Estado: Completada
  - Electricidad: 50 kWh @ $0.15 = $7.50

  **Reserva 3:**
  - Huésped: Ana Martínez
  - Check-in: Día 20 del mes
  - Check-out: Día 25 del mes (5 noches)
  - Precio: $500
  - Estado: Completada
  - Electricidad: 35 kWh @ $0.15 = $5.25

- [ ] ✅ Total ingresos: $1,400
- [ ] ✅ Total electricidad cobrada: $18.75

#### Paso 3: Gastos del mes
- [ ] Crear gastos:
  
  **Gasto 1 - Limpieza:**
  - Descripción: Limpieza después de cada huésped
  - Monto: $150 ($50 × 3 limpiezas)
  - Categoría: Limpieza

  **Gasto 2 - Mantenimiento:**
  - Descripción: Reparación grifo cocina
  - Monto: $80
  - Categoría: Mantenimiento

  **Gasto 3 - Electricidad:**
  - Usar modal especial de electricidad
  - ✅ Verificar que muestre $18.75 cobrado (3 reservas)
  - Factura real: $65.00 (lo que llegó del proveedor)
  - ✅ Diferencia: -$46.25 (pérdida, cobraste menos de lo que pagaste)

- [ ] ✅ Total gastos: $295

#### Paso 4: Verificar reportes
- [ ] Ir a Reportes Financieros
- [ ] Seleccionar "Apartamento Playa Vista"
- [ ] Verificar números:
  ```
  Ingresos brutos: $1,400.00
  Gastos totales: $295.00
  Comisión admin (15%): $210.00
  Ganancia neta: $895.00
  ROI: ~303% (si asumimos inversión de $295)
  ```

- [ ] En sección de electricidad:
  ```
  💵 Cobrado a Huéspedes: $18.75
  ⚡ Pagado en Facturas: $65.00
  📊 Diferencia: -$46.25 (pérdida)
  Margen: -71.15%
  Reservas: 3
  Gastos: 1
  ```

#### Paso 5: Exportar PDF del mes
- [ ] Descargar PDF
- [ ] ✅ Verificar que TODO esté reflejado:
  - Ingresos: $1,400
  - Gastos: $295
  - Ganancia: $895
  - Sección de electricidad completa con colores
  - Desglose de gastos por categoría

#### Paso 6: Estado de cuenta para propietario
- [ ] Verificar que el propietario pueda ver:
  - Sus ingresos del mes
  - Los gastos de su propiedad
  - La comisión descontada
  - Su pago neto

---

## ✅ CHECKLIST FINAL

### Backend (API)
- [ ] ✅ Todas las APIs responden correctamente
- [ ] ✅ Autenticación funciona
- [ ] ✅ CRUD de propiedades funciona
- [ ] ✅ CRUD de reservas funciona
- [ ] ✅ CRUD de gastos funciona
- [ ] ✅ Endpoint de electricidad summary funciona
- [ ] ✅ Cálculos financieros son correctos
- [ ] ✅ Swagger docs accesible en /api/docs

### Frontend (UI)
- [ ] ✅ Login/Logout funciona
- [ ] ✅ Navegación entre páginas funciona
- [ ] ✅ Formularios validan correctamente
- [ ] ✅ Modales abren y cierran correctamente
- [ ] ✅ Notificaciones (toasts) aparecen
- [ ] ✅ Datos se actualizan en tiempo real
- [ ] ✅ Filtros y búsquedas funcionan
- [ ] ✅ Responsive design funciona

### Flujo de Electricidad
- [ ] ✅ Cobro de electricidad en reservas funciona
- [ ] ✅ Modal especial se abre al seleccionar categoría
- [ ] ✅ Resumen automático calcula correctamente
- [ ] ✅ Diferencia se actualiza en tiempo real
- [ ] ✅ Gasto se guarda con metadata correcta
- [ ] ✅ Reportes muestran sección de electricidad
- [ ] ✅ PDF incluye sección de electricidad con colores
- [ ] ✅ Cálculos de margen son correctos

### Integridad de Datos
- [ ] ✅ No hay duplicados
- [ ] ✅ Fechas son consistentes
- [ ] ✅ Montos son correctos
- [ ] ✅ Relaciones FK funcionan
- [ ] ✅ Soft deletes funcionan (si aplica)

---

## 🐛 BUGS ENCONTRADOS

**Instrucciones:** Si encuentras algún bug durante el test, documéntalo aquí:

### Bug 1:
- **Descripción:**
- **Pasos para reproducir:**
- **Comportamiento esperado:**
- **Comportamiento actual:**
- **Severidad:** (Crítico/Alto/Medio/Bajo)

### Bug 2:
- **Descripción:**
- ...

---

## 📝 NOTAS ADICIONALES

- **Tiempo total estimado de testing:** 45-60 minutos
- **Recomendación:** Hacer este test después de cada cambio importante
- **Automatización:** Considerar crear tests automatizados con Playwright/Cypress en el futuro

---

## ✅ RESULTADO FINAL

- **Fecha de ejecución:**
- **Tester:**
- **Resultado general:** [ ] ✅ Todos los tests pasaron | [ ] ⚠️ Algunos fallos menores | [ ] ❌ Fallos críticos
- **Observaciones:**

---

**Este documento debe actualizarse cada vez que se agreguen nuevas funcionalidades al sistema.**
