// lib/features/products/products_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'products_provider.dart';
import '../../shared/widgets/product_card.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});
  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _scrollCtrl = ScrollController();
  final List<Product> _items = [];
  String? _category;
  String _search = '';
  bool _loading = false;
  bool _hasMore = true;
  int _page = 1;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    _loadMore();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 300) _loadMore();
  }

  Future<void> _loadMore() async {
    if (_loading || !_hasMore) return;
    setState(() => _loading = true);
    try {
      final api = ref.read(productsApi);
      final r = await api.list(
        page: _page, limit: 20,
        category: _category, q: _search.isEmpty ? null : _search,
      );
      setState(() {
        _items.addAll(r.data);
        _hasMore = r.meta.hasNext;
        _page++;
      });
    } catch (e) {
      // Ignore
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cats = [
      {'v': null, 'l': 'الكل'},
      {'v': 'men', 'l': 'رجالي'},
      {'v': 'women', 'l': 'نسائي'},
      {'v': 'kids', 'l': 'أطفال'},
      {'v': 'shoes', 'l': 'أحذية'},
    ];
    return Scaffold(
      appBar: AppBar(
        title: const Text('المنتجات'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              onSubmitted: (q) { setState(() { _search = q; _items.clear(); _page = 1; _hasMore = true; _loadMore(); }); },
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search), hintText: 'ابحث في المنتجات...',
                isDense: true, contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
            ),
          ),
        ),
      ),
      body: Column(children: [
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            itemCount: cats.length,
            separatorBuilder: (_, __) => const SizedBox(width: 6),
            itemBuilder: (_, i) {
              final c = cats[i];
              final selected = _category == c['v'];
              return FilterChip(
                label: Text(c['l']!),
                selected: selected,
                onSelected: (_) { setState(() { _category = c['v']; _items.clear(); _page = 1; _hasMore = true; _loadMore(); }); },
                selectedColor: Theme.of(context).colorScheme.primary,
                labelStyle: TextStyle(color: selected ? Theme.of(context).colorScheme.onPrimary : null, fontWeight: FontWeight.w600),
              );
            },
          ),
        ),
        Expanded(
          child: GridView.builder(
            controller: _scrollCtrl,
            padding: const EdgeInsets.all(12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, childAspectRatio: 0.62, mainAxisSpacing: 10, crossAxisSpacing: 10,
            ),
            itemCount: _items.length + (_loading || _hasMore ? 2 : 0),
            itemBuilder: (_, i) {
              if (i >= _items.length) return const Center(child: CircularProgressIndicator(strokeWidth: 2));
              return ProductCard(product: _items[i]);
            },
          ),
        ),
      ]),
    );
  }
}