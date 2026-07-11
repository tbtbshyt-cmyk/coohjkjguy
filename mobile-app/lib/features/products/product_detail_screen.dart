// lib/features/products/product_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'products_provider.dart';
import '../../shared/providers/cart_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/api_config.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String slug;
  const ProductDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String? _size;
  String? _color;
  int _qty = 1;
  int _imageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(productDetailProvider(widget.slug));
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المنتج')),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('خطأ: $e')),
        data: (p) {
          _size ??= p.sizes.isNotEmpty ? p.sizes.first : null;
          _color ??= p.colors.isNotEmpty ? p.colors.first : null;
          final images = p.images.map((i) {
            final url = (i.webpUrl ?? i.url);
            return url.startsWith('http') ? url : '${ApiConfig.cdnUrl}$url';
          }).toList();
          return Column(children: [
            Expanded(
              child: ListView(children: [
                SizedBox(
                  height: 320,
                  child: PageView.builder(
                    onPageChanged: (i) => setState(() => _imageIndex = i),
                    itemCount: images.length,
                    itemBuilder: (_, i) => CachedNetworkImage(
                      imageUrl: images[i], fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: Colors.white10),
                      errorWidget: (_, __, ___) => Container(color: AppColors.inkSoft, child: const Icon(Icons.image, color: Colors.white24, size: 60)),
                    ),
                  ),
                ),
                if (images.length > 1)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(
                      images.length, (i) => AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: i == _imageIndex ? 24 : 6, height: 6,
                        decoration: BoxDecoration(color: i == _imageIndex ? AppColors.gold : Colors.white24, borderRadius: BorderRadius.circular(3)),
                      ),
                    )),
                  ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(p.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    if (p.brand != null) Text(p.brand!.name, style: const TextStyle(color: AppColors.muted)),
                    const SizedBox(height: 12),
                    Row(children: [
                      Text('${p.basePrice.toStringAsFixed(0)} ${p.currency}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.gold)),
                      if (p.oldPrice != null) ...[
                        const SizedBox(width: 8),
                        Text('${p.oldPrice!.toStringAsFixed(0)} ${p.currency}', style: const TextStyle(decoration: TextDecoration.lineThrough, color: AppColors.muted)),
                      ],
                    ]),
                    const SizedBox(height: 16),
                    Text(p.description, style: const TextStyle(height: 1.6)),
                    if (p.sizes.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('المقاس', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(spacing: 8, children: p.sizes.map((s) => ChoiceChip(
                        label: Text(s),
                        selected: _size == s,
                        onSelected: (_) => setState(() => _size = s),
                      )).toList()),
                    ],
                    if (p.colors.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('اللون', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Wrap(spacing: 8, children: p.colors.map((c) => ChoiceChip(
                        label: Text(c),
                        selected: _color == c,
                        onSelected: (_) => setState(() => _color = c),
                      )).toList()),
                    ],
                    const SizedBox(height: 16),
                    Row(children: [
                      const Text('الكمية', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 16),
                      IconButton.outlined(onPressed: () => setState(() => _qty = (_qty - 1).clamp(1, 99)), icon: const Icon(Icons.remove)),
                      const SizedBox(width: 8),
                      Text('$_qty', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      IconButton.outlined(onPressed: () => setState(() => _qty = (_qty + 1).clamp(1, 99)), icon: const Icon(Icons.add)),
                    ]),
                  ]),
                ),
                // Recommendations
                Consumer(builder: (_, ref, __) {
                  final recs = ref.watch(recommendationsProvider(p.id));
                  return recs.when(
                    data: (list) => list.isEmpty ? const SizedBox.shrink() : Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: const [
                          Icon(Icons.auto_awesome, color: AppColors.gold, size: 16),
                          SizedBox(width: 6),
                          Text('قد يعجبك أيضاً', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ]),
                        const SizedBox(height: 8),
                        SizedBox(
                          height: 220,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: list.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 10),
                            itemBuilder: (_, i) => SizedBox(width: 150, child: ProductCard(product: list[i])),
                          ),
                        ),
                      ]),
                    ),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  );
                }),
              ]),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.shopping_bag),
                      label: const Text('أضف للسلة'),
                      style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
                      onPressed: () {
                        ref.read(cartProvider.notifier).add(CartItem(
                          id: '${p.id}-${_size ?? ''}-${_color ?? ''}',
                          productId: p.id, productName: p.name,
                          productImage: images.isNotEmpty ? images.first : '',
                          size: _size, color: _color, quantity: _qty, unitPrice: p.basePrice,
                        ));
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: const Text('✅ تمت الإضافة للسلة'),
                          action: SnackBarAction(label: 'عرض السلة', onPressed: () => context.push('/cart')),
                        ));
                      },
                    ),
                  ),
                ]),
              ),
            ),
          ]);
        },
      ),
    );
  }
}