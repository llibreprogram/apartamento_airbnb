# 🧪 Guía de Pruebas - Precios Dinámicos Integrados

## ✅ ¿Qué se Implementó?

Ahora cuando creas o modificas una reserva, el sistema **automáticamente calcula el precio total** usando:
1. **Precios especiales** (seasonal prices) si están activos para esas fechas
2. **Precio base** de la propiedad si no hay precio especial

El cálculo itera **día por día** para aplicar el precio correcto a cada noche.

---

## 📋 Pasos para Probar

### 1️⃣ Preparación

```bash
# En Windows, ejecuta el acceso directo:
🏢 Apartamento Airbnb

# O manualmente:
cd C:\Users\Yulia\apartamento_airbnb
npm run dev

# Espera ~30 segundos y abre:
http://localhost:3000
```

**Login:**
- Email: `demo1761960285@apartamentos.com`
- Password: `DemoPass123`

---

### 2️⃣ Crear Precio Especial

1. Ve a **Propiedades** → Selecciona una propiedad
2. En la sección **"Precios Especiales"**, crea un precio:
   - **Nombre:** Temporada Alta Navidad
   - **Tipo:** HOLIDAY
   - **Precio por Noche:** 150 USD (ejemplo)
   - **Fecha Inicio:** 2025-12-20
   - **Fecha Fin:** 2026-01-05
   - **Activo:** ✅ Sí
3. Clic en **"Guardar Precio Especial"**

---

### 3️⃣ Crear Reserva CON Precio Especial

1. Ve a **Reservas** → Clic en **"Nueva Reserva"**
2. Selecciona la misma propiedad
3. Configura fechas:
   - **Check-in:** 2025-12-24 (dentro del rango)
   - **Check-out:** 2025-12-27 (dentro del rango)
   - **Huéspedes:** 2
4. Observa el campo **"Precio Total"** 

**✅ PRUEBA 1: Verifica que el precio calculado sea:**
```
3 noches × 150 USD = 450 USD
```

Si tu propiedad tiene precio base de 100 USD, debería:
- **ANTES:** 3 × 100 = 300 USD
- **AHORA:** 3 × 150 = 450 USD ✅

---

### 4️⃣ Crear Reserva SIN Precio Especial (Precio Base)

1. Crea otra reserva en fechas **fuera del rango**:
   - **Check-in:** 2026-02-10
   - **Check-out:** 2026-02-13
   - **Huéspedes:** 2

**✅ PRUEBA 2: Verifica que use el precio base:**
```
3 noches × 100 USD = 300 USD
```

---

### 5️⃣ Crear Reserva que Abarca Ambos Períodos

1. Crea una reserva que cruza fechas con y sin precio especial:
   - **Check-in:** 2025-12-30 (con precio especial)
   - **Check-out:** 2026-01-08 (parte con, parte sin)

**✅ PRUEBA 3: Verifica cálculo día por día:**
```
Dec 30: 150 USD (especial)
Dec 31: 150 USD (especial)
Jan 1:  150 USD (especial)
Jan 2:  150 USD (especial)
Jan 3:  150 USD (especial)
Jan 4:  150 USD (especial)
Jan 5:  150 USD (especial)
─────────────────
Jan 6:  100 USD (base)
Jan 7:  100 USD (base)

TOTAL: (7 × 150) + (2 × 100) = 1,050 + 200 = 1,250 USD
```

---

### 6️⃣ Verificar en Reportes Financieros

1. Ve a **Reportes Financieros**
2. Genera reporte para el mes de **Diciembre 2025**
3. Selecciona la propiedad que tiene las reservas

**✅ PRUEBA 4: Verifica que los ingresos sumen correctamente:**
- Debe incluir las reservas con precios dinámicos
- El **Gross Income** debe reflejar los precios especiales

---

## 🔍 Cómo Verificar en la Base de Datos

Si quieres verificar directamente en PostgreSQL:

```sql
-- Ver reservas con sus precios
SELECT 
  id,
  propertyId,
  checkIn,
  checkOut,
  totalPrice,
  status
FROM reservations
ORDER BY checkIn DESC
LIMIT 10;

-- Ver precios especiales activos
SELECT 
  name,
  pricePerNight,
  startDate,
  endDate,
  type,
  isActive
FROM seasonal_prices
WHERE isActive = true;
```

---

## 🐛 Errores Comunes

### Error: "totalPrice is undefined"
**Causa:** Backend no calculó el precio
**Solución:** Verifica que backend está corriendo y usa el commit más reciente

### Error: Precio no cambia con seasonal price
**Causa:** 
1. El precio especial no está activo (`isActive = false`)
2. Las fechas no se superponen
3. Backend no se reinició después del pull

**Solución:**
```bash
# Reiniciar backend
cd C:\Users\Yulia\apartamento_airbnb
# Cerrar ventana de backend y ejecutar de nuevo
npm run dev
```

---

## ✅ Checklist de Pruebas

- [ ] Precio especial creado correctamente
- [ ] Reserva con precio especial calcula 150 USD/noche
- [ ] Reserva sin precio especial calcula 100 USD/noche (base)
- [ ] Reserva que cruza períodos calcula día por día
- [ ] Reportes financieros suman correctamente con precios dinámicos
- [ ] Modificar fechas de reserva recalcula el precio automáticamente

---

## 📝 Logs para Debugging

Si algo falla, revisa los logs del backend:

**Windows:**
- Ve a la ventana minimizada: "Backend - Apartamento Airbnb"
- Busca errores en rojo

**O revisa el archivo de logs:**
```bash
type C:\Users\Yulia\apartamento_airbnb\errores.txt
```

---

## 🎉 Resultado Esperado

Después de estas pruebas, deberías ver:

1. ✅ Reservas calculan precios dinámicos automáticamente
2. ✅ Precios especiales se aplican correctamente por fecha
3. ✅ Reportes financieros reflejan ingresos con precios dinámicos
4. ✅ Sistema es transparente: el usuario ve el precio calculado

---

## 🚀 Próximos Pasos

Una vez validadas las pruebas:

1. **Documentar** los resultados de las pruebas
2. **Actualizar** README.md con información de precios dinámicos
3. **Considerar** agregar indicador visual en frontend que muestre:
   - "Precio aplicado: Especial (150 USD/noche)"
   - "Precio aplicado: Base (100 USD/noche)"

---

**Última actualización:** 8 de Noviembre, 2025  
**Commit:** eec5c6c
