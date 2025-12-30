import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: bestSellers } = trpc.products.list.useQuery({ category: "all" });

  const categories = [
    { name: "Men's Perfumes", slug: "men", image: "🧴" },
    { name: "Women's Perfumes", slug: "women", image: "💐" },
    { name: "Unisex Perfumes", slug: "unisex", image: "✨" },
    { name: "Exclusive Packs", slug: "pack", image: "🎁" },
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
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products?category=men">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Men
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
            <Link href="/products?category=women">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Women
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
            <Link href="/products?category=unisex">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Unisex
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
            <Link href="/products?category=pack">
              <a className="text-sm hover:text-accent transition-colors relative group">
                Packs
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </a>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-foreground/10 transition-colors rounded-full">
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

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 hero-gradient from-background via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10" />
        
        <div className="relative z-10 container text-center max-w-4xl mx-auto px-4 animate-fade-in-up">
          <div className="mb-8 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans uppercase">
              DISCOVER ELEGANCE
            </p>
            <div className="h-px bg-foreground/20 max-w-20 mx-auto" />
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            The Art of
            <br />
            <span className="text-accent bg-gradient-to-r from-accent to-foreground bg-clip-text text-transparent">Fragrance</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Curated collection of premium perfumes from around the world. Each
            fragrance tells a story of elegance and sophistication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/products">
              <a className="btn-primary">
                Explore Collection
              </a>
            </Link>
            <button className="btn-secondary">
              Learn More
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
              SHOP BY CATEGORY
            </p>
            <div className="h-px bg-foreground/20 max-w-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <a className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                  <div className="mb-4 aspect-square bg-card border border-foreground/10 flex items-center justify-center text-6xl group-hover:bg-foreground/5 transition-colors rounded-xl overflow-hidden relative">
                    <span className="floating">{category.image}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">{category.name}</h3>
                  <p className="text-sm text-foreground/60 flex items-center justify-center group-hover:text-accent transition-colors">
                    Shop Now <ChevronRight className="w-4 h-4 ml-2" />
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

      {/* Exclusive Packs Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="mb-16 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans">
              EXCLUSIVE COLLECTIONS
            </p>
            <div className="h-px bg-foreground/20 max-w-20" />
            <h2 className="text-4xl md:text-5xl font-bold mt-6">
              Curated Packs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exclusivePacks.map((pack, index) => (
              <div
                key={pack.id}
                className="product-card group"
              >
                <div className="p-8">
                  <div className="text-5xl mb-6 text-center">{pack.image}</div>
                  <h3 className="text-2xl font-semibold mb-2 text-center">{pack.name}</h3>
                  <p className="text-foreground/60 text-sm mb-6 text-center">
                    {pack.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">{pack.price}</span>
                    <button className="btn-accent group-hover:scale-105 transition-transform">
                      View
                    </button>
                  </div>
                </div>
              </div>
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
          <div className="mb-16 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans">
              CUSTOMER FAVORITES
            </p>
            <div className="h-px bg-foreground/20 max-w-20" />
            <h2 className="text-4xl md:text-5xl font-bold mt-6">
              Best Sellers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers?.slice(0, 4).map((product: any, index) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <a className="product-card group">
                  <div className="product-image-container">
                    🧴
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-foreground/60 text-sm mb-4">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{product.price} DH</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
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

      {/* Newsletter Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient from-foreground/5 via-transparent to-accent/5 z-0" />
        <div className="container max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Stay Updated
          </h2>
          <p className="text-foreground/60 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Subscribe to our newsletter for exclusive offers and new fragrance
            releases.
          </p>

          <div className="flex gap-2 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-foreground/20 bg-background focus:outline-none focus:border-accent transition-colors rounded-l-lg"
            />
            <button className="btn-primary rounded-r-lg">Subscribe</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <p className="text-sm text-foreground/60 leading-relaxed">
                Premium fragrance collection curated for the discerning customer.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Men's Perfumes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Women's Perfumes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Unisex
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
                    Shipping
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow</h4>
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
            <p>&copy; 2024 Perfume Store. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
