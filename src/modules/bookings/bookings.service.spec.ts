import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bookings, BookingStatus } from './bookings.entity';
import { ListingsService } from '../listings/listings.service';
import { UsersService } from '../users/users.service';
import { AvailabilityBlockService } from '../availabilityBlocks/availabilityBlocks.service';
import { DataSource, Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: jest.Mocked<Repository<Bookings>>;
  let listingsService: jest.Mocked<ListingsService>;
  let usersService: jest.Mocked<UsersService>;
  let availabilityBlocksService: jest.Mocked<AvailabilityBlockService>;

  beforeEach(async () => {
    const bookingsRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    const listingsServiceMock = { getListing: jest.fn() };
    const usersServiceMock = { findUser: jest.fn() };
    const availabilityBlocksServiceMock = {
      findAvailabilityBlocksForBooking: jest.fn(),
    };
    const dataSourceMock = { createQueryRunner: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Bookings),
          useValue: bookingsRepositoryMock,
        },
        { provide: ListingsService, useValue: listingsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        {
          provide: AvailabilityBlockService,
          useValue: availabilityBlocksServiceMock,
        },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingsRepository = module.get(getRepositoryToken(Bookings));
    listingsService = module.get(ListingsService);
    usersService = module.get(UsersService);
    availabilityBlocksService = module.get(AvailabilityBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates pending booking with normalized dates and computed total amount', async () => {
    listingsService.getListing.mockResolvedValue({
      id: 10,
      pricePerNight: 100,
    } as never);
    usersService.findUser.mockResolvedValue({ id: 20 } as never);
    availabilityBlocksService.findAvailabilityBlocksForBooking.mockResolvedValue(
      [],
    );
    bookingsRepository.create.mockImplementation((input) => input as Bookings);
    bookingsRepository.save.mockImplementation(async (input) => input as Bookings);

    const result = await service.createBooking(
      10,
      20,
      '2026-03-10T12:00:00.000Z',
      '2026-03-12T12:00:00.000Z',
      'EUR',
    );

    expect(result.status).toBe(BookingStatus.PENDING);
    expect(result.totalAmount).toBe(200);
    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
    expect(bookingsRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws not found when listing does not exist', async () => {
    listingsService.getListing.mockResolvedValue(undefined as never);

    await expect(
      service.createBooking(
        999,
        1,
        '2026-03-10T12:00:00.000Z',
        '2026-03-12T12:00:00.000Z',
        'EUR',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws forbidden when cancelling booking from another guest', async () => {
    bookingsRepository.findOne.mockResolvedValue({
      id: 1,
      guest: { id: 33 },
      status: BookingStatus.PENDING,
    } as never);

    await expect(service.cancelBooking(1, 44, 'n/a')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
