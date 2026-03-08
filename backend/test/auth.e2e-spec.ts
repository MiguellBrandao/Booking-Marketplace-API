import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { Users } from '../src/modules/users/user.entity';

describe('Auth (integration)', () => {
  let app: INestApplication;
  let usersRepository: Repository<Users>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersRepository = moduleFixture.get(getRepositoryToken(Users));
  });

  beforeEach(async () => {
    await usersRepository.query('TRUNCATE TABLE "Users" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('signup + signin + refresh flow works', async () => {
    const email = `auth-${Date.now()}@mail.com`;
    const password = 'StrongPass123!';

    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name: 'Auth User' })
      .expect(201);

    expect(signup.body.accessToken).toBeDefined();
    expect(signup.body.refreshToken).toBeDefined();

    const signin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(201);

    expect(signin.body.accessToken).toBeDefined();
    expect(signin.body.refreshToken).toBeDefined();

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: signin.body.refreshToken })
      .expect(201);

    expect(refresh.body.accessToken).toBeDefined();
    expect(refresh.body.refreshToken).toBeDefined();
  });

  it('signin fails with wrong password', async () => {
    const email = `wrong-pass-${Date.now()}@mail.com`;
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'Correct123!', name: 'Wrong Password' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'Wrong123!' })
      .expect(400);
  });
});
