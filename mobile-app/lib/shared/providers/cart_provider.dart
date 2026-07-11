// lib/shared/providers/cart_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/storage/hive_boxes.dart';

class CartItem {
  final String id;
  final String productId;
  final String productName;
  final String productImage;
  final String? size;
  final String? color;
  final int quantity;
  final double unitPrice;

  const CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.size,
    required this.color,
    required this.quantity,
    required this.unitPrice,
  });

  double get lineTotal => unitPrice * quantity;

  Map<String, dynamic> toJson() => {
    'id': id, 'productId': productId, 'productName': productName,
    'productImage': productImage, 'size': size, 'color': color,
    'quantity': quantity, 'unitPrice': unitPrice,
  };

  factory CartItem.fromJson(Map<String, dynamic> j) => CartItem(
    id: j['id'] as String, productId: j['productId'] as String,
    productName: j['productName'] as String, productImage: j['productImage'] as String,
    size: j['size'] as String?, color: j['color'] as String?,
    quantity: j['quantity'] as int, unitPrice: (j['unitPrice'] as num).toDouble(),
  );
}

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super(_load()) {
    _syncRemote();
  }

  static List<CartItem> _load() {
    final box = HiveBoxes.cartBox;
    return box.values.map((e) => CartItem.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<void> _persist() async {
    final box = HiveBoxes.cartBox;
    await box.clear();
    for (final item in state) {
      await box.put(item.id, item.toJson());
    }
  }

  Future<void> _syncRemote() async {
    // Best-effort sync (in real app use Dio via ref.read)
    // Skipped here for brevity
  }

  Future<void> add(CartItem item) async {
    final idx = state.indexWhere((c) =>
      c.productId == item.productId && c.size == item.size && c.color == item.color);
    if (idx >= 0) {
      state = [...state];
      state[idx] = CartItem(
        id: state[idx].id, productId: state[idx].productId, productName: state[idx].productName,
        productImage: state[idx].productImage, size: state[idx].size, color: state[idx].color,
        quantity: state[idx].quantity + item.quantity, unitPrice: state[idx].unitPrice,
      );
    } else {
      state = [...state, item];
    }
    await _persist();
  }

  Future<void> remove(String id) async {
    state = state.where((c) => c.id != id).toList();
    await _persist();
  }

  Future<void> updateQty(String id, int qty) async {
    state = state.map((c) => c.id == id ? CartItem(
      id: c.id, productId: c.productId, productName: c.productName,
      productImage: c.productImage, size: c.size, color: c.color,
      quantity: qty.clamp(1, 99), unitPrice: c.unitPrice,
    ) : c).toList();
    await _persist();
  }

  Future<void> clear() async {
    state = [];
    await _persist();
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((_) => CartNotifier());
final cartCountProvider = Provider<int>((ref) => ref.watch(cartProvider).fold<int>(0, (s, c) => s + c.quantity));
final cartTotalProvider = Provider<double>((ref) => ref.watch(cartProvider).fold<double>(0, (s, c) => s + c.lineTotal));