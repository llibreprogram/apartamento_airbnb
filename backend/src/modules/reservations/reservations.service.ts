import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Not } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateReservationDto, UpdateReservationDto, CancelReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(guestId: string, createReservationDto: CreateReservationDto) {
    const { propertyId, checkIn, checkOut } = createReservationDto;

    // Validar que checkIn sea menor que checkOut
    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new BadRequestException('Check-in date must be before check-out date');
    }

    // Validar que no sean fechas en el pasado
    if (new Date(checkIn) < new Date()) {
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

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      guestId,
      status: ReservationStatus.PENDING,
    });

    return this.reservationsRepository.save(reservation);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.reservationsRepository.findAndCount({
      relations: ['property', 'guest'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
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
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationsRepository.save(reservation);
  }

  async confirm(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be confirmed');
    }

    reservation.status = ReservationStatus.CONFIRMED;
    return this.reservationsRepository.save(reservation);
  }

  async complete(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed reservations can be completed');
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

  async remove(id: string) {
    const reservation = await this.findOne(id);
    await this.reservationsRepository.remove(reservation);
    return { message: 'Reservation deleted successfully' };
  }
}
