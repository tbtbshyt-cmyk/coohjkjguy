import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { VoucherType, VoucherTrigger } from '@prisma/client';

@Injectable()
export class VouchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPublic(code: string) {
    const v = await this.prisma.voucher.findUnique({ where: { code } });
    if (!v || !v.active) throw new NotFoundException('كود غير موجود');
    return {
      code: v.code,
      descriptionAr: v.descriptionAr,
      type: v.type,
      value: Number(v.value),
      minOrderAmount: v.minOrderAmount ? Number(v.minOrderAmount) : null,
      maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : null,
      expiresAt: v.expiresAt,
      remainingUses: v.usageLimit ? v.usageLimit - v.usageCount : null,
    };
  }

  async adminList(page = 1, limit = 50) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.voucher.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.voucher.count(),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminCreate(dto: {
    code: string;
    descriptionAr: string;
    type: VoucherType;
    value: number;
    trigger?: VoucherTrigger;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    startsAt?: Date;
    expiresAt?: Date;
    firstOrderOnly?: boolean;
    combinable?: boolean;
  }, userId: string) {
    const v = await this.prisma.voucher.create({ data: dto as any });
    await this.audit.log({
      userId, action: 'CREATE', resource: 'voucher', resourceId: v.id,
      afterData: v as any,
    });
    return v;
  }

  async adminDelete(id: string, userId: string) {
    const before = await this.prisma.voucher.findUnique({ where: { id } });
    if (!before) throw new NotFoundException();
    await this.prisma.voucher.delete({ where: { id } });
    await this.audit.log({
      userId, action: 'DELETE', resource: 'voucher', resourceId: id,
      beforeData: before as any,
    });
    return { deleted: true };
  }
}