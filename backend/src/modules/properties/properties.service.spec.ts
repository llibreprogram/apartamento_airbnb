import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let mockPropertyRepository;

  const mockProperty = {
    id: 'prop-123',
    name: 'Beachfront Apartment',
    address: 'Calle Principal 123',
    city: 'Miami',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    capacity: 4,
    pricePerNight: 150,
    ownerId: 'user-123',
  };

  beforeEach(async () => {
    mockPropertyRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const createDto: CreatePropertyDto = {
        name: 'New Property',
        address: 'New Address',
        city: 'New City',
        bedrooms: 3,
        bathrooms: 2,
        capacity: 6,
        pricePerNight: 200,
        type: 'house',
      };

      mockPropertyRepository.create.mockReturnValue({ id: 'new-id', ...createDto });
      mockPropertyRepository.save.mockResolvedValue({ id: 'new-id', ...createDto });

      const result = await service.create(createDto, 'user-123');

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(mockPropertyRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated properties', async () => {
      const mockData = {
        data: [mockProperty],
        pageCount: 1,
      };

      mockPropertyRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.findAll(1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockPropertyRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a property by id', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      const result = await service.findOne('prop-123');

      expect(result).toBeDefined();
      expect(result.id).toBe(mockProperty.id);
      expect(mockPropertyRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prop-123' },
      });
    });

    it('should throw error if property not found', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Property not found',
      );
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedProperty = { ...mockProperty, ...updateDto };

      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.save.mockResolvedValue(updatedProperty);

      const result = await service.update('prop-123', updateDto, 'user-123');

      expect(result.name).toBe('Updated Name');
      expect(mockPropertyRepository.save).toHaveBeenCalled();
    });

    it('should throw error if not owner', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(
        service.update('prop-123', { name: 'New Name' }, 'different-user'),
      ).rejects.toThrow('You do not have permission to update this property');
    });
  });

  describe('remove', () => {
    it('should delete a property', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('prop-123', 'user-123');

      expect(mockPropertyRepository.delete).toHaveBeenCalledWith('prop-123');
    });

    it('should throw error if not owner', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(
        service.remove('prop-123', 'different-user'),
      ).rejects.toThrow('You do not have permission to delete this property');
    });
  });

  describe('findByCity', () => {
    it('should return properties in a city', async () => {
      mockPropertyRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.findByCity('Miami', 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockPropertyRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { city: 'Miami' },
        }),
      );
    });
  });

  describe('getMyProperties', () => {
    it('should return properties owned by user', async () => {
      mockPropertyRepository.find.mockResolvedValue([mockProperty]);

      const result = await service.getMyProperties('user-123', 1, 10);

      expect(Array.isArray(result)).toBe(true);
      expect(mockPropertyRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user-123' },
        }),
      );
    });
  });
});
