import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: string) {
    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      ownerId,
    });

    return this.propertiesRepository.save(property);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await this.propertiesRepository.findAndCount({
      skip,
      take: limit,
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: properties,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    return property;
  }

  async findByOwner(ownerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await this.propertiesRepository.findAndCount({
      where: { ownerId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: properties,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto, ownerId: string) {
    const property = await this.findOne(id);

    // Verificar que el propietario sea el mismo
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: string, ownerId: string) {
    const property = await this.findOne(id);

    // Verificar que el propietario sea el mismo
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.propertiesRepository.remove(property);
    return { message: 'Property deleted successfully' };
  }

  async findByCity(city: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [properties, total] = await this.propertiesRepository.findAndCount({
      where: { city, isAvailable: true },
      skip,
      take: limit,
      relations: ['owner'],
      order: { pricePerNight: 'ASC' },
    });

    return {
      data: properties,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
