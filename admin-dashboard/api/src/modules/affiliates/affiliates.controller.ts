import { Body, Controller, Get, Headers, Ip, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class AffiliatesController {
  constructor(private readonly affiliates: AffiliatesService) {}

  @Public()
  @Post('affiliates/track')
  track(@Body('code') code: string, @Ip() ip: string, @Headers('user-agent') ua: string, @Headers('referer') referrer: string) {
    return this.affiliates.trackClick(code, ip, ua, referrer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('affiliates/me')
  getMe(@Query('code') code: string) {
    return this.affiliates.getMe(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('admin/affiliates')
  adminList(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.affiliates.adminList(Number(page) || 1, Number(limit) || 50);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/affiliates')
  adminCreate(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.affiliates.adminCreate(dto, userId);
  }
}