import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useMemo } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { isAuthenticated } = useAuth();
  const guestCart = useGuestCart();
  
  // Authenticated cart from server
  const { data: authCartItems = [], refetch } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Products list for guest cart
  const { data: allProducts = [] } = trpc.products.list.useQuery({});
  
  // Combine auth and guest cart items
  const cartItems = useMemo(() => {
    if (isAuthenticated) {
      return authCartItems;
    } else {
      // Map guest cart items to include product details
      return guestCart.cartItems.map(item => {
        const product = allProducts.find((p: any) => p._id === item.productId);
        return {
          id: item.productId,
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          product: product,
        };
      });
    }
  }, [isAuthenticated, authCartItems, guestCart.cartItems, allProducts]);
  
  const removeFromCartMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Article supprimé");
    },
  });

  const updateCartMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleUpdateQuantity = (productId: string, quantity: number, selectedSize?: string, cartItemId?: string) => {
    if (quantity > 0) {
      if (isAuthenticated && cartItemId) {
        updateCartMutation.mutate({ cartItemId, quantity });
      } else {
        guestCart.updateQuantity(productId, quantity, selectedSize);
      }
    }
  };

  const handleRemoveItem = (productId: string, selectedSize?: string, cartItemId?: string) => {
    if (isAuthenticated && cartItemId) {
      removeFromCartMutation.mutate({ cartItemId });
    } else {
      guestCart.removeItem(productId, selectedSize);
      toast.success("Article supprimé");
    }
  };

  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product?.price || 0) * item.quantity);
  }, 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold">Votre Panier</h2>
              <span className="bg-accent text-accent-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                {cartItems.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
                <p className="text-foreground/60 mb-2">Votre panier est vide</p>
                <p className="text-sm text-foreground/40">
                  Ajoutez des parfums pour continuer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="border border-foreground/10 rounded-lg p-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-[#f5f3ed] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-2xl">🧴</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {item.product?.name || "Produit"}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-2">
                          {item.selectedSize || "50ml"}
                        </p>
                        <p className="font-bold text-accent">
                          {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} MAD
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId, item.selectedSize, item._id)}
                        className="p-2 hover:bg-destructive/10 text-destructive transition-colors rounded h-fit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.id)
                        }
                        className="w-8 h-8 border border-foreground/20 hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.id)
                        }
                        className="w-8 h-8 border border-foreground/20 hover:border-accent hover:bg-accent/5 transition-all flex items-center justify-center rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-foreground/10 p-6 bg-card">
              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-accent">
                  {cartTotal.toFixed(2)} MAD
                </span>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Link href="/cart">
                  <a
                    onClick={onClose}
                    className="block w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded-lg font-bold text-center transition-colors"
                  >
                    Voir le panier
                  </a>
                </Link>
                <Link href="/cart?checkout=true">
                  <a
                    onClick={onClose}
                    className="block w-full bg-foreground hover:bg-foreground/90 text-background py-3 rounded-lg font-bold text-center transition-colors"
                  >
                    Acheter maintenant
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
