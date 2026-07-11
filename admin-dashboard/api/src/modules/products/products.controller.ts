import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProductDto, ProductQueryDto, UpdateProductDto } from './dto/create-product.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { VisualSearchService } from '../ai/visual-search.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly visual: VisualSearchService,
  ) {}

  @Public()
  @Get()
  list(@Query() q: ProductQueryDto) {
    return this.products.list(q);
  }

  @Public()
  @Get('featured')
  featured() {
    return this.products.featured();
  }

  @Public()
  @Get('flash-sale')
  flashSale() {
    return this.products.flashSale();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.products.getBySlug(slug);
  }

  @Public()
  @Get(':id/recommendations')
  recommendations(@Param('id') id: string) {
    return this.products.getRecommendations(id);
  }

  @Public()
  @Post('visual-search')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async visualSearch(@UploadedFile() file: Express.Multer.File) {
    return this.visual.search(file);
  }

  // -------- ADMIN --------

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Get('admin/all')
  adminList(@Query('page') page?: string, @Query('limit') limit?: string, @Query('q') q?: string) {
    return this.products.adminList(Number(page) || 1, Number(limit) || 50, q);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/create')
  adminCreate(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.products.adminCreate(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('admin/:id')
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser('id') userId: string) {
    return this.products.adminUpdate(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Delete('admin/:id')
  adminDelete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.products.adminDelete(id, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('admin/bulk-import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  async bulkImport(@UploadedFile() file: Express.Multer.File, @CurrentUser('id') userId: string) {
    const rows = this.parseCsv(file.buffer.toString('utf-8'));
    return this.products.adminBulkImport(rows, userId);
  }

  private parseCsv(text: string): any[] {
    const lines = text.split('\n').filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const cells = this.parseCsvLine(line);
      const row: any = {};
      headers.forEach((h, i) => {
        const v = cells[i];
        if (['basePrice', 'oldPrice', 'costPrice', 'taxRate'].includes(h)) row[h] = Number(v) || 0;
        else if (['stock', 'lowStockThreshold', 'soldCount'].includes(h)) row[h] = Number(v) || 0;
        else if (['sizes', 'colors', 'tags', 'images'].includes(h)) row[h] = v ? v.split('|').map((s) => s.trim()).filter(Boolean) : [];
        else if (['isFeatured', 'isFlashSale', 'isNewArrival'].includes(h)) row[h] = v === '1' || v === 'true';
        else row[h] = v;
      });
      return row;
    });
  }

  private parseCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map((c) => c.trim().replace(/^"|"$/g, ''));
  }
}