import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AffiliatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async trackClick(code: string, ip?: string, ua?: string, referrer?: string) {
    const aff = await this.prisma.affiliate.findUnique({ where: { code } });
    if (!aff || !aff.active) throw new NotFoundException();
    await this.prisma.affiliateClick.create({
      data: { affiliateId: aff.id, ipAddress: ip, userAgent: ua, referrer },
    });
    await this.prisma.affiliate.update({
      where: { id: aff.id }, data: { totalClicks: { increment: 1 } },
    });
    return { tracked: true };
  }

  async getMe(code: string) {
    const aff = await this.prisma.affiliate.findUnique({
      where: { code },
      include: { commissions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!aff) throw new NotFoundException();
    return aff;
  }

  async adminList(page = 1, limit = 50) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.affiliate.findMany({
        include: { customer: { select: { fullName: true, phone: true } } },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affiliate.count(),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminCreate(dto: { customerId: string; code: string; name: string; phone?: string; commissionPct?: number }, userId: string) {
    const aff = await this.prisma.affiliate.create({ data: dto as any });
    await this.audit.log({
      userId, action: 'CREATE', resource: 'affiliate', resourceId: aff.id,
      afterData: aff as any,
    });
    return aff;
  }
}