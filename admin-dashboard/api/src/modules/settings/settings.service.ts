import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const DEFAULT_SETTINGS: Record<string, any> = {
  store: {
    name: 'أبو بشار',
    primaryColor: '#D4AF37',
    currency: 'YER',
    contactEmail: 'support@abu-bishar.com',
    contactPhone: '+967700000000',
    address: 'شبوة / عتق — Yemen',
    socialProofCities: ['عتق', 'شبوة', 'المكلا', 'عدن', 'صنعاء'],
  },
  shipping: {
    freeShipping: true,
    shippingFee: 0,
  },
  loyalty: {
    pointsPerYER: 100,
    yERPerPoint: 50,
  },
  autoDiscount: {
    enabled: true, startHour: 20, endHour: 23, percent: 15,
  },
  countdown: {
    enabled: true,
    label: 'عروض محطم السعر',
    endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  freebie: {
    enabled: true,
    minOrder: 30000,
  },
  abandonedCart: {
    enabled: true,
    voucherCode: 'COMEBACK5',
    delaySeconds: 90,
  },
  exitIntent: {
    enabled: true,
    voucherCode: 'STAY10',
  },
  currency: {
    base: 'YER',
    rates: { YER: 1, SAR: 0.0154, USD: 0.004 },
  },
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPublic() {
    const keys = ['store', 'shipping', 'autoDiscount', 'countdown', 'freebie', 'currency'];
    const settings = await this.prisma.setting.findMany({ where: { key: { in: keys } } });
    const map: Record<string, any> = {};
    for (const s of settings) map[s.key] = s.value;
    return { data: { ...DEFAULT_SETTINGS, ...map } };
  }

  async getAll() {
    const all = await this.prisma.setting.findMany();
    const map: Record<string, any> = {};
    for (const s of all) map[s.key] = s.value;
    return { data: { ...DEFAULT_SETTINGS, ...map } };
  }

  async update(patch: Record<string, any>, userId: string) {
    for (const [key, value] of Object.entries(patch)) {
      await this.prisma.setting.upsert({
        where: { key },
        create: { key, value: value as any, group: this.guessGroup(key) },
        update: { value: value as any },
      });
    }
    await this.audit.log({
      userId, action: 'SETTINGS_CHANGE', resource: 'settings',
      afterData: patch,
    });
    return { updated: Object.keys(patch) };
  }

  async getCurrencyRates() {
    const settings = await this.prisma.setting.findUnique({ where: { key: 'currency' } });
    const rates = await this.prisma.currencyRate.findMany();
    return {
      base: 'YER',
      rates: rates.map((r) => ({ target: r.target, rate: r.rate.toString(), fetchedAt: r.fetchedAt })),
    };
  }

  async updateCurrencyRates(rates: { target: string; rate: number }[], userId: string) {
    for (const r of rates) {
      await this.prisma.currencyRate.upsert({
        where: { target: r.target },
        create: { target: r.target, rate: r.rate, source: 'manual' },
        update: { rate: r.rate, source: 'manual', fetchedAt: new Date() },
      });
    }
    await this.audit.log({
      userId, action: 'UPDATE', resource: 'currency',
      afterData: rates as any,
    });
    return { synced: rates.length };
  }

  private guessGroup(key: string): string {
    if (['shipping', 'payment'].includes(key)) return key;
    if (['loyalty', 'autoDiscount', 'freebie'].includes(key)) return 'loyalty';
    return 'general';
  }
}