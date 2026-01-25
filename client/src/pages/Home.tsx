import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, ShoppingBag, Menu, X, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: bestSellers } = trpc.products.list.useQuery({ category: "all" });
  const { data: allProducts = [] } = trpc.products.list.useQuery({});

  // Filter products for search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return allProducts
      .filter((p: any) => p.name.toLowerCase().includes(query))
      .slice(0, 6); // Limit to 6 suggestions
  }, [searchQuery, allProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSearchOpen(false);
    setSearchQuery("");
    setLocation(`/product/${productId}`);
  };

  const categories = [
    { 
      name: "Parfums Hommes", 
      slug: "men", 
      image: "/uploads/home.png",
      description: "Audacieux & Sophistiqués"
    },
    { 
      name: "Parfums Femmes", 
      slug: "women", 
      image: "/uploads/women.png",
      description: "Élégants & Intemporels"
    },
    { 
      name: "Parfums Unisexe", 
      slug: "unisex", 
      image: "/uploads/unisex.png",
      description: "Pour Tous"
    },
  ];

  const exclusivePacks = [
    {
      id: 1,
      name: "Signature Collection",
      price: "249 DH",
      description: "3 Niche Perfumes + Luxury Pouch",
      image: "🎁",
    },
    {
      id: 2,
      name: "Discovery Set",
      price: "399 DH",
      description: "5 Best-Sellers + Premium Box",
      image: "🎀",
    },
    {
      id: 3,
      name: "Luxury Bundle",
      price: "599 DH",
      description: "3 Niche Soils + Silk Pouch",
      image: "👑",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <img src="/uploads/logo.jpg" alt="Mazaya Parfums" className="h-12 w-auto" />
              <span className="font-serif">MAZAYA</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products?category=men">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Hommes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
            <Link href="/products?category=women">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Femmes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
            <Link href="/products?category=unisex">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Unisexe
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-foreground/10 transition-colors rounded-full"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart">
              <a className="p-2 hover:bg-foreground/10 transition-colors relative rounded-full">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </a>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account">
                  <a className="text-sm font-medium hover:text-accent transition-colors">
                    Account
                  </a>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <a className="text-sm font-medium hover:text-accent transition-colors text-accent">
                      Admin
                    </a>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login">
                <a className="text-sm font-medium hover:text-accent transition-colors">
                  Sign In
                </a>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-foreground/10 transition-colors rounded-full"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm">
          <div className="container py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Rechercher</h2>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-foreground/40" />
              <input
                type="text"
                placeholder="Rechercher un parfum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-14 pr-32 py-4 text-xl border-2 border-foreground/20 bg-background rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Rechercher
              </button>
            </form>
            
            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="mt-4 bg-card border border-foreground/10 rounded-xl shadow-lg overflow-hidden">
                <p className="px-4 py-2 text-sm text-foreground/60 border-b border-foreground/10">
                  Suggestions ({searchSuggestions.length})
                </p>
                <div className="divide-y divide-foreground/10">
                  {searchSuggestions.map((product: any) => (
                    <button
                      key={product._id}
                      onClick={() => handleSelectProduct(product._id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-foreground/5 transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-[#f5f3ed] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">🧴</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{product.name}</p>
                        <p className="text-sm text-foreground/60">
                          {product.discountPrice || product.price} DH
                          {product.discountPrice && (
                            <span className="ml-2 line-through text-foreground/40">{product.price} DH</span>
                          )}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-foreground/40" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-3 text-sm font-semibold text-accent hover:bg-accent/10 transition-colors border-t border-foreground/10"
                >
                  Voir tous les résultats pour "{searchQuery}"
                </button>
              </div>
            )}

            {searchQuery.length >= 2 && searchSuggestions.length === 0 && (
              <div className="mt-4 p-6 bg-card border border-foreground/10 rounded-xl text-center">
                <p className="text-foreground/60">Aucun produit trouvé pour "{searchQuery}"</p>
              </div>
            )}

            {searchQuery.length < 2 && (
              <p className="text-sm text-foreground/60 mt-4">
                Tapez au moins 2 caractères pour voir les suggestions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pack Offer Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/5 via-background to-accent/10 border-b border-accent/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiNhODgyMDAiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Pack Image */}
            <div className="relative group">
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl z-10 animate-pulse border-2 border-white">
                🔥 OFFRE LIMITÉE
              </div>
              <div className="relative bg-gradient-to-br from-accent/5 via-background to-accent/10 rounded-3xl p-6 shadow-2xl border border-accent/10 group-hover:shadow-accent/30 transition-all duration-500">
                {/* Pack Image - Actual Photo */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-accent/5 via-background to-accent/10 group-hover:scale-[1.02] transition-transform duration-500">
                  <img 
                    src="/uploads/pack-mazaya.png" 
                    alt="Pack Mazaya Parfums"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-pack')) {
                        parent.innerHTML += `
                          <div class="fallback-pack w-full aspect-[4/3] flex items-center justify-center p-8">
                            <div class="grid grid-cols-2 gap-4 w-full">
                              <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 shadow-lg">
                                <div class="grid grid-cols-3 gap-2">
                                  ${[1,2,3,4,5].map(i => '<div class="aspect-[1/3] bg-gradient-to-b from-orange-700 to-orange-900 rounded-sm shadow"></div>').join('')}
                                </div>
                              </div>
                              <div class="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
                                <div class="grid grid-cols-3 gap-2">
                                  ${[1,2,3,4,5].map(i => '<div class="aspect-[1/3] bg-gradient-to-b from-orange-700 to-orange-900 rounded-sm shadow"></div>').join('')}
                                </div>
                              </div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Pack Details */}
            <div className="space-y-8">
              <div>
                <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-xs tracking-widest font-bold mb-4">
                  🌟 PACK NICHE MAZAYA
                </div>
                <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                  Composez Votre
                  <span className="text-accent block">Collection Unique</span>
                </h2>
                <p className="text-xl text-foreground/70 leading-relaxed">
                  Sélectionnez 5 parfums de niche exclusifs (30ml) et créez votre signature olfactive personnelle
                </p>
              </div>

              <div className="relative bg-gradient-to-br from-white via-accent/5 to-accent/10 border-2 border-accent/30 rounded-2xl p-8 space-y-6 shadow-2xl overflow-hidden">
                {/* Decorative corner elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-tr-full"></div>
                
                <div className="relative z-10">
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-6xl font-bold bg-gradient-to-r from-accent via-amber-600 to-accent bg-clip-text text-transparent">199 DH</span>
                    <span className="text-2xl text-foreground/40 line-through">250 DH</span>
                  </div>
                  <p className="text-sm text-accent font-semibold mb-6">Économisez 51 DH ✨</p>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-6"></div>
                  
                  <div className="space-y-4 text-base">
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium text-foreground/90">5 parfums premium (30ml) au choix</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium text-foreground/90">Livraison gratuite à domicile</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium text-foreground/90">Coffret luxe Mazaya offert</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="font-medium text-foreground/90">Chaque parfum: seulement 40 DH</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/pack-selection">
                <a className="block w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-8 py-5 rounded-xl font-bold text-xl hover:from-accent/90 hover:to-accent/70 transition-all hover:scale-105 hover:shadow-2xl shadow-xl relative overflow-hidden group">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span>Composer Mon Pack</span>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700"></div>
                </a>
              </Link>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-accent">🎯 Offre Exclusive</p>
                <p className="text-xs text-foreground/60">Livraison rapide • Paiement à la livraison</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=2000" 
            alt="Mazaya Parfums"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-accent/20" />
        </div>
        
        <div className="relative z-10 container text-center max-w-4xl mx-auto px-4 py-20 animate-fade-in-up">
          <div className="mb-8 space-y-3">
            <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              MZ
            </div>
            <p className="text-sm tracking-widest text-foreground/60 font-sans uppercase">
              MAZAYA PARFUMS • DÉCOUVREZ L'ÉLÉGANCE
            </p>
            <div className="h-px bg-accent/30 max-w-32 mx-auto" />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            L'Art du Parfum
            <br />
            <span className="text-accent bg-gradient-to-r from-accent via-accent/80 to-foreground bg-clip-text text-transparent">de Niche</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Collection exclusive de parfums de niche. Chaque fragrance Mazaya
            raconte une histoire d'élégance et de raffinement intemporel.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/products">
              <a className="btn-primary inline-block">
                Explorer la Collection
              </a>
            </Link>
            <button className="btn-secondary">
              En Savoir Plus
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border border-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/30 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-foreground/10" />
      </div>

      {/* Categories Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mb-16 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans">
              DÉCOUVRIR PAR CATÉGORIE
            </p>
            <div className="h-px bg-foreground/20 max-w-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <a className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                  <div className="mb-4 aspect-[3/4] bg-card border border-foreground/10 overflow-hidden rounded-xl relative">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="text-xs tracking-widest mb-2 opacity-90">{category.description}</p>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/60 flex items-center justify-center group-hover:text-accent transition-colors">
                    Découvrir <ChevronRight className="w-4 h-4 ml-2" />
                  </p>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-foreground/10" />
      </div>

      {/* Best Sellers Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mb-16 space-y-4 text-center">
            <p className="text-sm tracking-widest text-accent font-bold uppercase">
              🌟 NOS MEILLEURES VENTES
            </p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Best Sellers Mazaya
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Découvrez les parfums préférés de nos clients
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {(() => {
              const menProducts = allProducts.filter((p: any) => p.category === 'men').slice(0, 8);
              const womenProducts = allProducts.filter((p: any) => p.category === 'women').slice(0, 8);
              const unisexProducts = allProducts.filter((p: any) => p.category === 'unisex').slice(0, 4);
              const displayProducts = [...menProducts, ...womenProducts, ...unisexProducts];
              
              return displayProducts.map((product: any) => (
                <Link key={product._id} href={`/product/${product._id}`}>
                  <a className="group block border border-foreground/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 hover:scale-105 bg-[#f5f3ed]">
                    <div className="aspect-square bg-[#f5f3ed] flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML += '<div class="w-full h-full flex items-center justify-center text-5xl">🧴</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          🧴
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        50ml
                      </div>
                    </div>
                    <div className="p-5 bg-[#f5f3ed]">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-foreground/60 mb-3 capitalize">
                        {product.category === 'men' ? 'Homme' : product.category === 'women' ? 'Femme' : 'Unisexe'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-accent">50 DH</span>
                        <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold">
                          50ml
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ));
            })()}
          </div>

          {/* En Savoir Plus Button */}
          <div className="text-center">
            <Link href="/products">
              <a className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-8 py-4 rounded-xl font-bold text-lg hover:from-accent/90 hover:to-accent/70 transition-all hover:scale-105 shadow-lg">
                <span>En Savoir Plus</span>
                <ChevronRight className="w-5 h-5" />
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-foreground/10" />
      </div>

      {/* Newsletter Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient from-foreground/5 via-transparent to-accent/5 z-0" />
        <div className="container max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Restez Informé
          </h2>
          <p className="text-foreground/60 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Inscrivez-vous à notre newsletter pour des offres exclusives et nos nouveaux
            parfums.
          </p>

          <div className="flex gap-2 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 border border-foreground/20 bg-background focus:outline-none focus:border-accent transition-colors rounded-l-lg"
            />
            <button className="btn-primary rounded-r-lg">S'inscrire</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">À Propos</h4>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Collection de parfums de niche premium sélectionnée avec soin.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Boutique</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="/products?category=men" className="hover:text-accent transition-colors">
                    Parfums Hommes
                  </a>
                </li>
                <li>
                  <a href="/products?category=women" className="hover:text-accent transition-colors">
                    Parfums Femmes
                  </a>
                </li>
                <li>
                  <a href="/products?category=unisex" className="hover:text-accent transition-colors">
                    Parfums Unisexe
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Livraison
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Retours
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suivez-nous</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-foreground/10 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-foreground/60">
            <p>&copy; 2026 Mazaya Parfums. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
