import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import CartDrawer from "@/components/CartDrawer";
import { useGuestCart } from "@/hooks/useGuestCart";

export default function ProductDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const productId = parseInt(params.id || "0");
  const { user, isAuthenticated } = useAuth();

  const [selectedSize, setSelectedSize] = useState("50ml");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  const guestCart = useGuestCart();

  const { data: product, isLoading } = trpc.products.getById.useQuery({
    id: productId,
  });

  const { data: relatedProducts = [] } = trpc.products.list.useQuery({
    category: product?.category === 'all' ? undefined : product?.category,
  }, {
    enabled: !!product?.category,
  });

  const utils = trpc.useUtils();

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      // Invalidate cart query to refresh cart data
      utils.cart.getItems.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout au panier");
    },
  });

  const handleAddToCart = () => {
    // Show immediate feedback
    toast.success("Ajouté au panier! 🎁");
    setIsCartDrawerOpen(true);
    
    if (isAuthenticated) {
      // Authenticated users: add to database cart
      addToCartMutation.mutate({
        productId,
        quantity,
        selectedSize,
      });
    } else {
      // Guest users: add to local storage cart
      guestCart.addItem(productId, quantity, selectedSize);
    }
  };

  const handleBuyNow = () => {
    if (isAuthenticated) {
      addToCartMutation.mutate({
        productId,
        quantity,
        selectedSize,
      }, {
        onSuccess: () => {
          setLocation("/cart?checkout=true");
        }
      });
    } else {
      // Guest users: add to cart and go to checkout
      guestCart.addItem(productId, quantity, selectedSize);
      setLocation("/cart?checkout=true");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Chargement...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Link href="/products">
            <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
              <ChevronLeft className="w-5 h-5" />
              Retour aux produits
            </a>
          </Link>
          <p className="text-lg text-foreground/60">Produit introuvable</p>
        </div>
      </div>
    );
  }

  const sizes = (() => {
    try {
      if (typeof product.sizes === "string") {
        const parsed = JSON.parse(product.sizes);
        return Array.isArray(parsed) ? parsed : ["50ml"];
      } else if (Array.isArray(product.sizes)) {
        return product.sizes;
      } else {
        return ["50ml"];
      }
    } catch (e) {
      console.error("Error parsing sizes:", e);
      return ["50ml"];
    }
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <img src="/uploads/logo.jpg" alt="Mazaya Parfums" className="h-12 w-auto" />
              <span className="font-serif">MAZAYA</span>
            </a>
          </Link>
          <Link href="/products">
            <a className="text-sm hover:text-accent transition-colors">
              Retour au Catalogue
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <Link href="/products">
          <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Retour aux produits
          </a>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-[#f5f3ed] border border-foreground/10 flex items-center justify-center rounded-lg">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.parentElement!.innerHTML = '<div class="text-8xl">🧴</div>';
                  }}
                />
              ) : (
                <div className="text-8xl">🧴</div>
              )}
            </div>
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {(() => {
                const imageGallery = product.imageGallery 
                  ? (typeof product.imageGallery === 'string' 
                      ? JSON.parse(product.imageGallery) 
                      : product.imageGallery)
                  : [];
                
                const allImages = product.imageUrl ? [product.imageUrl, ...imageGallery] : imageGallery;
                
                return allImages.length > 0 
                  ? allImages.slice(0, 4).map((imgUrl: string, index: number) => (
                      <button
                        key={index}
                        className="aspect-square bg-[#f5f3ed] border border-foreground/10 flex items-center justify-center hover:border-accent transition-colors rounded"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Gallery ${index + 1}`} 
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.parentElement!.innerHTML = '<div class="text-4xl">🧴</div>';
                          }}
                        />
                      </button>
                    ))
                  : [1, 2, 3, 4].map((i) => (
                      <button
                        key={i}
                        className="aspect-square bg-[#f5f3ed] border border-foreground/10 flex items-center justify-center text-4xl hover:border-accent transition-colors rounded"
                      >
                        🧴
                      </button>
                    ));
              })()}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm text-foreground/60 mb-2 uppercase tracking-widest">
                {product.category === 'men' ? 'HOMME' : product.category === 'women' ? 'FEMME' : 'UNISEXE'}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold mb-4">
                {product.discountPrice || product.price} DH
              </p>
              {product.discountPrice && (
                <p className="text-lg text-foreground/60 line-through">
                  {product.price} DH
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-8 pb-8 border-b border-foreground/10">
              <p className="text-foreground/70 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Fragrance Notes */}
              {(product.topNotes || product.heartNotes || product.baseNotes) && (
                <div className="grid grid-cols-3 gap-4">
                  {product.topNotes && (
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mb-2">
                        Notes de Tête
                      </p>
                      <p className="text-sm font-semibold">{product.topNotes}</p>
                    </div>
                  )}
                  {product.heartNotes && (
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mb-2">
                        Notes de Cœur
                      </p>
                      <p className="text-sm font-semibold">{product.heartNotes}</p>
                    </div>
                  )}
                  {product.baseNotes && (
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mb-2">
                        Notes de Fond
                      </p>
                      <p className="text-sm font-semibold">{product.baseNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price & Info */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-5xl font-bold text-accent">50 DH</span>
                <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-bold">50ml</span>
              </div>
              <p className="text-sm text-foreground/60 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-accent rounded-full"></span>
                Mazaya Parfums • Parfum de Niche
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-4">Quantité</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-foreground/20 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center rounded-lg font-bold text-lg"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-foreground/20 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center rounded-lg font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {(product.stock ?? 0) > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-sm text-green-600 font-semibold">En Stock</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-destructive rounded-full"></span>
                  <p className="text-sm text-destructive font-semibold">
                    Rupture de Stock
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-8 py-4 rounded-xl font-bold text-lg hover:from-accent/90 hover:to-accent/70 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{addToCartMutation.isPending ? "Ajout..." : "Ajouter au Panier"}</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
                className="w-full bg-foreground hover:bg-foreground/90 text-background px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {addToCartMutation.isPending ? "Traitement..." : "Acheter maintenant"}
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full px-6 py-3 border-2 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/20 hover:border-accent"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-accent" : ""}`} />
                <span>{isWishlisted ? "Ajouté aux favoris" : "Ajouter aux favoris"}</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-foreground/10 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <span className="text-foreground/70">Livraison gratuite à partir de 200 DH</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <span className="text-foreground/70">Paiement à la livraison</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent text-xl">✓</span>
                <span className="text-foreground/70">Produits authentiques garantis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <div className="mb-8 space-y-2">
            <p className="text-sm tracking-widest text-accent font-bold uppercase">
              🌟 VOUS AIMEREZ AUSSI
            </p>
            <h3 className="text-3xl font-bold">Produits Similaires</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(() => {
              const filteredRelated = relatedProducts
                .filter((p: any) => p.id !== product?.id)
                .slice(0, 4);

              return filteredRelated.map((relatedProduct: any) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                  <a className="group block border border-foreground/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 hover:scale-105 bg-[#f5f3ed]">
                    <div className="aspect-square bg-[#f5f3ed] flex items-center justify-center relative overflow-hidden">
                      {relatedProduct.imageUrl ? (
                        <img 
                          src={relatedProduct.imageUrl} 
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain p-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML += '<div class="w-full h-full flex items-center justify-center text-4xl">🧴</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🧴
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        50ml
                      </div>
                    </div>
                    <div className="p-4 bg-[#f5f3ed]">
                      <h3 className="text-sm font-bold mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xs text-foreground/60 mb-2 capitalize">
                        {relatedProduct.category === 'men' ? 'Homme' : relatedProduct.category === 'women' ? 'Femme' : 'Unisexe'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-accent">50 DH</span>
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-semibold">
                          50ml
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
