import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, FilterExpenseDto } from './dto/create-expense.dto';
import { Reservation } from '@/modules/reservations/entities/reservation.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const expense = this.expensesRepository.create(createExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.expensesRepository.findAndCount({
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const expense = await this.expensesRepository.findOne({
      where: { id },
      relations: ['property'],
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }

    return expense;
  }

  async findByProperty(propertyId: string, page: number = 1, limit: number = 10, filters?: FilterExpenseDto) {
    const query = this.expensesRepository.createQueryBuilder('expense')
      .where('expense.propertyId = :propertyId', { propertyId })
      .leftJoinAndSelect('expense.property', 'property');

    // Filtrar por categoría si se proporciona
    if (filters?.category) {
      query.andWhere('expense.category = :category', { category: filters.category });
    }

    // Filtrar por rango de fechas
    if (filters?.startDate && filters?.endDate) {
      // Use the dates as-is (they're already in UTC from the controller)
      query.andWhere('expense.date >= :startDate', { startDate: filters.startDate })
        .andWhere('expense.date <= :endDate', { endDate: filters.endDate });
    } else if (filters?.startDate) {
      query.andWhere('expense.date >= :startDate', { startDate: filters.startDate });
    } else if (filters?.endDate) {
      query.andWhere('expense.date <= :endDate', { endDate: filters.endDate });
    }

    // Filtrar por estado de pago
    if (filters?.isPaid !== undefined) {
      query.andWhere('expense.isPaid = :isPaid', { isPaid: filters.isPaid });
    }

    query.orderBy('expense.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    
    console.log('Query result:', { propertyId, total, returned: data.length, filters });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByCategory(propertyId: string, category: ExpenseCategory, page: number = 1, limit: number = 10) {
    const [data, total] = await this.expensesRepository.findAndCount({
      where: { propertyId, category },
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findByDateRange(propertyId: string, startDate: Date, endDate: Date, page: number = 1, limit: number = 10) {
    const [data, total] = await this.expensesRepository.findAndCount({
      where: {
        propertyId,
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['property'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getTotalByCategory(propertyId: string, startDate?: Date, endDate?: Date) {
    let query = this.expensesRepository.createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .addSelect('COUNT(expense.id)', 'count')
      .where('expense.propertyId = :propertyId', { propertyId })
      .groupBy('expense.category');

    if (startDate && endDate) {
      query = query.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return query.getRawMany();
  }

  async getTotalExpenses(propertyId: string, startDate?: Date, endDate?: Date) {
    let query = this.expensesRepository.createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.propertyId = :propertyId', { propertyId });

    if (startDate && endDate) {
      query = query.andWhere('expense.date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    const result = await query.getRawOne();
    return { total: parseFloat(result.total) || 0 };
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.findOne(id);
    Object.assign(expense, updateExpenseDto);
    return this.expensesRepository.save(expense);
  }

  async markAsPaid(id: string) {
    const expense = await this.findOne(id);
    expense.isPaid = true;
    return this.expensesRepository.save(expense);
  }

  // Calcular resumen de electricidad para un período (usado al crear gasto de electricidad)
  async getElectricitySummary(propertyId: string, period: string) {
    // Parsear período YYYY-MM
    const [year, month] = period.split('-');
    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Último día del mes

    // Obtener todas las reservas completadas con electricidad en ese período
    const reservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select([
        'reservation.id as id',
        'reservation.guestName as guestName',
        'reservation.checkIn as checkIn',
        'reservation.checkOut as checkOut',
        'reservation.electricityConsumed as electricityConsumed',
        'reservation.electricityCharge as electricityCharge',
        'reservation.electricityRate as electricityRate',
        'reservation.meterReadingStart as meterReadingStart',
        'reservation.meterReadingEnd as meterReadingEnd',
      ])
      .where('reservation.propertyId = :propertyId', { propertyId })
      .andWhere('reservation.status = :status', { status: 'completed' })
      .andWhere('reservation.electricityCharge IS NOT NULL')
      .andWhere('reservation.checkIn >= :startDate', { startDate })
      .andWhere('reservation.checkOut <= :endDate', { endDate })
      .getRawMany();

    // Calcular totales
    const totalCharged = reservations.reduce((sum, res) => 
      sum + parseFloat(res.electricityCharge || 0), 0
    );
    
    const totalConsumed = reservations.reduce((sum, res) => 
      sum + parseFloat(res.electricityConsumed || 0), 0
    );

    return {
      period,
      propertyId,
      totalCharged: parseFloat(totalCharged.toFixed(2)),
      totalConsumed: parseFloat(totalConsumed.toFixed(2)),
      reservationsCount: reservations.length,
      reservations: reservations.map(res => ({
        id: res.id,
        guestName: res.guestName,
        checkIn: res.checkIn,
        checkOut: res.checkOut,
        electricityConsumed: parseFloat(res.electricityConsumed || 0),
        electricityCharge: parseFloat(res.electricityCharge || 0),
        electricityRate: parseFloat(res.electricityRate || 0),
        meterReadingStart: parseInt(res.meterReadingStart || 0),
        meterReadingEnd: parseInt(res.meterReadingEnd || 0),
      })),
    };
  }

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
    return { message: 'Expense deleted successfully' };
  }
}
