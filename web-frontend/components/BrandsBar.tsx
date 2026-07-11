const brands = ['أبو بشار', 'Royal', 'Heritage', 'Modern', 'Classic', 'Premium', 'Urban', 'Kids', 'Golden Touch', 'Elite'];
export function BrandsBar() {
  return (
    <section className="border-y border-ink-100 dark:border-ink-600 bg-white dark:bg-ink-700 py-5">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center sm:justify-around gap-x-10 gap-y-3 opacity-80">
        {brands.map((b) => <span key={b} className="text-base sm:text-lg font-black gradient-text">{b}</span>)}
      </div>
    </section>
  );
}