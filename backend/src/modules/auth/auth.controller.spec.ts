import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  it('delegates signup to auth service', async () => {
    authService.signup.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const result = await controller.signup({
      email: 'john@mail.com',
      password: '123',
      name: 'John',
    });

    expect(result.accessToken).toBe('a');
    expect(authService.signup).toHaveBeenCalledTimes(1);
  });
});
