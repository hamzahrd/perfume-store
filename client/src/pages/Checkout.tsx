import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
  });

  const { data: cartItems = [] } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      toast.success("Commande confirmée! 🎉");
      setLocation(`/order-confirmation/${order?.id}`);
    },
    onError: (error) => {
      toast.error("Erreur lors de la commande");
      console.error(error);
    },
  });

  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product?.price || 0) * item.quantity);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    // Create shipping address object with all customer info
    const shippingAddressData = {
      name: fullName,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
    };

    createOrderMutation.mutate({
      totalAmount: cartTotal,
      shippingAddress: shippingAddressData,
      customerName: fullName,
      customerCity: formData.city,
      customerPhone: formData.phone,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Finaliser la commande</h1>
            <p className="text-foreground/60 mb-8">
              Veuillez vous connecter pour continuer
            </p>
            <Link href="/login">
              <a className="btn-primary">Se connecter</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-foreground/20 mb-4" />
            <h1 className="text-3xl font-bold mb-4">Panier vide</h1>
            <p className="text-foreground/60 mb-8">
              Ajoutez des produits pour continuer
            </p>
            <Link href="/">
              <a className="btn-primary">Retour à l'accueil</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
        <div className="container py-4">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <img src="/uploads/logo.jpg" alt="Mazaya Parfums" className="h-12 w-auto" />
              <span className="font-serif">MAZAYA</span>
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <Link href="/cart">
          <a className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8">
            <ChevronLeft className="w-5 h-5" />
            Retour au panier
          </a>
        </Link>

        <h1 className="text-4xl font-bold mb-12">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-foreground/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-8">Informations de livraison</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Votre prénom"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Votre nom"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background transition-colors"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Numéro et nom de rue"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background transition-colors"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Entrez votre ville"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+212 6XX XX XX XX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background transition-colors"
                  />
                </div>

                {/* Payment Method Info */}
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <span className="text-accent text-xl">💳</span>
                    Mode de paiement
                  </h3>
                  <p className="text-sm text-foreground/70">
                    <strong>Paiement à la livraison</strong> - Vous payez en espèces lors de la réception de votre commande.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {createOrderMutation.isPending ? "Traitement..." : "Confirmer la commande"}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-foreground/10 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-foreground/10">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-[#f5f3ed] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product?.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-2xl">🧴</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.product?.name}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} MAD
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-foreground/70">
                  <span>Sous-total</span>
                  <span>{cartTotal.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <span>Livraison</span>
                  <span className="text-accent font-semibold">Gratuite</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-6 border-t border-foreground/10">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-accent">
                  {cartTotal.toFixed(2)} MAD
                </span>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-foreground/10 space-y-3 text-xs text-foreground/60">
                <p className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Paiement sécurisé
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Livraison gratuite
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  Produits authentiques
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
