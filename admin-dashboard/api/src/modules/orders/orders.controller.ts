import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '@prisma/client';
import { Public } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public as P } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly invoice: InvoiceService,
  ) {}

  @P()
  @Post('orders/checkout')
  checkout(@Body() dto: any) {
    return this.orders.checkout(dto);
  }

  @P()
  @Get('orders/track')
  track(@Query('phone') phone: string, @Query('code') orderNumber: string) {
    return this.orders.getByOrderNumber(orderNumber, phone);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Get('admin/orders')
  adminList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
    @Query('q') q?: string,
    @Query('archived') archived?: string,
  ) {
    return this.orders.adminList({
      page: Number(page) || 1,
      limit: Number(limit) || 25,
      status, q,
      archived: archived === undefined ? false : archived === 'true',
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Get('admin/orders/:id')
  adminGet(@Param('id') id: string) {
    return this.orders.adminGet(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Patch('admin/orders/:id/status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.orders.adminUpdateStatus(id, body.status, userId, body.note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/orders/:id/archive')
  adminArchive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.orders.adminArchive(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Get('admin/orders/:id/invoice.pdf')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.invoice.generate(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Get('admin/dashboard/summary')
  dashboard() {
    return this.orders.dashboardSummary();
  }
}