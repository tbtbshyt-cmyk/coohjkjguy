import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Public()
  @Post('ai/assistant')
  assistant(@Body() body: { sessionId?: string; message: string; context?: any }) {
    return this.ai.assistant(body.sessionId, body.message, body.context);
  }

  @Public()
  @Post('ai/size-calculator')
  size(@Body() body: { heightCm: number; weightKg: number; footCm?: number; category: string }) {
    return this.ai.sizeCalc(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('ai/analytics/inventory')
  inventory() {
    return this.ai.inventoryInsights();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('ai/analytics/searches')
  searches(@Query('days') days?: string) {
    return this.ai.searchSummary(Number(days) || 7);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Post('ai/ad-copy')
  adCopy(@Body('productId') productId: string) {
    return this.ai.adCopy(productId);
  }
}