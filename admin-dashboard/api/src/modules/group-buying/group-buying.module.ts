import { Module } from '@nestjs/common';
import { GroupBuyingService } from './group-buying.service';
import { GroupBuyingController } from './group-buying.controller';

@Module({
  controllers: [GroupBuyingController],
  providers: [GroupBuyingService],
})
export class GroupBuyingModule {}