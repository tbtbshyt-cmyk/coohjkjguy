// lib/features/loyalty/loyalty_screen.dart
// Feature #24 — Loyalty Points Wallet

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class LoyaltyScreen extends ConsumerStatefulWidget {
  const LoyaltyScreen({super.key});
  @override
  ConsumerState<LoyaltyScreen> createState() => _LoyaltyScreenState();
}

class _LoyaltyScreenState extends ConsumerState<LoyaltyScreen> {
  Map<String, dynamic>? _account;
  List<Map<String, dynamic>> _txns = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final dio = ref.read(dioProvider);
      final r1 = await dio.get('/loyalty/me');
      final r2 = await dio.get('/loyalty/me/transactions');
      _account = r1.data['data'];
      _txns = List<Map<String, dynamic>>.from(r2.data['data']['transactions'] ?? []);
    } on DioException {
      // 401 if not logged in
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('نقاط الولاء')),
      body: _loading ? const Center(child: CircularProgressIndicator())
        : _account == null
          ? const Center(child: Padding(padding: EdgeInsets.all(40), child: Text('سجّل دخول لعرض محفظتك', textAlign: TextAlign.center)))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppColors.ink, AppColors.inkSoft]),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [
                      Text('رصيدك', style: TextStyle(color: Colors.white70)),
                      Icon(Icons.wallet, color: AppColors.gold),
                    ]),
                    const SizedBox(height: 12),
                    Text('${_account!['points']} نقطة', style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.gold)),
                    Text('≈ ${(_account!['points'] * (_account!['yERPerPoint'] as num)).toStringAsFixed(0)} ر.ي', style: const TextStyle(color: Colors.white70)),
                    const SizedBox(height: 12),
                    const Text('كل نقطة = خصم 50 ر.ي عند الشراء', style: TextStyle(fontSize: 11, color: Colors.white54)),
                  ]),
                ),
                const SizedBox(height: 16),
                const Text('سجل المعاملات', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                if (_txns.isEmpty) const Padding(padding: EdgeInsets.all(20), child: Text('لا توجد معاملات بعد', textAlign: TextAlign.center, style: TextStyle(color: Colors.white54))),
                ..._txns.map((t) => Card(child: ListTile(
                  leading: CircleAvatar(backgroundColor: (t['delta'] as int) >= 0 ? Colors.green : Colors.red, child: Icon((t['delta'] as int) >= 0 ? Icons.add : Icons.remove, color: Colors.white)),
                  title: Text(t['reason'] ?? ''),
                  subtitle: Text(DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(t['createdAt']))),
                  trailing: Text('${t['delta'] >= 0 ? '+' : ''}${t['delta']}', style: TextStyle(fontWeight: FontWeight.bold, color: (t['delta'] as int) >= 0 ? Colors.green : Colors.red)),
                ))),
              ]),
            ),
    );
  }
}