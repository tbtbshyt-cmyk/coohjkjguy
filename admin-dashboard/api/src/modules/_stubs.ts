// Lightweight stub modules for modules referenced in app.module.ts
// These wrap simple CRUD patterns and can be expanded as needed.

import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';

// ============== USERS (admin) ==============
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
class UsersController {
  constructor(private prisma: PrismaService, private audit: AuditService) {}
  @Get() @Roles('SUPER_ADMIN') list() { return this.prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' } }); }
  @Post() @Roles('SUPER_ADMIN') create(@Body() dto: any) { return this.prisma.adminUser.create({ data: dto }); }
  @Patch(':id') @Roles('SUPER_ADMIN') update(@Param('id') id: string, @Body() dto: any) { return this.prisma.adminUser.update({ where: { id }, data: dto }); }
  @Delete(':id') @Roles('SUPER_ADMIN') remove(@Param('id') id: string) { return this.prisma.adminUser.delete({ where: { id } }); }
}

@Module({ controllers: [UsersController] })
export class UsersModule {}

// ============== CUSTOMERS ==============
@Controller()
class CustomersController {
  constructor(private prisma: PrismaService) {}
  @Public() @Get('customers/track') track(@Query('phone') phone: string) { return this.prisma.customer.findUnique({ where: { phone } }); }
  @Get('admin/customers') list(@Query('page') page?: string, @Query('q') q?: string) {
    const p = Math.max(1, Number(page) || 1);
    return this.prisma.customer.findMany({
      where: q ? { OR: [{ fullName: { contains: q, mode: 'insensitive' } }, { phone: { contains: q } }] } : undefined,
      skip: (p - 1) * 25, take: 25, orderBy: { createdAt: 'desc' },
    });
  }
}

@Module({ controllers: [CustomersController] })
export class CustomersModule {}

// ============== CATEGORIES ==============
@Controller('categories')
class CategoriesController {
  constructor(private prisma: PrismaService) {}
  @Public() @Get() list() { return this.prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }); }
  @Public() @Get(':slug') get(@Param('slug') slug: string) { return this.prisma.category.findUnique({ where: { slug: slug.toUpperCase() as any }, include: { products: { take: 50, include: { images: { take: 1 } } } } }); }
  @Post('admin') create(@Body() dto: any) { return this.prisma.category.create({ data: dto }); }
  @Patch('admin/:id') update(@Param('id') id: string, @Body() dto: any) { return this.prisma.category.update({ where: { id }, data: dto }); }
}

@Module({ controllers: [CategoriesController] })
export class CategoriesModule {}

// ============== WISHLIST ==============
@Controller('wishlist')
class WishlistController {
  constructor(private prisma: PrismaService) {}
  @Get() list(@CurrentUser('id') userId: string) { return this.prisma.wishlistItem.findMany({ where: { customerId: userId }, include: { product: { include: { images: { take: 1 } } } } }); }
  @Post() add(@CurrentUser('id') userId: string, @Body('productId') productId: string) { return this.prisma.wishlistItem.upsert({ where: { customerId_productId: { customerId: userId, productId } }, create: { customerId: userId, productId }, update: {} }); }
  @Delete(':productId') remove(@CurrentUser('id') userId: string, @Param('productId') productId: string) { return this.prisma.wishlistItem.delete({ where: { customerId_productId: { customerId: userId, productId } } }); }
}

@Module({ controllers: [WishlistController] })
export class WishlistModule {}

// ============== INVENTORY ==============
@Controller('admin/inventory')
class InventoryController {
  constructor(private prisma: PrismaService) {}
  @Get('alerts') list() { return this.prisma.inventoryAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { product: { select: { nameAr: true, stock: true } } } }); }
}

@Module({ controllers: [InventoryController] })
export class InventoryModule {}

// ============== MEDIA ==============
@Controller('media')
class MediaController {
  constructor(private prisma: PrismaService) {}
  @Get('presign') presign(@Query('filename') filename: string) { return { uploadUrl: `https://media.abu-bishar.com/upload?key=${encodeURIComponent(filename)}`, method: 'PUT', publicUrl: `https://media.abu-bishar.com/${encodeURIComponent(filename)}` }; }
}

@Module({ controllers: [MediaController] })
export class MediaModule {}

// ============== ANALYTICS ==============
@Controller('admin/dashboard')
class AnalyticsController {
  constructor(private prisma: PrismaService) {}
  @Get('top-products') top() {
    return this.prisma.product.findMany({ orderBy: { soldCount: 'desc' }, take: 10, include: { images: { take: 1 } } });
  }
  @Get('revenue') revenue() { return this.prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }); }
}

@Module({ controllers: [AnalyticsController] })
export class AnalyticsModule {}

// ============== NOTIFICATIONS ==============
@Controller('notifications')
class NotificationsController {
  constructor(private prisma: PrismaService) {}
  @Get() list(@CurrentUser('id') userId: string) { return this.prisma.notification.findMany({ where: { customerId: userId }, orderBy: { createdAt: 'desc' }, take: 50 }); }
  @Patch(':id/read') read(@CurrentUser('id') userId: string, @Param('id') id: string) { return this.prisma.notification.update({ where: { id }, data: { read: true, readAt: new Date() } }); }
}

@Module({ controllers: [NotificationsController] })
export class NotificationsModule {}

// Stub the controllers to import the guard decorator
import { UseGuards } from '@nestjs/common';
UsersController;
CustomersController;
CategoriesController;
WishlistController;
InventoryController;
MediaController;
AnalyticsController;
NotificationsController;