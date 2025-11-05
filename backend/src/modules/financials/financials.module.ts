import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialsService } from './financials.service';
import { FinancialsController } from './financials.controller';
import { Financial } from './entities/financial.entity';
import { Property } from '@/modules/properties/entities/property.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Expense } from '@/modules/expenses/entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Financial, Property, Reservation, Expense]),
  ],
  providers: [FinancialsService],
  controllers: [FinancialsController],
  exports: [FinancialsService],
})
export class FinancialsModule {}
