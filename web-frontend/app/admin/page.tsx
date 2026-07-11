'use client';
export default function AdminPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-black mb-3">لوحة الإدارة</h1>
      <p className="text-ink-300 mb-6 max-w-md">استخدم تطبيق الـ Backend (/admin-dashboard/api) أو الـ Flutter للوحة الإدارة الكاملة.</p>
      <a href="https://api.abu-bishar.com/api/v1/abecp/docs" target="_blank" rel="noreferrer" className="btn-gold">Swagger API Docs</a>
    </div>
  );
}
