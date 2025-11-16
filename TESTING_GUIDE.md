# 🧪 Scripts de Testing

Este directorio contiene varios scripts para facilitar el testing del sistema.

## 📋 Scripts Disponibles

### 1. `test-automatico.sh` - Test Automático End-to-End ⚡

**Propósito:** Ejecuta tests automáticos de la API backend verificando todos los endpoints principales.

**Qué hace:**
- ✅ Verifica que backend y frontend estén corriendo
- ✅ Prueba autenticación (login)
- ✅ Lista y obtiene detalles de propiedades
- ✅ Lista y obtiene detalles de reservas  
- ✅ Verifica gastos y resumen de electricidad
- ✅ Prueba reportes financieros
- ✅ Verifica acceso a Swagger docs

**Uso:**
```bash
./test-automatico.sh
```

**Salida:**
- Muestra cada test con ✅ (pasó) o ❌ (falló)
- Resume tests pasados/fallidos
- Calcula tasa de éxito
- Exit code 0 si todo OK, 1 si hay fallos

**Tiempo:** ~5-10 segundos

---

### 2. `run-test.sh` - Verificación de Servicios 🔍

**Propósito:** Verifica que los servicios necesarios estén corriendo antes de ejecutar tests.

**Qué hace:**
- ✅ Verifica backend en puerto 3001
- ✅ Verifica frontend en puerto 3000
- ✅ Verifica conexión a base de datos

**Uso:**
```bash
./run-test.sh
```

**Salida:**
- Muestra estado de cada servicio
- Exit code 0 si todo OK, 1 si algo falta

**Tiempo:** ~2 segundos

---

### 3. `TEST_MANUAL_COMPLETO.md` - Guía de Test Manual 📋

**Propósito:** Guía paso a paso para test manual exhaustivo de toda la aplicación.

**Contenido:**
- 7 fases de testing completas
- Checklist detallado para cada funcionalidad
- Caso de uso real (gestión mensual de apartamento)
- Sección para documentar bugs
- Checklist final de verificación

**Uso:**
```bash
# Abrir en tu editor favorito
code TEST_MANUAL_COMPLETO.md
# o
cat TEST_MANUAL_COMPLETO.md
```

**Tiempo:** 45-60 minutos

---

### 4. `TEST_RAPIDO.md` - Test Rápido de Funcionalidades Clave ⚡

**Propósito:** Checklist rápido enfocado en las funcionalidades más críticas.

**Contenido:**
- 5 fases principales
- Verificaciones críticas
- Enfocado en flujo de electricidad y PDF
- Métricas de éxito

**Uso:**
```bash
# Abrir en tu editor favorito
code TEST_RAPIDO.md
```

**Tiempo:** 15 minutos

---

## 🚀 Workflow Recomendado

### Desarrollo Diario

```bash
# 1. Iniciar servicios
npm run dev

# 2. Esperar a que arranquen (10-15 segundos)

# 3. Verificar que todo esté OK
./run-test.sh

# 4. Ejecutar test automático
./test-automatico.sh

# 5. Si todo pasa, empezar a trabajar
```

### Antes de Commit

```bash
# 1. Ejecutar test automático
./test-automatico.sh

# 2. Si pasa, hacer commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push
git push origin master
```

### Después de Merge Importante

```bash
# 1. Test automático
./test-automatico.sh

# 2. Test rápido manual (15 min)
# Seguir TEST_RAPIDO.md

# 3. Si hay tiempo, test completo (60 min)
# Seguir TEST_MANUAL_COMPLETO.md
```

### Antes de Release

```bash
# 1. Test automático
./test-automatico.sh

# 2. Test manual completo
# Seguir TEST_MANUAL_COMPLETO.md

# 3. Documentar resultados
# Actualizar sección de "Resultado Final" en TEST_MANUAL_COMPLETO.md
```

---

## 📊 Interpretación de Resultados

### Test Automático

**100% de éxito:**
```
🎉 ¡TODOS LOS TESTS PASARON!
✅ Sistema funcionando correctamente
```
→ Sistema listo para usar

**78-99% de éxito:**
```
⚠️  ALGUNOS TESTS FALLARON
✅ Tests pasados: 11
❌ Tests fallidos: 3
```
→ Revisar warnings, pueden ser normales (datos vacíos)

**< 78% de éxito:**
```
❌ Tests pasados: 8
❌ Tests fallidos: 6
```
→ Problemas serios, revisar logs del backend

---

## 🐛 Troubleshooting

### Test falla: "Backend no responde"

```bash
# Verificar que el backend esté corriendo
lsof -i :3001

# Si no está, iniciarlo
npm run backend:dev
```

### Test falla: "Frontend no responde"

```bash
# Verificar que el frontend esté corriendo
lsof -i :3000

# Si no está, iniciarlo
npm run frontend:dev
```

### Test falla: "Login falló"

```bash
# Verificar credenciales en backend
psql -U postgres -d apartamento_airbnb -c "SELECT email FROM users WHERE email='demo1761960285@apartamentos.com';"

# Si no existe el usuario, ejecutar seed
npm run seed
```

### Test falla: "No se encontraron propiedades"

```bash
# La base de datos está vacía, ejecutar seed
cd backend
npm run seed
```

---

## 🔧 Personalización

### Cambiar credenciales de test

Edita `test-automatico.sh`:

```bash
# Líneas 11-12
EMAIL="tu_email@ejemplo.com"
PASSWORD="tu_password"
```

### Agregar más tests

Edita `test-automatico.sh` y agrega tests siguiendo el patrón:

```bash
# Test X: Descripción
RESPONSE=$(api_call "GET" "/tu-endpoint" "" "$TOKEN")
VALOR=$(echo $RESPONSE | grep -o '"campo":"[^"]*"' | cut -d'"' -f4)

if [ -n "$VALOR" ]; then
    print_result 0 "Tu test pasó"
else
    print_result 1 "Tu test falló"
fi
```

---

## 📝 Notas

- Los tests automáticos NO modifican datos en la BD
- Los tests manuales SÍ pueden crear/editar/eliminar datos
- Ejecuta `npm run seed` si necesitas resetear los datos de prueba
- Los scripts requieren `bash`, `curl` y `grep` (disponibles por defecto en Linux/macOS)

---

## 🎯 Objetivos de Cobertura

| Área | Test Auto | Test Manual | Objetivo |
|------|-----------|-------------|----------|
| Autenticación | ✅ | ✅ | 100% |
| Propiedades | ✅ | ✅ | 100% |
| Reservas | ✅ | ✅ | 100% |
| Gastos | ✅ | ✅ | 100% |
| Electricidad | ✅ | ✅ | 100% |
| Reportes | ⚠️ | ✅ | 100% |
| PDF Export | ❌ | ✅ | Manual |

**Leyenda:**
- ✅ Cubierto
- ⚠️ Parcialmente cubierto  
- ❌ No cubierto (requiere UI)

---

**Última actualización:** 16 de Noviembre, 2025
