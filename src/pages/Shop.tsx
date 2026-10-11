import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Modal, ProductCard, Transparency } from "../components";
import { categories, ecoScore, products } from "../model";

type Filters = { category: string; eco: string; max: string };
export function Shop() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [draft, setDraft] = useState<Filters>({
    category: "",
    eco: "",
    max: "",
  });
  const filters = {
    category: params.get("category") || "",
    eco: params.get("eco") || "",
    max: params.get("max") || "",
  };
  const query = params.get("q") || "";
  const sort = params.get("sort") || "featured";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const active = !!(filters.category || filters.eco || filters.max);
  let shown = products.filter(
    (p) =>
      (!query ||
        `${p.name} ${p.description} ${p.material} ${p.category}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.eco || ecoScore(p) >= Number(filters.eco)) &&
      (!filters.max || p.price <= Number(filters.max) * 100),
  );
  if (sort === "price-low") shown.sort((a, b) => a.price - b.price);
  if (sort === "price-high") shown.sort((a, b) => b.price - a.price);
  if (sort === "eco") shown.sort((a, b) => ecoScore(b) - ecoScore(a));
  const controls = (
    value: Filters,
    set: (key: keyof Filters, value: string) => void,
  ) => (
    <>
      <label>
        Category
        <select
          aria-label="Category"
          value={value.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Minimum Eco-Score
        <select
          aria-label="Minimum Eco-Score"
          value={value.eco}
          onChange={(e) => set("eco", e.target.value)}
        >
          <option value="">Any score</option>
          <option value="3">3 leaves & above</option>
          <option value="4">4 leaves & above</option>
          <option value="5">5 leaves</option>
        </select>
      </label>
      <label>
        Maximum price
        <select
          aria-label="Maximum price"
          value={value.max}
          onChange={(e) => set("max", e.target.value)}
        >
          <option value="">Any price</option>
          <option value="250">₹250</option>
          <option value="500">₹500</option>
          <option value="750">₹750</option>
          <option value="1000">₹1,000</option>
        </select>
      </label>
    </>
  );
  return (
    <>
      <p className="eyebrow accent">
        The collection / 12 considered essentials
      </p>
      <div className="page-heading">
        <div>
          <h1>Everyday, improved.</h1>
          <p className="muted">
            Simple swaps. Useful things. Made for repeat use.
          </p>
        </div>
        <span className="small muted">Everyday essentials</span>
      </div>
      <form
        className="catalog-search"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="catalog-search">Search the collection</label>
        <input
          id="catalog-search"
          type="search"
          placeholder="Try bottle, canvas or kitchen"
          value={query}
          onChange={(e) => update("q", e.target.value)}
        />
      </form>
      <div className="catalog-layout">
        <aside className="filter-sidebar">
          <h2>Find your essentials</h2>
          {controls(filters, update)}
          {active && (
            <button
              className="text-button"
              onClick={() => {
                const p = new URLSearchParams(params);
                ["category", "eco", "max"].forEach((k) => p.delete(k));
                setParams(p);
              }}
            >
              Clear filters
            </button>
          )}
          <p className="caption muted">
            Eco-Scores use an illustrative rubric. No independent certification
            is claimed.
          </p>
        </aside>
        <section aria-label="Product results">
          <div className="results-toolbar">
            <p role="status">
              {shown.length} {shown.length === 1 ? "product" : "products"}
              {query && <> for “{query}”</>}
            </p>
            <button
              className="button secondary mobile-filter"
              onClick={() => {
                setDraft(filters);
                setShowFilters(true);
              }}
            >
              <SlidersHorizontal size={16} /> Filters{active ? " •" : ""}
            </button>
            <label className="sort">
              Sort by
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="eco">Eco-Score</option>
              </select>
            </label>
          </div>
          {shown.length ? (
            <div className="product-grid catalog-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h2>No matches, yet.</h2>
              <p>Try a broader search or remove a filter.</p>
              <button
                className="button secondary"
                onClick={() => setParams({})}
              >
                Reset search & filters
              </button>
            </div>
          )}
        </section>
      </div>
      <Transparency />
      {showFilters && (
        <Modal
          title="Find your essentials"
          onClose={() => setShowFilters(false)}
        >
          <div className="filter-fields">
            {controls(draft, (k, v) => setDraft((d) => ({ ...d, [k]: v })))}
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setDraft({ category: "", eco: "", max: "" })}
            >
              Reset filters
            </button>
            <button
              className="button"
              onClick={() => {
                const p = new URLSearchParams(params);
                Object.entries(draft).forEach(([k, v]) =>
                  v ? p.set(k, v) : p.delete(k),
                );
                setParams(p);
                setShowFilters(false);
              }}
            >
              Show products
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
