// lib/features/size_calculator/size_screen.dart
// Feature #2 — AI Size Guide Calculator

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class SizeScreen extends ConsumerStatefulWidget {
  const SizeScreen({super.key});
  @override
  ConsumerState<SizeScreen> createState() => _SizeScreenState();
}

class _SizeScreenState extends ConsumerState<SizeScreen> {
  double _height = 170, _weight = 75, _foot = 27;
  String _category = 'men';
  Map<String, dynamic>? _result;

  Future<void> _compute() async {
    try {
      final r = await ref.read(dioProvider).post('/ai/size-calculator', data: {
        'heightCm': _height, 'weightKg': _weight, 'footCm': _foot, 'category': _category,
      });
      setState(() => _result = r.data['data']);
    } on DioException {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذّر الحساب')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('حاسبة المقاسات الذكية')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.gold.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: const Row(children: [
            Icon(Icons.info_outline, color: AppColors.gold),
            SizedBox(width: 8),
            Expanded(child: Text('أدخل طولك ووزنك ومقاس قدمك لتحصل على المقاس المناسب فوراً.', style: TextStyle(fontSize: 13))),
          ]),
        ),
        const SizedBox(height: 16),
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'men', label: Text('رجالي')),
            ButtonSegment(value: 'women', label: Text('نسائي')),
            ButtonSegment(value: 'kids', label: Text('أطفال')),
          ],
          selected: {_category},
          onSelectionChanged: (s) => setState(() => _category = s.first),
        ),
        const SizedBox(height: 16),
        _Slider(label: 'الطول (سم)', value: _height, min: 120, max: 210, onChanged: (v) => setState(() => _height = v)),
        _Slider(label: 'الوزن (كجم)', value: _weight, min: 20, max: 150, onChanged: (v) => setState(() => _weight = v)),
        _Slider(label: 'مقاس القدم (سم)', value: _foot, min: 15, max: 35, onChanged: (v) => setState(() => _foot = v)),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          icon: const Icon(Icons.calculate),
          label: const Text('احسب مقاسي'),
          onPressed: _compute,
          style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
        ),
        if (_result != null) ...[
          const SizedBox(height: 24),
          Card(color: AppColors.gold.withOpacity(0.05), child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              const Row(children: [
                Icon(Icons.check_circle, color: AppColors.gold),
                SizedBox(width: 8),
                Text('مقاسك المقترح', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.gold)),
              ]),
              const SizedBox(height: 12),
              Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
                _SizeBox(label: 'الملابس', value: _result!['topSize']),
                if (_result!['shoeSize'] != null) _SizeBox(label: 'الحذاء', value: _result!['shoeSize']),
              ]),
              const SizedBox(height: 12),
              ...List<Widget>.from(
                (_result!['notes'] as List).map((n) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Text('• $n', style: const TextStyle(fontSize: 13)),
                )),
              ),
            ]),
          )),
        ],
      ]),
    );
  }
}

class _Slider extends StatelessWidget {
  final String label; final double value; final double min; final double max; final ValueChanged<double> onChanged;
  const _Slider({required this.label, required this.value, required this.min, required this.max, required this.onChanged});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('$label: ${value.toInt()}', style: const TextStyle(fontWeight: FontWeight.w600)),
      Slider(value: value, min: min, max: max, divisions: (max - min).toInt(), label: '${value.toInt()}', onChanged: onChanged, activeColor: AppColors.gold),
    ]),
  );
}

class _SizeBox extends StatelessWidget {
  final String label; final String value;
  const _SizeBox({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(label, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
    const SizedBox(height: 4),
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(12)),
      child: Text(value, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppColors.gold)),
    ),
  ]);
}