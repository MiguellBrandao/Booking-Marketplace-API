import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AuthDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { RefreshDto } from './dtos/refresh.dto';
import { AuthGuard } from './guards/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Serialize(AuthDto)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({ type: AuthDto })
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ type: AuthDto })
  signin(@Body() body: SignInDto) {
    return this.authService.signin(body);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Get a new access token using refresh token' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ type: AuthDto })
  refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current authenticated user' })
  @ApiOkResponse({
    schema: { example: { ok: true } },
  })
  logout(@Request() request) {
    return this.authService.logout(request.user.id);
  }
}
