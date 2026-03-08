import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AuthDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Serialize(AuthDto)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getRefreshCookieName() {
    return this.configService.get<string>('REFRESH_COOKIE_NAME') ?? 'refreshToken';
  }

  private getRefreshCookieMaxAgeMs() {
    const configured = this.configService.get<string>('REFRESH_COOKIE_MAX_AGE_MS');
    const parsed = configured ? Number(configured) : NaN;
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    return 7 * 24 * 60 * 60 * 1000;
  }

  private setRefreshCookie(response: ExpressResponse, refreshToken: string) {
    response.cookie(this.getRefreshCookieName(), refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.getRefreshCookieMaxAgeMs(),
    });
  }

  private clearRefreshCookie(response: ExpressResponse) {
    response.clearCookie(this.getRefreshCookieName(), {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({ type: AuthDto })
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const tokens = await this.authService.signup(body);
    this.setRefreshCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ type: AuthDto })
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const tokens = await this.authService.signin(body);
    this.setRefreshCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get a new access token using refresh token cookie' })
  @ApiOkResponse({ type: AuthDto })
  async refresh(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const refreshToken = request.cookies?.[this.getRefreshCookieName()];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie not found');
    }

    const tokens = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(response, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current authenticated user' })
  @ApiOkResponse({
    schema: { example: { ok: true } },
  })
  async logout(
    @Req() request: ExpressRequest & { user: { id: number } },
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    this.clearRefreshCookie(response);
    return this.authService.logout(request.user.id);
  }
}
