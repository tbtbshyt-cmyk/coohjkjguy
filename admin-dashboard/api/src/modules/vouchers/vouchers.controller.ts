import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class VouchersController {
  constructor(private readonly vouchers: VouchersService) {}

  @Public()
  @Get('vouchers/:code')
  getPublic(@Param('code') code: string) {
    return this.vouchers.getPublic(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('admin/vouchers')
  adminList(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.vouchers.adminList(Number(page) || 1, Number(limit) || 50);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/vouchers')
  adminCreate(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.vouchers.adminCreate(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Delete('admin/vouchers/:id')
  adminDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.vouchers.adminDelete(id, userId);
  }
}