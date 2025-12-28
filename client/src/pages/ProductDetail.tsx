import { useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, ShoppingBag, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id || "0");
  const { user, isAuthenticated } = useAuth();

  const [selectedSize, setSelectedSize] = useState("50ml");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { data: product, isLoading } = trpc.products.getById.useQuery({
    id: productId,
  });

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      setQuantity(1);
    },
    onError: () => {
      toast.error("Please sign in to add items to cart");
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    addToCartMutation.mutate({
      productId,
      quantity,
      selectedSize,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60">Loading...</p>
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
              Back to Products
            </a>
          </Link>
          <p className="text-lg text-foreground/60">Product not found</p>
        </div>
      </div>
    );
  }

  const sizes = (product.sizes as string[]) || ["30ml", "50ml", "100ml"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>
          <Link href="/products">
            <a className="text-sm hover:text-accent transition-colors">
              Back to Catalog
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <Link href="/products">
          <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Back to Products
          </a>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-card border border-foreground/10 flex items-center justify-center text-8xl">
              🧴
            </div>
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className="aspect-square bg-card border border-foreground/10 flex items-center justify-center text-4xl hover:border-accent transition-colors"
                >
                  🧴
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm text-foreground/60 mb-2 uppercase tracking-widest">
                {product.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-bold mb-4">
                {product.discountPrice || product.price} DH
              </p>
              {product.discountPrice && (
                <p className="text-sm text-foreground/60 line-through">
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
                        Top Notes
                      </p>
                      <p className="text-sm font-semibold">{product.topNotes}</p>
                    </div>
                  )}
                  {product.heartNotes && (
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mb-2">
                        Heart Notes
                      </p>
                      <p className="text-sm font-semibold">{product.heartNotes}</p>
                    </div>
                  )}
                  {product.baseNotes && (
                    <div>
                      <p className="text-xs text-foreground/60 uppercase tracking-widest mb-2">
                        Base Notes
                      </p>
                      <p className="text-sm font-semibold">{product.baseNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-4">Size</p>
              <div className="flex gap-3">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border transition-colors ${
                      selectedSize === size
                        ? "border-accent bg-foreground/5"
                        : "border-foreground/20 hover:border-accent"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-semibold mb-4">Quantity</p>
              <div className="flex items-center gap-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {(product.stock ?? 0) > 0 ? (
                <p className="text-sm text-accent font-semibold">In Stock</p>
              ) : (
                <p className="text-sm text-destructive font-semibold">
                  Out of Stock
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={(product.stock ?? 0) === 0 || addToCartMutation.isPending}
                className="flex-1 btn-elegant-filled flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="px-6 py-3 border border-foreground/40 hover:border-accent transition-colors flex items-center justify-center"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-accent text-accent" : ""
                  }`}
                />
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-foreground/10 space-y-4 text-sm text-foreground/60">
              <p>✓ Free shipping on orders over 500 DH</p>
              <p>✓ 30-day returns policy</p>
              <p>✓ Authentic products guaranteed</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-16">
          <div className="mb-8 space-y-2">
            <p className="text-sm tracking-widest text-foreground/60 font-sans">
              YOU MAY ALSO LIKE
            </p>
            <div className="h-px bg-foreground/20 max-w-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href={`/product/${i}`}>
                <a className="group">
                  <div className="mb-4 aspect-square bg-card border border-foreground/10 flex items-center justify-center text-5xl group-hover:bg-foreground/5 transition-colors">
                    🧴
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Related Product</h3>
                  <p className="text-sm text-foreground/60 mb-4">
                    {product.category}
                  </p>
                  <p className="font-bold">250 DH</p>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
