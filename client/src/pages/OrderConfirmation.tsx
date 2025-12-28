import { useParams } from "wouter";
import { Link } from "wouter";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OrderConfirmation() {
  const params = useParams();
  const orderId = parseInt(params.id || "0");

  const { data: order } = trpc.orders.getById.useQuery({ id: orderId });
  const { data: orderItems = [] } = trpc.orders.getItems.useQuery(
    { orderId },
    { enabled: !!order }
  );

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground/60 mb-4">Loading order details...</p>
          <Link href="/">
            <a className="btn-elegant">Back Home</a>
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = [
    { status: "pending", label: "Order Placed", icon: CheckCircle },
    { status: "confirmed", label: "Confirmed", icon: Package },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: Home },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

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

      <div className="container py-12 md:py-16">
        {/* Success Message */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Thank You for Your Order
          </h1>
          <p className="text-lg text-foreground/60 mb-2">
            Order #{order.orderNumber}
          </p>
          <p className="text-foreground/60">
            A confirmation email has been sent to {order.email}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-8">Order Status</h2>

            {/* Timeline */}
            <div className="mb-12">
              <div className="flex justify-between mb-8">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                          isCompleted
                            ? "bg-accent text-background"
                            : "bg-foreground/10 text-foreground/40"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <p
                        className={`text-sm font-semibold text-center ${
                          isCurrent ? "text-accent" : isCompleted ? "text-foreground" : "text-foreground/40"
                        }`}
                      >
                        {step.label}
                      </p>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute w-12 h-px mt-6 ml-12 ${
                            isCompleted ? "bg-accent" : "bg-foreground/10"
                          }`}
                          style={{ left: "calc(50% + 24px)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <h2 className="text-2xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4 mb-12 pb-12 border-b border-foreground/10">
              {orderItems.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.product?.name || "Product"}</p>
                    <p className="text-sm text-foreground/60">
                      Qty: {item.quantity} × {item.selectedSize || "Standard"}
                    </p>
                  </div>
                  <p className="font-bold">{(item.unitPrice * item.quantity).toFixed(2)} DH</p>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
            <div className="bg-card border border-foreground/10 p-6">
              <p className="text-foreground/60 whitespace-pre-wrap">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-foreground/10 p-8 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-foreground/10">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>{order.totalAmount} DH</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Tax</span>
                  <span>{(parseFloat(order.totalAmount) * 0.1).toFixed(2)} DH</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {(parseFloat(order.totalAmount) * 1.1).toFixed(2)} DH
                </span>
              </div>

              <div className="bg-accent/10 border border-accent/20 p-4 rounded mb-6">
                <p className="text-sm text-accent font-semibold">
                  Order Status: <span className="capitalize">{order.status}</span>
                </p>
              </div>

              <Link href="/account/orders">
                <a className="block text-center btn-elegant-filled mb-4">
                  View All Orders
                </a>
              </Link>

              <Link href="/products">
                <a className="block text-center btn-elegant">
                  Continue Shopping
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card border border-foreground/10 p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">1. Confirmation</h3>
              <p className="text-sm text-foreground/60">
                You'll receive a confirmation email shortly with tracking information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Preparation</h3>
              <p className="text-sm text-foreground/60">
                We'll carefully prepare your order for shipment within 2-3 business days.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Delivery</h3>
              <p className="text-sm text-foreground/60">
                Your package will be delivered within 5-7 business days. Track it anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
