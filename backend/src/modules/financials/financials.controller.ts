import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { FinancialsService } from './financials.service';
import { CreateFinancialDto } from './dto/create-financial.dto';

@ApiTags('Financials')
@Controller('financials')
export class FinancialsController {
  constructor(private financialsService: FinancialsService) {}

  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate financial report for a property and period' })
  async calculateFinancial(@Body() dto: CreateFinancialDto) {
    return this.financialsService.calculateFinancial(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all financial reports' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const [data, total] = await this.financialsService.findAll(
      parseInt(page),
      parseInt(limit),
    );
    return {
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get overall financial summary across all properties' })
  async getSummary() {
    return this.financialsService.getSummary();
  }

  @Get('property/:propertyId/summary')
  @ApiOperation({ summary: 'Get financial summary for a specific property' })
  @ApiParam({ name: 'propertyId', type: String })
  async getPropertySummary(@Param('propertyId') propertyId: string) {
    return this.financialsService.getPropertySummary(propertyId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get all financial reports for a property' })
  @ApiParam({ name: 'propertyId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const [data, total] = await this.financialsService.findByProperty(
      propertyId,
      parseInt(page),
      parseInt(limit),
    );
    return {
      data,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  @Get('comparative')
  @ApiOperation({ summary: 'Compare financial reports between two periods' })
  @ApiQuery({ name: 'propertyId', type: String })
  @ApiQuery({ name: 'period1', type: String, example: '2025-09' })
  @ApiQuery({ name: 'period2', type: String, example: '2025-10' })
  async getComparative(
    @Query('propertyId') propertyId: string,
    @Query('period1') period1: string,
    @Query('period2') period2: string,
  ) {
    return this.financialsService.getComparative(propertyId, period1, period2);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get financial report by ID' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    return this.financialsService.findOne(id);
  }
}
