import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { SeasonalPricingService } from './seasonal-pricing.service';
import { SeasonalPricingController } from './seasonal-pricing.controller';
import { Property } from './entities/property.entity';
import { SeasonalPrice } from './entities/seasonal-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, SeasonalPrice])],
  providers: [PropertiesService, SeasonalPricingService],
  controllers: [PropertiesController, SeasonalPricingController],
  exports: [PropertiesService, SeasonalPricingService],
})
export class PropertiesModule {}
