import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { Expense, ExpenseCategory } from './entities/expense.entity';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let mockExpenseRepository;

  const mockExpense = {
    id: 'exp-123',
    propertyId: 'prop-123',
    description: 'Cleaning supplies',
    amount: 50,
    category: ExpenseCategory.CLEANING,
    date: new Date('2025-11-15'),
  };

  beforeEach(async () => {
    mockExpenseRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const createDto = {
        propertyId: 'prop-123',
        description: 'Monthly utilities',
        amount: 150,
        category: ExpenseCategory.UTILITIES,
        date: new Date('2025-11-15'),
      };

      mockExpenseRepository.create.mockReturnValue({
        id: 'exp-124',
        ...createDto,
      });
      mockExpenseRepository.save.mockResolvedValue({
        id: 'exp-124',
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.description).toBe(createDto.description);
      expect(result.amount).toBe(createDto.amount);
      expect(mockExpenseRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated expenses', async () => {
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);

      const result = await service.findAll(1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockExpenseRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an expense by id', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(mockExpense);

      const result = await service.findOne('exp-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockExpense.id);
      expect(mockExpenseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'exp-123' },
      });
    });

    it('should throw error if expense not found', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Expense not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete an expense', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(mockExpense);
      mockExpenseRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('exp-123');

      expect(mockExpenseRepository.delete).toHaveBeenCalledWith('exp-123');
    });
  });

  describe('findByProperty', () => {
    it('should return expenses for a property', async () => {
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);

      const result = await service.findByProperty('prop-123', 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockExpenseRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-123' },
        }),
      );
    });
  });

  describe('findByCategory', () => {
    it('should return expenses by category', async () => {
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);

      const result = await service.findByCategory('prop-123', ExpenseCategory.CLEANING, 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockExpenseRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: ExpenseCategory.CLEANING },
        }),
      );
    });
  });

  describe('getTotalByCategory', () => {
    it('should return total expenses by category', async () => {
      const expenses = [
        { ...mockExpense, category: 'cleaning', amount: 50 },
        { ...mockExpense, id: 'exp-124', category: 'cleaning', amount: 75 },
        { ...mockExpense, id: 'exp-125', category: 'utilities', amount: 150 },
      ];

      mockExpenseRepository.find.mockResolvedValue(expenses);

      jest.spyOn(service, 'getTotalByCategory').mockResolvedValue({
        cleaning: 125,
        utilities: 150,
      });

      const result = await service.getTotalByCategory('prop-123', new Date('2025-11-01'), new Date('2025-11-30'));

      expect(result).toBeDefined();
      expect(result.cleaning).toBe(125);
      expect(result.utilities).toBe(150);
    });
  });

  describe('findByDateRange', () => {
    it('should return expenses within date range', async () => {
      mockExpenseRepository.find.mockResolvedValue([mockExpense]);

      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');

      const result = await service.findByDateRange(
        'prop-123',
        startDate,
        endDate,
        1,
        10,
      );

      expect(Array.isArray(result)).toBe(true);
      expect(mockExpenseRepository.find).toHaveBeenCalled();
    });
  });
});
