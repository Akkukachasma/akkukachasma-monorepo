import { Test, TestingModule } from '@nestjs/testing';
import { InquiryService } from './inquiry.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquirySource } from '@prisma/client';

describe('InquiryService', () => {
  let service: InquiryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    inquiry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InquiryService>(InquiryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an inquiry', async () => {
      const createInquiryDto: CreateInquiryDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+919876543210',
        message: 'Test inquiry message',
        source: InquirySource.contact_us,
      };

      const expectedResult = {
        id: 'test-id',
        ...createInquiryDto,
        created_at: new Date(),
        updated_at: new Date(),
        address: null,
      };

      mockPrismaService.inquiry.create.mockResolvedValue(expectedResult);

      const result = await service.create({ createInquiryDto });

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.inquiry.create).toHaveBeenCalledWith({
        data: createInquiryDto,
        include: {
          address: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated inquiries', async () => {
      const mockInquiries = [
        {
          id: 'test-id-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+919876543210',
          message: 'Test inquiry 1',
          source: InquirySource.contact_us,
          created_at: new Date(),
          updated_at: new Date(),
          address: null,
        },
      ];

      mockPrismaService.inquiry.findMany.mockResolvedValue(mockInquiries);

      const result = await service.findAll({
        page: 1,
        page_size: 10,
        sort_by: 'created_desc',
      });

      expect(result).toEqual(mockInquiries);
      expect(mockPrismaService.inquiry.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: [{ created_at: 'desc' }],
        include: {
          address: true,
        },
      });
    });
  });

  describe('count', () => {
    it('should return count of inquiries', async () => {
      const expectedCount = 5;
      mockPrismaService.inquiry.count.mockResolvedValue(expectedCount);

      const result = await service.count();

      expect(result).toBe(expectedCount);
      expect(mockPrismaService.inquiry.count).toHaveBeenCalledWith({
        where: {},
      });
    });
  });

  describe('delete', () => {
    it('should delete an inquiry', async () => {
      const inquiryId = 'test-id';
      const expectedResult = {
        id: inquiryId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+919876543210',
        message: 'Test inquiry',
        source: InquirySource.contact_us,
        created_at: new Date(),
        updated_at: new Date(),
        address: null,
      };

      mockPrismaService.inquiry.delete.mockResolvedValue(expectedResult);

      const result = await service.delete({ inquiry_id: inquiryId });

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.inquiry.delete).toHaveBeenCalledWith({
        where: { id: inquiryId },
        include: {
          address: true,
        },
      });
    });
  });

  describe('doesExist', () => {
    it('should return inquiry if exists', async () => {
      const inquiryId = 'test-id';
      const expectedResult = {
        id: inquiryId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+919876543210',
        message: 'Test inquiry',
        source: InquirySource.contact_us,
        created_at: new Date(),
        updated_at: new Date(),
        address: null,
      };

      mockPrismaService.inquiry.findUnique.mockResolvedValue(expectedResult);

      const result = await service.doesExist(inquiryId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.inquiry.findUnique).toHaveBeenCalledWith({
        where: { id: inquiryId },
        include: {
          address: true,
        },
      });
    });

    it('should return null if inquiry does not exist', async () => {
      const inquiryId = 'non-existent-id';
      mockPrismaService.inquiry.findUnique.mockResolvedValue(null);

      const result = await service.doesExist(inquiryId);

      expect(result).toBeNull();
    });
  });
}); 