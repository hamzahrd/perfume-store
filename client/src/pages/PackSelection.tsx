import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, X, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PackSelection() {
  const { user, isAuthenticated } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<(number | null)[]>([null, null, null, null, null]);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    city: "",
    address: "",
    phone: "",
  });

  const { data: allProducts = [] } = trpc.products.list.useQuery({});
  const createGuestOrderMutation = trpc.orders.createGuest.useMutation({
    onSuccess: (order) => {
      const trackingUrl = `/command/${order?.orderNumber}`;
      toast.success(
        () => (
          <div>
            <p className="font-semibold mb-2">✅ Commande créée avec succès!</p>
            <p className="text-sm mb-3">Pour suivre votre commande, allez à:</p>
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-accent px-4 py-2 rounded font-semibold hover:bg-accent/10 transition-colors break-all"
            >
              http://localhost:3000{trackingUrl}
            </a>
          </div>
        ),
        { duration: 8000 }
      );
      
      // Reset form
      setSelectedProducts([null, null, null, null, null]);
      setFormData({ lastName: "", firstName: "", city: "", address: "", phone: "" });
      
      // Redirect to tracking page
      setTimeout(() => {
        window.location.href = trackingUrl;
      }, 2000);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la commande");
      console.error(error);
    },
  });

  const handleProductSelect = (productId: number) => {
    if (currentSlot !== null) {
      const newSelected = [...selectedProducts];
      newSelected[currentSlot] = productId;
      setSelectedProducts(newSelected);
      setCurrentSlot(null);
      toast.success("Parfum ajouté!");
    }
  };

  const handleRemoveProduct = (index: number) => {
    const newSelected = [...selectedProducts];
    newSelected[index] = null;
    setSelectedProducts(newSelected);
  };

  const handleSubmitOrder = () => {
    const validProducts = selectedProducts.filter((id) => id !== null) as number[];
    
    if (validProducts.length !== 5) {
      toast.error("Veuillez sélectionner 5 parfums");
      return;
    }

    if (!formData.lastName || !formData.firstName || !formData.city || !formData.address || !formData.phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Create guest order with selected products
    createGuestOrderMutation.mutate({
      productIds: validProducts,
      totalAmount: 199, // Pack price
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerCity: formData.city,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerEmail: "",
    });
  };

  const filteredProducts = allProducts.filter((product: any) =>
    searchQuery === "" || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductById = (id: number | null) => {
    if (!id) return null;
    return allProducts.find((p: any) => p.id === id);
  };

  const filledSlots = selectedProducts.filter(id => id !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/10 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-lg font-semibold">Retour</span>
            </a>
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-accent">⚡</span> COMPOSEZ VOTRE PACK
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-7xl mx-auto">
          {/* Offer Description */}
          <div className="text-center mb-10">
            <div className="inline-block bg-gradient-to-r from-accent to-accent/80 text-white px-6 py-2 rounded-full text-sm tracking-widest font-bold mb-4 shadow-lg">
              🌟 PACK NICHE MAZAYA
            </div>
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-foreground to-accent bg-clip-text text-transparent">
              Pack Antaali - 5 Parfums
            </h2>
            <p className="text-xl text-foreground/80 mb-2 font-medium">
              Plongez dans l'univers du luxe à petit prix.
            </p>
            <p className="text-lg text-foreground/70">
              Pour seulement <span className="text-accent font-bold text-3xl">199 DH</span>, composez votre collection personnelle de 5 parfums premium.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Pack Image */}
            <div className="lg:col-span-4 flex">
              <div className="lg:sticky top-24 w-full h-full">
                <div className="relative bg-white/95 rounded-[18px] p-5 shadow-lg border border-accent/15 overflow-hidden h-full min-h-[460px] max-h-[560px] flex flex-col">
                  <div className="absolute -top-4 -right-4 bg-gradient-to-br from-red-500 to-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md z-10 rotate-12">
                    🔥 199 DH
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-accent/5 via-background to-accent/10 flex items-center justify-center h-[360px] mx-auto w-full flex-1">
                    <img 
                      src="/uploads/pack-mazaya.png" 
                      alt="Pack Mazaya Parfums"
                      className="max-h-[95%] w-auto object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-pack')) {
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'fallback-pack w-full aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-gray-200';
                          fallbackDiv.innerHTML = `
                            <div class="text-center">
                              <div class="text-6xl mb-4">🎁</div>
                              <p class="font-bold text-lg">Pack Mazaya</p>
                              <p class="text-sm text-foreground/60">5 Parfums de Luxe</p>
                            </div>
                          `;
                          parent.appendChild(fallbackDiv);
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4"></div>
                </div>
              </div>
            </div>

            {/* Center: 5 Product Selection Slots */}
            <div className="lg:col-span-5 flex">
              <div className="bg-white rounded-[18px] p-7 shadow-lg border border-accent/15 h-full flex flex-col w-full min-h-[460px]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Choisissez vos produits</h3>
                </div>
                <p className="text-sm text-foreground/70 mb-8 bg-accent/5 p-3 rounded-lg border border-accent/20">
                  <span className="font-semibold">Sélectionnez 5 parfums pour votre pack</span> ({filledSlots}/5)
                </p>

                {/* 5 Product Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {selectedProducts.map((productId, index) => {
                    const product = getProductById(productId);
                    const slotNumber = index + 1;
                    
                    return (
                      <div
                        key={index}
                        className={`relative aspect-square border-2 rounded-xl p-3 transition-all ${
                          product
                            ? "border-accent bg-accent/5"
                            : "border-dashed border-foreground/20 hover:border-accent/50 cursor-pointer"
                        }`}
                        onClick={() => !product && setCurrentSlot(index)}
                      >
                        {product ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(index);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="h-full flex flex-col">
                              <div className="flex-1 bg-[#f5f3ed] rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-2"
                                  />
                                ) : (
                                  <span className="text-3xl">🧴</span>
                                )}
                              </div>
                              <p className="text-xs font-semibold line-clamp-2 text-center">
                                {product.name}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-2">
                              <Plus className="w-8 h-8 text-foreground/40" />
                            </div>
                            <p className="text-xs text-foreground/60 font-semibold">
                              Parfum {slotNumber}
                            </p>
                            <p className="text-xs text-foreground/40">
                              Cliquez pour ajouter
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filledSlots === 5 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-semibold">
                      ✓ Tous les parfums sont sélectionnés! Complétez votre commande ci-dessous.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Form */}
            <div className="lg:col-span-3 flex">
              <div className="bg-[#FFF6F2] rounded-[18px] p-5 shadow-lg border border-accent/15 h-full flex flex-col w-full min-h-[460px] lg:sticky top-24">
                <div className="mb-6">
                  <h3 className="text-lg font-serif font-semibold text-[#8B4513] mb-1">
                    Informations de livraison
                  </h3>
                  <p className="text-xs text-foreground/60">Complétez vos informations</p>
                </div>

                {/* 2-Column Grid for Inputs */}
                <div className="space-y-3 mb-5">
                  {/* Row 1: Nom | Prénom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">Nom *</label>
                      <input
                        type="text"
                        placeholder="Votre nom"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-medium bg-white border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all shadow-sm placeholder:text-foreground/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">Prénom *</label>
                      <input
                        type="text"
                        placeholder="Votre prénom"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-medium bg-white border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all shadow-sm placeholder:text-foreground/40"
                      />
                    </div>
                  </div>

                  {/* Row 2: Ville | Téléphone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">Ville *</label>
                      <input
                        type="text"
                        placeholder="Votre ville"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-medium bg-white border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all shadow-sm placeholder:text-foreground/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">Téléphone *</label>
                      <input
                        type="tel"
                        placeholder="06xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-medium bg-white border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all shadow-sm placeholder:text-foreground/40"
                      />
                    </div>
                  </div>

                  {/* Row 3: Adresse (Full Width) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground/70 mb-1.5">Adresse *</label>
                    <input
                      type="text"
                      placeholder="Votre adresse complète"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm font-medium bg-white border border-foreground/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all shadow-sm placeholder:text-foreground/40"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3.5 mb-4 border border-accent/10 shadow">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[11px] text-foreground/60">Prix normal</span>
                    <span className="line-through text-foreground/50 text-sm">250 DH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-serif font-semibold text-[#8B4513]">Prix Pack</span>
                    <div className="text-right leading-tight">
                      <div className="text-3xl font-bold text-[#D2691E]">199</div>
                      <div className="text-base font-semibold text-[#D2691E]">DH</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-accent/10">
                    <p className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
                      <span>✓</span> Économisez 51 DH + Livraison Gratuite
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white/40 rounded-xl p-2.5 mb-3 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-base">💳</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-semibold text-foreground mb-0.5">Méthode de paiement</h4>
                      <p className="text-[11px] text-accent font-medium">Paiement à la livraison</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-foreground/60 mt-1.5 ml-10 leading-relaxed">
                    Le paiement sera effectué directement par le service de livraison.
                  </p>
                </div>

                {/* Delivery Info */}
                <div className="bg-white/40 rounded-xl p-2.5 mb-4 border border-green-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-base">🚚</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-semibold text-foreground mb-0.5">Livraison gratuite sur tout le Maroc</h4>
                      <p className="text-[10px] text-foreground/60">
                        Délai: <span className="font-medium text-green-700">2-5 jours ouvrables</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={filledSlots !== 5 || createGuestOrderMutation.isPending}
                  className="w-full bg-gradient-to-r from-[#CD7F54] to-[#D2691E] text-white py-3 rounded-2xl font-semibold text-base hover:from-[#B86F4A] hover:to-[#C25E1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {createGuestOrderMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Traitement en cours...
                    </span>
                  ) : (
                    "Confirmer ma commande"
                  )}
                </button>

                {/* Trust Indicators */}
                <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-foreground/60">
                  <div className="flex items-center gap-1">
                    <span className="text-green-600">✓</span>
                    <span>Livraison gratuite</span>
                  </div>
                  <span className="text-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600">✓</span>
                    <span>Paiement à la livraison</span>
                  </div>
                  <span className="text-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-accent">✓</span>
                    <span>Satisfait ou remboursé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={currentSlot !== null} onOpenChange={() => setCurrentSlot(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Sélectionnez un parfum pour la position {currentSlot !== null ? currentSlot + 1 : ''}
            </DialogTitle>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher un parfum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-3 border border-foreground/20 bg-background rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product: any) => {
              const isAlreadySelected = selectedProducts.includes(product.id);
              
              return (
                <div
                  key={product.id}
                  className={`border-2 rounded-lg p-3 transition-all cursor-pointer ${
                    isAlreadySelected
                      ? "border-foreground/20 bg-foreground/5 opacity-50 cursor-not-allowed"
                      : "border-foreground/20 hover:border-accent hover:shadow-lg"
                  }`}
                  onClick={() => !isAlreadySelected && handleProductSelect(product.id)}
                >
                  <div className="aspect-square bg-[#f5f3ed] rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl">🧴</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-accent mb-1">
                    {product.price} DH
                  </p>
                  <h4 className="text-xs font-semibold line-clamp-2 mb-2">
                    {product.name}
                  </h4>
                  {isAlreadySelected && (
                    <p className="text-xs text-foreground/60 text-center">Déjà sélectionné</p>
                  )}
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60">Aucun parfum trouvé</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
