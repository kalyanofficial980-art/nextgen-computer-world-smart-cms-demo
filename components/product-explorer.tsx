"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

const emptyFilters = {
  search: "",
  category: "",
  brand: "",
  processor: "",
  ram: "",
  storage: "",
  condition: "",
  stock: "",
  minPrice: "",
  maxPrice: "",
  sort: "featured",
};

export function ProductExplorer({ products }: { products: Product[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState(emptyFilters);
  const [selected, setSelected] = useState<string[]>([]);

  const values = (key: keyof Product) =>
    [...new Set(products.map((product) => String(product[key])))]
      .filter((value) => value && value !== "Not Applicable")
      .sort();

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    const result = products.filter((product) => {
      const haystack = [
        product.name,
        product.category,
        product.brand,
        product.processor,
        product.ram,
        product.storage,
        product.condition,
        product.stock,
      ]
        .join(" ")
        .toLowerCase();

      if (query && !haystack.includes(query)) return false;

      for (const key of [
        "category",
        "brand",
        "processor",
        "ram",
        "storage",
        "condition",
        "stock",
      ] as const) {
        if (filters[key] && product[key] !== filters[key]) return false;
      }

      const min = Number(filters.minPrice || 0);
      const max = Number(filters.maxPrice || Number.POSITIVE_INFINITY);

      return product.price >= min && product.price <= max;
    });

    return [...result].sort((a, b) => {
      if (filters.sort === "price-low") return a.price - b.price;
      if (filters.sort === "price-high") return b.price - a.price;
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured);
    });
  }, [filters, products]);

  const update = (key: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const updateCompare = (slug: string, checked: boolean) => {
    setSelected((current) => {
      if (!checked) return current.filter((item) => item !== slug);
      if (current.length >= 3) {
        window.alert("You can compare up to three products.");
        return current;
      }
      return [...current, slug];
    });
  };

  const selectOptions = [
    ["category", "Category", values("category")],
    ["brand", "Brand", values("brand")],
    ["processor", "Processor", values("processor")],
    ["ram", "RAM", values("ram")],
    ["storage", "Storage", values("storage")],
    ["condition", "Condition", values("condition")],
    ["stock", "Stock", values("stock")],
  ] as const;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="surface h-fit rounded-3xl p-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-2">
            <Icon name="filter" className="size-5 text-cyan-300" />
            <h2 className="font-black text-white">Filter Products</h2>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-black text-slate-300">
              Search
            </span>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
              />
              <input
                value={filters.search}
                onChange={(event) => update("search", event.target.value)}
                placeholder="Product, brand or specification"
                className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 pr-3 pl-10 text-sm text-white"
              />
            </div>
          </label>

          <div className="mt-4 grid gap-4">
            {selectOptions.map(([key, label, options]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-xs font-black text-slate-300">
                  {label}
                </span>
                <select
                  value={filters[key]}
                  onChange={(event) => update(key, event.target.value)}
                  className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
                >
                  <option value="">All {label.toLowerCase()} options</option>
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <label>
              <span className="mb-2 block text-xs font-black text-slate-300">
                Min price
              </span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(event) => update("minPrice", event.target.value)}
                placeholder="₹"
                className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-black text-slate-300">
                Max price
              </span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(event) => update("maxPrice", event.target.value)}
                placeholder="₹"
                className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="focus-ring mt-5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 text-sm font-black text-white"
          >
            Reset Filters
          </button>
        </aside>

        <div>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <strong className="text-white">Catalogue Results</strong>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} of {products.length} products
              </p>
            </div>
            <label className="min-w-52">
              <span className="mb-2 block text-xs font-black text-slate-300">
                Sort
              </span>
              <select
                value={filters.sort}
                onChange={(event) => update("sort", event.target.value)}
                className="focus-ring min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 text-sm text-white"
              >
                <option value="featured">Featured first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  selected={selected.includes(product.slug)}
                  onCompareChange={updateCompare}
                />
              ))}
            </div>
          ) : (
            <div className="surface rounded-3xl p-12 text-center">
              <h3 className="text-xl font-black text-white">No products found</h3>
              <p className="mt-2 text-slate-500">
                Remove one or more filters and try again.
              </p>
            </div>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="glass fixed right-4 bottom-4 left-4 z-40 mx-auto flex max-w-3xl flex-col justify-between gap-3 rounded-2xl p-4 shadow-2xl sm:flex-row sm:items-center">
          <div>
            <strong className="text-sm text-white">Selected for comparison</strong>
            <p className="mt-1 text-xs text-slate-400">
              {selected.length} selected • Choose 2 or 3 products
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected([])}
              className="focus-ring min-h-11 rounded-xl border border-slate-700 px-4 text-sm font-black text-white"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={selected.length < 2}
              onClick={() =>
                router.push(`/compare?ids=${encodeURIComponent(selected.join(","))}`)
              }
              className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon name="compare" className="size-4" />
              Compare
            </button>
          </div>
        </div>
      )}
    </>
  );
}
