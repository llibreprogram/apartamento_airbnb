import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { PriceType } from '../entities/seasonal-price.entity';

export class CreateSeasonalPriceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  @IsNotEmpty()
  endDate: string; // YYYY-MM-DD

  @IsEnum(PriceType)
  @IsOptional()
  type: PriceType;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}

export class UpdateSeasonalPriceDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerNight: number;

  @IsDateString()
  @IsOptional()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate: string;

  @IsEnum(PriceType)
  @IsOptional()
  type: PriceType;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
