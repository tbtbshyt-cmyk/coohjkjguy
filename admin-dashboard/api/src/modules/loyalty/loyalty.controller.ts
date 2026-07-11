import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.loyalty.getOrCreateAccount(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/transactions')
  history(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loyalty.history(userId, Number(page) || 1, Number(limit) || 20);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  redeem(@CurrentUser('id') userId: string, @Body('points') points: number) {
    return this.loyalty.redeemPoints(userId, points);
  }
}