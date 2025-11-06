import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonalPrice } from './entities/seasonal-price.entity';
import { CreateSeasonalPriceDto, UpdateSeasonalPriceDto } from './dto/seasonal-price.dto';
import { Property } from './entities/property.entity';

@Injectable()
export class SeasonalPricingService {
  constructor(
    @InjectRepository(SeasonalPrice)
    private seasonalPriceRepository: Repository<SeasonalPrice>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  // Crear precio especial
  async create(propertyId: string, dto: CreateSeasonalPriceDto): Promise<SeasonalPrice> {
    // Validar que la propiedad existe
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) {
      throw new NotFoundException(`Property with ID "${propertyId}" not found`);
    }

    // Validar que startDate < endDate
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const seasonalPrice = this.seasonalPriceRepository.create({
      ...dto,
      propertyId,
    });

    return this.seasonalPriceRepository.save(seasonalPrice);
  }

  // Obtener todos los precios especiales de una propiedad
  async findByProperty(propertyId: string): Promise<SeasonalPrice[]> {
    return this.seasonalPriceRepository.find({
      where: { propertyId },
      order: { startDate: 'ASC' },
    });
  }

  // Obtener precios activos de una propiedad
  async findActiveByProperty(propertyId: string): Promise<SeasonalPrice[]> {
    return this.seasonalPriceRepository.find({
      where: { propertyId, isActive: true },
      order: { startDate: 'ASC' },
    });
  }

  // Obtener precio especial por ID
  async findOne(id: string): Promise<SeasonalPrice> {
    const seasonalPrice = await this.seasonalPriceRepository.findOne({
      where: { id },
    });

    if (!seasonalPrice) {
      throw new NotFoundException(`Seasonal price with ID "${id}" not found`);
    }

    return seasonalPrice;
  }

  // Actualizar precio especial
  async update(id: string, dto: UpdateSeasonalPriceDto): Promise<SeasonalPrice> {
    const seasonalPrice = await this.findOne(id);

    // Validar que startDate < endDate si se está actualizando
    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('startDate must be before endDate');
      }
    }

    Object.assign(seasonalPrice, dto);
    return this.seasonalPriceRepository.save(seasonalPrice);
  }

  // Eliminar precio especial
  async remove(id: string): Promise<void> {
    const seasonalPrice = await this.findOne(id);
    await this.seasonalPriceRepository.remove(seasonalPrice);
  }

  /**
   * Obtener el precio para una fecha específica
   * Busca si hay un precio especial activo para esa fecha
   * Si no encontrado, retorna null (usar precio base)
   */
  async getPriceForDate(propertyId: string, date: string): Promise<number | null> {
    const seasonalPrice = await this.seasonalPriceRepository
      .createQueryBuilder('sp')
      .where('sp.propertyId = :propertyId', { propertyId })
      .andWhere('sp.isActive = true')
      .andWhere('sp.startDate <= :date', { date })
      .andWhere('sp.endDate >= :date', { date })
      .orderBy('sp.createdAt', 'DESC')
      .getOne();

    return seasonalPrice?.pricePerNight || null;
  }

  /**
   * Obtener el precio promedio para un rango de fechas
   * Útil para calcular el total de una reserva
   */
  async getAveragePriceForDateRange(
    propertyId: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    // Obtener todos los precios especiales activos que se superponen con el rango
    const seasonalPrices = await this.seasonalPriceRepository.find({
      where: {
        propertyId,
        isActive: true,
      },
    });

    // Si no hay precios especiales, retornar 0 (significa usar precio base)
    if (seasonalPrices.length === 0) return 0;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    let totalPrice = 0;
    let totalDays = 0;

    // Iterar cada día del rango y verificar si hay precio especial
    const currentDate = new Date(startDateObj);
    while (currentDate < endDateObj) {
      const dateString = currentDate.toISOString().split('T')[0];

      // Buscar si hay precio especial para este día
      const priceForDay = seasonalPrices.find(
        (sp) =>
          sp.startDate <= dateString &&
          sp.endDate >= dateString,
      );

      if (priceForDay) {
        totalPrice += Number(priceForDay.pricePerNight);
      }

      totalDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Retornar precio promedio solo si hay precios especiales
    return totalDays > 0 ? totalPrice / totalDays : 0;
  }

  /**
   * Detectar conflictos entre precios especiales
   * Útil para validar que no se superponen
   */
  async detectConflicts(
    propertyId: string,
    startDate: string,
    endDate: string,
    excludeId?: string,
  ): Promise<SeasonalPrice[]> {
    const query = this.seasonalPriceRepository
      .createQueryBuilder('sp')
      .where('sp.propertyId = :propertyId', { propertyId })
      .andWhere('sp.isActive = true')
      .andWhere('sp.startDate <= :endDate', { endDate })
      .andWhere('sp.endDate >= :startDate', { startDate });

    if (excludeId) {
      query.andWhere('sp.id != :excludeId', { excludeId });
    }

    return query.getMany();
  }
}
