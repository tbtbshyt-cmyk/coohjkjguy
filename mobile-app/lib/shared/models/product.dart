// lib/shared/models/product.dart
// Product models — server-aligned, no codegen to keep build simple.
import 'package:flutter/foundation.dart';

@immutable
class Product {
  final String id;
  final String slug;
  final String name;
  final String? nameAr;
  final String description;
  final String? descriptionAr;
  final double price;
  final double? compareAtPrice;
  final String currency;
  final List<String> images;
  final String? brand;
  final String? category;
  final List<String> sizes;
  final List<String> colors;
  final int stock;
  final double rating;
  final int reviewCount;
  final bool featured;
  final DateTime? createdAt;

  const Product({
    required this.id,
    required this.slug,
    required this.name,
    this.nameAr,
    required this.description,
    this.descriptionAr,
    required this.price,
    this.compareAtPrice,
    this.currency = 'YER',
    this.images = const [],
    this.brand,
    this.category,
    this.sizes = const [],
    this.colors = const [],
    this.stock = 0,
    this.rating = 0,
    this.reviewCount = 0,
    this.featured = false,
    this.createdAt,
  });

  bool get onSale =>
      compareAtPrice != null && compareAtPrice! > price && stock > 0;
  bool get inStock => stock > 0;
  double get discountPct {
    if (compareAtPrice == null || compareAtPrice! <= 0) return 0;
    return ((compareAtPrice! - price) / compareAtPrice!) * 100;
  }

  factory Product.fromJson(Map<String, dynamic> j) {
    return Product(
      id: (j['id'] ?? '').toString(),
      slug: (j['slug'] ?? '').toString(),
      name: (j['name'] ?? '').toString(),
      nameAr: j['nameAr']?.toString(),
      description: (j['description'] ?? '').toString(),
      descriptionAr: j['descriptionAr']?.toString(),
      price: (j['price'] is num)
          ? (j['price'] as num).toDouble()
          : double.tryParse('${j['price']}') ?? 0.0,
      compareAtPrice: j['compareAtPrice'] != null
          ? (j['compareAtPrice'] is num
              ? (j['compareAtPrice'] as num).toDouble()
              : double.tryParse('${j['compareAtPrice']}') ?? 0.0)
          : null,
      currency: (j['currency'] ?? 'YER').toString(),
      images: (j['images'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      brand: j['brand']?.toString(),
      category: j['category']?.toString(),
      sizes: (j['sizes'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      colors: (j['colors'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      stock: (j['stock'] is num) ? (j['stock'] as num).toInt() : 0,
      rating: (j['rating'] is num) ? (j['rating'] as num).toDouble() : 0,
      reviewCount:
          (j['reviewCount'] is num) ? (j['reviewCount'] as num).toInt() : 0,
      featured: j['featured'] == true,
      createdAt: j['createdAt'] != null
          ? DateTime.tryParse(j['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'name': name,
        'nameAr': nameAr,
        'description': description,
        'descriptionAr': descriptionAr,
        'price': price,
        'compareAtPrice': compareAtPrice,
        'currency': currency,
        'images': images,
        'brand': brand,
        'category': category,
        'sizes': sizes,
        'colors': colors,
        'stock': stock,
        'rating': rating,
        'reviewCount': reviewCount,
        'featured': featured,
        'createdAt': createdAt?.toIso8601String(),
      };
}

@immutable
class ProductListResponse {
  final List<Product> items;
  final int total;
  final int page;
  final int limit;
  final bool hasMore;

  const ProductListResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasMore,
  });

  factory ProductListResponse.fromJson(Map<String, dynamic> j) {
    final data = j['data'] ?? j;
    final list = (data['items'] ?? data['products'] ?? data['data'] ?? []) as List;
    return ProductListResponse(
      items: list
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList(growable: false),
      total: (data['total'] is num) ? (data['total'] as num).toInt() : 0,
      page: (data['page'] is num) ? (data['page'] as num).toInt() : 1,
      limit: (data['limit'] is num) ? (data['limit'] as num).toInt() : 20,
      hasMore: data['hasMore'] == true,
    );
  }
}
