import { Test, TestingModule } from '@nestjs/testing';
import { InquiryController } from './inquiry.controller';
import { InquiryService } from './inquiry.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { GetInquiryDto } from './dto/get-inquiry.dto';
import { InquirySource } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('InquiryController', () => {
  let controller: InquiryController;
  let inquiryService: InquiryService;
  let prismaService: PrismaService;

  const mockInquiryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    doesExist: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    inquiry: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InquiryController],
      providers: [
        {
          provide: InquiryService,
          useValue: mockInquiryService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<InquiryController>(InquiryController);
    inquiryService = module.get<InquiryService>(InquiryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInquiry', () => {
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

      mockInquiryService.create.mockResolvedValue(expectedResult);

      const result = await controller.createInquiry(createInquiryDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
        message: 'Inquiry created successfully',
      });
      expect(mockInquiryService.create).toHaveBeenCalledWith({
        createInquiryDto,
      });
    });
  });

  describe('getAllInquiries', () => {
    it('should return paginated inquiries with filters', async () => {
      const query: GetInquiryDto = {
        page: 1,
        page_size: 10,
        search_term: 'john',
        source: InquirySource.contact_us,
        sort_by: 'created_desc',
      };

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

      const total = 1;

      mockInquiryService.findAll.mockResolvedValue(mockInquiries);
      mockInquiryService.count.mockResolvedValue(total);

      const result = await controller.getAllInquiries(query);

      expect(result).toEqual({
        success: true,
        data: mockInquiries,
        total,
        page: query.page,
        page_size: query.page_size,
      });

      expect(mockInquiryService.findAll).toHaveBeenCalledWith({
        page: query.page,
        page_size: query.page_size,
        filters: {
          OR: [
            {
              first_name: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
            {
              last_name: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
          ],
          source: query.source,
        },
        sort_by: query.sort_by,
      });

      expect(mockInquiryService.count).toHaveBeenCalledWith({
        filters: {
          OR: [
            {
              first_name: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
            {
              last_name: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: query.search_term,
                mode: 'insensitive',
              },
            },
          ],
          source: query.source,
        },
      });
    });

    it('should handle date range filters', async () => {
      const query: GetInquiryDto = {
        page: 1,
        page_size: 10,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };

      const mockInquiries = [];
      const total = 0;

      mockInquiryService.findAll.mockResolvedValue(mockInquiries);
      mockInquiryService.count.mockResolvedValue(total);

      await controller.getAllInquiries(query);

      expect(mockInquiryService.findAll).toHaveBeenCalledWith({
        page: query.page,
        page_size: query.page_size,
        filters: {
          created_at: {
            gte: new Date(query.start_date),
            lte: new Date(query.end_date),
          },
        },
        sort_by: undefined,
      });
    });
  });

  describe('deleteInquiry', () => {
    it('should delete an inquiry successfully', async () => {
      const inquiryId = 'test-id';
      const mockInquiry = {
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

      mockInquiryService.doesExist.mockResolvedValue(mockInquiry);
      mockInquiryService.delete.mockResolvedValue(mockInquiry);

      const result = await controller.deleteInquiry({ id: inquiryId });

      expect(result).toEqual({
        success: true,
        message: 'Inquiry deleted successfully',
      });
      expect(mockInquiryService.doesExist).toHaveBeenCalledWith(inquiryId);
      expect(mockInquiryService.delete).toHaveBeenCalledWith({
        inquiry_id: inquiryId,
      });
    });

    it('should throw NotFoundException when inquiry does not exist', async () => {
      const inquiryId = 'non-existent-id';

      mockInquiryService.doesExist.mockResolvedValue(null);

      await expect(controller.deleteInquiry({ id: inquiryId })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockInquiryService.doesExist).toHaveBeenCalledWith(inquiryId);
      expect(mockInquiryService.delete).not.toHaveBeenCalled();
    });
  });
}); 