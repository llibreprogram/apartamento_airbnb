import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

// DTO para crear reporte financiero
export class CreateFinancialDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in format YYYY-MM' })
  period: string; // e.g., "2025-10"

  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO para actualizar reporte
export class UpdateFinancialDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in format YYYY-MM' })
  period?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// DTO para filtrar reportes financieros
export class FilterFinancialDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Period must be in format YYYY-MM' })
  period?: string;

  @IsOptional()
  @IsString()
  startPeriod?: string; // YYYY-MM

  @IsOptional()
  @IsString()
  endPeriod?: string; // YYYY-MM
}

// DTO para respuesta de ROI
export class FinancialReportDto {
  id: string;
  propertyId: string;
  period: string;
  grossIncome: number;
  totalExpenses: number;
  commissionAmount: number;
  netProfit: number;
  roi: number;
  numberOfReservations: number;
  averageReservationValue: number;
  notes: string;
  createdAt: Date;
}
