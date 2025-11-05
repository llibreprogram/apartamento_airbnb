import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense, ExpenseCategory } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto, FilterExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
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

  async remove(id: string) {
    const expense = await this.findOne(id);
    await this.expensesRepository.remove(expense);
    return { message: 'Expense deleted successfully' };
  }
}
