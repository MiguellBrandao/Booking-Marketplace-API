import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Users } from '../src/modules/users/user.entity';
import { Listings, ListingStatus } from '../src/modules/listings/listings.entity';
import { Bookings, BookingStatus } from '../src/modules/bookings/bookings.entity';
import { BookingsExpireService } from '../src/modules/bookings/bookings-expire.service';

describe('Bookings expiration sweep (integration)', () => {
  let app: INestApplication;
  let usersRepository: Repository<Users>;
  let listingsRepository: Repository<Listings>;
  let bookingsRepository: Repository<Bookings>;
  let expireService: BookingsExpireService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(Users));
    listingsRepository = moduleFixture.get(getRepositoryToken(Listings));
    bookingsRepository = moduleFixture.get(getRepositoryToken(Bookings));
    expireService = moduleFixture.get(BookingsExpireService);
  });

  beforeEach(async () => {
    await bookingsRepository.query('TRUNCATE TABLE "Bookings" RESTART IDENTITY CASCADE');
    await listingsRepository.query('TRUNCATE TABLE "Listings" RESTART IDENTITY CASCADE');
    await usersRepository.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('expires only due pending bookings', async () => {
    const user = await usersRepository.save(
      usersRepository.create({
        email: `expire-${Date.now()}@mail.com`,
        password: 'pass',
        name: 'Expire User',
      }),
    );
    const listing = await listingsRepository.save(
      listingsRepository.create({
        host: user,
        title: 'Expire Test Listing',
        description: 'desc',
        city: 'Lisbon',
        pricePerNight: 100,
        currency: 'EUR',
        status: ListingStatus.ACTIVE,
      }),
    );

    await bookingsRepository.save(
      bookingsRepository.create({
        listing,
        guest: user,
        startDate: new Date('2026-03-10T00:00:00.000Z'),
        endDate: new Date('2026-03-11T00:00:00.000Z'),
        status: BookingStatus.PENDING,
        totalAmount: 100,
        currency: 'EUR',
        expiresAt: new Date(Date.now() - 60_000),
      }),
    );
    await bookingsRepository.save(
      bookingsRepository.create({
        listing,
        guest: user,
        startDate: new Date('2026-03-12T00:00:00.000Z'),
        endDate: new Date('2026-03-13T00:00:00.000Z'),
        status: BookingStatus.CONFIRMED,
        totalAmount: 100,
        currency: 'EUR',
        expiresAt: new Date(Date.now() - 60_000),
      }),
    );

    const affected = await expireService.expireDuePendingBookings();
    expect(affected).toBeGreaterThanOrEqual(0);

    const all = await bookingsRepository.find({ order: { id: 'ASC' } });
    expect(all[0].status).toBe(BookingStatus.EXPIRED);
    expect(all[0].expiredAt).toBeTruthy();
    expect(all[1].status).toBe(BookingStatus.CONFIRMED);
  });
});
