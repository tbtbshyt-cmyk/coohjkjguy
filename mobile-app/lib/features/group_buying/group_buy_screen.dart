// lib/features/group_buying/group_buy_screen.dart
// Feature #23 — Group Buying

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class GroupBuyScreen extends ConsumerStatefulWidget {
  const GroupBuyScreen({super.key});
  @override
  ConsumerState<GroupBuyScreen> createState() => _GroupBuyScreenState();
}

class _GroupBuyScreenState extends ConsumerState<GroupBuyScreen> {
  final _hostName = TextEditingController();
  final _hostPhone = TextEditingController();
  Map<String, dynamic>? _room;

  Future<void> _create() async {
    try {
      final r = await ref.read(dioProvider).post('/group-buying/rooms', data: {
        'hostName': _hostName.text, 'hostPhone': _hostPhone.text,
      });
      setState(() => _room = r.data['data']);
    } on DioException {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('فشل الإنشاء')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الشراء الجماعي')),
      body: _room == null ? Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: const Column(children: [
              Icon(Icons.groups, color: AppColors.gold, size: 50),
              SizedBox(height: 8),
              Text('اجمع أصدقاءك على طلب واحد', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              SizedBox(height: 6),
              Text('كل ما زاد عدد المشاركين، زاد الخصم تلقائياً', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70, fontSize: 13)),
            ]),
          ),
          const SizedBox(height: 16),
          Row(children: [
            _tier('3+', 5), _tier('5+', 10), _tier('8+', 15),
          ]),
          const SizedBox(height: 16),
          TextField(controller: _hostName, decoration: const InputDecoration(labelText: 'اسمك')),
          const SizedBox(height: 10),
          TextField(controller: _hostPhone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'رقم الجوال')),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _create, style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)), child: const Text('إنشاء الغرفة')),
        ]),
      ) : Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Card(color: AppColors.gold.withOpacity(0.1), child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              const Text('رقم الغرفة', style: TextStyle(fontSize: 12, color: Colors.white70)),
              const SizedBox(height: 4),
              Text(_room!['code'], style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.gold)),
              const SizedBox(height: 12),
              Text('عدد المشاركين: ${(_room!['members'] as List).length}'),
              Text('خصم المجموعة: ${_room!['discountTier']}%', style: const TextStyle(color: AppColors.gold)),
              Text('الإجمالي بعد الخصم: ${(_room!['finalTotal'] as num).toStringAsFixed(0)} ر.ي', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ]),
          )),
          const SizedBox(height: 16),
          ElevatedButton.icon(onPressed: () {/* share via wa.me */}, icon: const Icon(Icons.share), label: const Text('شارك الغرفة')),
        ]),
      ),
    );
  }

  Widget _tier(String people, int pct) => Expanded(child: Container(
    margin: const EdgeInsets.symmetric(horizontal: 4),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(12)),
    child: Column(children: [
      Text(people, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.gold)),
      Text('$pct% خصم', style: const TextStyle(fontSize: 12)),
    ]),
  ));
}