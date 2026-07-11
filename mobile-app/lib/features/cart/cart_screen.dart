// lib/features/cart/cart_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/providers/cart_provider.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);
    return Scaffold(
      appBar: AppBar(title: Text('السلة (${items.length})')),
      body: items.isEmpty
        ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.shopping_bag_outlined, size: 80, color: Colors.white24),
            const SizedBox(height: 12),
            const Text('السلة فارغة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('أضف منتجات لتبدأ التسوق', style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: () => context.go('/'), child: const Text('تسوق الآن')),
          ]))
        : ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final it = items[i];
              return Card(child: Padding(
                padding: const EdgeInsets.all(8),
                child: Row(children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(it.productImage, width: 64, height: 64, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(width: 64, height: 64, color: Colors.white10)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(it.productName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                    if (it.size != null || it.color != null) Text('${it.size ?? ''} ${it.color ?? ''}', style: const TextStyle(fontSize: 11, color: Colors.white54)),
                    Text('${it.unitPrice.toStringAsFixed(0)} ر.ي × ${it.quantity}', style: const TextStyle(color: Color(0xFFD4AF37))),
                  ])),
                  Column(children: [
                    IconButton(icon: const Icon(Icons.remove_circle_outline, size: 20), onPressed: () => ref.read(cartProvider.notifier).updateQty(it.id, it.quantity - 1)),
                    Text('${it.quantity}'),
                    IconButton(icon: const Icon(Icons.add_circle_outline, size: 20), onPressed: () => ref.read(cartProvider.notifier).updateQty(it.id, it.quantity + 1)),
                    IconButton(icon: const Icon(Icons.delete_outline, size: 20, color: Colors.redAccent), onPressed: () => ref.read(cartProvider.notifier).remove(it.id)),
                  ]),
                ]),
              ));
            },
          ),
      bottomNavigationBar: items.isEmpty ? null : SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(children: [
              const Text('الإجمالي:', style: TextStyle(fontSize: 16)),
              const Spacer(),
              Text('${total.toStringAsFixed(0)} ر.ي', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFD4AF37))),
            ]),
            const SizedBox(height: 12),
            ElevatedButton(
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
              onPressed: () => context.push('/checkout'),
              child: const Text('إتمام الطلب'),
            ),
          ]),
        ),
      ),
    );
  }
}