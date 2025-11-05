# ❓ FAQ y Troubleshooting

## Preguntas Frecuentes

### General

**P: ¿Cuánto tiempo toma implementar la MVP?**
R: Con un equipo de 2-3 desarrolladores, aproximadamente 3-4 meses de desarrollo activo.

**P: ¿Qué habilidades necesito para trabajar en este proyecto?**
R: TypeScript, Node.js/NestJS, React, PostgreSQL, y conocimiento básico de REST APIs.

**P: ¿Puedo usar esta aplicación para otros tipos de alquileres?**
R: Sí, es genérica y puede adaptarse a hoteles, casas vacacionales, oficinas, etc.

**P: ¿Qué pasa si mi proveedor de hosting falla?**
R: Implementa backup automatizado a AWS S3 o similar, y ten un plan de recuperación.

### Arquitectura

**P: ¿Por qué NestJS y no Express?**
R: NestJS ofrece estructura empresarial, inyección de dependencias, y mejor escalabilidad que Express puro.

**P: ¿Necesito usar TypeORM o puedo usar Prisma?**
R: Prisma es excelente alternativa, más moderno y con mejor DX. Migración es viable en futuro.

**P: ¿Puedo agregar microservicios?**
R: En Fase 2 sí, separando Financials en servicio independiente.

**P: ¿Qué tan grande puede escalar la BD?**
R: Con índices adecuados, fácilmente a 10,000+ propiedades y millones de transacciones.

### Desarrollo

**P: ¿Cómo agrego una nueva entidad?**
R: Ver sección "Crear un Nuevo Módulo" en DEVELOPMENT.md

**P: ¿Cómo hago testing?**
R: Usar Jest para backend, vitest para frontend. Ver ejemplos en DEVELOPMENT.md

**P: ¿Puedo usar MongoDB en lugar de PostgreSQL?**
R: No recomendado para datos financieros. PostgreSQL es mejor para integridad transaccional.

**P: ¿Necesito Redis para MVP?**
R: No, pero mejora performance de dashboards significativamente.

### Seguridad

**P: ¿Cómo protejo datos de propietarios?**
R: Implementar encriptación AES-256, RBAC estricto, y auditoría completa. Ver POLICIES.md

**P: ¿Qué pasa si alguien obtiene el JWT?**
R: JWT expira en 24h. Implementa refresh tokens y invalidación en BD si es necesario.

**P: ¿Debo usar HTTPS?**
R: Obligatorio en producción. Usa Let's Encrypt (gratuito).

**P: ¿Cómo manejo datos sensibles de tarjetas?**
R: NUNCA guardes números de tarjeta. Usa Stripe/Wise para tokenización.

### Integraciones

**P: ¿Puedo sincronizar con Airbnb automáticamente?**
R: Airbnb tiene limitaciones. Recomiendo empezar con import manual/CSV. Ver INTEGRATIONS.md

**P: ¿Qué tan difícil es integrar Stripe?**
R: Relativamente simple. Documentación es excelente. Incluye ejemplo en INTEGRATIONS.md

**P: ¿Cómo envío emails?**
R: Usa SendGrid (recomendado) o Gmail SMTP. Ver ejemplos en INTEGRATIONS.md

---

## Troubleshooting

### Backend Issues

#### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar PostgreSQL está corriendo
psql -U postgres -c "SELECT 1;"

# Si falla, iniciar PostgreSQL
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start PostgreSQL14
```

#### Error: "Port 3001 already in use"

**Solución:**
```bash
# Encontrar proceso usando puerto
# macOS/Linux
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

#### Error: "JWT token expired"

**Solución:**
- Implementar refresh token endpoint
- Cliente debe pedir nuevo token antes de expirar
- Revisar `JWT_EXPIRATION` en `.env`

```typescript
@Post('auth/refresh-token')
async refreshToken(@Body() dto: { refreshToken: string }) {
  return this.authService.refreshToken(dto.refreshToken);
}
```

#### Error: "TypeORM entity not found"

**Solución:**
- Verificar que la entidad está registrada en `TypeOrmModule.forFeature([])`
- Verificar import path correcto
- Asegurarse que archivo termina en `.entity.ts`

```typescript
// En module
@Module({
  imports: [TypeOrmModule.forFeature([Property, Reservation])],
  // ...
})
```

#### Error: "CORS policy blocked"

**Solución:**
```typescript
// En main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Frontend Issues

#### Error: "Cannot find module '@/services'"

**Solución:**
- Verificar alias en `tsconfig.json`
- Verificar ruta existe
- Reiniciar dev server

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```

#### Error: "API call returns 401"

