import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get('settings/public')
  getPublic() {
    return this.settings.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('admin/settings')
  getAll() {
    return this.settings.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch('admin/settings')
  update(@Body() body: Record<string, any>, @CurrentUser('id') userId: string) {
    return this.settings.update(body, userId);
  }

  @Public()
  @Get('currency/rates')
  getCurrencyRates() {
    return this.settings.getCurrencyRates();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/currency/sync')
  syncRates(@Body('rates') rates: any[], @CurrentUser('id') userId: string) {
    return this.settings.updateCurrencyRates(rates, userId);
  }
}