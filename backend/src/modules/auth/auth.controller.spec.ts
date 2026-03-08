import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock = {
      signup: jest.fn(),
      signin: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    const configServiceMock = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          JWT_REFRESH_EXPIRES: '7d',
          REFRESH_COOKIE_NAME: 'refreshToken',
          NODE_ENV: 'test',
        };
        return map[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('delegates signup to auth service', async () => {
    authService.signup.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });
    const response = { cookie: jest.fn() } as any;

    const result = await controller.signup({
      email: 'john@mail.com',
      password: '123',
      name: 'John',
    }, response);

    expect(result.accessToken).toBe('a');
    expect(response.cookie).toHaveBeenCalledTimes(1);
    expect(authService.signup).toHaveBeenCalledTimes(1);
  });
});
