// lib/features/admin/admin_dashboard_screen.dart
// Feature #35 — Employee audit log live in admin dashboard

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  final String? initialTab;
  const AdminDashboardScreen({super.key, this.initialTab});
  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  int _tab = 0;
  Map<String, dynamic>? _summary;
  List<Map<String, dynamic>> _auditLogs = [];
  List<Map<String, dynamic>> _orders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    if (widget.initialTab == 'products') _tab = 1;
    if (widget.initialTab == 'orders') _tab = 2;
    if (widget.initialTab == 'analytics') _tab = 3;
    if (widget.initialTab == 'settings') _tab = 4;
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final dio = ref.read(dioProvider);
    try {
      if (_tab == 0) {
        final r = await dio.get('/admin/dashboard/summary');
        _summary = r.data['data'];
      } else if (_tab == 2) {
        final r = await dio.get('/admin/orders', queryParameters: {'limit': 50});
        _orders = List<Map<String, dynamic>>.from(r.data['data']);
      } else if (_tab == 3) {
        final r = await dio.get('/admin/audit-logs', queryParameters: {'limit': 50});
        _auditLogs = List<Map<String, dynamic>>.from(r.data['data']);
      }
    } on DioException {
      // ignore
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة التحكم'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              children: [
                _tabBar('الرئيسية', 0), _tabBar('المنتجات', 1), _tabBar('الطلبات', 2),
                _tabBar('سجل التدقيق', 3), _tabBar('الإعدادات', 4),
              ],
            ),
          ),
        ),
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _load,
            child: _tab == 0 ? _summaryView() : _tab == 2 ? _ordersView() : _tab == 3 ? _auditView() : _placeholderView(),
          ),
    );
  }

  Widget _tabBar(String label, int i) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
    child: ChoiceChip(label: Text(label), selected: _tab == i, onSelected: (_) { setState(() => _tab = i); _load(); }),
  );

  Widget _summaryView() {
    if (_summary == null) return const Center(child: Text('لا توجد بيانات'));
    return ListView(padding: const EdgeInsets.all(16), children: [
      GridView.count(crossAxisCount: 2, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.5,
        children: [
          _kpiCard('إجمالي المبيعات', '${_summary!['totalRevenue']} ر.ي', Icons.attach_money, Colors.green),
          _kpiCard('طلبات اليوم', '${_summary!['todayOrders']}', Icons.shopping_cart, Colors.blue),
          _kpiCard('قيد الانتظار', '${_summary!['pendingOrders']}', Icons.pending, AppColors.gold),
          _kpiCard('منتجات قاربت على النفاد', '${_summary!['lowStockProducts']}', Icons.warning, Colors.orange),
        ],
      ),
      const SizedBox(height: 16),
      Card(child: ListTile(
        leading: const Icon(Icons.security, color: AppColors.gold),
        title: const Text('سجل التدقيق (#35)'),
        subtitle: const Text('كل تصرفات الموظفين مسجلة'),
        trailing: const Icon(Icons.chevron_left),
        onTap: () => setState(() { _tab = 3; _load(); }),
      )),
    ]);
  }

  Widget _kpiCard(String label, String value, IconData icon, Color color) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
      Row(children: [Icon(icon, color: color, size: 18), const SizedBox(width: 4), Text(label, style: const TextStyle(fontSize: 11, color: Colors.white70))]),
      const SizedBox(height: 6),
      Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
    ]),
  );

  Widget _ordersView() => ListView.separated(
    itemCount: _orders.length,
    separatorBuilder: (_, __) => const Divider(height: 1),
    itemBuilder: (_, i) {
      final o = _orders[i];
      return ListTile(
        title: Text(o['orderNumber'] ?? '—', style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('${o['customerName']} · ${(o['total'] as num).toStringAsFixed(0)} ر.ي'),
        trailing: Text(o['status'] ?? '', style: const TextStyle(fontSize: 11)),
      );
    },
  );

  Widget _auditView() => ListView.separated(
    itemCount: _auditLogs.length,
    separatorBuilder: (_, __) => const Divider(height: 1),
    itemBuilder: (_, i) {
      final log = _auditLogs[i];
      return ListTile(
        dense: true,
        leading: CircleAvatar(
          radius: 14,
          backgroundColor: _actionColor(log['action'] as String).withOpacity(0.2),
          child: Icon(_actionIcon(log['action'] as String), size: 12, color: _actionColor(log['action'] as String)),
        ),
        title: Text('${log['userEmail'] ?? 'system'} · ${log['action']} ${log['resource']}'),
        subtitle: Text(DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(log['createdAt']))),
      );
    },
  );

  Widget _placeholderView() => Center(child: Padding(padding: const EdgeInsets.all(40),
    child: Text(_tab == 1 ? 'إدارة المنتجات — استخدم إصدار الويب للإدارة المتقدمة' : 'الإعدادات', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white54))));

  IconData _actionIcon(String action) {
    return ({'CREATE': Icons.add, 'UPDATE': Icons.edit, 'DELETE': Icons.delete, 'LOGIN': Icons.login, 'LOGOUT': Icons.logout, 'SETTINGS_CHANGE': Icons.settings} as Map<String, IconData>)[action] ?? Icons.circle;
  }

  Color _actionColor(String action) {
    if (action == 'DELETE') return Colors.redAccent;
    if (action == 'CREATE') return Colors.greenAccent;
    if (action == 'UPDATE') return AppColors.gold;
    return Colors.blueAccent;
  }
}