// lib/features/gift_cards/gift_card_screen.dart
// Feature #18 — Digital Gift Cards

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class GiftCardScreen extends ConsumerStatefulWidget {
  const GiftCardScreen({super.key});
  @override
  ConsumerState<GiftCardScreen> createState() => _GiftCardScreenState();
}

class _GiftCardScreenState extends ConsumerState<GiftCardScreen> {
  double _amount = 5000;
  final _from = TextEditingController();
  final _to = TextEditingController();
  final _msg = TextEditingController();
  Map<String, dynamic>? _created;
  bool _busy = false;

  Future<void> _create() async {
    setState(() => _busy = true);
    try {
      final r = await ref.read(dioProvider).post('/gift-cards', data: {
        'amount': _amount, 'fromName': _from.text, 'toName': _to.text, 'message': _msg.text,
      });
      setState(() => _created = r.data['data']);
    } on DioException {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('فشل الإنشاء')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('كارت هدية')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _created == null ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppColors.ink, AppColors.inkSoft]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(children: const [
              Icon(Icons.card_giftcard, size: 60, color: AppColors.gold),
              SizedBox(height: 8),
              Text('🎁 كارت هدية رقمي', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.gold)),
              SizedBox(height: 4),
              Text('أهدِ أحبابك بقيمة يحددها أنت', style: TextStyle(fontSize: 12, color: Colors.white70)),
            ]),
          ),
          const SizedBox(height: 16),
          Text('القيمة: ${_amount.toInt()} ر.ي', style: const TextStyle(fontWeight: FontWeight.bold)),
          Slider(value: _amount, min: 1000, max: 50000, divisions: 49, label: '${_amount.toInt()}', onChanged: (v) => setState(() => _amount = v), activeColor: AppColors.gold),
          TextField(controller: _from, decoration: const InputDecoration(labelText: 'من')),
          const SizedBox(height: 8),
          TextField(controller: _to, decoration: const InputDecoration(labelText: 'إلى')),
          const SizedBox(height: 8),
          TextField(controller: _msg, maxLines: 2, decoration: const InputDecoration(labelText: 'رسالة')),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _busy ? null : _create, style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)), child: _busy ? const CircularProgressIndicator() : const Text('إنشاء الكارت')),
        ]) : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.check_circle, size: 80, color: Colors.green),
          const SizedBox(height: 12),
          const Text('تم إنشاء الكارت!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Column(children: [
              const Text('الكود', style: TextStyle(fontSize: 11, color: Colors.white70)),
              Text(_created!['code'], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.gold)),
              const SizedBox(height: 4),
              Text('${_created!['amount']} ر.ي', style: const TextStyle(fontSize: 16)),
            ]),
          ),
        ]),
      ),
    );
  }
}