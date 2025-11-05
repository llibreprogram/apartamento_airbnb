import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import { PropertyType } from '../entities/property.entity';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  @IsNumber()
  @Min(1)
  bedrooms: number;

  @IsNumber()
  @Min(1)
  bathrooms: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(1)
  pricePerNight: number;

  @IsNumber()
  @IsOptional()
  securityDeposit: number;

  @IsArray()
  @IsOptional()
  amenities: string[];

  @IsArray()
  @IsOptional()
  photos: string[];
}

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  city: string;

  @IsString()
  @IsOptional()
  zipCode: string;

  @IsEnum(PropertyType)
  @IsOptional()
  type: PropertyType;

  @IsNumber()
  @IsOptional()
  bedrooms: number;

  @IsNumber()
  @IsOptional()
  bathrooms: number;

  @IsNumber()
  @IsOptional()
  capacity: number;

  @IsNumber()
  @IsOptional()
  pricePerNight: number;

  @IsNumber()
  @IsOptional()
  securityDeposit: number;

  @IsArray()
  @IsOptional()
  amenities: string[];

  @IsArray()
  @IsOptional()
  photos: string[];

  @IsString()
  @IsOptional()
  isAvailable: string;
}
