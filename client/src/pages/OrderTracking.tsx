import { useState } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Package, CheckCircle, Truck, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrderTracking() {
  const params = useParams();
  const orderNumber = params.orderNumber || "";

  const { data: order, isLoading, isError } = trpc.orders.getByOrderNumber.useQuery(
    { orderNumber },
    { enabled: !!orderNumber }
  );

  const getStatusStep = (status: string) => {
    const steps: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return steps[status] || 0;
  };

  const statusStep = order ? getStatusStep(order.status) : 0;

  const statuses = [
    { key: "pending", label: "En attente", icon: Package, color: "text-yellow-600" },
    { key: "confirmed", label: "Confirmée", icon: CheckCircle, color: "text-blue-600" },
    { key: "shipped", label: "Expédiée", icon: Truck, color: "text-purple-600" },
    { key: "delivered", label: "Livrée", icon: CheckCircle, color: "text-green-600" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/10">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
          <div className="container flex items-center gap-4 py-4">
            <Link href="/">
              <a className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-lg font-semibold">Retour</span>
              </a>
            </Link>
          </div>
        </header>
        <div className="container py-12 flex items-center justify-center min-h-screen">
          <p className="text-lg text-foreground/60">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/10">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
          <div className="container flex items-center gap-4 py-4">
            <Link href="/">
              <a className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-lg font-semibold">Retour</span>
              </a>
            </Link>
          </div>
        </header>
        <div className="container py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Commande non trouvée</h1>
            <p className="text-foreground/60 mb-8">
              Impossible de trouver la commande avec le numéro: {orderNumber}
            </p>
            <Link href="/">
              <a className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                Retour à l'accueil
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/5 via-background to-accent/10">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/20">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-lg font-semibold">Retour</span>
            </a>
          </Link>
          <h1 className="text-2xl font-bold">Suivi de Commande</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container py-12 max-w-2xl">
        {/* Order Header */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-accent/15 mb-8">
          <div className="mb-4">
            <p className="text-sm text-foreground/60 mb-1">Numéro de commande</p>
            <h2 className="text-3xl font-bold text-accent">#{order.orderNumber}</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-foreground/60 mb-1">Total</p>
              <p className="text-2xl font-bold">{order.totalAmount} DH</p>
            </div>
            <div>
              <p className="text-sm text-foreground/60 mb-1">Date de commande</p>
              <p className="text-lg font-semibold">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR") : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-accent/15 mb-8">
          <h3 className="text-xl font-bold mb-8">Statut de votre commande</h3>

          {order.status === "cancelled" ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <p className="text-red-700 font-semibold text-lg">
                ❌ Commande Annulée
              </p>
              <p className="text-red-600 text-sm mt-2">
                Votre commande a été annulée. Veuillez contacter notre équipe pour plus d'informations.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {statuses.map((statusItem, index) => {
                const isActive = statusStep >= index;
                const isCompleted = statusStep > index;
                const Icon = statusItem.icon;

                return (
                  <div key={statusItem.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                          isActive
                            ? "bg-accent text-white shadow-lg"
                            : "bg-foreground/10 text-foreground/40"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {index < statuses.length - 1 && (
                        <div
                          className={`w-1 h-12 mt-2 transition-colors ${
                            isCompleted ? "bg-accent" : "bg-foreground/10"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <p
                        className={`font-semibold transition-colors ${
                          isActive ? "text-foreground" : "text-foreground/40"
                        }`}
                      >
                        {statusItem.label}
                      </p>
                      <p className="text-sm text-foreground/60">
                        {statusItem.key === order.status && "En cours"}
                        {statusItem.key === "pending" && "En attente de confirmation"}
                        {statusItem.key === "confirmed" && "Votre commande a été confirmée"}
                        {statusItem.key === "shipped" && "Votre commande est en route"}
                        {statusItem.key === "delivered" && "Votre commande a été livrée"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-accent/15">
          <h3 className="text-xl font-bold mb-6">Informations de livraison</h3>
          <div className="space-y-4">
            {(() => {
              let shippingInfo;
              try {
                shippingInfo = typeof order.shippingAddress === "string" 
                  ? JSON.parse(order.shippingAddress) 
                  : order.shippingAddress;
              } catch {
                shippingInfo = { address: order.shippingAddress };
              }
              
              return (
                <>
                  {shippingInfo.name && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Nom</p>
                      <p className="font-semibold">{shippingInfo.name}</p>
                    </div>
                  )}
                  {shippingInfo.phone && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Téléphone</p>
                      <p className="font-semibold">{shippingInfo.phone}</p>
                    </div>
                  )}
                  {shippingInfo.address && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Adresse</p>
                      <p className="font-semibold">{shippingInfo.address}</p>
                    </div>
                  )}
                  {shippingInfo.city && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Ville</p>
                      <p className="font-semibold">{shippingInfo.city}</p>
                    </div>
                  )}
                </>
              );
            })()}
            {order.email && (
              <div>
                <p className="text-sm text-foreground/60 mb-1">Email</p>
                <p className="font-semibold">{order.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
          <p className="text-center text-foreground/70">
            Des questions sur votre commande?{" "}
            <a
              href="https://wa.me/212627485020"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold hover:underline"
            >
              Contactez-nous sur WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
