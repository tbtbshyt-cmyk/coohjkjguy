// lib/features/wishlist/wishlist_screen.dart
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../core/storage/hive_boxes.dart';
import '../products/products_provider.dart';
import '../../shared/widgets/product_card.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WishlistScreen extends ConsumerStatefulWidget {
  const WishlistScreen({super.key});
  @override
  ConsumerState<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends ConsumerState<WishlistScreen> {
  late Box _box;
  List<String> _ids = [];

  @override
  void initState() {
    super.initState();
    _box = HiveBoxes.wishlistBox;
    _ids = _box.values.cast<String>().toList();
  }

  Future<void> _remove(String id) async {
    await _box.delete(id);
    setState(() => _ids.remove(id));
  }

  @override
  Widget build(BuildContext context) {
    if (_ids.isEmpty) {
      return Scaffold(appBar: AppBar(title: const Text('المفضلة')), body: const Center(child: Text('لا توجد منتجات في المفضلة')));
    }
    return Scaffold(
      appBar: AppBar(title: Text('المفضلة (${_ids.length})')),
      body: FutureBuilder(
        future: ref.read(productsApi).list(limit: 50),
        builder: (context, snap) {
          if (!snap.hasData) return const Center(child: CircularProgressIndicator());
          final list = (snap.data!.data).where((p) => _ids.contains(p.id)).toList();
          return GridView.builder(
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.62, mainAxisSpacing: 10, crossAxisSpacing: 10),
            itemCount: list.length,
            itemBuilder: (_, i) => ProductCard(product: list[i]),
          );
        },
      ),
    );
  }
}