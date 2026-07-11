import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';

@Controller()
export class GiftCardsController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Public()
  @Post('gift-cards')
  create(@Body() dto: any) {
    return this.giftCards.create(dto);
  }

  @Public()
  @Get('gift-cards/:code/balance')
  getBalance(@Param('code') code: string) {
    return this.giftCards.getBalance(code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('admin/gift-cards')
  listAll() {
    return this.giftCards.listAll();
  }
}