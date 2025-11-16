import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ReservationStatus } from '../entities/reservation.entity';

export class CreateReservationDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Si es formato YYYY-MM-DD, devolverlo tal cual para evitar timezone issues
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      // Si es ISO8601, extraer solo la parte de fecha
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return value.split('T')[0];
      }
    }
    return value;
  })
  checkIn: string | Date;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Si es formato YYYY-MM-DD, devolverlo tal cual para evitar timezone issues
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      // Si es ISO8601, extraer solo la parte de fecha
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return value.split('T')[0];
      }
    }
    return value;
  })
  checkOut: string | Date;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  numberOfGuests: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateReservationDto {
  @IsString()
  @IsOptional()
  guestName?: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      // Si es formato YYYY-MM-DD, devolverlo tal cual
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      // Si es ISO8601, extraer solo la parte de fecha
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return value.split('T')[0];
      }
    }
    return value;
  })
  checkIn?: string | Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      // Si es formato YYYY-MM-DD, devolverlo tal cual
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      // Si es ISO8601, extraer solo la parte de fecha
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return value.split('T')[0];
      }
    }
    return value;
  })
  checkOut?: string | Date;

  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfGuests?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  securityDeposit?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}

export class CancelReservationDto {
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

export class CompleteReservationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  meterReadingStart?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  meterReadingEnd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  electricityRate?: number; // $/kWh

  @IsOptional()
  @IsEnum(['cash', 'deposit', 'invoice', 'waived'])
  electricityPaymentMethod?: string;

  @IsOptional()
  @IsString()
  electricityNotes?: string;
}

export class RegisterElectricityCostDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  electricityActualCost: number; // Costo real pagado por el propietario

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return value.split('T')[0];
      }
    }
    return value;
  })
  electricityBillDate?: string | Date;

  @IsOptional()
  @IsString()
  electricityBillNotes?: string;
}
