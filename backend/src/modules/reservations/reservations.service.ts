import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto, UpdateReservationDto, CancelReservationDto, CompleteReservationDto } from './dto/create-reservation.dto';
import { SeasonalPricingService } from '@/modules/properties/seasonal-pricing.service';
import { PropertiesService } from '@/modules/properties/properties.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly seasonalPricingService: SeasonalPricingService,
    private readonly propertiesService: PropertiesService,
  ) {}

  /**
   * Calcular precio total de una reserva usando precios dinámicos
   * Itera día por día y busca si hay precio especial activo
   */
  async calculateTotalPrice(
    propertyId: string,
    checkIn: string | Date,
    checkOut: string | Date,
  ): Promise<number> {
    // Obtener la propiedad para el precio base
    const property = await this.propertiesService.findOne(propertyId);

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    let totalPrice = 0;
    const currentDate = new Date(startDate);

    // Iterar cada día (noche) de la reserva
    while (currentDate < endDate) {
      const dateString = currentDate.toISOString().split('T')[0];

      // Buscar precio especial para este día
      const seasonalPrice = await this.seasonalPricingService.getPriceForDate(
        propertyId,
        dateString,
      );

      // Usar precio especial si existe, si no usar precio base
      const priceForNight = seasonalPrice || Number(property.pricePerNight);
      totalPrice += priceForNight;

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return parseFloat(totalPrice.toFixed(2));
  }

  async create(guestId: string, createReservationDto: CreateReservationDto) {
    const { propertyId, checkIn, checkOut } = createReservationDto;

    // Validar que checkIn sea menor que checkOut
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    // Validar que no sean fechas en el pasado (permitir día actual)
    // Usar solo la parte de fecha para evitar problemas de timezone
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // "2025-11-14"
    const checkInDateString = new Date(checkIn).toISOString().split('T')[0]; // "2025-11-14"
    
    if (checkInDateString < todayDateString) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Verificar disponibilidad: no debe haber reservas confirmadas que se superpongan
    const conflictingReservation = await this.reservationsRepository.findOne({
      where: {
        propertyId,
        status: ReservationStatus.CONFIRMED,
        checkIn: LessThan(new Date(checkOut)),
        checkOut: MoreThan(new Date(checkIn)),
      },
    });

    if (conflictingReservation) {
      throw new BadRequestException(
        'Property is not available for the selected dates',
      );
    }

    // Calcular precio total usando precios dinámicos SOLO si no se proporciona
    let totalPrice = createReservationDto.totalPrice;
    
    // Si no se proporciona precio o es 0, calcular automáticamente
    if (!totalPrice || totalPrice === 0) {
      totalPrice = await this.calculateTotalPrice(propertyId, checkIn, checkOut);
    }

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      guestId,
      status: ReservationStatus.PENDING,
      totalPrice, // Usar precio proporcionado o calculado
    });

    return this.reservationsRepository.save(reservation);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.reservationsRepository.findAndCount({
      relations: ['property', 'guest'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      cache: false, // Disable cache to ensure fresh data
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
      relations: ['property', 'guest'],
      cache: false, // Disable cache to ensure fresh data
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID "${id}" not found`);
    }

    return reservation;
  }

  async findByProperty(propertyId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.reservationsRepository.findAndCount({
      where: { propertyId },
      relations: ['property', 'guest'],
      skip: (page - 1) * limit,
      take: limit,
      order: { checkIn: 'DESC' },
      cache: false, // Disable cache to ensure fresh data
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByGuest(guestId: string, page: number = 1, limit: number = 10) {
    const [data, total] = await this.reservationsRepository.findAndCount({
      where: { guestId },
      relations: ['property', 'guest'],
      skip: (page - 1) * limit,
      take: limit,
      order: { checkIn: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findAvailable(propertyId: string, checkIn: Date, checkOut: Date) {
    // Retorna disponibilidad: true si no hay conflictos confirmados
    const conflictingReservation = await this.reservationsRepository.findOne({
      where: {
        propertyId,
        status: ReservationStatus.CONFIRMED,
        checkIn: LessThan(new Date(checkOut)),
        checkOut: MoreThan(new Date(checkIn)),
      },
    });

    return !conflictingReservation;
  }

  async update(id: string, guestId: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    // Solo el guest que hizo la reserva puede actualizar (si está PENDING)
    if (reservation.guestId !== guestId && reservation.status === ReservationStatus.PENDING) {
      throw new BadRequestException('Only the guest can update a pending reservation');
    }

    // Si se cambian fechas, validar disponibilidad nuevamente
    if (updateReservationDto.checkIn || updateReservationDto.checkOut) {
      const checkIn = updateReservationDto.checkIn || reservation.checkIn;
      const checkOut = updateReservationDto.checkOut || reservation.checkOut;

      if (new Date(checkIn) >= new Date(checkOut)) {
        throw new BadRequestException('Check-in date must be before check-out date');
      }

      // Verificar disponibilidad excluyendo esta reserva
      const conflictingReservation = await this.reservationsRepository.findOne({
        where: {
          propertyId: reservation.propertyId,
          id: Not(id),
          status: ReservationStatus.CONFIRMED,
          checkIn: LessThan(new Date(checkOut)),
          checkOut: MoreThan(new Date(checkIn)),
        },
      });

      if (conflictingReservation) {
        throw new BadRequestException(
          'Property is not available for the selected dates',
        );
      }

      // Recalcular precio total SOLO si no se proporciona en el DTO
      if (!updateReservationDto.totalPrice || updateReservationDto.totalPrice === 0) {
        const totalPrice = await this.calculateTotalPrice(
          reservation.propertyId,
          checkIn,
          checkOut,
        );
        updateReservationDto.totalPrice = totalPrice;
      }
    }

    console.log('Before update - reservation:', {
      id: reservation.id,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      totalPrice: reservation.totalPrice
    });
    console.log('DTO to apply:', updateReservationDto);

    // Build update data object with explicit string conversion for dates
    const updateData: any = {};
    
    if (updateReservationDto.checkIn) {
      const date = new Date(updateReservationDto.checkIn);
      updateData.checkIn = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }
    if (updateReservationDto.checkOut) {
      const date = new Date(updateReservationDto.checkOut);
      updateData.checkOut = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    }
    if (updateReservationDto.guestName) {
      updateData.guestName = updateReservationDto.guestName;
    }
    if (updateReservationDto.guestEmail !== undefined) {
      updateData.guestEmail = updateReservationDto.guestEmail;
    }
    if (updateReservationDto.guestPhone !== undefined) {
      updateData.guestPhone = updateReservationDto.guestPhone;
    }
    if (updateReservationDto.numberOfGuests) {
      updateData.numberOfGuests = updateReservationDto.numberOfGuests;
    }
    if (updateReservationDto.totalPrice !== undefined) {
      updateData.totalPrice = updateReservationDto.totalPrice;
    }
    if (updateReservationDto.notes !== undefined) {
      updateData.notes = updateReservationDto.notes;
    }

    console.log('Updating reservation with data:', updateData);

    // Use update() to force SQL UPDATE without change detection
    await this.reservationsRepository.update(id, updateData);
    
    // Reload to get updated entity
    const updated = await this.findOne(id);
    
    console.log('After update and reload:', {
      id: updated.id,
      checkIn: updated.checkIn,
      checkOut: updated.checkOut,
      totalPrice: updated.totalPrice
    });
    
    return updated;
  }

  async confirm(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be confirmed');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    return this.reservationsRepository.save(reservation);
  }

  async complete(id: string, completeDto?: CompleteReservationDto) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed reservations can be completed');
    }

    // Calcular datos de electricidad si se proporcionan las lecturas del medidor
    if (completeDto?.meterReadingStart !== undefined && 
        completeDto?.meterReadingEnd !== undefined && 
        completeDto?.electricityRate !== undefined) {
      
      // Validar que la lectura final sea mayor que la inicial
      if (completeDto.meterReadingEnd < completeDto.meterReadingStart) {
        throw new BadRequestException('Final meter reading must be greater than or equal to initial reading');
      }

      // Calcular consumo en kWh
      const consumed = completeDto.meterReadingEnd - completeDto.meterReadingStart;

      // Calcular cargo total
      const charge = consumed * completeDto.electricityRate;

      // Guardar datos de electricidad en la reserva
      reservation.meterReadingStart = completeDto.meterReadingStart;
      reservation.meterReadingEnd = completeDto.meterReadingEnd;
      reservation.electricityRate = completeDto.electricityRate;
      reservation.electricityConsumed = consumed;
      reservation.electricityCharge = charge;
      reservation.electricityPaymentMethod = completeDto.electricityPaymentMethod || 'cash';
      reservation.electricityNotes = completeDto.electricityNotes;
    }

    reservation.status = ReservationStatus.COMPLETED;
    return this.reservationsRepository.save(reservation);
  }

  async cancel(id: string, guestId: string, cancelReservationDto: CancelReservationDto) {
    const reservation = await this.findOne(id);

    // Solo el guest o un admin puede cancelar
    if (reservation.guestId !== guestId) {
      throw new BadRequestException('Only the guest can cancel their reservation');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationReason = cancelReservationDto.cancellationReason;
    return this.reservationsRepository.save(reservation);
  }

  async registerElectricityCost(id: string, dto: any) {
    const reservation = await this.findOne(id);

    // Verificar que la reserva esté completada
    if (reservation.status !== ReservationStatus.COMPLETED) {
      throw new BadRequestException('Cannot register electricity cost for non-completed reservation');
    }

    // Verificar que tenga datos de electricidad cobrada
    if (!reservation.electricityCharge) {
      throw new BadRequestException('Reservation has no electricity charge recorded');
    }

    // Actualizar con el costo real
    reservation.electricityActualCost = dto.electricityActualCost;
    reservation.electricityBillDate = dto.electricityBillDate || new Date();
    reservation.electricityBillNotes = dto.electricityBillNotes;

    await this.reservationsRepository.save(reservation);

    // Calcular diferencia para mostrar al usuario
    const difference = reservation.electricityCharge - dto.electricityActualCost;
    const ownerContribution = difference < 0 ? Math.abs(difference) : 0;
    const adminProfit = difference > 0 ? difference : 0;

    return {
      message: 'Electricity cost registered successfully',
      data: {
        electricityCharged: reservation.electricityCharge,
        electricityActualCost: dto.electricityActualCost,
        difference: difference,
        ownerContribution: ownerContribution, // Lo que el propietario debe pagar
        adminProfit: adminProfit, // Ganancia si se cobró más de lo que costó
      },
    };
  }

  async remove(id: string) {
    const reservation = await this.findOne(id);
    await this.reservationsRepository.remove(reservation);
    return { message: 'Reservation deleted successfully' };
  }
}
