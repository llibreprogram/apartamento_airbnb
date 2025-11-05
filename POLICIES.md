# 📋 Requerimientos y Políticas de Desarrollo

## Estándares de Código

### TypeScript
- ✅ `strict: true` en tsconfig
- ✅ Sin tipos `any` (a menos que sea absolutamente necesario)
- ✅ Interfaces explícitas para objetos complejos
- ✅ Use tipos genéricos para collections

### Naming Conventions
- **Componentes React:** PascalCase (`PropertyCard.tsx`)
- **Archivos/Carpetas:** kebab-case (`property-service.ts`)
- **Variables/Funciones:** camelCase (`getProperties()`)
- **Constantes:** UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Interfaces:** PascalCase con prefijo `I` o sin prefijo (`Property`)

### Estructura de Archivos
```
feature/
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/
│   └── feature.entity.ts
├── feature.service.spec.ts
└── guards/ (si es necesario)
```

## Validación

### Backend - Validación de DTOs
Siempre usar `class-validator`:
```typescript
export class CreatePropertyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  bedrooms: number;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### Frontend - Validación de Formularios
```typescript
export const propertySchema = z.object({
  name: z.string().min(3).max(100),
  bedrooms: z.number().min(1).max(10),
  type: z.enum(['apartment', 'house']),
});
```

## Autenticación y Autorización

### Roles Permitidos
- `admin`: Acceso total
- `owner`: Acceso a propias propiedades

### Guards Obligatorios
```typescript
@UseGuards(JwtAuthGuard)      // Siempre en endpoints protegidos
@UseGuards(RolesGuard)        // Cuando es necesario validar rol
@Roles('admin')               // Especificar roles requeridos
```

### Tokens JWT
- **Expiración:** 24 horas (configurable)
- **Refresh:** Implementar refresh tokens
- **Secreto:** Almacenar en `process.env.JWT_SECRET`

## Seguridad

### Encriptación
- ✅ Contraseñas: `bcryptjs` (10 rondas)
- ✅ Datos sensibles: AES-256 (futuro)
- ✅ Almacenar keys en `.env`

### Validación
- ✅ Validar TODOS los inputs
- ✅ Sanitizar strings
- ✅ Rate limiting en endpoints públicos
- ✅ CORS configurado correctamente

### Base de Datos
- ✅ Usar prepared statements (ORM hace esto)
- ✅ No concatenar strings en queries
- ✅ Encryptar datos sensibles en BD

## Testing

### Cobertura Mínima
- **Servicios:** >80% cobertura
- **Controllers:** >70% cobertura
- **Utils:** 100% cobertura

### Obligatorio Testear
- Lógica de cálculos financieros (100%)
- Autenticación y autorización (100%)
- Validación de datos (100%)

### Ejemplo de Test
```typescript
describe('FinancialsService.calculateROI', () => {
  it('should calculate correct ROI', async () => {
    const result = service.calculateROI({
      grossIncome: 1000,
      expenses: 200,
    });
    expect(result).toBe(0.8); // 80%
  });

  it('should handle edge case with zero income', () => {
    expect(() => {
      service.calculateROI({
        grossIncome: 0,
        expenses: 100,
      });
    }).toThrow();
  });
});
```

## Documentación

### Comentarios en Código
```typescript
/**
 * Calcula la rentabilidad bruta de una propiedad
 * @param property - Propiedad a analizar
 * @param period - Período en formato YYYY-MM
 * @returns ROI en porcentaje (0-100)
 * @throws BadRequestException si los parámetros son inválidos
 */
calculateROI(property: Property, period: string): number {
  // implementación
}
```

### Swagger Documentation
```typescript
@Get()
@ApiOperation({ summary: 'Get all properties' })
@ApiResponse({ status: 200, description: 'List of properties' })
async getAll() {
  return this.service.findAll();
}
```

### README.md
- ✅ Debe existir en cada carpeta principal
- ✅ Incluir estructura, instalación, y uso
- ✅ Mantener actualizado

## Performance

### Paginated Endpoints
```typescript
@Get()
async findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
  return this.service.findAll(page, limit);
}
```

### Índices en BD
```typescript
@Entity()
export class Property {
  @Index()
  @Column()
  ownerId: string;

  @Index()
  @Column()
  createdAt: Date;
}
```

### Caché (Redis - Futuro)
```typescript
@Cacheable('properties:all', 60) // TTL 60 segundos
async getAllProperties() {
  return this.repo.find();
}
```

## Versionado de API

### URL Structure
```
/api/v1/properties        # Versión 1
/api/v2/properties        # Versión 2 (futuro)
```

### Backward Compatibility
- No eliminar endpoints deprecated en semanas
- Dar advertencia en respuestas
- Incluir `Deprecation` header

## Deploy

### Pre-deployment Checks
```bash
npm run lint              # Sin errores
npm run test              # 100% tests pasan
npm run build             # Build exitoso
```

### Variables de Entorno (Producción)
```env
NODE_ENV=production
DB_HOST=prod-db.example.com
DB_PASSWORD=strong-password-changed
JWT_SECRET=long-random-secret
CORS_ORIGIN=https://app.example.com
```

## Commits y Versionado

### Conventional Commits
```
feat(properties): add filtering by location
fix(auth): correct JWT expiration issue
docs(readme): update installation steps
test(financials): add ROI calculation tests
refactor(reservations): simplify conflict detection
```

### Versioning (Semantic)
- MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

## Revisión de Código (Code Review)

### Checklist
- [ ] Código sigue estándares del proyecto
- [ ] Tests incluidos y pasan
- [ ] Documentación actualizada
- [ ] No hay logs de debug
- [ ] Manejo de errores apropiado
- [ ] Sin datos sensibles hardcodeados

## Workflow de Git

```bash
# 1. Crear rama
git checkout -b feat/new-feature

# 2. Hacer commits
git commit -m "feat: add new feature"

# 3. Push a rama
git push origin feat/new-feature

# 4. Crear Pull Request
# 5. Code review
# 6. Merge a develop
# 7. Deploy a staging

# Release
git checkout develop
git pull
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Version 1.2.0"
git push origin develop main v1.2.0
```

## Políticas de Datos Financieros

### Auditoría Obligatoria
- ✅ Registrar QUIÉN hizo cambios
- ✅ CUÁNDO se realizaron
- ✅ QUÉ cambió
- ✅ Valor anterior y nuevo

### Immutabilidad
- Gastos/ingresos pasados: Solo lectura
- Correcciones: Crear transacción inversa
- Nunca eliminar registros (soft delete)

### Reconciliación
- Mensual: verificar cálculos vs banco
- Trimestral: auditoría completa
- Anual: revisión con contador

---

**Última actualización:** Octubre 2025
