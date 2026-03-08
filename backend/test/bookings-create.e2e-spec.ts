import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Users } from '../src/modules/users/user.entity';
import { Listings } from '../src/modules/listings/listings.entity';
import { AvailabilityBlocks } from '../src/modules/availabilityBlocks/availabilityBlocks.entity';
import { Bookings } from '../src/modules/bookings/bookings.entity';

describe('Bookings create API (integration)', () => {
  let app: INestApplication;
  let usersRepository: Repository<Users>;
  let listingsRepository: Repository<Listings>;
  let availabilityRepository: Repository<AvailabilityBlocks>;
  let bookingsRepository: Repository<Bookings>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(Users));
    listingsRepository = moduleFixture.get(getRepositoryToken(Listings));
    availabilityRepository = moduleFixture.get(getRepositoryToken(AvailabilityBlocks));
    bookingsRepository = moduleFixture.get(getRepositoryToken(Bookings));
  });

  beforeEach(async () => {
    await bookingsRepository.query('TRUNCATE TABLE "Bookings" RESTART IDENTITY CASCADE');
    await availabilityRepository.query(
      'TRUNCATE TABLE "AvailabilityBlocks" RESTART IDENTITY CASCADE',
    );
    await listingsRepository.query('TRUNCATE TABLE "Listings" RESTART IDENTITY CASCADE');
    await usersRepository.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  async function signupAndGetToken(email: string, name: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'StrongPass123!', name })
      .expect(201);
    return response.body.accessToken as string;
  }

  async function createListing(hostToken: string) {
    const listingRes = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Booking Test Listing',
        description: 'Test description',
        city: 'Lisbon',
        pricePerNight: 100,
        currency: 'EUR',
        status: 'active',
      })
      .expect(201);

    return listingRes.body.id as number;
  }

  it('creates booking successfully', async () => {
    const hostToken = await signupAndGetToken(`host-${Date.now()}@mail.com`, 'Host');
    const guestToken = await signupAndGetToken(`guest-${Date.now()}@mail.com`, 'Guest');
    const listingId = await createListing(hostToken);

    const response = await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId,
        startDate: '2026-08-10T00:00:00.000Z',
        endDate: '2026-08-12T00:00:00.000Z',
        currency: 'EUR',
      })
      .expect(201);

    expect(response.body.status).toBe('pending');
    expect(response.body.expiresAt).toBeDefined();
  });

  it('returns conflict when dates are blocked for listing', async () => {
    const hostToken = await signupAndGetToken(`host2-${Date.now()}@mail.com`, 'Host 2');
    const guestToken = await signupAndGetToken(
      `guest2-${Date.now()}@mail.com`,
      'Guest 2',
    );
    const listingId = await createListing(hostToken);

    await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-09-03T00:00:00.000Z',
        reason: 'Host unavailable',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId,
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: '2026-09-03T00:00:00.000Z',
        currency: 'EUR',
      })
      .expect(409);
  });

  it('returns bad request for invalid dates', async () => {
    const hostToken = await signupAndGetToken(`host3-${Date.now()}@mail.com`, 'Host 3');
    const guestToken = await signupAndGetToken(
      `guest3-${Date.now()}@mail.com`,
      'Guest 3',
    );
    const listingId = await createListing(hostToken);

    await request(app.getHttpServer())
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId,
        startDate: '2026-10-10T00:00:00.000Z',
        endDate: '2026-10-08T00:00:00.000Z',
        currency: 'EUR',
      })
      .expect(400);
  });
});
