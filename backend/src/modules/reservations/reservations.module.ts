import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PropertiesModule } from '@/modules/properties/properties.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    PropertiesModule, // Importar para usar SeasonalPricingService
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {}
