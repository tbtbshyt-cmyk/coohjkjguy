import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GiftCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: {
    amount: number;
    fromName?: string;
    fromId?: string;
    toName?: string;
    toId?: string;
    message?: string;
    expiresAt?: Date;
  }) {
    const code = `GIFT-${uuid().slice(0, 4).toUpperCase()}-${uuid().slice(0, 4).toUpperCase()}`;
    const card = await this.prisma.giftCard.create({
      data: {
        code, amount: dto.amount, balance: dto.amount,
        fromName: dto.fromName, fromId: dto.fromId,
        toName: dto.toName, toId: dto.toId,
        message: dto.message, expiresAt: dto.expiresAt,
      },
    });
    return card;
  }

  async getBalance(code: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { code } });
    if (!card) throw new BadRequestException('كارت غير موجود');
    return {
      code: card.code,
      balance: Number(card.balance),
      currency: card.currency,
      active: card.active && !card.redeemed,
      expiresAt: card.expiresAt,
    };
  }

  async listAll() {
    return this.prisma.giftCard.findMany({ orderBy: { createdAt: 'desc' } });
  }
}