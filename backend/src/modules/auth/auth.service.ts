import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareValue, hashValue } from 'src/utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { Users } from '../users/user.entity';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

interface TokensPayload {
  id: number;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private async generateTokens(payload: TokensPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<StringValue>('JWT_ACCESS_EXPIRES') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<StringValue>('JWT_REFRESH_EXPIRES') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async signup({ email, password, name }: SignUpDto): Promise<AuthTokens> {
    const existing = await this.userService.findUser(undefined, email);
    if (existing) throw new BadRequestException('Email already in use!');
    const user = await this.userService.createUser(email, password, name);

    const tokenPayload = { id: user.id, name: user.name };
    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    await this.userService.updateRefreshToken(
      user.id,
      await hashValue(refreshToken),
    );

    return { accessToken, refreshToken };
  }

  async signin({ email, password }: SignInDto): Promise<AuthTokens> {
    const user = await this.userService.findUser(undefined, email);

    if (!user) throw new NotFoundException('User not found!');

    const passwordValid = await compareValue(password, user.password);

    if (!passwordValid) throw new BadRequestException('Password is incorrect!');

    const tokenPayload = {
      id: user.id,
      name: user.name,
    };
    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    await this.userService.updateRefreshToken(
      user.id,
      await hashValue(refreshToken),
    );

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user: Users | null = await this.userService.findUser(payload.id);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Refresh token mismatch');

    const match = await compareValue(refreshToken, user.hashedRefreshToken);
    if (!match) throw new UnauthorizedException('Refresh token mismatch');

    const newPayload = { id: user.id, name: user.name };
    const generatedTokens = await this.generateTokens(newPayload);

    await this.userService.updateRefreshToken(
      user.id,
      await hashValue(generatedTokens.refreshToken),
    );

    return generatedTokens;
  }

  async logout(userId: number) {
    await this.userService.updateRefreshToken(userId, null);
    return { ok: true };
  }
}