**Solución:**
```typescript
// Verificar token en localStorage
console.log(localStorage.getItem('token'));

// Si no existe, redirigir a login
if (!token) {
  navigate('/login');
}

// Si existe pero 401, probablemente expiró
// Implementar logout automático
```

#### Error: "Tailwind styles not loading"

**Solución:**
```bash
# Reinstalar Tailwind
npm install -D tailwindcss postcss autoprefixer

# Verificar tailwind.config.js existe
# Verificar @tailwind directives en index.css
```

#### Error: "Charts (Recharts) not rendering"

**Solución:**
```bash
# Instalar dependencia
npm install recharts

# Verificar que ResponsiveContainer tiene width
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

### Database Issues

#### Error: "Column does not exist"

**Solución:**
```bash
# Verificar migrations ejecutadas
npm run migration:show

# Ejecutar pending migrations
npm run migration:run

# Si falta, crear migration
npm run migration:create -- CreatePropertyTable
```

#### Error: "Duplicate entry for unique constraint"

**Solución:**
```typescript
// Verificar constraint en entidad
@Column({ unique: true })
email: string;

// Eliminar datos duplicados
DELETE FROM users WHERE email = 'duplicate@example.com';

// O manejar en código
try {
  await this.repo.save(user);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    throw new ConflictException('Email already exists');
  }
}
```

#### Error: "Foreign key constraint failed"

**Solución:**
```typescript
// Verificar que relación existe
@ManyToOne(() => Property)
@JoinColumn({ name: 'property_id' })
property: Property;

// Verificar referencia al guardar
const reservation = this.repo.create({
  propertyId: propertyId, // Debe existir en propiedades
  guestName: 'John',
  // ...
});
```

### Performance Issues

#### Dashboard cargando lentamente

**Solución:**
```bash
# Agregar índices
ALTER TABLE reservations ADD INDEX idx_property_date (property_id, created_at);
ALTER TABLE expenses ADD INDEX idx_category (category);

# Implementar caché
npm install redis
```

```typescript
// Caché resultados
@Cacheable('dashboard:stats', 300) // 5 minutos
async getDashboardStats() {
  // ...
}
```

#### API responses lentas

**Solución:**
- Agregar paginación a endpoints que retornan listas
- Usar select específico de columnas
- Implementar lazy loading en frontend

```typescript
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
  return this.service.findAll(page, limit);
}
```

### Deployment Issues

#### Error: "Cannot find module in production"

**Solución:**
```bash
# Asegurarse que build pasó
npm run build

# Verificar que node_modules incluye todas dependencias
npm ci --omit=dev

# En Docker, usar multi-stage build
```

#### Error: "Database connection fails in production"

**Solución:**
```env
# Verificar credentials
DB_HOST=production-db.example.com
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=strong-password

# Verificar SSL
DB_SSL=true
```

#### Error: "Environment variables not loading"

**Solución:**
```bash
# Asegurarse que .env existe en servidor
# O pasar variables vía process

# En PM2
pm2 ecosystem.config.js

# En Docker
docker run --env-file .env my-app
```

#### Aplicación se reinicia constantemente

**Solución:**
```bash
# Verificar logs
npm run start:prod 2>&1 | tee app.log

# Usar PM2 para monitoreo
pm2 start dist/main.js --name "apartamentos-api"
pm2 logs
```

---

## Checklist de Debugging

### Antes de reportar bug:

- [ ] ¿El error es reproducible consistentemente?
- [ ] ¿Qué versión de Node.js estás usando?
- [ ] ¿Git status está limpio (sin cambios no commitados)?
- [ ] ¿Reinstalaste dependencias? (`rm -rf node_modules && npm install`)
- [ ] ¿Limpiaste caché? (`npm cache clean --force`)
- [ ] ¿Los tests pasan? (`npm test`)
- [ ] ¿Revisaste los logs de error? (console, docker logs, etc.)
- [ ] ¿La issue ya existe en GitHub?

### Al reportar bug:

1. **Título descriptivo:** `[Backend] JWT validation fails on expired tokens`
2. **Pasos para reproducir:** Lista exacta de acciones
3. **Comportamiento esperado:** Qué debería pasar
4. **Comportamiento actual:** Qué pasó
5. **Evidencia:** Logs, screenshots, stack trace
6. **Ambiente:** Node version, OS, etc.

---

## Recursos Útiles

### Documentación Oficial
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

### Herramientas
- [Postman](https://www.postman.com) - Testing API
- [DBeaver](https://dbeaver.io) - SQL Cliente
- [pgAdmin](https://www.pgadmin.org) - PostgreSQL GUI
- [VS Code](https://code.visualstudio.com) - Editor

### Comunidades
- [NestJS Discord](https://discord.gg/nestjs)
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com)

---

**Última actualización:** Octubre 2025
