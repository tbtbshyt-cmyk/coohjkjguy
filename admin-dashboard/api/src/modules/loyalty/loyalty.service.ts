import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateAccount(customerId: string) {
    let acc = await this.prisma.loyaltyAccount.findUnique({ where: { customerId } });
    if (!acc) {
      acc = await this.prisma.loyaltyAccount.create({ data: { customerId } });
    }
    return acc;
  }

  async earnPoints(customerId: string, points: number, reason: string) {
    const acc = await this.getOrCreateAccount(customerId);
    await this.prisma.loyaltyAccount.update({
      where: { id: acc.id },
      data: { points: { increment: points }, lifetimePoints: { increment: points } },
    });
    await this.prisma.loyaltyTransaction.create({
      data: { accountId: acc.id, delta: points, reason },
    });
  }

  async redeemPoints(customerId: string, points: number): Promise<number> {
    const acc = await this.getOrCreateAccount(customerId);
    if (acc.points < points) throw new BadRequestException('نقاط غير كافية');
    await this.prisma.loyaltyAccount.update({
      where: { id: acc.id }, data: { points: { decrement: points } },
    });
    await this.prisma.loyaltyTransaction.create({
      data: { accountId: acc.id, delta: -points, reason: 'استبدال نقاط' },
    });
    return points * Number(acc.yERPerPoint);
  }

  async history(customerId: string, page = 1, limit = 20) {
    const acc = await this.getOrCreateAccount(customerId);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.findMany({
        where: { accountId: acc.id }, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.loyaltyTransaction.count({ where: { accountId: acc.id } }),
    ]);
    return { data: { account: acc, transactions: items }, meta: { page, limit, total } };
  }
}