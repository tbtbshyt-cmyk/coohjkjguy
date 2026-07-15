// lib/shared/widgets/product_card.dart
// Reusable product card widget for grid/list views.
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/product.dart';
import '../../core/theme/app_theme.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final bool compact;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.divider, width: 0.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                children: [
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(16)),
                      child: product.images.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: product.images.first,
                              fit: BoxFit.cover,
                              placeholder: (_, __) =>
                                  Container(color: AppTheme.surfaceLight),
                              errorWidget: (_, __, ___) => Container(
                                color: AppTheme.surfaceLight,
                                child: const Icon(Icons.image_not_supported,
                                    color: AppTheme.textMuted),
                              ),
                            )
                          : Container(
                              color: AppTheme.surfaceLight,
                              child: const Icon(Icons.shopping_bag,
                                  color: AppTheme.textMuted, size: 40),
                            ),
                    ),
                  ),
                  if (product.onSale)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '-${product.discountPct.toStringAsFixed(0)}%',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  if (!product.inStock)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(16)),
                        ),
                        child: const Center(
                          child: Text(
                            'نفذ المخزون',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (product.brand != null && product.brand!.isNotEmpty)
                    Text(
                      product.brand!,
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 2),
                  Text(
                    product.nameAr ?? product.name,
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: compact ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Text(
                        '${product.price.toStringAsFixed(0)} ${product.currency}',
                        style: TextStyle(
                          color: AppTheme.accent,
                          fontSize: compact ? 13 : 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (product.compareAtPrice != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          '${product.compareAtPrice!.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 11,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
