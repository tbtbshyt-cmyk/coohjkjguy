// lib/app/router.dart — GoRouter with auth-aware redirects
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/storage/hive_boxes.dart';
import '../features/home/home_screen.dart';
import '../features/products/products_screen.dart';
import '../features/products/product_detail_screen.dart';
import '../features/cart/cart_screen.dart';
import '../features/checkout/checkout_screen.dart';
import '../features/orders/orders_screen.dart';
import '../features/orders/order_track_screen.dart';
import '../features/wishlist/wishlist_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/admin/admin_dashboard_screen.dart';
import '../features/ai_assistant/assistant_screen.dart';
import '../features/size_calculator/size_screen.dart';
import '../features/group_buying/group_buy_screen.dart';
import '../features/gift_cards/gift_card_screen.dart';
import '../features/loyalty/loyalty_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: false,
    redirect: (context, state) {
      final isLoggedIn = HiveBoxes.appBox.get('admin_token') != null;
      final goingToAdmin = state.matchedLocation.startsWith('/admin');
      if (goingToAdmin && !isLoggedIn) return '/login?redirect=/admin';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/products', builder: (_, __) => const ProductsScreen()),
      GoRoute(path: '/products/:slug', builder: (_, s) => ProductDetailScreen(slug: s.pathParameters['slug']!)),
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
      GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),
      GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
      GoRoute(path: '/orders/track', builder: (_, s) => OrderTrackScreen(phone: s.uri.queryParameters['phone'] ?? '', code: s.uri.queryParameters['code'] ?? '')),
      GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
      GoRoute(path: '/login', builder: (_, s) => LoginScreen(redirect: s.uri.queryParameters['redirect'])),
      GoRoute(path: '/assistant', builder: (_, __) => const AssistantScreen()),
      GoRoute(path: '/size-calculator', builder: (_, __) => const SizeScreen()),
      GoRoute(path: '/group-buy', builder: (_, __) => const GroupBuyScreen()),
      GoRoute(path: '/gift-cards', builder: (_, __) => const GiftCardScreen()),
      GoRoute(path: '/loyalty', builder: (_, __) => const LoyaltyScreen()),
      GoRoute(
        path: '/admin',
        builder: (_, __) => const AdminDashboardScreen(),
        routes: [
          GoRoute(path: 'products', builder: (_, __) => const AdminDashboardScreen(initialTab: 'products')),
          GoRoute(path: 'orders', builder: (_, __) => const AdminDashboardScreen(initialTab: 'orders')),
          GoRoute(path: 'analytics', builder: (_, __) => const AdminDashboardScreen(initialTab: 'analytics')),
          GoRoute(path: 'settings', builder: (_, __) => const AdminDashboardScreen(initialTab: 'settings')),
        ],
      ),
    ],
  );
});