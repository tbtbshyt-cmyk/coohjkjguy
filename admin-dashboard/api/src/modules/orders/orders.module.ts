import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { InvoiceService } from './invoice.service';
import { AuditModule } from '../audit/audit.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [AuditModule, LoyaltyModule],
  controllers: [OrdersController],
  providers: [OrdersService, InvoiceService],
  exports: [OrdersService],
})
export class OrdersModule {}