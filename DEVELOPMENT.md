# 🎓 Guía de Desarrollo

## Primeros Pasos

### 1. Setup Inicial

```bash
# Clonar repositorio
git clone <repo-url>
cd apartamento_airbnb

# Instalar todas las dependencias
npm install

# Copiar archivos .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configurar PostgreSQL
createdb apartamento_airbnb
```

### 2. Configurar Backend

Editar `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=apartamento_airbnb
JWT_SECRET=dev-secret-key-change-in-prod
NODE_ENV=development
PORT=3001
```

### 3. Iniciar Aplicación

```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run frontend:dev

# O ambas en paralelo
npm run dev
```

Acceso:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs

## Estructura de Commits

Usa conventional commits para mantener historial limpio:

```bash
# Feature
git commit -m "feat: agregar autenticación JWT"

# Bug fix
git commit -m "fix: corregir cálculo de comisión"

# Documentación
git commit -m "docs: actualizar README"

# Tests
git commit -m "test: agregar tests para auth service"
```

## Crear un Nuevo Módulo

### Backend: Agregar módulo de Notificaciones

1. **Generar estructura:**
```bash
cd backend
nest g module modules/notifications
nest g controller modules/notifications
nest g service modules/notifications
```

2. **Crear entities:**
```typescript
// src/modules/notifications/entities/notification.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
```

3. **Crear DTOs:**
```typescript
// src/modules/notifications/dto/create-notification.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
```

4. **Implementar Service:**
```typescript
// src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    const notification = this.repo.create({
      userId,
      ...dto,
    });
    return this.repo.save(notification);
  }

  async findAll(userId: string) {
    return this.repo.find({ where: { userId } });
  }

  async markAsRead(id: string) {
    return this.repo.update(id, { read: true });
  }
}
```

5. **Implementar Controller:**
```typescript
// src/modules/notifications/notifications.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateNotificationDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}
```

6. **Registrar módulo:**
```typescript
// src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

7. **Agregar a AppModule:**
```typescript
// src/app.module.ts
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    // ... otros módulos
    NotificationsModule,
  ],
})
export class AppModule {}
```

## Buenas Prácticas

### 1. Validación de Datos
Siempre usa DTOs con validadores:
```typescript
export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsNumber()
  @Min(1)
  bedrooms: number;

  @IsEnum(PropertyType)
  type: PropertyType;
}
```

### 2. Manejo de Errores
```typescript
@Post()
async create(@Body() dto: CreatePropertyDto) {
  try {
    return await this.service.create(dto);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new BadRequestException('Property already exists');
    }
    throw new InternalServerErrorException();
  }
}
```

### 3. Logging
```typescript
import { Logger } from '@nestjs/common';

export class PropertyService {
  private logger = new Logger(PropertyService.name);

  async create(dto: CreatePropertyDto) {
    this.logger.log(`Creating property: ${dto.name}`);
    // ...
    this.logger.error('Error creating property', error.stack);
  }
}
```

### 4. Testing Básico
```typescript
// properties.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertiesService],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a property', async () => {
    const dto = { name: 'Test', bedrooms: 2 };
    const result = await service.create(dto);
    expect(result.name).toBe('Test');
  });
});
```

### 5. Usar Decoradores de Roles
```typescript
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

## Trabaja con el Frontend

### Crear un Nuevo Hook

```typescript
// frontend/src/hooks/useProperties.ts
import { useState, useEffect } from 'react';
import { propertyService } from '@/services/propertyService';

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { properties, loading, error, reload: loadProperties };
};
```

### Crear un Componente

```typescript
// frontend/src/components/PropertyCard.tsx
interface PropertyCardProps {
  property: Property;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="font-bold text-lg">{property.name}</h3>
      <p className="text-gray-600">{property.address}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="px-4 py-2 bg-blue-500 text-white rounded">
          Editar
        </button>
        <button onClick={onDelete} className="px-4 py-2 bg-red-500 text-white rounded">
          Eliminar
        </button>
      </div>
    </div>
  );
};
```

## Comandos Útiles

```bash
# Backend
npm run lint          # Ejecutar linter
npm run format        # Formatear código
npm run test          # Ejecutar tests
npm run test:cov      # Tests con cobertura

# Frontend
npm run build         # Build producción
npm run test          # Tests

# General
npm run dev           # Desarrollo
npm run build         # Build ambas aplicaciones
```

## Resolución de Problemas

### Error: "Cannot find module '@nestjs/core'"
```bash
cd backend
npm install
```

### Error: "Port 3001 already in use"
```bash
# Linux/Mac: encontrar proceso
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: "Connection to database failed"
```bash
# Verificar PostgreSQL está corriendo
psql -U postgres -c "SELECT 1;"

# Crear base de datos si no existe
createdb apartamento_airbnb
```

### Frontend no conecta a Backend
- Verificar que Backend corre en http://localhost:3001
- Revisar CORS en `backend/src/main.ts`
- Verificar `frontend/.env` tiene URL correcta

## Recursos

- [NestJS Docs](https://docs.nestjs.com)
- [React Docs](https://react.dev)
- [TypeORM Docs](https://typeorm.io)
- [Tailwind CSS](https://tailwindcss.com)

---

**Última actualización:** Octubre 2025
