import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

interface CheckoutDto {
  guestToken?: string;
  customer: { name: string; phone: string; email?: string; city: string; address: string };
  paymentMethod: 'COD' | 'GIFT_CARD' | 'LOYALTY_POINTS' | 'BANK_TRANSFER';
  voucherCode?: string;
  giftCardCode?: string;
  pointsToUse?: number;
  affiliateCode?: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly loyalty: LoyaltyService,
  ) {}

  async checkout(dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1) Resolve cart (by guest token or customer phone)
      const cart = await this.findCart(tx, dto.customer.phone, dto.guestToken);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('السلة فارغة');
      }

      // 2) Find or create customer
      const customer = await tx.customer.upsert({
        where: { phone: dto.customer.phone },
        create: {
          phone: dto.customer.phone,
          fullName: dto.customer.name,
          email: dto.customer.email,
          city: dto.customer.city,
          address: dto.customer.address,
          isGuest: true,
        },
        update: {
          fullName: dto.customer.name,
          email: dto.customer.email,
          city: dto.customer.city,
          address: dto.customer.address,
        },
      });

      // 3) Re-validate prices (server is source of truth)
      const productIds = cart.items.map((i: any) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsData: any[] = [];
      for (const item of cart.items) {
        const p = productMap.get(item.productId);
        if (!p) throw new BadRequestException(`منتج غير متوفر: ${item.productId}`);
        if (p.stock < item.quantity) {
          throw new BadRequestException(`المخزون غير كافٍ لـ "${p.nameAr}"`);
        }
        subtotal += Number(p.basePrice) * item.quantity;
        orderItemsData.push({
          productId: p.id,
          productName: p.nameAr,
          productSku: p.sku,
          productImage: (p as any).images?.[0]?.webpUrl || (p as any).images?.[0]?.url,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: p.basePrice,
          totalPrice: Number(p.basePrice) * item.quantity,
        });
      }

      // 4) Apply voucher
      let discount = 0;
      if (dto.voucherCode) {
        const v = await this.validateVoucher(tx, dto.voucherCode, subtotal, customer.id);
        discount += v.discount;
        await tx.voucherUsage.create({
          data: { voucherId: v.voucherId, customerId: customer.id, discount: v.discount },
        });
        await tx.voucher.update({ where: { id: v.voucherId }, data: { usageCount: { increment: 1 } } });
      }

      // 5) Apply gift card
      if (dto.giftCardCode) {
        const gc = await tx.giftCard.findUnique({ where: { code: dto.giftCardCode } });
        if (!gc || gc.redeemed || !gc.active || gc.balance <= 0) {
          throw new BadRequestException('كارت الهدية غير صالح');
        }
        const use = Math.min(Number(gc.balance), subtotal - discount);
        discount += use;
        await tx.giftCard.update({
          where: { id: gc.id },
          data: { balance: { decrement: use }, redeemed: use === Number(gc.balance) },
        });
      }

      // 6) Points
      if (dto.pointsToUse && dto.pointsToUse > 0) {
        const value = await this.loyalty.redeemPoints(customer.id, dto.pointsToUse);
        discount += value;
      }

      // 7) Affiliate
      let affiliateId: string | undefined;
      if (dto.affiliateCode) {
        const aff = await tx.affiliate.findUnique({ where: { code: dto.affiliateCode } });
        if (aff) affiliateId = aff.id;
      }

      // 8) Shipping
      const settings = await this.getShippingSettings(tx);
      const shipping = settings.freeShipping ? 0 : settings.shippingFee;

      // 9) Generate order number
      const orderNumber = await this.generateOrderNumber(tx);

      // 10) Create order
      const total = Math.max(0, subtotal - discount + shipping);
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          customerName: dto.customer.name,
          customerPhone: dto.customer.phone,
          customerEmail: dto.customer.email,
          customerCity: dto.customer.city,
          customerAddress: dto.customer.address,
          status: 'PENDING',
          paymentMethod: dto.paymentMethod,
          isGuest: true,
          subtotal,
          discount,
          shipping,
          total,
          voucherCode: dto.voucherCode,
          giftCardCode: dto.giftCardCode,
          pointsUsed: dto.pointsToUse || 0,
          affiliateCode: dto.affiliateCode,
          notes: dto.notes,
          items: { create: orderItemsData },
          statusHistory: {
            create: { status: 'PENDING', note: 'تم إنشاء الطلب' },
          },
        },
        include: { items: true },
      });

      // 11) Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        });
      }

      // 12) Loyalty earn (only for COD orders)
      let earned = 0;
      if (dto.paymentMethod === 'COD') {
        const loyaltySettings = await this.getLoyaltySettings(tx);
        earned = Math.floor(total / Number(loyaltySettings.pointsPerYER));
        if (earned > 0) {
          await this.loyalty.earnPoints(customer.id, earned, `طلب ${orderNumber}`);
        }
      }

      // 13) Affiliate commission
      if (affiliateId) {
        const aff = await tx.affiliate.findUnique({ where: { id: affiliateId } });
        if (aff) {
          const commission = Math.round(total * Number(aff.commissionPct));
          await tx.affiliateCommission.create({
            data: { affiliateId: aff.id, orderId: order.id, amount: commission, rate: aff.commissionPct },
          });
          await tx.affiliate.update({
            where: { id: aff.id },
            data: { totalEarned: { increment: commission }, totalOrders: { increment: 1 } },
          });
        }
      }

      // 14) Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      // 15) Audit log
      await this.audit.log({
        userId: null, userEmail: dto.customer.email,
        action: 'CREATE', resource: 'order', resourceId: order.id,
        afterData: { orderNumber, total } as any,
        metadata: { source: 'guest_checkout' },
      });

      return {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentMethod: order.paymentMethod,
          total: Number(order.total),
          currency: 'YER',
          invoiceUrl: `/admin/orders/${order.id}/invoice.pdf`,
          estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
          trackingUrl: `/orders/track?phone=${dto.customer.phone}&code=${order.orderNumber}`,
        },
        loyaltyEarned: earned,
      };
    });
  }

  async getByOrderNumber(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('الطلب غير موجود');
    if (order.customerPhone !== phone) throw new NotFoundException('الطلب غير موجود');
    return order;
  }

  async adminList(opts: { page?: number; limit?: number; status?: OrderStatus; q?: string; archived?: boolean }) {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(100, opts.limit || 25);
    const where: Prisma.OrderWhereInput = {
      ...(opts.status && { status: opts.status }),
      ...(opts.archived !== undefined && { archived: opts.archived }),
      ...(opts.q && {
        OR: [
          { orderNumber: { contains: opts.q, mode: 'insensitive' } },
          { customerName: { contains: opts.q, mode: 'insensitive' } },
          { customerPhone: { contains: opts.q } },
        ],
      }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
        include: { items: true, customer: true },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminGet(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true, statusHistory: { orderBy: { createdAt: 'desc' } } },
    });
  }

  async adminUpdateStatus(id: string, status: OrderStatus, userId: string, note?: string) {
    const before = await this.prisma.order.findUnique({ where: { id } });
    if (!before) throw new NotFoundException();
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'SHIPPED' && { shippedAt: new Date(), trackingNumber: `YMP-${Date.now().toString().slice(-8)}` }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        statusHistory: { create: { status, changedBy: userId, note } },
      },
    });
    await this.audit.log({
      userId, action: 'UPDATE', resource: 'order', resourceId: id,
      beforeData: { status: before.status }, afterData: { status },
      metadata: { note },
    });
    return order;
  }

  async adminArchive(id: string, userId: string) {
    const order = await this.prisma.order.update({
      where: { id }, data: { archived: true, archivedAt: new Date() },
    });
    await this.audit.log({
      userId, action: 'UPDATE', resource: 'order', resourceId: id,
      afterData: { archived: true } as any,
    });
    return order;
  }

  async dashboardSummary() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalRevenue, todayOrders, pendingOrders, totalCustomers, lowStock, archivedCount] = await this.prisma.$transaction([
      this.prisma.order.aggregate({ _sum: { total: true }, where: { archived: false, status: { not: 'CANCELLED' } } }),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.customer.count({ where: { active: true } }),
      this.prisma.product.count({ where: { stock: { lt: 5 } } }),
      this.prisma.order.count({ where: { archived: true } }),
    ]);
    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      todayOrders,
      pendingOrders,
      totalCustomers,
      lowStockProducts: lowStock,
      archivedOrders: archivedCount,
      currency: 'YER',
    };
  }

  // -------- helpers --------
  private async findCart(tx: any, phone: string, guestToken?: string) {
    return tx.cart.findFirst({
      where: guestToken
        ? { guestToken }
        : { customer: { phone } },
      include: { items: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private async validateVoucher(tx: any, code: string, subtotal: number, customerId: string) {
    const v = await tx.voucher.findUnique({ where: { code } });
    if (!v || !v.active) throw new BadRequestException('كود غير صالح');
    if (v.startsAt && v.startsAt > new Date()) throw new BadRequestException('الكود لم يبدأ بعد');
    if (v.expiresAt && v.expiresAt < new Date()) throw new BadRequestException('انتهت صلاحية الكود');
    if (v.usageLimit && v.usageCount >= v.usageLimit) throw new BadRequestException('استنفد الكود');
    if (v.minOrderAmount && subtotal < Number(v.minOrderAmount)) {
      throw new BadRequestException(`الحد الأدنى ${Number(v.minOrderAmount).toLocaleString('ar-EG')} ر.ي`);
    }
    let discount = 0;
    if (v.type === 'PERCENTAGE') {
      discount = Math.round(subtotal * (Number(v.value) / 100));
      if (v.maxDiscount && discount > Number(v.maxDiscount)) discount = Number(v.maxDiscount);
    } else if (v.type === 'FIXED_AMOUNT') {
      discount = Number(v.value);
    } else if (v.type === 'FREE_SHIPPING') {
      discount = 0; // handled in shipping
    }
    return { voucherId: v.id, discount };
  }

  private async generateOrderNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await tx.order.count({
      where: { orderNumber: { startsWith: `AB-${year}-` } },
    });
    return `AB-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  private async getShippingSettings(tx: any) {
    const s = await tx.setting.findFirst({ where: { key: 'shipping' } });
    if (!s) return { freeShipping: true, shippingFee: 0 };
    return s.value as any;
  }

  private async getLoyaltySettings(tx: any) {
    const s = await tx.setting.findFirst({ where: { key: 'loyalty' } });
    if (!s) return { pointsPerYER: 100, yERPerPoint: 50 };
    return s.value as any;
  }
}