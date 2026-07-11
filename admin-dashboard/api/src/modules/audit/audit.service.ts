import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

interface LogInput {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  beforeData?: any;
  afterData?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: LogInput) {
    try {
      await this.prisma.auditLog.create({ data: input as any });
    } catch (e) {
      // Don't fail the main request if audit fails
      console.error('Audit log failed:', e);
    }
  }

  async list(opts: {
    page?: number; limit?: number;
    userId?: string; action?: AuditAction;
    resource?: string; resourceId?: string;
    from?: Date; to?: Date;
  }) {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(200, opts.limit || 50);
    const where: Prisma.AuditLogWhereInput = {
      ...(opts.userId && { userId: opts.userId }),
      ...(opts.action && { action: opts.action }),
      ...(opts.resource && { resource: opts.resource }),
      ...(opts.resourceId && { resourceId: opts.resourceId }),
      ...(opts.from || opts.to ? { createdAt: { gte: opts.from, lte: opts.to } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
        include: { user: { select: { id: true, email: true, fullName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getById(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
  }
}