import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString() @MinLength(2) nameAr!: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsString() @MinLength(10) descriptionAr!: string;
  @IsOptional() @IsString() descriptionEn?: string;

  @IsNumber() @Min(0) basePrice!: number;
  @IsOptional() @IsNumber() oldPrice?: number;
  @IsOptional() @IsNumber() costPrice?: number;
  @IsOptional() @IsNumber() taxRate?: number;

  @IsString() categoryId!: string;
  @IsOptional() @IsString() brandId?: string;
  @IsString() sku!: string;
  @IsString() slug!: string;

  @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsInt() lowStockThreshold?: number;

  @IsArray() @IsString({ each: true }) sizes!: string[];
  @IsArray() @IsString({ each: true }) colors!: string[];
  @IsArray() @IsString({ each: true }) tags!: string[];

  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isFlashSale?: boolean;
  @IsOptional() @IsBoolean() isNewArrival?: boolean;

  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaDesc?: string;
}

export class UpdateProductDto extends CreateProductDto {
  @IsOptional() @IsString() id?: string;
}

export class ProductQueryDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 20;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Boolean) featured?: boolean;
  @IsOptional() @Type(() => Boolean) flash?: boolean;
  @IsOptional() @IsString() sort?: 'new' | 'priceAsc' | 'priceDesc' | 'best';
  @IsOptional() @IsString() locale?: 'ar' | 'en';
}