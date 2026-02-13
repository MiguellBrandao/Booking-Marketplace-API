import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { SignInDto } from './dtos/signin.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { AuthDto } from './dtos/auth.dto';
import { AuthService } from './auth.service';
import { RefreshDto } from './dtos/refresh.dto';
import { AuthGuard } from './guards/auth.guard';

@Serialize(AuthDto)
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("/signup")
    signup(@Body() body: SignUpDto) {
        return this.authService.signup(body)
    }

    @Post("signin")
    signin(@Body() body: SignInDto) {
        return this.authService.signin(body)
    }

    @Post("refresh")
    refresh(@Body() body: RefreshDto) {
        return this.authService.refresh(body)
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    logout(@Request() request) {
        console.log(request.user.id)
        return this.authService.logout(request.user)
    }

}
