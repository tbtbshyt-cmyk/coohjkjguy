// lib/features/orders/orders_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

final myOrdersProvider = FutureProvider.family.autoDispose<List<Map<String, dynamic>>, String>((ref, phone) async {
  final dio = ref.watch(dioProvider);
  final r = await dio.get('/orders/track', queryParameters: {'phone': phone, 'code': ''});
  return List<Map<String, dynamic>>.from((r.data as Map)['data'] is List ? (r.data as Map)['data'] : []);
});

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});
  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  final _phone = TextEditingController();
  List<Map<String, dynamic>>? _orders;
  bool _loading = false;

  Future<void> _load() async {
    if (_phone.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      // List endpoint: filter by phone via search
      final dio = ref.read(dioProvider);
      final r = await dio.get('/admin/orders', queryParameters: {'q': _phone.text, 'limit': 50});
      final items = (r.data['data'] as List).cast<Map<String, dynamic>>();
      setState(() => _orders = items);
    } on DioException {
      setState(() => _orders = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('طلباتي')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          Row(children: [
            Expanded(child: TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'رقم الجوال', hintText: '7XXXXXXXX'),
            )),
            const SizedBox(width: 8),
            ElevatedButton(onPressed: _load, child: const Text('بحث')),
          ]),
          const SizedBox(height: 16),
          if (_loading) const Center(child: CircularProgressIndicator()),
          if (_orders != null && _orders!.isEmpty)
            const Padding(padding: EdgeInsets.all(40), child: Text('لا توجد طلبات', style: TextStyle(color: Colors.white54))),
          Expanded(
            child: ListView.separated(
              itemCount: _orders?.length ?? 0,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) {
                final o = _orders![i];
                final status = o['status'] as String;
                return Card(child: ListTile(
                  title: Text(o['orderNumber'] ?? '—', style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${o['customerName']} · ${DateFormat.yMMMd('ar').format(DateTime.parse(o['createdAt']))}'),
                  trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text('${(o['total'] as num).toStringAsFixed(0)} ر.ي', style: const TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold)),
                    Text(_statusAr(status), style: const TextStyle(fontSize: 11)),
                  ]),
                  onTap: () => showModalBottomSheet(
                    context: context, showDragHandle: true,
                    builder: (_) => Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(o['orderNumber'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('الحالة: ${_statusAr(status)}'),
                        Text('طريقة الدفع: ${o['paymentMethod']}'),
                        const SizedBox(height: 12),
                        const Text('المنتجات', style: TextStyle(fontWeight: FontWeight.bold)),
                        ...((o['items'] as List?) ?? []).map((it) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          child: Text('• ${it['productName']} × ${it['quantity']}'),
                        )),
                      ]),
                    ),
                  ),
                ));
              },
            ),
          ),
        ]),
      ),
    );
  }

  String _statusAr(String s) {
    return ({'PENDING': 'قيد الانتظار', 'CONFIRMED': 'مؤكد', 'SHIPPED': 'تم الشحن', 'DELIVERED': 'مكتمل', 'CANCELLED': 'ملغى'} as Map<String, String>)[s] ?? s;
  }
}