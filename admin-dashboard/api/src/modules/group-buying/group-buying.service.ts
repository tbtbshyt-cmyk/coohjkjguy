import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GroupBuyingService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(hostName: string, hostPhone: string) {
    const code = `ROOM-${uuid().slice(0, 6).toUpperCase()}`;
    return this.prisma.groupBuyRoom.create({
      data: { code, hostName, hostPhone, members: { create: { name: hostName, amount: 5000 } } },
      include: { members: true },
    });
  }

  async getRoom(code: string) {
    const room = await this.prisma.groupBuyRoom.findUnique({
      where: { code }, include: { members: true },
    });
    if (!room) throw new NotFoundException();
    const total = room.members.reduce((s, m) => s + Number(m.amount), 0);
    const people = room.members.length;
    const discountTier = people >= 8 ? 15 : people >= 5 ? 10 : people >= 3 ? 5 : 0;
    const discount = Math.round(total * (discountTier / 100));
    return {
      ...room,
      totalAmount: total,
      discountTier,
      discount,
      finalTotal: total - discount,
    };
  }

  async joinRoom(code: string, name: string, amount: number) {
    const room = await this.prisma.groupBuyRoom.findUnique({ where: { code } });
    if (!room || room.status !== 'OPEN') throw new BadRequestException('غرفة غير متاحة');
    return this.prisma.groupBuyMember.create({
      data: { roomId: room.id, name, amount },
    });
  }
}