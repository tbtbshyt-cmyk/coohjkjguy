// lib/features/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:badges/badges.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/theme/app_theme.dart';
import '../products/products_provider.dart';
import '../../shared/widgets/product_card.dart';
import '../../shared/providers/cart_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final featured = ref.watch(featuredProductsProvider);
    final flashSale = ref.watch(flashSaleProvider);
    final cartCount = ref.watch(cartCountProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(featuredProductsProvider);
          ref.invalidate(flashSaleProvider);
        },
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              pinned: true,
              title: Row(
                children: [
                  const Text('أبو بشار', style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.gold)),
                  const Spacer(),
                  IconButton(
                    icon: Badge(
                      isLabelVisible: cartCount > 0,
                      label: Text('$cartCount'),
                      child: const Icon(Icons.shopping_bag_outlined),
                    ),
                    onPressed: () => context.push('/cart'),
                  ),
                ],
              ),
            ),

            // Hero
            SliverToBoxAdapter(child: _HeroSection(onShop: () => context.push('/products'))),

            // Featured
            const SliverToBoxAdapter(child: _SectionTitle('الأكثر مبيعاً', 'ابتداءً من تسوقك')),
            featured.when(
              data: (products) => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                sliver: SliverGrid(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, childAspectRatio: 0.62, mainAxisSpacing: 10, crossAxisSpacing: 10,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, i) => ProductCard(product: products[i]),
                    childCount: products.length > 6 ? 6 : products.length,
                  ),
                ),
              ),
              loading: () => const SliverToBoxAdapter(child: _ShimmerGrid()),
              error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('خطأ: $e'))),
            ),

            // Flash Sale
            const SliverToBoxAdapter(child: _SectionTitle('⚡ عروض محطم السعر', 'لفترة محدودة', highlight: true)),
            flashSale.when(
              data: (products) => SliverToBoxAdapter(
                child: SizedBox(
                  height: 280,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemBuilder: (_, i) => SizedBox(
                      width: 170,
                      child: ProductCard(product: products[i]),
                    ),
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemCount: products.length,
                  ),
                ),
              ),
              loading: () => const SliverToBoxAdapter(child: SizedBox(height: 280, child: _ShimmerGrid())),
              error: (_, __) => const SliverToBoxAdapter(child: SizedBox.shrink()),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 40)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.ink,
        onPressed: () => context.push('/assistant'),
        icon: const Icon(Icons.smart_toy_outlined),
        label: const Text('مساعد'),
      ),
    );
  }
}

class _HeroSection extends StatelessWidget {
  final VoidCallback onShop;
  const _HeroSection({required this.onShop});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      height: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          colors: [AppColors.ink, AppColors.inkSoft],
          begin: Alignment.topRight, end: Alignment.bottomLeft,
        ),
        image: const DecorationImage(
          image: CachedNetworkImageProvider('https://cdn.abu-bishar.com/hero-bg.jpg'),
          fit: BoxFit.cover, opacity: 0.3,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: 20, right: 20,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('مجموعة جديدة 2025', style: TextStyle(color: AppColors.gold, fontSize: 14, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              const Text('متجر الأناقة', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              const Text('تشكيلة فاخرة من الملابس والأحذية', style: TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: onShop, child: const Text('تسوق الآن')),
            ]),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool highlight;
  const _SectionTitle(this.title, this.subtitle, {this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
      child: Row(
        children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: TextStyle(
              fontSize: 18, fontWeight: FontWeight.bold,
              color: highlight ? AppColors.gold : null,
            )),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          ]),
          const Spacer(),
          TextButton(onPressed: () => context.push('/products'), child: const Text('عرض الكل ←')),
        ],
      ),
    );
  }
}

class _ShimmerGrid extends StatelessWidget {
  const _ShimmerGrid();
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
    baseColor: Colors.white12, highlightColor: Colors.white24,
    child: GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.62, mainAxisSpacing: 10, crossAxisSpacing: 10),
      itemCount: 4,
      itemBuilder: (_, __) => Container(color: Colors.white12, margin: const EdgeInsets.symmetric(horizontal: 12)),
    ),
  );
}