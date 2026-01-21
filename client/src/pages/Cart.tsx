import { useState, useMemo, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { ChevronLeft, Trash2, Plus, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useGuestCart } from "@/hooks/useGuestCart";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const guestCart = useGuestCart();
  const searchParams = useSearch();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: "",
    lastName: "",
    city: "",
    phone: "",
    address: "",
  });

  const { data: authCartItems = [], refetch: refetchCart } = trpc.cart.getItems.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Auto-open checkout form if checkout query parameter is present
  useEffect(() => {
    if (searchParams.includes('checkout=true')) {
      setIsCheckingOut(true);
    }
  }, [searchParams]);

  // Fetch product details for guest cart items
  const { data: allProducts = [] } = trpc.products.list.useQuery({});
  
  // Combine auth and guest cart items
  const cartItems = useMemo(() => {
    if (isAuthenticated) {
      return authCartItems;
    } else {
      // Map guest cart items to product details
      return guestCart.cartItems.map(item => {
        const product = allProducts.find((p: any) => p.id === item.productId);
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
      window.location.href = `/order-confirmation/${order?.id}`;
    },
    onError: (error) => {
      toast.error("Erreur lors de la commande");
      console.error(error);
    },
  });
  
  const createGuestOrderMutation = trpc.orders.createGuest.useMutation({
    onSuccess: (order) => {
      toast.success("Commande placée avec succès! 🎁");
      setIsCheckingOut(false);
      guestCart.clearCart();
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

  const handleRemoveItem = (productId: number, selectedSize?: string) => {
    if (isAuthenticated) {
      // Find the cart item ID
      const item = authCartItems.find((i: any) => i.productId === productId);
      if (item) {
        removeFromCartMutation.mutate({ cartItemId: item.id });
      }
    } else {
      guestCart.removeItem(productId, selectedSize);
      toast.success("Article supprimé du panier");
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number, selectedSize?: string) => {
    if (quantity > 0) {
      if (isAuthenticated) {
        const item = authCartItems.find((i: any) => i.productId === productId);
        if (item) {
          updateCartMutation.mutate({ cartItemId: item.id, quantity });
        }
      } else {
        guestCart.updateQuantity(productId, quantity, selectedSize);
      }
    }
  };

  const handleCheckout = () => {
    if (!checkoutForm.firstName || !checkoutForm.lastName || !checkoutForm.city || !checkoutForm.phone || !checkoutForm.address) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const fullName = `${checkoutForm.firstName} ${checkoutForm.lastName}`;
    
    // Create shipping address object with all customer info
    const shippingAddressData = {
      name: fullName,
      address: checkoutForm.address,
      city: checkoutForm.city,
      phone: checkoutForm.phone,
    };
    
    if (isAuthenticated) {
      // Authenticated user: use normal order creation
      createOrderMutation.mutate({
        totalAmount: cartTotal,
        shippingAddress: shippingAddressData,
        customerName: fullName,
        customerCity: checkoutForm.city,
        customerPhone: checkoutForm.phone,
      });
    } else {
      // Guest user: create guest order
      const productIds = cartItems.map((item: any) => item.productId);
      createGuestOrderMutation.mutate({
        productIds,
        totalAmount: cartTotal,
        customerName: fullName,
        customerCity: checkoutForm.city,
        customerPhone: checkoutForm.phone,
        customerAddress: checkoutForm.address,
        customerEmail: "",
      });
    }
  };

  // Allow guests to use the cart - authentication is optional
  if (false) {
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
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-70 transition-opacity">
              <img src="/uploads/logo.jpg" alt="Mazaya Parfums" className="h-12 w-auto" />
              <span className="font-serif text-accent">MAZAYA</span>
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
                              handleUpdateQuantity(item.productId, item.quantity - 1, item.selectedSize)
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
                              handleUpdateQuantity(item.productId, item.quantity + 1, item.selectedSize)
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
                          onClick={() => handleRemoveItem(item.productId, item.selectedSize)}
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
                    {/* Payment Method Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💳</span>
                        <h3 className="font-bold text-blue-900">Méthode de paiement</h3>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-lg p-3">
                        <input type="radio" checked readOnly className="text-blue-600" />
                        <div>
                          <p className="font-semibold text-blue-900">Paiement à la livraison</p>
                          <p className="text-xs text-blue-700">Le paiement sera effectué directement par le service de livraison.</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Prénom *</label>
                        <input
                          type="text"
                          placeholder="Votre prénom"
                          value={checkoutForm.firstName}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, firstName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Nom *</label>
                        <input
                          type="text"
                          placeholder="Votre nom"
                          value={checkoutForm.lastName || ""}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, lastName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Adresse complète *</label>
                      <input
                        type="text"
                        placeholder="Numéro, rue, quartier..."
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Ville *</label>
                      <input
                        type="text"
                        placeholder="Entrez votre ville"
                        value={checkoutForm.city}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, city: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        placeholder="06XXXXXXXX"
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background text-sm"
                      />
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <p className="text-green-800">🚚 <strong>Livraison gratuite</strong> sur tout le Maroc</p>
                      <p className="text-green-700 text-xs mt-1">Délai de livraison: 2-5 jours ouvrables</p>
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
