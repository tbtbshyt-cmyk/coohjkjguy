import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive() {
    const now = new Date();
    const hour = now.getHours();
    const promos = await this.prisma.promotion.findMany({
      where: {
        active: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
    });
    // Filter nightly auto-discount by hour
    return promos.filter((p) => {
      if (p.startHour !== null && p.endHour !== null) {
        if (p.startHour <= p.endHour) {
          return hour >= p.startHour && hour < p.endHour;
        }
        return hour >= p.startHour || hour < p.endHour;
      }
      return true;
    });
  }

  async adminList() {
    return this.prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async adminCreate(dto: any) {
    return this.prisma.promotion.create({ data: dto });
  }

  async adminUpdate(id: string, dto: any) {
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async adminDelete(id: string) {
    return this.prisma.promotion.delete({ where: { id } });
  }

  // Hourly task: emit event for auto-discount window
  @Cron(CronExpression.EVERY_HOUR)
  async hourlyTick() {
    const active = await this.getActive();
    // Could push to SSE subscribers / WebSocket here
  }
}