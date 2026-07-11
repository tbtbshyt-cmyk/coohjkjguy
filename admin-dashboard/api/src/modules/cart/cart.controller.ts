import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { GuestToken } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Public()
  @Get()
  async get(
    @CurrentUser('id') userId: string | undefined,
    @GuestToken() guestToken: string | undefined,
  ) {
    const c = await this.cart.getOrCreate(userId, guestToken);
    const totals = await this.cart.getTotals(c.id);
    return { data: { ...c, totals } };
  }

  @Public()
  @Post('items')
  async addItem(
    @GuestToken() guestToken: string | undefined,
    @CurrentUser('id') userId: string | undefined,
    @Body() body: { productId: string; variantId?: string; quantity: number; size?: string; color?: string },
  ) {
    const c = await this.cart.getOrCreate(userId, guestToken);
    const item = await this.cart.addItem(c.id, body);
    const totals = await this.cart.getTotals(c.id);
    return { data: { item, totals } };
  }

  @Public()
  @Patch('items/:id')
  updateQty(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cart.updateQty(id, quantity);
  }

  @Public()
  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.cart.removeItem(id);
  }
}