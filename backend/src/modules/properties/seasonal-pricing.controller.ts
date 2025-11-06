import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SeasonalPricingService } from './seasonal-pricing.service';
import { CreateSeasonalPriceDto, UpdateSeasonalPriceDto } from './dto/seasonal-price.dto';

@Controller('seasonal-prices')
@UseGuards(JwtAuthGuard)
export class SeasonalPricingController {
  constructor(private readonly seasonalPricingService: SeasonalPricingService) {}

  @Post('property/:propertyId')
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateSeasonalPriceDto,
  ) {
    // TODO: Verificar que el usuario es propietario de la propiedad
    return this.seasonalPricingService.create(propertyId, dto);
  }

  @Get('property/:propertyId')
  async findByProperty(@Param('propertyId') propertyId: string) {
    return this.seasonalPricingService.findByProperty(propertyId);
  }

  @Get('property/:propertyId/active')
  async findActiveByProperty(@Param('propertyId') propertyId: string) {
    return this.seasonalPricingService.findActiveByProperty(propertyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.seasonalPricingService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSeasonalPriceDto,
  ) {
    // TODO: Verificar que el usuario es propietario de la propiedad
    return this.seasonalPricingService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // TODO: Verificar que el usuario es propietario de la propiedad
    await this.seasonalPricingService.remove(id);
    return { message: 'Seasonal price deleted successfully' };
  }

  @Get('property/:propertyId/price-for-date')
  async getPriceForDate(
    @Param('propertyId') propertyId: string,
    @Body('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('Date is required');
    }

    const price = await this.seasonalPricingService.getPriceForDate(propertyId, date);
    return { price };
  }

  @Post('property/:propertyId/check-conflicts')
  async checkConflicts(
    @Param('propertyId') propertyId: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }

    const conflicts = await this.seasonalPricingService.detectConflicts(
      propertyId,
      startDate,
      endDate,
    );

    return { hasConflicts: conflicts.length > 0, conflicts };
  }
}
