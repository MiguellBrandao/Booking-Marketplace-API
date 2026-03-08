import { ConflictException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Bookings, BookingStatus } from '../src/modules/bookings/bookings.entity';
import { Listings, ListingStatus } from '../src/modules/listings/listings.entity';
import { Users } from '../src/modules/users/user.entity';
import { BookingsService } from '../src/modules/bookings/bookings.service';

describe('Bookings confirmation concurrency (integration)', () => {
  let app: INestApplication;
  let bookingsService: BookingsService;
  let usersRepository: Repository<Users>;
  let listingsRepository: Repository<Listings>;
  let bookingsRepository: Repository<Bookings>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bookingsService = moduleFixture.get(BookingsService);
    usersRepository = moduleFixture.get(getRepositoryToken(Users));
    listingsRepository = moduleFixture.get(getRepositoryToken(Listings));
    bookingsRepository = moduleFixture.get(getRepositoryToken(Bookings));
  });

  beforeEach(async () => {
    await bookingsRepository.query('TRUNCATE TABLE "Bookings" RESTART IDENTITY CASCADE');
    await listingsRepository.query('TRUNCATE TABLE "Listings" RESTART IDENTITY CASCADE');
    await usersRepository.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedUserAndListing() {
    const user = await usersRepository.save(
      usersRepository.create({
        email: `concurrency-${Date.now()}@mail.com`,
        password: 'pass',
        name: 'Concurrency Tester',
      }),
    );

    const listing = await listingsRepository.save(
      listingsRepository.create({
        host: user,
        title: 'Concurrency Listing',
        description: 'For booking confirmation race tests',
        city: 'Lisbon',
        pricePerNight: 100,
        currency: 'EUR',
        status: ListingStatus.ACTIVE,
      }),
    );

    return { user, listing };
  }

  it('same booking confirmed simultaneously -> one succeeds and one conflicts', async () => {
    const { user, listing } = await seedUserAndListing();
    const now = new Date();
    const booking = await bookingsRepository.save(
      bookingsRepository.create({
        listing,
        guest: user,
        startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalAmount: 100,
        currency: 'EUR',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      }),
    );

    const [r1, r2] = await Promise.allSettled([
      bookingsService.confirmBooking(booking.id),
      bookingsService.confirmBooking(booking.id),
    ]);

    const fulfilledCount = [r1, r2].filter((result) => result.status === 'fulfilled').length;
    const rejectedResults = [r1, r2].filter((result) => result.status === 'rejected');

    expect(fulfilledCount).toBe(1);
    expect(rejectedResults).toHaveLength(1);
    expect((rejectedResults[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      ConflictException,
    );

    const updated = await bookingsRepository.findOneByOrFail({ id: booking.id });
    expect(updated.status).toBe(BookingStatus.CONFIRMED);
  });

  it('two overlapping pending bookings confirmed simultaneously -> only one confirmed', async () => {
    const { user, listing } = await seedUserAndListing();
    const now = new Date();

    const bookingA = await bookingsRepository.save(
      bookingsRepository.create({
        listing,
        guest: user,
        startDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalAmount: 300,
        currency: 'EUR',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      }),
    );

    const bookingB = await bookingsRepository.save(
      bookingsRepository.create({
        listing,
        guest: user,
        startDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 96 * 60 * 60 * 1000),
        status: BookingStatus.PENDING,
        totalAmount: 300,
        currency: 'EUR',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      }),
    );

    const [r1, r2] = await Promise.allSettled([
      bookingsService.confirmBooking(bookingA.id),
      bookingsService.confirmBooking(bookingB.id),
    ]);

    const fulfilledCount = [r1, r2].filter((result) => result.status === 'fulfilled').length;
    const rejectedResults = [r1, r2].filter((result) => result.status === 'rejected');

    expect(fulfilledCount).toBe(1);
    expect(rejectedResults).toHaveLength(1);
    expect((rejectedResults[0] as PromiseRejectedResult).reason).toBeInstanceOf(
      ConflictException,
    );

    const latestA = await bookingsRepository.findOneByOrFail({ id: bookingA.id });
    const latestB = await bookingsRepository.findOneByOrFail({ id: bookingB.id });
    const confirmedCount = [latestA, latestB].filter(
      (booking) => booking.status === BookingStatus.CONFIRMED,
    ).length;
    const pendingCount = [latestA, latestB].filter(
      (booking) => booking.status === BookingStatus.PENDING,
    ).length;

    expect(confirmedCount).toBe(1);
    expect(pendingCount).toBe(1);
  });
});
