import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Accept both "2025-11-01" and "2025-11-01T00:00:00Z" formats
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
      return new Date(value);
    }
    return value;
  })
  date: Date;

  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

export class UpdateExpenseDto {
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
      return new Date(value);
    }
    return value;
  })
  date?: Date;

  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}

export class FilterExpenseDto {
  @IsEnum(ExpenseCategory)
  @IsOptional()
  category?: ExpenseCategory;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
      return new Date(value);
    }
    return value;
  })
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(value + 'T00:00:00Z');
      }
      return new Date(value);
    }
    return value;
  })
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
