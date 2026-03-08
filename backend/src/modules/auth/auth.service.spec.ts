import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('src/utils/bcrypt', () => ({
  compareValue: jest.fn(),
  hashValue: jest.fn(async (value: string) => `hashed-${value}`),
}));

const { compareValue } = jest.requireMock('src/utils/bcrypt') as {
  compareValue: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const usersServiceMock = {
      findUser: jest.fn(),
      createUser: jest.fn(),
      updateRefreshToken: jest.fn(),
    };
    const jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    const configServiceMock = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_ACCESS_EXPIRES: '15m',
          JWT_REFRESH_EXPIRES: '7d',
        };
        return map[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('signup fails when email already exists', async () => {
    usersService.findUser.mockResolvedValue({ id: 1 } as never);

    await expect(
      service.signup({
        email: 'exists@mail.com',
        password: 'x',
        name: 'Exists',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('signin fails when user does not exist', async () => {
    usersService.findUser.mockResolvedValue(null);

    await expect(
      service.signin({ email: 'missing@mail.com', password: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('signin fails on invalid password', async () => {
    usersService.findUser.mockResolvedValue({
      id: 2,
      name: 'Test',
      password: 'stored',
    } as never);
    compareValue.mockResolvedValue(false);

    await expect(
      service.signin({ email: 'test@mail.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refresh fails on invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      service.refresh({ refreshToken: 'invalid-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
