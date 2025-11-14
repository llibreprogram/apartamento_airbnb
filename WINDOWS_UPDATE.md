# 🔄 Scripts de Actualización Automática (Windows)

## Archivos Incluidos

### 📄 `actualizar.bat` (Recomendado)
Script simple de doble-clic para actualizar el sistema.

**Uso:**
1. Haz doble clic en `actualizar.bat`
2. Espera a que termine la actualización
3. ¡Listo! El sistema se reiniciará automáticamente

### 📄 `update-windows.ps1`
Script PowerShell completo con más opciones y mensajes detallados.

**Uso desde PowerShell:**
```powershell
.\update-windows.ps1
```

## 🚀 Instalación Inicial

### Paso 1: Clonar el repositorio (solo primera vez)
```powershell
cd C:\Users\Yulia
git clone https://github.com/llibreprogram/apartamento_airbnb.git
cd apartamento_airbnb
```

### Paso 2: Configurar Git
```powershell
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

### Paso 3: Instalar dependencias (solo primera vez)
```powershell
# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
```

## 📋 Uso Diario

### Opción 1: Doble clic (Más fácil)
1. Abre el explorador de Windows
2. Navega a `C:\Users\Yulia\apartamento_airbnb`
3. Haz doble clic en `actualizar.bat`

### Opción 2: Desde PowerShell
```powershell
cd C:\Users\Yulia\apartamento_airbnb
.\update-windows.ps1
```

### Opción 3: Crear acceso directo en el Escritorio
1. Click derecho en `actualizar.bat`
2. Seleccionar "Crear acceso directo"
3. Mover el acceso directo al Escritorio
4. Ahora puedes actualizar con doble clic desde el escritorio

## 🔧 Lo que hace el script automáticamente

1. ✅ Guarda tus cambios locales (git stash)
2. ✅ Descarga los últimos cambios desde GitHub
3. ✅ Aplica las actualizaciones
4. ✅ Detiene los procesos anteriores
5. ✅ Reinicia Backend (puerto 3001)
6. ✅ Reinicia Frontend (puerto 3000)

## ⚠️ Requisitos

- Git instalado en Windows
- Node.js instalado
- Conexión a Internet
- Acceso al repositorio en GitHub

## 🐛 Solución de Problemas

### Error: "No se puede ejecutar scripts"
Si ves un error sobre políticas de ejecución:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "No se encuentra git"
Instala Git para Windows desde: https://git-scm.com/download/win

### Error: "No se puede conectar a GitHub"
- Verifica tu conexión a Internet
- Verifica que tienes acceso al repositorio
- Asegúrate de tener configuradas las credenciales de Git

### Los servicios no inician
- Espera 10-15 segundos después de la actualización
- Verifica que los puertos 3000 y 3001 estén libres
- Revisa las ventanas minimizadas de PowerShell para ver los logs

## 📞 Soporte

Si tienes problemas, contacta al equipo de desarrollo:
- Email: haciendallibre@gmail.com
- GitHub Issues: https://github.com/llibreprogram/apartamento_airbnb/issues

## 🔐 Seguridad

**IMPORTANTE:** No compartas este archivo si contiene credenciales. Los scripts actuales usan Git SSH/HTTPS que ya tiene configuradas las credenciales en tu máquina.

## 📝 Notas

- El script guarda tus cambios locales automáticamente (git stash)
- Si hay conflictos, el script te alertará
- Los servicios se inician en ventanas minimizadas
- Puedes cerrar las ventanas de PowerShell después de que inicien los servicios

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0
