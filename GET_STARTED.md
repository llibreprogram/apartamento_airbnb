# 🚀 PRIMEROS PASOS - Comienza Aquí

Bienvenido al proyecto de **Gestión de Apartamentos en Alquiler Vacacional**. Este documento te guía a través de los próximos pasos.

---

## 📖 Lee Primero (Orden Recomendado)

```
1. Este archivo (GET STARTED.md)
2. README.md - Visión general del proyecto
3. EXECUTIVE_SUMMARY.md - Resumen estratégico
4. ARCHITECTURE.md - Cómo está organizado
5. DEVELOPMENT.md - Guía técnica para codificar
```

---

## ✅ Setup Inicial (15 minutos)

### Paso 1: Clonar y Entrar al Directorio
```bash
cd /home/llibre/apartamento_airbnb
```

### Paso 2: Instalar Dependencias
```bash
# Instalar en monorepo (instala backend y frontend automáticamente)
npm install
```

⏳ **Tiempo:** ~5 minutos (depende de conexión)

### Paso 3: Configurar Variables de Entorno

**Backend:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env si es necesario
cat backend/.env
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
# Generalmente no necesita cambios
```

### Paso 4: Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb apartamento_airbnb

# Verificar que existe
psql -l | grep apartamento
```

❓ **¿PostgreSQL no está instalado?**
- **macOS:** `brew install postgresql`
- **Linux (Ubuntu):** `sudo apt-get install postgresql postgresql-contrib`
- **Windows:** Descargar de [postgresql.org](https://postgresql.org)

### Paso 5: Iniciar Aplicación
```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run frontend:dev

# O ambas en paralelo
npm run dev
```

✨ **Listo!**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## 📚 Estructura del Proyecto

```
📁 /backend      - API REST (NestJS)
📁 /frontend     - Interfaz (React)
📄 README.md     - Descripción general
📄 ARCHITECTURE.md - Diseño técnico
📄 DEVELOPMENT.md - Guía para desarrollar
📄 POLICIES.md   - Estándares y mejores prácticas
📄 INTEGRATIONS.md - Guía de terceros (Stripe, etc)
📄 FAQ.md        - Preguntas y soluciones
```

Ver `PROJECT_STRUCTURE.md` para árbol completo.

---

## 🛠️ Crear tu Primer Feature

### Ejemplo: Agregar módulo de "Tarifas"

**1. Generar estructura (en backend):**
```bash
cd backend
nest g module modules/rates
nest g controller modules/rates
nest g service modules/rates
```

**2. Ver DEVELOPMENT.md sección "Crear un Nuevo Módulo"**

**3. Implementar lógica**

**4. Agregar tests**

**5. Commit y push**

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ambas aplicaciones
npm run backend:dev      # Solo backend
npm run frontend:dev     # Solo frontend

# Build
npm run build           # Build ambas para producción

# Testing
npm test                # Tests
npm run test:cov        # Con cobertura

# Linting
npm run lint            # Revisar código
npm run format          # Formatear código

# Database
npm run migration:create  -- NombreMigracion
npm run migration:run     # Ejecutar migraciones
npm run seed             # Popular BD con datos demo
```

---

## 🎯 Mapa de Trabajo

### Semana 1: Aprender Arquitectura
- [ ] Leer ARCHITECTURE.md
- [ ] Entender estructura de módulos
- [ ] Familiarizarse con DTOs y entidades
- [ ] Ejecutar setup inicial

### Semana 2: Primeros Tests
- [ ] Correr `npm test` backend
- [ ] Ejecutar aplicación en dev
- [ ] Navegar por Swagger docs
- [ ] Probar un endpoint manualmente

### Semana 3: Primer Feature
- [ ] Implementar un nuevo módulo pequeño
- [ ] Escribir tests
- [ ] Hacer commit con conventional commits
- [ ] Crear Pull Request

### Semana 4: Code Review
- [ ] Revisar código de compañeros
- [ ] Solicitar cambios
- [ ] Mergear a main
- [ ] Deploy a staging

---

## 🐛 Troubleshooting Común

### Error: "Cannot find module '@nestjs/core'"
```bash
cd backend
npm install
```

### Error: "Port 3001 already in use"
```bash
# Matar proceso en puerto
lsof -i :3001
kill -9 <PID>
```

### Error: "Cannot connect to database"
```bash
# Verificar PostgreSQL
psql -U postgres

# Crear BD si no existe
createdb apartamento_airbnb
```

### Error: React no ve cambios en CSS
```bash
# Reiniciar dev server
npm run frontend:dev
```

❓ **Más problemas?** Ver `FAQ.md`

---

## 📋 Checklist Pre-Desarrollo

Antes de comenzar a codificar, verifica:

- [ ] Git configurado (`git config --global user.name`)
- [ ] Node 18+ instalado (`node --version`)
- [ ] PostgreSQL corriendo (`psql --version`)
- [ ] Dependencies instaladas (`npm install`)
- [ ] `.env` configurado
- [ ] BD creada (`createdb apartamento_airbnb`)
- [ ] Backend arranca sin errores (`npm run backend:dev`)
- [ ] Frontend arranca sin errores (`npm run frontend:dev`)
- [ ] Puedes acceder a http://localhost:3000
- [ ] Puedes acceder a http://localhost:3001/api/docs

---

## 📞 Necesitas Ayuda?

### Documentación
1. **Preguntas técnicas:** `FAQ.md`
2. **Cómo codificar:** `DEVELOPMENT.md`
3. **Arquitectura:** `ARCHITECTURE.md`
4. **Estándares:** `POLICIES.md`
5. **Terceros:** `INTEGRATIONS.md`

### Recursos Online
- [NestJS Docs](https://docs.nestjs.com)
- [React Docs](https://react.dev)
- [TypeORM Docs](https://typeorm.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

### Equipo
- 💬 Slack/Discord del equipo
- 📧 Email a dev@example.com
- 🤝 Weekly standup (todos)

---

## 🎓 Plan de Aprendizaje (2 Semanas)

### Día 1-2: Familiarización
```
├─ Leer README.md (30 min)
├─ Leer ARCHITECTURE.md (1 hora)
├─ Setup local (30 min)
└─ Explorar código (1 hora)
```

### Día 3-4: NestJS
```
├─ Entender módulos (1 hora)
├─ Controllers y Services (1 hora)
├─ DTOs y Validación (1 hora)
└─ Crear primer endpoint (2 horas)
```

### Día 5-7: React
```
├─ Componentes básicos (1 hora)
├─ Hooks (useEffect, useState) (1 hora)
├─ Services y API calls (1 hora)
└─ Crear primer componente (2 horas)
```

### Día 8-10: Integración
```
├─ Conectar frontend a backend (2 horas)
├─ Crear feature completo (4 horas)
└─ Tests (2 horas)
```

### Día 11-14: Profundización
```
├─ Revisar código de otros (2 horas)
├─ Code reviews de PR (2 horas)
├─ Optimización (2 horas)
└─ Documentación (2 horas)
```

---

## 🚀 Tu Primer Commit

```bash
# 1. Crear rama
git checkout -b feat/first-feature

# 2. Hacer cambios
# ... code code code ...

# 3. Commit
git add .
git commit -m "feat(properties): add new feature"

# 4. Push
git push origin feat/first-feature

# 5. Crear Pull Request en GitHub
# Esperar code review
# Merge a develop
```

---

## 📊 Progreso del MVP

```
Fase 1: MVP (Semanas 1-16)

├─ Semana 1-4:   Autenticación + CRUD básico
├─ Semana 5-8:   Lógica de negocio + Financials
├─ Semana 9-12:  Reportes + Dashboards
├─ Semana 13-15: QA + Optimización
└─ Semana 16:    Deploy + Documentación

Status: ▰▰▰▱▱▱▱▱▱▱ 30%
```

---

## 🎁 Bonus: Scripts Útiles

**Crear script para development rápido:**

```bash
#!/bin/bash
# dev.sh
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
createdb apartamento_airbnb 2>/dev/null || true
npm run dev
```

**Uso:**
```bash
chmod +x dev.sh
./dev.sh
```

---

## ✨ Siguiente Paso

👉 **Lee ARCHITECTURE.md** para entender cómo está organizado el código

Luego, cuando estés listo para codificar, sigue **DEVELOPMENT.md**

---

## 📝 Notas Importantes

- ⚠️ **Nunca commitees `.env`** - Siempre usa `.env.example`
- 🔐 **Datos sensibles en variables de entorno** - Nunca hardcodear
- 📚 **Mantén documentación actualizada** - Cuando cambies cosas importantes
- 🧪 **Escribe tests** - Mínimo 80% de cobertura
- 💾 **Commits frecuentes** - Pequeños y atómicos
- 🔍 **Code reviews** - Aprende de otros

---

## 🎉 ¡Estás Listo!

Ya tienes todo para comenzar. 

**Próximo paso:** Abre `ARCHITECTURE.md` y comienza a aprender cómo el sistema está organizado.

Cualquier pregunta → Ver `FAQ.md` o pregunta en el equipo.

**¡Happy Coding!** 🚀

---

**Última actualización:** 30 de Octubre, 2025

**Contacto:** dev@example.com
