// lib/features/orders/order_track_screen.dart
import 'package:flutter/material.dart';

class OrderTrackScreen extends StatelessWidget {
  final String phone;
  final String code;
  const OrderTrackScreen({super.key, required this.phone, required this.code});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تتبع الطلب')),
      body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.local_shipping, size: 80, color: Color(0xFFD4AF37)),
        const SizedBox(height: 12),
        Text('الطلب $code', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 6),
        Text('على الرقم $phone', style: const TextStyle(color: Colors.white54)),
      ])),
    );
  }
}