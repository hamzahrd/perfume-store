import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: cartItems = [], refetch: refetchCart } = trpc.cart.getItems.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeFromCartMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Item removed from cart");
    },
  });

  const updateCartMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => {
      refetchCart();
    },
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      toast.success("Order placed successfully!");
      setIsCheckingOut(false);
      // Redirect to order confirmation
      window.location.href = `/order-confirmation/${order?.id}`;
    },
    onError: () => {
      toast.error("Failed to place order");
    },
  });

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total: number, item: any) => {
      return total + (parseFloat(item.product?.price || 0) * item.quantity);
    }, 0);
  }, [cartItems]);

  const handleRemoveItem = (cartItemId: number) => {
    removeFromCartMutation.mutate({ cartItemId });
  };

  const handleUpdateQuantity = (cartItemId: number, quantity: number) => {
    if (quantity > 0) {
      updateCartMutation.mutate({ cartItemId, quantity });
    }
  };

  const handleCheckout = () => {
    if (!user?.shippingAddress) {
      toast.error("Please update your shipping address first");
      return;
    }

    createOrderMutation.mutate({
      totalAmount: cartTotal,
      shippingAddress: JSON.parse(user.shippingAddress),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/">
            <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
              <ChevronLeft className="w-5 h-5" />
              Back Home
            </a>
          </Link>

          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Shopping Cart</h1>
            <p className="text-foreground/60 mb-8">
              Please sign in to view your cart
            </p>
            <Link href="/login">
              <a className="btn-elegant-filled">Sign In</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="container py-4">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <Link href="/products">
          <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </a>
        </Link>

        <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60 mb-8">
              Your cart is empty
            </p>
            <Link href="/products">
              <a className="btn-elegant-filled">Start Shopping</a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-6 pb-8 border-b border-foreground/10"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-card border border-foreground/10 flex items-center justify-center text-3xl flex-shrink-0">
                      🧴
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link href={`/product/${item.productId}`}>
                        <a className="text-lg font-semibold hover:text-accent transition-colors mb-2">
                          {item.product?.name || "Product"}
                        </a>
                      </Link>
                      <p className="text-sm text-foreground/60 mb-4">
                        Size: {item.selectedSize || "Standard"}
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 w-fit mb-4">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="font-bold">
                        {parseFloat(item.product?.price || 0) * item.quantity} DH
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-foreground/10 p-8 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-foreground/10">
                  <div className="flex justify-between text-foreground/60">
                    <span>Subtotal</span>
                    <span>{cartTotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Tax</span>
                    <span>{(cartTotal * 0.1).toFixed(2)} DH</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    {(cartTotal * 1.1).toFixed(2)} DH
                  </span>
                </div>

                <button
                  onClick={() => setIsCheckingOut(true)}
                  disabled={createOrderMutation.isPending}
                  className="w-full btn-elegant-filled mb-4 disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                </button>

                <Link href="/products">
                  <a className="block text-center btn-elegant">
                    Continue Shopping
                  </a>
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 pt-8 border-t border-foreground/10 space-y-3 text-xs text-foreground/60">
                  <p>✓ Secure checkout</p>
                  <p>✓ Free returns</p>
                  <p>✓ Authentic products</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
