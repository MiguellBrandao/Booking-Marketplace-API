import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { Repository } from 'typeorm';
import { hashValue } from 'src/utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
  ) {}

  async findUser(id?: number, email?: string) {
    if (!id && !email) return null;

    if (id) return this.userRepository.findOneBy({ id });
    else return this.userRepository.findOneBy({ email });
  }

  async createUser(email: string, password: string, name: string) {
    password = await hashValue(password);

    const user = this.userRepository.create({
      email,
      password,
      name,
    });

    return this.userRepository.save(user);
  }

  async updateRefreshToken(id: number, refreshToken: string | null) {
    const user = await this.userRepository.findOneBy({ id })
    if (!user) throw new NotFoundException('User not Found')
    Object.assign(user, { hashedRefreshToken: refreshToken });
    return this.userRepository.save(user)
  }
}
