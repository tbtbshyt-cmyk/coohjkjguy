// lib/core/storage/hive_boxes.dart
import 'package:hive_flutter/hive_flutter.dart';

class HiveBoxes {
  static const String app = 'app';                  // theme, currency, locale
  static const String catalog = 'catalog';          // products cache
  static const String productDetail = 'product_detail';
  static const String banners = 'banners';
  static const String settings = 'settings';
  static const String cart = 'cart_local';
  static const String wishlist = 'wishlist';
  static const String cache = 'http_cache';

  static late Box appBox;
  static late Box catalogBox;
  static late Box productDetailBox;
  static late Box bannersBox;
  static late Box settingsBox;
  static late Box cartBox;
  static late Box wishlistBox;
  static late Box<String> cacheBox;

  static Future<void> init() async {
    appBox = await Hive.openBox(app);
    catalogBox = await Hive.openBox(catalog);
    productDetailBox = await Hive.openBox(productDetail);
    bannersBox = await Hive.openBox(banners);
    settingsBox = await Hive.openBox(settings);
    cartBox = await Hive.openBox(cart);
    wishlistBox = await Hive.openBox(wishlist);
    cacheBox = await Hive.openBox<String>(cache);
  }

  static Future<void> clearAll() async {
    await appBox.clear();
    await cartBox.clear();
    await wishlistBox.clear();
    await catalogBox.clear();
    await productDetailBox.clear();
  }
}