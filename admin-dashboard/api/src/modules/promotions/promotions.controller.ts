import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';

@Controller()
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Public()
  @Get('promotions/active')
  getActive() {
    return this.promotions.getActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('admin/promotions')
  adminList() {
    return this.promotions.adminList();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/promotions')
  adminCreate(@Body() dto: any) {
    return this.promotions.adminCreate(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('admin/promotions/:id')
  adminUpdate(@Param('id') id: string, @Body() dto: any) {
    return this.promotions.adminUpdate(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Delete('admin/promotions/:id')
  adminDelete(@Param('id') id: string) {
    return this.promotions.adminDelete(id);
  }
}