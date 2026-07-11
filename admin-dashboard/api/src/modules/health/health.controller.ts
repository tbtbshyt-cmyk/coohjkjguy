import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Public } from '../../common/decorators/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @SkipThrottle()
  @Get()
  async liveness() {
    return { status: 'ok', timestamp: new Date().toISOString(), service: 'abu-bishar-api' };
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  async readiness() {
    try {
      await this.prisma.ping();
      return { status: 'ready', database: 'up', timestamp: new Date().toISOString() };
    } catch (e: any) {
      return { status: 'degraded', database: 'down', error: e.message };
    }
  }
}