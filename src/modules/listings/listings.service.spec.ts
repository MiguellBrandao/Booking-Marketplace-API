import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Listings } from './listings.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ListingsService', () => {
  let service: ListingsService;
  let repository: jest.Mocked<Repository<Listings>>;

  beforeEach(async () => {
    const qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    const repoMock = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: getRepositoryToken(Listings), useValue: repoMock },
      ],
    }).compile();

    service = module.get(ListingsService);
    repository = module.get(getRepositoryToken(Listings));
  });

  it('returns listing by id', async () => {
    repository.findOne.mockResolvedValue({ id: 1 } as never);

    const listing = await service.getListing(1);

    expect(listing).toEqual({ id: 1 });
  });

  it('throws when listing not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.getListing(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws bad request on empty update payload', async () => {
    await expect(service.updateListing(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns paginated listings with optional filters', async () => {
    const result = await service.getListings({
      city: 'Lisbon',
      minPrice: '50',
      maxPrice: '200',
      page: '2',
      limit: '5',
    });

    expect(result).toEqual({
      data: [],
      page: 2,
      limit: 5,
      total: 0,
      totalPages: 0,
    });
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('listing');
  });
});
