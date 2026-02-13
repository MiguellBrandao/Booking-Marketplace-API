import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Users } from '../src/modules/users/user.entity';
import { Listings } from '../src/modules/listings/listings.entity';
import { AvailabilityBlocks } from '../src/modules/availabilityBlocks/availabilityBlocks.entity';

describe('Listings + Availability (integration)', () => {
  let app: INestApplication;
  let usersRepository: Repository<Users>;
  let listingsRepository: Repository<Listings>;
  let availabilityRepository: Repository<AvailabilityBlocks>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(Users));
    listingsRepository = moduleFixture.get(getRepositoryToken(Listings));
    availabilityRepository = moduleFixture.get(getRepositoryToken(AvailabilityBlocks));
  });

  beforeEach(async () => {
    await availabilityRepository.query(
      'TRUNCATE TABLE "AvailabilityBlocks" RESTART IDENTITY CASCADE',
    );
    await listingsRepository.query('TRUNCATE TABLE "Listings" RESTART IDENTITY CASCADE');
    await usersRepository.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  async function signupAndGetToken(email: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'StrongPass123!', name: 'User' })
      .expect(201);
    return response.body.accessToken as string;
  }

  it('creates listing and manages availability blocks', async () => {
    const hostToken = await signupAndGetToken(`host-${Date.now()}@mail.com`);

    const listingRes = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Beach House',
        description: 'Ocean view',
        city: 'Porto',
        pricePerNight: 200,
        currency: 'EUR',
        status: 'active',
      })
      .expect(201);

    const listingId = listingRes.body.id;
    expect(listingId).toBeDefined();

    const createBlock = await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId,
        startDate: '2026-04-01T00:00:00.000Z',
        endDate: '2026-04-05T00:00:00.000Z',
        reason: 'Maintenance',
      })
      .expect(201);

    expect(createBlock.body.reason).toBe('Maintenance');

    const found = await request(app.getHttpServer())
      .get('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .query({ listingId: String(listingId) })
      .expect(200);

    expect(Array.isArray(found.body)).toBe(true);
    expect(found.body.length).toBe(1);

    const persistedBlock = await availabilityRepository.findOneByOrFail({
      reason: 'Maintenance',
    });

    await request(app.getHttpServer())
      .delete(`/availabilityblocks/${persistedBlock.id}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(200);
  });

  it('prevents non-host from creating availability block', async () => {
    const hostToken = await signupAndGetToken(`host2-${Date.now()}@mail.com`);
    const otherToken = await signupAndGetToken(`other-${Date.now()}@mail.com`);

    const listingRes = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Mountain Cabin',
        description: 'Quiet and private',
        city: 'Braga',
        pricePerNight: 140,
        currency: 'EUR',
        status: 'active',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        listingId: listingRes.body.id,
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-05-03T00:00:00.000Z',
        reason: 'Block attempt',
      })
      .expect(401);
  });

  it('prevents overlapping blocks on create and update', async () => {
    const hostToken = await signupAndGetToken(`host3-${Date.now()}@mail.com`);

    const listingRes = await request(app.getHttpServer())
      .post('/listings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'City Loft',
        description: 'Center',
        city: 'Lisbon',
        pricePerNight: 180,
        currency: 'EUR',
        status: 'active',
      })
      .expect(201);

    const listingId = listingRes.body.id;

    const blockA = await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId,
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-05T00:00:00.000Z',
        reason: 'Maintenance A',
      })
      .expect(201);

    const blockB = await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId,
        startDate: '2026-06-10T00:00:00.000Z',
        endDate: '2026-06-12T00:00:00.000Z',
        reason: 'Maintenance B',
      })
      .expect(201);
    const persistedBlockB = await availabilityRepository.findOneByOrFail({
      reason: 'Maintenance B',
    });

    await request(app.getHttpServer())
      .post('/availabilityblocks')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId,
        startDate: '2026-06-04T00:00:00.000Z',
        endDate: '2026-06-06T00:00:00.000Z',
        reason: 'Should conflict',
      })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/availabilityblocks/${persistedBlockB.id}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        startDate: '2026-06-03T00:00:00.000Z',
        endDate: '2026-06-11T00:00:00.000Z',
      })
      .expect(409);

    await request(app.getHttpServer())
      .patch(`/availabilityblocks/${persistedBlockB.id}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        startDate: '2026-06-12T00:00:00.000Z',
        endDate: '2026-06-14T00:00:00.000Z',
        reason: 'Updated non-overlap',
      })
      .expect(200);

    expect(blockA.body.reason).toBe('Maintenance A');
  });
});
