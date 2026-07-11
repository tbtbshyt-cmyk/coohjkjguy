import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(customerId?: string, guestToken?: string) {
    const where = customerId ? { customerId } : { guestToken: guestToken || `gt_${uuid()}` };
    let cart = await this.prisma.cart.findFirst({
      where, include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId, guestToken: guestToken || `gt_${uuid()}`, items: { create: [] } },
        include: { items: { include: { product: { include: { images: { take: 1 } } } } } },
      });
    }
    return cart;
  }

  async addItem(cartId: string, item: { productId: string; variantId?: string; quantity: number; size?: string; color?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new NotFoundException('المنتج غير موجود');
    if (product.stock < item.quantity) throw new NotFoundException('المخزون غير كافي');

    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId, productId: item.productId, size: item.size, color: item.color },
    });
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity, unitPrice: product.basePrice },
        include: { product: { include: { images: { take: 1 } } } },
      });
    }
    return this.prisma.cartItem.create({
      data: { cartId, productId: item.productId, quantity: item.quantity, size: item.size, color: item.color, unitPrice: product.basePrice },
      include: { product: { include: { images: { take: 1 } } } },
    });
  }

  async updateQty(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.max(1, quantity) },
      include: { product: { include: { images: { take: 1 } } } },
    });
  }

  async removeItem(itemId: string) {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { removed: true };
  }

  async getTotals(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId }, include: { product: true },
    });
    let subtotal = 0;
    for (const i of items) subtotal += Number(i.unitPrice) * i.quantity;
    const shipping = 0; // could read from settings
    return { subtotal, discount: 0, shipping, total: subtotal + shipping, currency: 'YER' };
  }
}