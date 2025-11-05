import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let mockReservationRepository;

  const mockReservation = {
    id: 'res-123',
    propertyId: 'prop-123',
    guestId: 'user-456',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    checkIn: new Date('2025-12-01'),
    checkOut: new Date('2025-12-05'),
    numberOfGuests: 2,
    totalPrice: 600,
    status: 'pending',
  };

  beforeEach(async () => {
    mockReservationRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  describe('create', () => {
    it('should create a new reservation', async () => {
      const createDto = {
        propertyId: 'prop-123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        checkIn: new Date('2025-12-01'),
        checkOut: new Date('2025-12-05'),
        numberOfGuests: 2,
        totalPrice: 600,
      };

      mockReservationRepository.create.mockReturnValue({
        id: 'res-124',
        ...createDto,
      });
      mockReservationRepository.save.mockResolvedValue({
        id: 'res-124',
        ...createDto,
      });

      const result = await service.create(createDto, 'user-456');

      expect(result).toBeDefined();
      expect(result.guestName).toBe(createDto.guestName);
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      mockReservationRepository.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne('res-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockReservation.id);
      expect(mockReservationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'res-123' },
      });
    });

    it('should throw error if reservation not found', async () => {
      mockReservationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Reservation not found',
      );
    });
  });

  describe('confirm', () => {
    it('should confirm a pending reservation', async () => {
      const pendingReservation = { ...mockReservation, status: 'pending' };
      const confirmedReservation = { ...pendingReservation, status: 'confirmed' };

      mockReservationRepository.findOne.mockResolvedValue(pendingReservation);
      mockReservationRepository.save.mockResolvedValue(confirmedReservation);

      const result = await service.confirm('res-123');

      expect(result.status).toBe('confirmed');
      expect(mockReservationRepository.save).toHaveBeenCalled();
    });

    it('should throw error if already confirmed', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: 'confirmed',
      };

      mockReservationRepository.findOne.mockResolvedValue(confirmedReservation);

      await expect(service.confirm('res-123')).rejects.toThrow(
        'Can only confirm pending reservations',
      );
    });
  });

  describe('complete', () => {
    it('should complete a confirmed reservation', async () => {
      const confirmedReservation = {
        ...mockReservation,
        status: 'confirmed',
      };
      const completedReservation = {
        ...confirmedReservation,
        status: 'completed',
      };

      mockReservationRepository.findOne.mockResolvedValue(confirmedReservation);
      mockReservationRepository.save.mockResolvedValue(completedReservation);

      const result = await service.complete('res-123');

      expect(result.status).toBe('completed');
    });
  });

  describe('cancel', () => {
    it('should cancel a pending reservation', async () => {
      const pendingReservation = { ...mockReservation, status: 'pending' };
      const cancelledReservation = {
        ...pendingReservation,
        status: 'cancelled',
      };

      mockReservationRepository.findOne.mockResolvedValue(pendingReservation);
      mockReservationRepository.save.mockResolvedValue(cancelledReservation);

      const result = await service.cancel('res-123', 'User request');

      expect(result.status).toBe('cancelled');
    });

    it('should throw error if trying to cancel completed reservation', async () => {
      const completedReservation = {
        ...mockReservation,
        status: 'completed',
      };

      mockReservationRepository.findOne.mockResolvedValue(completedReservation);

      await expect(
        service.cancel('res-123', 'User request'),
      ).rejects.toThrow('Cannot cancel completed reservations');
    });
  });

  describe('checkAvailability', () => {
    it('should return true if property is available', async () => {
      mockReservationRepository.find.mockResolvedValue([]);

      const result = await service.checkAvailability(
        'prop-123',
        new Date('2025-12-01'),
        new Date('2025-12-05'),
      );

      expect(result).toBe(true);
    });

    it('should return false if dates conflict with existing reservation', async () => {
      mockReservationRepository.find.mockResolvedValue([mockReservation]);

      const result = await service.checkAvailability(
        'prop-123',
        new Date('2025-12-03'),
        new Date('2025-12-07'),
      );

      expect(result).toBe(false);
    });
  });

  describe('findByProperty', () => {
    it('should return reservations for a property', async () => {
      mockReservationRepository.find.mockResolvedValue([mockReservation]);

      const result = await service.findByProperty('prop-123', 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockReservationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { propertyId: 'prop-123' },
        }),
      );
    });
  });
});
