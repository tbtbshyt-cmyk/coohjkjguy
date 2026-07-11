import { Module } from '@nestjs/common';
import { VisualSearchService } from './visual-search.service';

@Module({
  providers: [VisualSearchService],
  exports: [VisualSearchService],
})
export class VisualSearchModule {}