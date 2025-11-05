# 🌐 Guía Rápida: Acceso Externo para Pruebas

Este documento explica cómo iniciar el entorno de desarrollo local y cómo exponer la aplicación a internet para que un usuario externo pueda probarla.

## Paso 1: Iniciar los Servidores Locales

Necesitarás **dos terminales separadas** para ejecutar el backend y el frontend.

### 1.1. Iniciar el Backend

En tu **primera terminal**, ejecuta:

```bash
cd /home/llibre/apartamento_airbnb/backend && npm run start:dev
```

✅ **Éxito:** Deberías ver un mensaje como:
```
[Nest] ... Nest application successfully started...
✨ Server running on port 3001
```

⚠️ **Deja esta terminal abierta** - El backend debe seguir corriendo

---

### 1.2. Iniciar el Frontend

En tu **segunda terminal**, ejecuta:

```bash
cd /home/llibre/apartamento_airbnb/frontend && npm run dev
```

✅ **Éxito:** Deberías ver un mensaje con:
```
VITE v4.5.14  ready in XXX ms

➜  Local:   http://localhost:3000
➜  Network: http://192.168.x.x:3000
```

⚠️ **Deja esta terminal abierta** - El frontend debe seguir corriendo

---

## Paso 2: Verificar que Todo Funciona Localmente

Antes de exponer a internet, verifica que ambos servidores responden:

```bash
# En una tercera terminal:
curl -s http://localhost:3000 | head -10
# Debería devolver HTML (la app está corriendo)

curl -s http://localhost:3001/api/auth/me
# Debería devolver un error sin token (es normal, indica que el backend funciona)
```

---

## Paso 3: Exponer el Frontend a Internet con Serveo.net

Una vez que ambos servidores estén corriendo correctamente, puedes crear el túnel.

### 3.1. Iniciar el Túnel

En una **tercera terminal**, ejecuta:

```bash
ssh -R 80:localhost:3000 serveo.net
```

> **Nota:** La primera vez que te conectes, es posible que te pregunte si quieres continuar con la conexión SSH. Escribe `yes` y presiona `Enter`.

---

### 3.2. Compartir la URL Pública

El comando anterior generará una URL pública en la terminal, algo como:

```
Forwarding HTTP traffic from https://ejemplo-aleatorio-123.serveo.net
```

**✅ Esa es la URL que debes compartir** con la persona que necesita probar la aplicación.

**Ejemplo completo de lo que verá en la terminal:**
```
[llibre@localhost] ~ $ ssh -R 80:localhost:3000 serveo.net
Forwarding HTTP traffic from https://mysterious-hawk-42.serveo.net
Forwarding HTTPS traffic from https://mysterious-hawk-42.serveo.net
Press Enter to confirm selection.
```

> Deja esta tercera terminal abierta para que el túnel siga funcionando.

---

## Paso 4: Pruebas de Acceso

### 4.1. Acceso Local
- **URL:** http://localhost:3000
- **Usuario:** demo1761960285@apartamentos.com
- **Contraseña:** DemoPass123

### 4.2. Acceso Externo
- **URL:** https://[tu-url-aleatorio].serveo.net
- **Usuario:** demo1761960285@apartamentos.com
- **Contraseña:** DemoPass123

---

## Paso 5: Cómo Detener Todo

Para detener todo y cerrar el túnel:

1. **Terminal 1 (Backend):** Presiona `Ctrl + C`
2. **Terminal 2 (Frontend):** Presiona `Ctrl + C`
3. **Terminal 3 (Túnel):** Presiona `Ctrl + C`

---

## 🔧 Troubleshooting

### ❌ Error: "Address already in use" en puerto 3000 o 3001

**Solución:** Mata los procesos anteriores
```bash
pkill -9 npm
pkill -9 node
sleep 2
# Luego reinicia los servidores
```

### ❌ La URL de Serveo.net no funciona

**Posibles causas:**
1. El túnel se cerró (verifica Terminal 3)
2. Los servidores locales se cayeron (verifica Terminales 1 y 2)
3. La URL tiene caracteres mal copiados

**Solución:** Reinicia el túnel en Terminal 3:
```bash
ssh -R 80:localhost:3000 serveo.net
```

### ❌ El frontend carga pero no puedo hacer login

**Solución:** Verifica que el backend está corriendo:
```bash
curl -s http://localhost:3001/api/auth/me
```

Si no responde, reinicia el backend en Terminal 1.

---

## 📋 Checklist Rápido

- [ ] Backend corriendo en Terminal 1 (`npm run start:dev`)
- [ ] Frontend corriendo en Terminal 2 (`npm run dev`)
- [ ] Acceso local funciona: http://localhost:3000
- [ ] Login funciona con demo1761960285@apartamentos.com / DemoPass123
- [ ] Túnel iniciado en Terminal 3 (`ssh -R 80:localhost:3000 serveo.net`)
- [ ] URL pública compartida con usuario externo
- [ ] Usuario externo puede acceder a https://[tu-url].serveo.net

---

## 💡 Tips Útiles

### Si necesitas más control sobre el puerto del frontend:

```bash
# En lugar de npm run dev, puedes especificar el puerto:
cd /home/llibre/apartamento_airbnb/frontend
npm run dev -- --port 3000
```

### Si quieres exponer el backend también:

En otra terminal:
```bash
ssh -R 3001:localhost:3001 serveo.net
```

Entonces podrías acceder al Swagger en:
```
https://[tu-url-aleatorio].serveo.net/api/docs
```

### Para monitorear la actividad del túnel:

El túnel mostrará en tiempo real todas las conexiones que pasen a través de él.

---

## 🎯 Resumen Rápido

```bash
# Terminal 1: Backend
cd /home/llibre/apartamento_airbnb/backend && npm run start:dev

# Terminal 2: Frontend  
cd /home/llibre/apartamento_airbnb/frontend && npm run dev

# Terminal 3: Túnel
ssh -R 80:localhost:3000 serveo.net

# Copiar la URL pública que aparezca en Terminal 3 ✅
```

---

**Última actualización:** 5 de Noviembre, 2025

**Contacto:** Para soporte contacta al equipo de desarrollo
