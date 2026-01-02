import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Search, Check, Minus, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function PackSelection() {
  const { user, isAuthenticated } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    city: "",
    phone: "",
  });

  const { data: allProducts = [] } = trpc.products.list.useQuery({});
  const addToCartMutation = trpc.cart.addItem.useMutation();
  const utils = trpc.useUtils();

  const handleProductToggle = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else if (selectedProducts.length < 5) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      toast.error("Vous pouvez sélectionner maximum 5 parfums");
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour acheter");
      return;
    }

    if (selectedProducts.length !== 5) {
      toast.error("Veuillez sélectionner 5 parfums");
      return;
    }

    if (!formData.firstName || !formData.city || !formData.phone) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Add each selected product to cart
    selectedProducts.forEach((productId) => {
      addToCartMutation.mutate(
        { productId, quantity: 1 },
        {
          onSuccess: () => {
            utils.cart.getCart.invalidate();
          }
        }
      );
    });

    toast.success("Pack ajouté au panier! 🎁");
    // Reset form
    setSelectedProducts([]);
    setFormData({ firstName: "", city: "", phone: "" });
  };

  const filteredProducts = allProducts.filter((product: any) =>
    searchQuery === "" || 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-lg font-semibold">Retour</span>
            </a>
          </Link>
          <h1 className="text-2xl font-bold">PACK NICHE</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Offer Description */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Offre parfums de niche :</h2>
            <p className="text-lg text-foreground/70 mb-2">
              2 parfums de niche (50ml) achetés le 3eme offert = 300 dh au lieu 450 dh +
            </p>
            <p className="text-lg text-foreground/70">livraison gratuite</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Product Selection */}
            <div className="lg:col-span-2">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Rechercher un parfum..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-foreground/20 bg-background rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Product Selection Section */}
              <div className="bg-card border border-foreground/10 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-bold">Choisissez vos produits</h3>
                </div>
                <p className="text-sm text-foreground/60 mb-6">
                  Sélectionnez 5 parfums pour votre pack ({selectedProducts.length}/5)
                </p>

                {/* Products Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {filteredProducts.slice(0, 20).map((product: any) => {
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center relative ${
                          isSelected
                            ? "border-accent bg-accent/10"
                            : "border-foreground/10 hover:border-accent/50"
                        }`}
                        onClick={() => handleProductToggle(product.id)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-accent text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
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
                        <p className="text-sm font-semibold text-accent mb-1">
                          {product.price} DH
                        </p>
                        <h4 className="text-xs font-semibold line-clamp-2 mb-2">
                          {product.name}
                        </h4>
                        <button
                          className={`w-full py-2 rounded-lg font-semibold transition-all ${
                            isSelected
                              ? "bg-accent text-white"
                              : "bg-foreground/5 hover:bg-foreground/10"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductToggle(product.id);
                          }}
                        >
                          {isSelected ? "✓" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-foreground/10 rounded-xl p-6 sticky top-20">
                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Quantité</label>
                  <div className="flex items-center border border-foreground/20 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-foreground/5"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center py-2 bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-foreground/5"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Form */}
                <p className="text-sm text-foreground/60 mb-4">
                  To place an order, please enter your information here
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Prénom *</label>
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Ville *</label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background"
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
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:border-accent bg-background"
                    />
                  </div>
                </div>

                {/* Price Info */}
                <div className="bg-foreground/5 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-foreground/60">Prix normal:</span>
                    <span className="line-through text-foreground/60">450 DH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Prix pack:</span>
                    <span className="text-2xl font-bold text-accent">300 DH</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedProducts.length !== 5 || addToCartMutation.isPending}
                  className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-bold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addToCartMutation.isPending ? "Traitement..." : "Acheter maintenant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
