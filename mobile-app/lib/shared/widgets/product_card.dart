// lib/shared/widgets/product_card.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/api_config.dart';
import '../../features/products/products_provider.dart';
import '../providers/cart_provider.dart';

class ProductCard extends ConsumerWidget {
  final Product product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final primary = product.images.firstOrNull?.webpUrl ?? product.images.first.url;
    final url = primary.startsWith('http') ? primary : '${ApiConfig.cdnUrl}$primary';

    return GestureDetector(
      onTap: () => context.push('/products/${product.slug}'),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: AspectRatio(
              aspectRatio: 1,
              child: Stack(children: [
                CachedNetworkImage(
                  imageUrl: url, fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: Colors.white10),
                  errorWidget: (_, __, ___) => Container(
                    color: AppColors.inkSoft,
                    child: const Icon(Icons.image, color: Colors.white24, size: 40),
                  ),
                  fadeInDuration: const Duration(milliseconds: 200),
                  memCacheWidth: 600, // save memory on 3G devices
                ),
                if (product.isFlashSale && product.discountPercent > 0)
                  Positioned(top: 8, left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(20)),
                      child: Text('خصم ${product.discountPercent.toInt()}%',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Row(children: [
                Text('${product.basePrice.toStringAsFixed(0)} ${product.currency}',
                  style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 14)),
                if (product.oldPrice != null) ...[
                  const SizedBox(width: 6),
                  Text('${product.oldPrice!.toStringAsFixed(0)}',
                    style: const TextStyle(decoration: TextDecoration.lineThrough, color: AppColors.muted, fontSize: 11)),
                ],
              ]),
            ]),
          ),
        ]),
      ),
    );
  }
}