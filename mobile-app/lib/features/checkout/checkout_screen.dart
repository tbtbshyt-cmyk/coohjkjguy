// lib/features/checkout/checkout_screen.dart
// Feature #16 — Guest Checkout

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../shared/providers/cart_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _city = TextEditingController(text: 'عتق');
  final _address = TextEditingController();
  final _notes = TextEditingController();
  String _payment = 'COD';
  bool _busy = false;

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _busy = true);
    try {
      final cart = ref.read(cartProvider);
      final r = await ref.read(dioProvider).post('/orders/checkout', data: {
        'customer': {
          'name': _name.text, 'phone': _phone.text,
          'email': _email.text.isEmpty ? null : _email.text,
          'city': _city.text, 'address': _address.text,
        },
        'paymentMethod': _payment,
        'notes': _notes.text.isEmpty ? null : _notes.text,
        'items': cart.map((c) => {
          'productId': c.productId, 'quantity': c.quantity,
          'size': c.size, 'color': c.color, 'unitPrice': c.unitPrice,
        }).toList(),
      });
      final order = r.data['data']['order'];
      ref.read(cartProvider.notifier).clear();
      if (!mounted) return;
      showDialog(context: context, builder: (_) => AlertDialog(
        icon: const Icon(Icons.check_circle, color: Colors.green, size: 56),
        title: const Text('تم إرسال طلبك!'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('رقم الطلب: ${order['orderNumber']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFD4AF37))),
          const SizedBox(height: 8),
          const Text('سنتواصل معك قريباً لتأكيد التوصيل.'),
        ]),
        actions: [
          TextButton(onPressed: () { Navigator.pop(context); context.go('/'); }, child: const Text('العودة للتسوق')),
        ],
      ));
    } on DioException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: ${e.response?.data?['message'] ?? e.message}')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إتمام الطلب')),
      body: Form(
        key: _form,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          const Text('معلومات التوصيل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'الاسم الكامل', prefixIcon: Icon(Icons.person)), validator: (v) => v!.isEmpty ? 'مطلوب' : null),
          const SizedBox(height: 10),
          TextFormField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'رقم الجوال', prefixIcon: Icon(Icons.phone), hintText: '7XXXXXXXX'), validator: (v) => v!.length < 7 ? 'غير صالح' : null),
          const SizedBox(height: 10),
          TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'البريد (اختياري)', prefixIcon: Icon(Icons.email)),
            validator: (v) => v != null && v.isNotEmpty && !v.contains('@') ? 'بريد غير صالح' : null),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(
            initialValue: _city.text,
            items: ['عتق', 'شبوة', 'المكلا', 'عدن', 'صنعاء', 'سيئون'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (v) => setState(() => _city.text = v ?? 'عتق'),
            decoration: const InputDecoration(labelText: 'المدينة', prefixIcon: Icon(Icons.location_city)),
          ),
          const SizedBox(height: 10),
          TextFormField(controller: _address, decoration: const InputDecoration(labelText: 'العنوان التفصيلي', prefixIcon: Icon(Icons.place)), validator: (v) => v!.isEmpty ? 'مطلوب' : null),
          const SizedBox(height: 10),
          TextFormField(controller: _notes, maxLines: 2, decoration: const InputDecoration(labelText: 'ملاحظات (اختياري)')),
          const SizedBox(height: 20),
          const Text('طريقة الدفع', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 8),
          Wrap(spacing: 8, children: [
            ChoiceChip(label: const Text('الدفع عند الاستلام'), selected: _payment == 'COD', onSelected: (_) => setState(() => _payment = 'COD')),
            ChoiceChip(label: const Text('كارت هدية'), selected: _payment == 'GIFT_CARD', onSelected: (_) => setState(() => _payment = 'GIFT_CARD')),
            ChoiceChip(label: const Text('نقاط ولاء'), selected: _payment == 'LOYALTY_POINTS', onSelected: (_) => setState(() => _payment = 'LOYALTY_POINTS')),
          ]),
          const SizedBox(height: 24),
          ElevatedButton(
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 56)),
            onPressed: _busy ? null : _submit,
            child: _busy ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('تأكيد الطلب'),
          ),
          const SizedBox(height: 12),
          const Text('الدفع عند الاستلام — توصيل شبوة/عتق', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.white54)),
        ]),
      ),
    );
  }
}