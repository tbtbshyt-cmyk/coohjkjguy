import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine { id: string; productId: string; productName: string; productImage: string; size?: string; color?: string; quantity: number; unitPrice: number; }
export interface WishlistEntry { productId: string; addedAt: number; notifyOnDrop: boolean; }

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;

  // Cart (local optimistic mirror — server is source of truth)
  cart: CartLine[];
  cartOpen: boolean;
  setCart: (cart: CartLine[]) => void;
  addToCart: (line: CartLine) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, q: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: WishlistEntry[];
  toggleWishlist: (productId: string) => void;

  // Auth
  adminToken: string | null;
  refreshToken: string | null;
  admin: { id: string; email: string; fullName: string; role: string } | null;
  setAuth: (tokens: { accessToken: string; refreshToken: string; admin: any }) => void;
  clearAuth: () => void;

  // Currency
  currency: 'YER' | 'SAR' | 'USD';
  rates: { YER: number; SAR: number; USD: number };
  setCurrency: (c: 'YER' | 'SAR' | 'USD') => void;
  setRates: (r: { YER: number; SAR: number; USD: number }) => void;

  // Vouchers applied
  appliedVoucher: string | null;
  appliedGiftCard: string | null;
  pointsUsed: number;
  setVoucher: (code: string | null) => void;
  setGiftCard: (code: string | null) => void;
  setPointsUsed: (n: number) => void;

  // Guest token
  guestToken: string | null;
  setGuestToken: (t: string) => void;
}

const ensureGuestToken = () => {
  if (typeof window === 'undefined') return null;
  let t = localStorage.getItem('abv_guest_token');
  if (!t) {
    t = `gt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem('abv_guest_token', t);
  }
  return t;
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setTheme: (t) => set({ theme: t }),

      cart: [],
      cartOpen: false,
      setCart: (cart) => set({ cart }),
      addToCart: (line) => set({
        cart: (() => {
          const idx = get().cart.findIndex((c) => c.productId === line.productId && c.size === line.size && c.color === line.color);
          if (idx >= 0) {
            const copy = [...get().cart];
            copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + line.quantity };
            return copy;
          }
          return [...get().cart, line];
        })(),
      }),
      removeFromCart: (id) => set({ cart: get().cart.filter((c) => c.id !== id) }),
      updateQty: (id, q) => set({ cart: get().cart.map((c) => (c.id === id ? { ...c, quantity: Math.max(1, q) } : c)) }),
      clearCart: () => set({ cart: [] }),
      setCartOpen: (open) => set({ cartOpen: open }),

      wishlist: [],
      toggleWishlist: (productId) => set({
        wishlist: get().wishlist.find((w) => w.productId === productId)
          ? get().wishlist.filter((w) => w.productId !== productId)
          : [...get().wishlist, { productId, addedAt: Date.now(), notifyOnDrop: true }],
      }),

      adminToken: null,
      refreshToken: null,
      admin: null,
      setAuth: ({ accessToken, refreshToken, admin }) => set({
        adminToken: accessToken, refreshToken, admin,
      }),
      clearAuth: () => set({ adminToken: null, refreshToken: null, admin: null }),

      currency: 'YER',
      rates: { YER: 1, SAR: 0.0154, USD: 0.004 },
      setCurrency: (c) => set({ currency: c }),
      setRates: (r) => set({ rates: r }),

      appliedVoucher: null,
      appliedGiftCard: null,
      pointsUsed: 0,
      setVoucher: (code) => set({ appliedVoucher: code }),
      setGiftCard: (code) => set({ appliedGiftCard: code }),
      setPointsUsed: (n) => set({ pointsUsed: n }),

      guestToken: null,
      setGuestToken: (t) => set({ guestToken: t }),
    }),
    {
      name: 'abu-bishar-app',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any))),
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        wishlist: state.wishlist,
        adminToken: state.adminToken,
        refreshToken: state.refreshToken,
        admin: state.admin,
        currency: state.currency,
        rates: state.rates,
        guestToken: state.guestToken,
      }),
      skipHydration: true,
    },
  ),
);