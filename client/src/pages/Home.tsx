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
      <header className="sticky top-0 z-50 bg-background border-b border-foreground/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products?category=men">
              <a className="text-sm hover:text-accent transition-colors">
                Men
              </a>
            </Link>
            <Link href="/products?category=women">
              <a className="text-sm hover:text-accent transition-colors">
                Women
              </a>
            </Link>
            <Link href="/products?category=unisex">
              <a className="text-sm hover:text-accent transition-colors">
                Unisex
              </a>
            </Link>
            <Link href="/products?category=pack">
              <a className="text-sm hover:text-accent transition-colors">
                Packs
              </a>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-foreground/5 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart">
              <a className="p-2 hover:bg-foreground/5 transition-colors relative">
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
              className="md:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />

        <div className="relative z-10 container text-center max-w-4xl mx-auto px-4">
          <div className="mb-8 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans">
              DISCOVER ELEGANCE
            </p>
            <div className="h-px bg-foreground/20 max-w-20 mx-auto" />
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
            The Art of
            <br />
            <span className="text-accent">Fragrance</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Curated collection of premium perfumes from around the world. Each
            fragrance tells a story of elegance and sophistication.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <a className="btn-elegant-filled">
                Explore Collection
              </a>
            </Link>
            <button className="btn-elegant">
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
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <a className="group cursor-pointer">
                  <div className="mb-4 aspect-square bg-card border border-foreground/10 flex items-center justify-center text-6xl group-hover:bg-foreground/5 transition-colors">
                    {category.image}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-foreground/60 flex items-center group-hover:text-accent transition-colors">
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
            {exclusivePacks.map((pack) => (
              <div
                key={pack.id}
                className="border border-foreground/10 p-8 hover:border-accent/50 transition-colors group"
              >
                <div className="text-5xl mb-6">{pack.image}</div>
                <h3 className="text-2xl font-semibold mb-2">{pack.name}</h3>
                <p className="text-foreground/60 text-sm mb-6">
                  {pack.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">{pack.price}</span>
                  <button className="btn-elegant-outline group-hover:border-accent/70 transition-colors">
                    View
                  </button>
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
            {bestSellers?.slice(0, 4).map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <a className="group">
                  <div className="mb-4 aspect-square bg-card border border-foreground/10 flex items-center justify-center text-4xl group-hover:bg-foreground/5 transition-colors">
                    🧴
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-foreground/60 text-sm mb-4">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{product.price} DH</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
      <section className="py-20 md:py-32">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stay Updated
          </h2>
          <p className="text-foreground/60 mb-8">
            Subscribe to our newsletter for exclusive offers and new fragrance
            releases.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-foreground/20 bg-background focus:outline-none focus:border-accent transition-colors"
            />
            <button className="btn-elegant-filled">Subscribe</button>
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
