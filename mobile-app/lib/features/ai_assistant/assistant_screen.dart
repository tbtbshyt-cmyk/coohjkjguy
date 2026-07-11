// lib/features/ai_assistant/assistant_screen.dart
// Feature #1 — AI Sales Assistant

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../core/network/dio_client.dart';
import '../../core/theme/app_theme.dart';

class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});
  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen> {
  final List<_Msg> _msgs = [
    _Msg('assistant', 'أهلاً بك في أبو بشار 👑\nأنا مساعدك الذكي. اسألني عن الملابس، المقاسات، العروض أو طريقة الطلب.'),
  ];
  final _ctrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  String? _sessionId;
  bool _busy = false;

  Future<void> _send(String text) async {
    if (text.trim().isEmpty) return;
    setState(() { _msgs.add(_Msg('user', text)); _busy = true; });
    _ctrl.clear();
    _scrollToBottom();
    try {
      final dio = ref.read(dioProvider);
      final r = await dio.post('/ai/assistant', data: {
        'sessionId': _sessionId, 'message': text,
      });
      final data = r.data['data'];
      _sessionId = data['sessionId'];
      setState(() => _msgs.add(_Msg('assistant', data['reply'] ?? '...')));
    } on DioException catch (e) {
      setState(() => _msgs.add(_Msg('assistant', '⚠️ تعذّر الاتصال. حاول مرة أخرى.')));
    } finally {
      setState(() => _busy = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final suggestions = ['عروض اليوم', 'مقاسات', 'رجالي', 'نسائي', 'الدفع عند الاستلام'];
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          const Icon(Icons.auto_awesome, color: AppColors.gold, size: 18),
          const SizedBox(width: 6),
          const Text('مساعد أبو بشار الذكي'),
        ]),
      ),
      body: Column(children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollCtrl,
            padding: const EdgeInsets.all(12),
            itemCount: _msgs.length,
            itemBuilder: (_, i) => _Bubble(msg: _msgs[i]),
          ),
        ),
        if (_busy) const Padding(padding: EdgeInsets.all(8), child: LinearProgressIndicator(minHeight: 2)),
        Container(
          padding: const EdgeInsets.fromLTRB(8, 8, 8, 8),
          decoration: BoxDecoration(color: Theme.of(context).cardColor, border: const Border(top: BorderSide(color: Colors.white10))),
          child: SafeArea(
            top: false,
            child: Column(children: [
              SizedBox(
                height: 32,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: suggestions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 6),
                  itemBuilder: (_, i) => ActionChip(
                    label: Text(suggestions[i], style: const TextStyle(fontSize: 12)),
                    onPressed: () => _send(suggestions[i]),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Row(children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    onSubmitted: _send,
                    decoration: const InputDecoration(hintText: 'اكتب رسالتك...'),
                  ),
                ),
                const SizedBox(width: 6),
                IconButton.filled(
                  style: IconButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: AppColors.ink),
                  onPressed: _busy ? null : () => _send(_ctrl.text),
                  icon: const Icon(Icons.send),
                ),
              ]),
            ]),
          ),
        ),
      ]),
    );
  }
}

class _Msg { final String role; final String text; const _Msg(this.role, this.text); }
class _Bubble extends StatelessWidget {
  final _Msg msg;
  const _Bubble({required this.msg});
  @override
  Widget build(BuildContext context) {
    final isUser = msg.role == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: isUser ? AppColors.gold : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white10),
        ),
        child: MarkdownBody(
          data: msg.text,
          style: TextStyle(color: isUser ? AppColors.ink : null, fontSize: 14, height: 1.5),
        ),
      ),
    );
  }
}