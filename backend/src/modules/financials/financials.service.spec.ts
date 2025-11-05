import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinancialsService } from './financials.service';
import { Financial } from './entities/financial.entity';

describe('FinancialsService', () => {
  let service: FinancialsService;
  let mockFinancialRepository;

  const mockFinancial = {
    id: 'fin-123',
    propertyId: 'prop-123',
    period: '2025-11',
    grossIncome: 2000,
    totalExpenses: 500,
    commissionAmount: 200,
    netProfit: 1300,
  };

  beforeEach(async () => {
    mockFinancialRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialsService,
        {
          provide: getRepositoryToken(Financial),
          useValue: mockFinancialRepository,
        },
      ],
    }).compile();

    service = module.get<FinancialsService>(FinancialsService);
  });

  describe('create', () => {
    it('should create a new financial record', async () => {
      const createDto = {
        propertyId: 'prop-123',
        period: '2025-11',
        grossIncome: 2000,
        totalExpenses: 500,
        commissionAmount: 200,
      };

      mockFinancialRepository.create.mockReturnValue({
        id: 'fin-124',
        ...createDto,
        netProfit: 1300,
      });
      mockFinancialRepository.save.mockResolvedValue({
        id: 'fin-124',
        ...createDto,
        netProfit: 1300,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.grossIncome).toBe(2000);
      expect(result.netProfit).toBe(1300);
      expect(mockFinancialRepository.save).toHaveBeenCalled();
    });

    it('should calculate net profit correctly', async () => {
      const createDto = {
        propertyId: 'prop-123',
        period: '2025-11',
        grossIncome: 5000,
        totalExpenses: 1500,
        commissionAmount: 500,
      };

      const expectedNetProfit = 5000 - 1500 - 500; // 3000

      mockFinancialRepository.create.mockReturnValue({
        id: 'fin-125',
        ...createDto,
        netProfit: expectedNetProfit,
      });
      mockFinancialRepository.save.mockResolvedValue({
        id: 'fin-125',
        ...createDto,
        netProfit: expectedNetProfit,
      });

      const result = await service.create(createDto);

      expect(result.netProfit).toBe(3000);
    });
  });

  describe('findOne', () => {
    it('should return a financial record by id', async () => {
      mockFinancialRepository.findOne.mockResolvedValue(mockFinancial);

      const result = await service.findOne('fin-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockFinancial.id);
      expect(result.grossIncome).toBe(2000);
      expect(mockFinancialRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'fin-123' },
      });
    });

    it('should throw error if financial record not found', async () => {
      mockFinancialRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Financial record not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated financial records', async () => {
      mockFinancialRepository.find.mockResolvedValue([mockFinancial]);

      const result = await service.findAll(1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockFinancialRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByProperty', () => {
    it('should return financial records for a property', async () => {
      mockFinancialRepository.find.mockResolvedValue([mockFinancial]);

      const result = await service.findByProperty('prop-123', 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockFinancialRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-123' },
        }),
      );
    });
  });

  describe('getSummary', () => {
    it('should return summary of financial records', async () => {
      const records = [
        { ...mockFinancial, grossIncome: 2000, netProfit: 1300 },
        { ...mockFinancial, id: 'fin-124', grossIncome: 3000, netProfit: 2000 },
      ];

      mockFinancialRepository.find.mockResolvedValue(records);

      const result = await service.getSummary();

      expect(result).toBeDefined();
      expect(result.totalGrossIncome).toBe(5000);
      expect(result.totalNetProfit).toBe(3300);
    });
  });

  describe('getPropertySummary', () => {
    it('should return summary for a specific property', async () => {
      const records = [
        { ...mockFinancial, grossIncome: 2000, netProfit: 1300 },
        { ...mockFinancial, id: 'fin-124', grossIncome: 3000, netProfit: 2000 },
      ];

      mockFinancialRepository.find.mockResolvedValue(records);

      const result = await service.getPropertySummary('prop-123');

      expect(result).toBeDefined();
      expect(result.totalGrossIncome).toBe(5000);
      expect(result.averageNetProfit).toBeDefined();
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI percentage correctly', async () => {
      const investment = 10000;
      const netProfit = 2000;

      mockFinancialRepository.findOne.mockResolvedValue({
        ...mockFinancial,
        netProfit,
      });

      const result = await service.calculateROI('fin-123', investment);

      expect(result).toBe((netProfit / investment) * 100);
      expect(result).toBeCloseTo(20);
    });

    it('should handle zero investment in ROI calculation', async () => {
      mockFinancialRepository.findOne.mockResolvedValue(mockFinancial);

      await expect(service.calculateROI('fin-123', 0)).rejects.toThrow(
        'Investment amount must be greater than 0',
      );
    });
  });

  describe('getComparative', () => {
    it('should return comparative data between periods', async () => {
      const currentPeriod = [
        { ...mockFinancial, period: '2025-11', netProfit: 1300 },
      ];
      const previousPeriod = [
        { ...mockFinancial, period: '2025-10', netProfit: 1100 },
      ];

      mockFinancialRepository.find
        .mockResolvedValueOnce(currentPeriod)
        .mockResolvedValueOnce(previousPeriod);

      const result = await service.getComparative('2025-11', '2025-10');

      expect(result).toBeDefined();
      expect(result.currentPeriodTotal).toBe(1300);
      expect(result.previousPeriodTotal).toBe(1100);
      expect(result.change).toBe(200);
    });

    it('should calculate percentage change correctly', async () => {
      const currentPeriod = [{ netProfit: 1500 }];
      const previousPeriod = [{ netProfit: 1000 }];

      mockFinancialRepository.find
        .mockResolvedValueOnce(currentPeriod)
        .mockResolvedValueOnce(previousPeriod);

      const result = await service.getComparative('2025-11', '2025-10');

      expect(result.percentChange).toBeCloseTo(50);
    });
  });

  describe('delete', () => {
    it('should delete a financial record', async () => {
      mockFinancialRepository.findOne.mockResolvedValue(mockFinancial);
      mockFinancialRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('fin-123');

      expect(mockFinancialRepository.delete).toHaveBeenCalledWith('fin-123');
    });
  });
});
