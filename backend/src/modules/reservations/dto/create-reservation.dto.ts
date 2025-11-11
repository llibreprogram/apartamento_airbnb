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
      // Handle both ISO8601 and simple date format (YYYY-MM-DD)
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
    }
    return new Date(value);
  })
  checkIn: Date;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle both ISO8601 and simple date format (YYYY-MM-DD)
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
    }
    return new Date(value);
  })
  checkOut: Date;

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
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
    }
    return new Date(value);
  })
  checkIn?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
    }
    return new Date(value);
  })
  checkOut?: Date;

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
