import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { Property, PropertyType } from './entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';

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
      findAndCount: jest.fn(),
      remove: jest.fn(),
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
        zipCode: '12345',
        bedrooms: 3,
        bathrooms: 2,
        capacity: 6,
        pricePerNight: 200,
        type: PropertyType.HOUSE,
        description: 'A new property',
        securityDeposit: 100,
        amenities: ['wifi', 'tv'],
        photos: ['photo1.jpg', 'photo2.jpg'],
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

      mockPropertyRepository.findAndCount.mockResolvedValue([[mockProperty], 1]);

      const result = await service.findAll(1, 10);

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockPropertyRepository.findAndCount).toHaveBeenCalled();
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
        relations: ['owner'],
      });
    });

    it('should throw error if property not found', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Property with ID "nonexistent" not found',
      );
    });
  });

  describe('update', () => {
    it('should update a property', async () => {
      const updateDto: UpdatePropertyDto = {
        name: 'Updated Name',
        description: 'Updated description',
        address: 'Updated Address',
        city: 'Updated City',
        zipCode: '54321',
        type: PropertyType.APARTMENT,
        bedrooms: 3,
        bathrooms: 2,
        capacity: 5,
        pricePerNight: 250,
        securityDeposit: 150,
        amenities: ['pool', 'gym'],
        photos: ['updated_photo.jpg'],
        isAvailable: 'true',
      };
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
        service.update('prop-123', {
          name: 'New Name',
          description: 'New description',
          address: 'New Address',
          city: 'New City',
          zipCode: '54321',
          type: PropertyType.APARTMENT,
          bedrooms: 3,
          bathrooms: 2,
          capacity: 5,
          pricePerNight: 250,
          securityDeposit: 150,
          amenities: ['pool', 'gym'],
          photos: ['new_photo.jpg'],
          isAvailable: 'true',
        }, 'different-user'),
      ).rejects.toThrow('You can only update your own properties');
    });
  });

  describe('remove', () => {
    it('should delete a property', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);
      mockPropertyRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove('prop-123', 'user-123');

      expect(mockPropertyRepository.remove).toHaveBeenCalledWith(mockProperty);
    });

    it('should throw error if not owner', async () => {
      mockPropertyRepository.findOne.mockResolvedValue(mockProperty);

      await expect(
        service.remove('prop-123', 'different-user'),
      ).rejects.toThrow('You can only delete your own properties');
    });
  });

  describe('findByCity', () => {
    it('should return properties in a city', async () => {
      mockPropertyRepository.findAndCount.mockResolvedValue([[mockProperty], 1]);

      const result = await service.findByCity('Miami', 1, 10);

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockPropertyRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { city: 'Miami', isAvailable: true },
          skip: 0,
          take: 10,
          relations: ['owner'],
          order: { pricePerNight: 'ASC' },
        }),
      );
    });
  });

  describe('getMyProperties', () => {
    it('should return properties owned by user', async () => {
      mockPropertyRepository.findAndCount.mockResolvedValue([[mockProperty], 1]);

      const result = await service.getMyProperties('user-123', 1, 10);

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(mockPropertyRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ownerId: 'user-123' },
        }),
      );
    });
  });
});