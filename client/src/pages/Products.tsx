import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { ChevronRight, Search, Filter, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categoryParam = params.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: products = [] } = trpc.products.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const categories = [
    { name: "Tous", value: "all" },
    { name: "Hommes", value: "men" },
    { name: "Femmes", value: "women" },
    { name: "Unisexe", value: "unisex" },
  ];

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === "newest") {
      filtered = [...filtered].reverse();
    }

    return filtered;
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="container py-4">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded font-serif">MZ</span>
              <span className="font-serif">MAZAYA</span>
            </a>
          </Link>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2 border border-foreground/20 hover:border-accent transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside
            className={`lg:col-span-1 ${
              filterOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setFilterOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 transition-colors ${
                        selectedCategory === cat.value
                          ? "bg-accent text-accent-foreground font-semibold rounded-lg"
                          : "hover:bg-foreground/5 rounded-lg"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent rounded-lg"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <div className="space-y-2 text-sm text-foreground/60">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Under 100 DH</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>100 - 250 DH</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>250 - 500 DH</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Over 500 DH</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {selectedCategory === "all"
                    ? "All Fragrances"
                    : selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1)}
                </h1>
                <p className="text-foreground/60">
                  {filteredProducts.length} products
                </p>
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-foreground/10 transition-colors"
              >
                {filterOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product: any, index) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a className="product-card group">
                      <div className="product-image-container">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-contain p-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.parentElement!.innerHTML = '<div class="text-5xl">🧴</div>';
                            }}
                          />
                        ) : (
                          <div className="text-5xl">🧴</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-4 capitalize">
                          {product.category}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.discountPrice ? (
                              <>
                                <span className="text-lg font-bold">
                                  {product.discountPrice} DH
                                </span>
                                <span className="text-sm text-foreground/50 line-through">
                                  {product.price} DH
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold">
                                {product.price} DH
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>

                        {/* Stock Status */}
                        {product.stock > 0 ? (
                          <p className="text-xs text-accent mt-2">In Stock</p>
                        ) : (
                          <p className="text-xs text-destructive mt-2">
                            Out of Stock
                          </p>
                        )}
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-foreground/60 mb-4">
                  No products found
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
