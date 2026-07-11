// lib/features/auth/login_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  final String? redirect;
  const LoginScreen({super.key, this.redirect});
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  String? _err;

  Future<void> _login() async {
    setState(() { _busy = true; _err = null; });
    try {
      final r = await ref.read(dioProvider).post('/auth/admin/login', data: {
        'email': _email.text, 'password': _password.text,
      });
      final data = r.data['data'];
      const secure = FlutterSecureStorage();
      await secure.write(key: 'abv_admin_token', value: data['accessToken']);
      await secure.write(key: 'abv_refresh_token', value: data['refreshToken']);
      if (!mounted) return;
      context.go(widget.redirect ?? '/admin');
    } on DioException catch (e) {
      setState(() => _err = e.response?.data?.[ 'message'] ?? 'بيانات الدخول غير صحيحة');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: Center(child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 400), child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.lock, size: 60, color: AppColors.gold),
          const SizedBox(height: 12),
          const Text('لوحة الإدارة', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'البريد الإلكتروني', prefixIcon: Icon(Icons.email))),
          const SizedBox(height: 12),
          TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'كلمة المرور', prefixIcon: Icon(Icons.lock))),
          if (_err != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_err!, style: const TextStyle(color: Colors.redAccent))),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 52)),
            onPressed: _busy ? null : _login,
            child: _busy ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('دخول'),
          ),
        ])),
      ))),
    );
  }
}