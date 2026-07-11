import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuditModule } from '../audit/audit.module';
import { VisualSearchModule } from '../ai/visual-search.module';

@Module({
  imports: [AuditModule, VisualSearchModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}