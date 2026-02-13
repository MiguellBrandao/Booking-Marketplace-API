import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

jest.mock('src/utils/bcrypt', () => ({
  hashValue: jest.fn(async (value: string) => `hashed-${value}`),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<Users>>;

  beforeEach(async () => {
    const repoMock = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(Users), useValue: repoMock },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(getRepositoryToken(Users));
  });

  it('finds user by id', async () => {
    repository.findOneBy.mockResolvedValue({ id: 7 } as never);

    const user = await service.findUser(7);

    expect(user).toEqual({ id: 7 });
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 7 });
  });

  it('creates user hashing password before save', async () => {
    repository.create.mockImplementation((input) => input as Users);
    repository.save.mockImplementation(async (input) => input as Users);

    const created = await service.createUser('test@mail.com', 'secret', 'Test');

    expect(repository.create).toHaveBeenCalledWith({
      email: 'test@mail.com',
      password: 'hashed-secret',
      name: 'Test',
    });
    expect(created.password).toBe('hashed-secret');
  });

  it('throws when updating refresh token for missing user', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.updateRefreshToken(99, 'token')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
