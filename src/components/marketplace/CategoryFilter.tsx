interface CategoryFilterProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

const categoryLabels: Record<string, string> = {
  game: 'Games', defi: 'DeFi', social: 'Social', tool: 'Tools', nft: 'NFT', other: 'Other',
};

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          active === null
            ? 'bg-orange-500 dark:bg-brand-orange text-white shadow-md shadow-orange-500/20'
            : 'bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/8 text-neutral-500 dark:text-white/45 hover:text-neutral-700 dark:hover:text-white hover:border-neutral-300 dark:hover:border-white/15'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(active === cat ? null : cat)}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            active === cat
              ? 'bg-orange-500 dark:bg-brand-orange text-white shadow-md shadow-orange-500/20'
              : 'bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/8 text-neutral-500 dark:text-white/45 hover:text-neutral-700 dark:hover:text-white hover:border-neutral-300 dark:hover:border-white/15'
          }`}
        >
          {categoryLabels[cat] ?? cat}
        </button>
      ))}
    </div>
  );
}
