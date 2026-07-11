import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CustomersModule } from './modules/customers/customers.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { GiftCardsModule } from './modules/gift-cards/gift-cards.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AffiliatesModule } from './modules/affiliates/affiliates.module';
import { GroupBuyingModule } from './modules/group-buying/group-buying.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AiModule } from './modules/ai/ai.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'production'
          ? undefined
          : { target: 'pino-pretty', options: { singleLine: true, translateTime: 'HH:MM:ss' } },
        redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
        genReqId: (req) => req.headers['x-request-id'] || `req_${Date.now()}`,
        customLogLevel: (req, res, err) => {
          if (err || res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'public', ttl: 60_000, limit: 100 },
      { name: 'admin', ttl: 60_000, limit: 600 },
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }),

    PrismaModule,
    HealthModule,

    // Business modules
    AuthModule,
    UsersModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    WishlistModule,
    VouchersModule,
    GiftCardsModule,
    LoyaltyModule,
    AffiliatesModule,
    GroupBuyingModule,
    PromotionsModule,
    InventoryModule,
    AiModule,
    MediaModule,
    SettingsModule,
    AnalyticsModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}