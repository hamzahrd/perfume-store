import { useParams } from "wouter";
import { Link } from "wouter";
import { CheckCircle, Package, Phone, MessageSquare, Truck, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function OrderConfirmation() {
  const params = useParams();
  const orderId = params.id || "";

  const { data: order } = trpc.orders.getById.useQuery({ id: orderId });
  const { data: orderItems = [] } = trpc.orders.getItems.useQuery(
    { orderId },
    { enabled: !!order }
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">Chargement de votre commande...</p>
          <Link href="/">
            <a className="btn-primary">Retour à l'accueil</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f3ed] to-background">
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

      <div className="container py-12 md:py-16">
        {/* Success Message */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          {/* Big Green Check Icon */}
          <div className="flex justify-center mb-8 animate-[bounce_1s_ease-in-out]">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-8 shadow-2xl">
                <CheckCircle className="w-24 h-24 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            Merci ! Votre commande a été confirmée
          </h1>
          
          <p className="text-xl text-foreground/70 mb-6">
            Commande <span className="font-bold text-accent">#{order.orderNumber || (order._id as any)}</span>
          </p>

          {/* Contact Info Card */}
          <div className="bg-card border-2 border-accent/20 rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Package className="w-6 h-6 text-accent" />
              Nous vous contacterons bientôt
            </h2>
            <p className="text-foreground/70 mb-6">
              Vous recevrez une confirmation par:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-green-50 px-6 py-3 rounded-lg border border-green-200">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">SMS</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-6 py-3 rounded-lg border border-orange-200">
                <Phone className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-900">Appel téléphonique</span>
              </div>
            </div>
          </div>

          {/* Order Tracking Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
              <Truck className="w-6 h-6 text-blue-600" />
              Suivez votre commande
            </h2>
            <p className="text-foreground/70 mb-4 text-center">
              Conservez ce lien pour suivre l'état de votre commande à tout moment:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="bg-white px-4 py-3 rounded-lg border border-blue-300 font-mono text-sm text-blue-800 flex items-center gap-2">
                <span>mazayaparfums.com/command/{order.orderNumber || (order._id as any)}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/command/${order.orderNumber || (order._id as any)}`);
                    toast.success("Lien copié!");
                  }}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  title="Copier le lien"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-foreground/10 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Récapitulatif de la commande</h2>

            {/* Order Items */}
            <div className="space-y-4 mb-8 pb-8 border-b border-foreground/10">
              {orderItems.length > 0 ? (
                orderItems.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-[#f5f3ed] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-foreground/10">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product?.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-3xl">🧴</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.product?.name || "Produit"}</h3>
                      <p className="text-sm text-foreground/60">
                        Quantité: {item.quantity} × {item.product?.price || 0} MAD
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-accent">
                        {(item.quantity * parseFloat(item.product?.price || 0)).toFixed(2)} MAD
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-foreground/60">Articles en cours de chargement...</p>
              )}
            </div>

            {/* Order Total */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-foreground/70">
                <span>Sous-total</span>
                <span>{order.totalAmount} MAD</span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Livraison</span>
                <span className="text-accent font-semibold">Gratuite</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-foreground/10">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-accent">{order.totalAmount} MAD</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-foreground/5 rounded-xl p-6 mb-6">
              <h3 className="font-bold mb-4">Informations de livraison</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-foreground/60">Email:</span> <span className="font-semibold">{order.email}</span></p>
                <p><span className="text-foreground/60">Adresse:</span> <span className="font-semibold">
                  {typeof order.shippingAddress === 'string' 
                    ? order.shippingAddress 
                    : JSON.stringify(order.shippingAddress)}
                </span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href={`/command/${order.orderNumber || (order._id as any)}`}>
                <a className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground px-8 py-4 rounded-xl font-bold text-center transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  Suivre ma commande
                </a>
              </Link>
              <Link href="/">
                <a className="w-full border-2 border-foreground/20 hover:border-accent text-foreground px-8 py-4 rounded-xl font-bold text-center transition-all hover:scale-105 flex items-center justify-center">
                  Continuer mes achats
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
            <p className="text-sm text-foreground/70">
              <strong className="text-accent">Note:</strong> Notre équipe vérifiera votre commande et vous contactera dans les plus brefs délais pour confirmer les détails de livraison.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
