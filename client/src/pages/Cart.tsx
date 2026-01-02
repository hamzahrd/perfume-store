import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    city: "",
    phone: "",
    address: "",
  });

  const { data: cartItems = [], refetch: refetchCart } = trpc.cart.getItems.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeFromCartMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success("Article supprimé du panier");
    },
  });

  const updateCartMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => {
      refetchCart();
    },
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      toast.success("Commande placée avec succès! 🎁");
      setIsCheckingOut(false);
      // Redirect to order confirmation
      window.location.href = `/order-confirmation/${order?.id}`;
    },
    onError: (error) => {
      toast.error("Erreur lors de la commande");
      console.error(error);
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
    if (!checkoutForm.firstName || !checkoutForm.city || !checkoutForm.phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const shippingAddress = `${checkoutForm.address || checkoutForm.city}`;
    
    createOrderMutation.mutate({
      totalAmount: cartTotal,
      shippingAddress,
      customerName: checkoutForm.firstName,
      customerCity: checkoutForm.city,
      customerPhone: checkoutForm.phone,
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
              <a className="btn-primary">Sign In</a>
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
        <Link href="/">
          <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Retour
          </a>
        </Link>

        <h1 className="text-4xl font-bold mb-12">Panier</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-foreground/60 mb-8">
              Votre panier est vide
            </p>
            <Link href="/">
              <a className="btn-primary">Continuer les achats</a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="border border-foreground/10 rounded-lg p-4 hover:border-accent/50 transition-colors"
                  >
                    {/* Product Row */}
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-[#f5f3ed] border border-foreground/10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">🧴</span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link href={`/product/${item.productId}`}>
                          <a className="font-semibold hover:text-accent transition-colors block mb-1">
                            {item.product?.name || "Produit"}
                          </a>
                        </Link>
                        <p className="text-sm text-foreground/60 mb-2">
                          {item.product?.price || 0} DH
                        </p>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 w-fit">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center rounded text-xs"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 border border-foreground/20 hover:border-accent transition-colors flex items-center justify-center rounded text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right">
                        <p className="font-bold mb-4">
                          {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} DH
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive transition-colors rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Checkout Panel */}
            <div className="lg:col-span-1">
              <div className="border border-foreground/10 rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-6">Récapitulatif</h2>

                {/* Summary Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-foreground/10">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground/70">
                        {item.product?.name} × {item.quantity}
                      </span>
                      <span className="font-semibold text-foreground/90">
                        {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} DH
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-foreground/70">
                    <span>Prix de détail</span>
                    <span>{cartTotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Sous-total</span>
                    <span>{cartTotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Expédition</span>
                    <span>Calculés à la caisse</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 pb-6 border-t border-foreground/10 pt-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-accent">
                    {cartTotal.toFixed(2)} DH
                  </span>
                </div>

                {/* Checkout Form */}
                {isCheckingOut && (
                  <div className="space-y-4 mb-6 pb-6 border-b border-foreground/10">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Prénom *</label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={checkoutForm.firstName}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Adresse *</label>
                      <input
                        type="text"
                        placeholder="Votre adresse"
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Ville *</label>
                      <select
                        value={checkoutForm.city}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, city: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      >
                        <option value="">Sélectionnez une ville</option>
                        <option value="casablanca">Casablanca</option>
                        <option value="rabat">Rabat</option>
                        <option value="marrakech">Marrakech</option>
                        <option value="fez">Fez</option>
                        <option value="tangier">Tangier</option>
                        <option value="agadir">Agadir</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        placeholder="Votre téléphone"
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                {!isCheckingOut ? (
                  <button
                    onClick={() => setIsCheckingOut(true)}
                    disabled={cartItems.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-bold transition-colors disabled:cursor-not-allowed mb-4"
                  >
                    Passer commande
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCheckout}
                      disabled={createOrderMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-bold transition-colors disabled:cursor-not-allowed mb-4"
                    >
                      {createOrderMutation.isPending ? "Traitement..." : "Confirmer la commande"}
                    </button>
                    <button
                      onClick={() => setIsCheckingOut(false)}
                      className="w-full border border-foreground/20 hover:border-foreground/40 text-foreground py-3 rounded-lg font-bold transition-colors"
                    >
                      Annuler
                    </button>
                  </>
                )}

                <p className="text-xs text-foreground/60 text-center mt-4">
                  Votre commande sera envoyée via WhatsApp
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
