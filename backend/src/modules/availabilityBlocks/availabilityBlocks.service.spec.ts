import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityBlockService } from './availabilityBlocks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AvailabilityBlocks } from './availabilityBlocks.entity';
import { Repository } from 'typeorm';
import { ListingsService } from '../listings/listings.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AvailabilityBlockService', () => {
  let service: AvailabilityBlockService;
  let repository: jest.Mocked<Repository<AvailabilityBlocks>>;
  let listingsService: jest.Mocked<ListingsService>;

  beforeEach(async () => {
    const repoMock = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const listingsServiceMock = {
      getListing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityBlockService,
        {
          provide: getRepositoryToken(AvailabilityBlocks),
          useValue: repoMock,
        },
        { provide: ListingsService, useValue: listingsServiceMock },
      ],
    }).compile();

    service = module.get(AvailabilityBlockService);
    repository = module.get(getRepositoryToken(AvailabilityBlocks));
    listingsService = module.get(ListingsService);
  });

  it('throws when host is not listing owner while creating block', async () => {
    listingsService.getListing.mockResolvedValue({ host: { id: 2 } } as never);

    await expect(
      service.createAvailabilityBlock(
        1,
        10,
        '2026-04-01T00:00:00.000Z',
        '2026-04-02T00:00:00.000Z',
        'test',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when no availability blocks are found', async () => {
    repository.find.mockResolvedValue([]);

    await expect(service.findAvailabilityBlocks(10)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws conflict when creating overlapping availability block', async () => {
    listingsService.getListing.mockResolvedValue({
      id: 10,
      host: { id: 1 },
    } as never);

    const qbMock = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 99 }),
    };
    repository.createQueryBuilder.mockReturnValue(qbMock as never);

    await expect(
      service.createAvailabilityBlock(
        1,
        10,
        '2026-04-01T00:00:00.000Z',
        '2026-04-05T00:00:00.000Z',
        'Maintenance',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
