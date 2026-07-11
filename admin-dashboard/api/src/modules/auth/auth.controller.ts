import { Body, Controller, Get, Ip, Post, Req, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth/admin')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // 10 attempts/min
  @Post('login')
  login(
    @Body() dto: AdminLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') ua: string,
  ) {
    return this.auth.login(dto.email, dto.password, ip, ua, dto.device);
  }

  @Public()
  @Post('refresh')
  refresh(@Body('refreshToken') token: string, @Ip() ip: string) {
    return this.auth.refresh(token, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser('id') userId: string, @Ip() ip: string) {
    return this.auth.logout(userId, ip);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.auth.me(userId);
  }
}