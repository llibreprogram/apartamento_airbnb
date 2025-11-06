import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Financial } from './entities/financial.entity';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { Property } from '@/modules/properties/entities/property.entity';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';
import { Expense } from '@/modules/expenses/entities/expense.entity';

@Injectable()
export class FinancialsService {
  constructor(
    @InjectRepository(Financial)
    private financialsRepository: Repository<Financial>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  // Calcular reporte financiero para una propiedad y período
  async calculateFinancial(dto: CreateFinancialDto): Promise<Financial> {
    // Validar que la propiedad existe
    const property = await this.propertiesRepository.findOne({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${dto.propertyId} not found`);
    }

    // Extraer año y mes del período (YYYY-MM)
    const [year, month] = dto.period.split('-');
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Último día del mes

    // 1. Calcular ingresos totales (confirmed + completed reservations)
    const reservationsResult = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select('COALESCE(SUM(reservation.totalPrice), 0)', 'total')
      .addSelect('COUNT(reservation.id)', 'count')
      .where('reservation.propertyId = :propertyId', { propertyId: dto.propertyId })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: ['confirmed', 'completed'],
      })
      .andWhere('reservation.checkIn >= :startDate', { startDate })
      .andWhere('reservation.checkOut <= :endDate', { endDate })
      .getRawOne();

    const grossIncome = parseFloat(reservationsResult?.total || 0);
    const numberOfReservations = parseInt(reservationsResult?.count || 0);

    // 2. Calcular gastos totales
    const expensesResult = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('expense.propertyId = :propertyId', { propertyId: dto.propertyId })
      .andWhere('expense.date >= :startDate', { startDate })
      .andWhere('expense.date <= :endDate', { endDate })
      .getRawOne();

    const totalExpenses = parseFloat(expensesResult?.total || 0);

    // 3. Calcular comisión usando la tasa de la propiedad
    const commissionRate = parseFloat(property.commissionRate?.toString() || '0.1');
    const commissionAmount = parseFloat((grossIncome * commissionRate).toFixed(2));

    // 4. Calcular ganancias netas
    const netProfit = parseFloat((grossIncome - totalExpenses - commissionAmount).toFixed(2));

    // 5. Calcular ROI (si hay inversión)
    let roi = 0;
    if (property.securityDeposit > 0) {
      roi = parseFloat(((netProfit / property.securityDeposit) * 100).toFixed(2));
    }

    // 6. Calcular valor promedio de reserva
    const averageReservationValue =
      numberOfReservations > 0
        ? parseFloat((grossIncome / numberOfReservations).toFixed(2))
        : 0;

    // Verificar si ya existe reporte para este período
    let financial = await this.financialsRepository.findOne({
      where: {
        propertyId: dto.propertyId,
        period: dto.period,
      },
    });

    if (financial) {
      // Actualizar reporte existente
      financial.grossIncome = grossIncome;
      financial.totalExpenses = totalExpenses;
      financial.commissionAmount = commissionAmount;
      financial.netProfit = netProfit;
      financial.roi = roi;
      financial.numberOfReservations = numberOfReservations;
      financial.averageReservationValue = averageReservationValue;
      if (dto.notes) {
        financial.notes = dto.notes;
      }
    } else {
      // Crear nuevo reporte
      financial = this.financialsRepository.create({
        ...dto,
        grossIncome,
        totalExpenses,
        commissionAmount,
        netProfit,
        roi,
        numberOfReservations,
        averageReservationValue,
      });
    }

    return this.financialsRepository.save(financial);
  }

  // Obtener reporte financiero por ID
  async findOne(id: string): Promise<Financial> {
    const financial = await this.financialsRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!financial) {
      throw new NotFoundException(`Financial report with id ${id} not found`);
    }

    return financial;
  }

  // Obtener todos los reportes financieros (con paginación)
  async findAll(page: number = 1, limit: number = 10): Promise<[Financial[], number]> {
    const [data, total] = await this.financialsRepository.findAndCount({
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Mapear property.name a propertyName en la respuesta
    const mappedData = data.map((financial) => ({
      ...financial,
      propertyName: financial.property?.name || 'Unknown Property',
    }));

    return [mappedData as any, total];
  }

  // Obtener reportes financieros de una propiedad
  async findByProperty(
    propertyId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Financial[], number]> {
    const [data, total] = await this.financialsRepository.findAndCount({
      where: { propertyId },
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { period: 'DESC' },
    });

    // Mapear property.name a propertyName en la respuesta
    const mappedData = data.map((financial) => ({
      ...financial,
      propertyName: financial.property?.name || 'Unknown Property',
    }));

    return [mappedData as any, total];
  }

  // Obtener reportes por período (rango)
  async findByPeriodRange(
    startPeriod: string, // YYYY-MM
    page: number = 1,
    limit: number = 10,
  ): Promise<[Financial[], number]> {
    const [data, total] = await this.financialsRepository.findAndCount({
      where: {
        period: `${startPeriod}` as any, // Simplified - should use BETWEEN in SQL
      },
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { period: 'DESC' },
    });

    return [data, total];
  }

  // Obtener resumen financiero de todas las propiedades
  async getSummary(): Promise<any> {
    const result = await this.financialsRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.grossIncome)', 'totalGrossIncome')
      .addSelect('SUM(financial.totalExpenses)', 'totalExpenses')
      .addSelect('SUM(financial.commissionAmount)', 'totalCommissions')
      .addSelect('SUM(financial.netProfit)', 'totalNetProfit')
      .addSelect('AVG(financial.roi)', 'averageROI')
      .addSelect('COUNT(DISTINCT financial.propertyId)', 'totalProperties')
      .getRawOne();

    return {
      totalGrossIncome: parseFloat(result?.totalGrossIncome || 0),
      totalExpenses: parseFloat(result?.totalExpenses || 0),
      totalCommissions: parseFloat(result?.totalCommissions || 0),
      totalNetProfit: parseFloat(result?.totalNetProfit || 0),
      averageROI: parseFloat(result?.averageROI || 0),
      totalProperties: parseInt(result?.totalProperties || 0),
    };
  }

  // Obtener resumen por propiedad
  async getPropertySummary(propertyId: string): Promise<any> {
    const result = await this.financialsRepository
      .createQueryBuilder('financial')
      .select('SUM(financial.grossIncome)', 'totalGrossIncome')
      .addSelect('SUM(financial.totalExpenses)', 'totalExpenses')
      .addSelect('SUM(financial.commissionAmount)', 'totalCommissions')
      .addSelect('SUM(financial.netProfit)', 'totalNetProfit')
      .addSelect('AVG(financial.roi)', 'averageROI')
      .addSelect('COUNT(financial.id)', 'reportCount')
      .where('financial.propertyId = :propertyId', { propertyId })
      .getRawOne();

    if (!result) {
      throw new NotFoundException(`Financial summary for property ${propertyId} not found`);
    }

    return {
      propertyId,
      totalGrossIncome: parseFloat(result?.totalGrossIncome || 0),
      totalExpenses: parseFloat(result?.totalExpenses || 0),
      totalCommissions: parseFloat(result?.totalCommissions || 0),
      totalNetProfit: parseFloat(result?.totalNetProfit || 0),
      averageROI: parseFloat(result?.averageROI || 0),
      reportCount: parseInt(result?.reportCount || 0),
    };
  }

  // Obtener comparativo de períodos
  async getComparative(
    propertyId: string,
    period1: string,
    period2: string,
  ): Promise<any> {
    const financial1 = await this.financialsRepository.findOne({
      where: { propertyId, period: period1 },
    });

    const financial2 = await this.financialsRepository.findOne({
      where: { propertyId, period: period2 },
    });

    if (!financial1 || !financial2) {
      throw new NotFoundException('One or both periods not found');
    }

    return {
      period1: {
        period: financial1.period,
        grossIncome: financial1.grossIncome,
        totalExpenses: financial1.totalExpenses,
        netProfit: financial1.netProfit,
        roi: financial1.roi,
      },
      period2: {
        period: financial2.period,
        grossIncome: financial2.grossIncome,
        totalExpenses: financial2.totalExpenses,
        netProfit: financial2.netProfit,
        roi: financial2.roi,
      },
      comparison: {
        incomeChange: parseFloat((financial2.grossIncome - financial1.grossIncome).toFixed(2)),
        expenseChange: parseFloat((financial2.totalExpenses - financial1.totalExpenses).toFixed(2)),
        profitChange: parseFloat((financial2.netProfit - financial1.netProfit).toFixed(2)),
        roiChange: parseFloat((financial2.roi - financial1.roi).toFixed(2)),
      },
    };
  }

  // Actualizar reporte
  async update(id: string, updates: Partial<Financial>): Promise<Financial> {
    const financial = await this.findOne(id);
    Object.assign(financial, updates);
    return this.financialsRepository.save(financial);
  }

  // Eliminar reporte
  async remove(id: string): Promise<void> {
    const financial = await this.findOne(id);
    await this.financialsRepository.remove(financial);
  }
}
