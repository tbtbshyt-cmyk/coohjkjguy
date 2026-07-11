import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupBuyingService } from './group-buying.service';
import { Public } from '../../common/decorators/roles.decorator';

@Controller('group-buying')
export class GroupBuyingController {
  constructor(private readonly gb: GroupBuyingService) {}

  @Public()
  @Post('rooms')
  create(@Body() body: { hostName: string; hostPhone: string }) {
    return this.gb.createRoom(body.hostName, body.hostPhone);
  }

  @Public()
  @Get('rooms/:code')
  get(@Param('code') code: string) {
    return this.gb.getRoom(code);
  }

  @Public()
  @Post('rooms/:code/members')
  join(@Param('code') code: string, @Body() body: { name: string; amount: number }) {
    return this.gb.joinRoom(code, body.name, body.amount);
  }
}