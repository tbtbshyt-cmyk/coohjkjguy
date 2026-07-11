// lib/features/products/products_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../shared/models/product.dart';
import '../../core/network/dio_client.dart';

final productsApi = Provider<ProductsApi>((ref) => ProductsApi(ref.watch(dioProvider)));

class ProductsApi {
  final Dio _dio;
  ProductsApi(this._dio);

  Future<ProductListResponse> list({
    int page = 1,
    int limit = 20,
    String? category,
    String? brand,
    double? minPrice,
    double? maxPrice,
    String? q,
    bool? featured,
    bool? flash,
    String? sort,
  }) async {
    final r = await _dio.get('/products', queryParameters: {
      'page': page, 'limit': limit,
      if (category != null) 'category': category,
      if (brand != null) 'brand': brand,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
      if (q != null) 'q': q,
      if (featured != null) 'featured': featured,
      if (flash != null) 'flash': flash,
      if (sort != null) 'sort': sort,
    });
    return ProductListResponse.fromJson(r.data['data']);
  }

  Future<Product> getBySlug(String slug) async {
    final r = await _dio.get('/products/$slug');
    return Product.fromJson(r.data['data']);
  }

  Future<List<Product>> featured() async {
    final r = await _dio.get('/products/featured');
    return (r.data['data'] as List).map((j) => Product.fromJson(j)).toList();
  }

  Future<List<Product>> flashSale() async {
    final r = await _dio.get('/products/flash-sale');
    return (r.data['data'] as List).map((j) => Product.fromJson(j)).toList();
  }

  Future<List<Product>> recommendations(String productId) async {
    final r = await _dio.get('/products/$productId/recommendations');
    return (r.data['data'] as List).map((j) => Product.fromJson(j)).toList();
  }
}

// Riverpod: paginated, infinite-scroll friendly
final productListProvider = FutureProvider.family<ProductListResponse, ProductFilter>((ref, filter) async {
  return ref.watch(productsApi).list(
    page: filter.page,
    limit: filter.limit,
    category: filter.category,
    brand: filter.brand,
    q: filter.q,
    featured: filter.featured,
    flash: filter.flash,
    sort: filter.sort,
  );
});

class ProductFilter {
  final int page;
  final int limit;
  final String? category;
  final String? brand;
  final String? q;
  final bool? featured;
  final bool? flash;
  final String? sort;
  const ProductFilter({
    this.page = 1,
    this.limit = 20,
    this.category,
    this.brand,
    this.q,
    this.featured,
    this.flash,
    this.sort,
  });
  ProductFilter copyWith({int? page}) => ProductFilter(
    page: page ?? this.page, limit: limit,
    category: category, brand: brand, q: q,
    featured: featured, flash: flash, sort: sort,
  );
}

final featuredProductsProvider = FutureProvider<List<Product>>((ref) {
  return ref.watch(productsApi).featured();
});

final flashSaleProvider = FutureProvider<List<Product>>((ref) {
  return ref.watch(productsApi).flashSale();
});

final productDetailProvider = FutureProvider.family<Product, String>((ref, slug) async {
  return ref.watch(productsApi).getBySlug(slug);
});

final recommendationsProvider = FutureProvider.family<List<Product>, String>((ref, productId) async {
  return ref.watch(productsApi).recommendations(productId);
});