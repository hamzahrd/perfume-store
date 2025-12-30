import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, LogOut, Package, User, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Account() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [editingAddress, setEditingAddress] = useState(false);
  const [address, setAddress] = useState(
    user?.shippingAddress ? JSON.parse(user.shippingAddress) : ""
  );

  const { data: orders = [] } = trpc.orders.getUserOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
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
            <h1 className="text-3xl font-bold mb-4">My Account</h1>
            <p className="text-foreground/60 mb-8">
              Please sign in to access your account
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
            Back Home
          </a>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-card border border-foreground/10 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-foreground/60">{user?.email}</p>
                </div>
              </div>
              <div className="h-px bg-foreground/10 my-4" />
              <p className="text-xs text-foreground/60 mb-4">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : ""}
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 btn-secondary text-destructive border-destructive/30 hover:border-destructive/60"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 ${
                  activeTab === "orders"
                    ? "bg-foreground/10 text-accent font-semibold"
                    : "hover:bg-foreground/5"
                }`}
              >
                <Package className="w-4 h-4" />
                My Orders
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "bg-foreground/10 text-accent font-semibold"
                    : "hover:bg-foreground/5"
                }`}
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 ${
                  activeTab === "address"
                    ? "bg-foreground/10 text-accent font-semibold"
                    : "hover:bg-foreground/5"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Shipping Address
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                    <p className="text-foreground/60 mb-6">
                      You haven't placed any orders yet
                    </p>
                    <Link href="/products">
                      <a className="btn-primary">Start Shopping</a>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Link key={order.id} href={`/order-confirmation/${order.id}`}>
                        <a className="block border border-foreground/10 p-6 hover:border-accent/50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-semibold">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-sm text-foreground/60">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{order.totalAmount} DH</p>
                              <p className={`text-sm font-semibold capitalize ${
                                order.status === "delivered"
                                  ? "text-accent"
                                  : order.status === "cancelled"
                                  ? "text-destructive"
                                  : "text-foreground/60"
                              }`}>
                                {order.status}
                              </p>
                            </div>
                          </div>
                          <div className="h-px bg-foreground/10 mb-4" />
                          <p className="text-sm text-foreground/60">
                            View order details and tracking information
                          </p>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                <div className="bg-card border border-foreground/10 p-8 max-w-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ""}
                        disabled
                        className="w-full px-4 py-2 border border-foreground/20 bg-foreground/5 text-foreground/60 cursor-not-allowed"
                      />
                      <p className="text-xs text-foreground/60 mt-2">
                        Contact support to change your name
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-2 border border-foreground/20 bg-foreground/5 text-foreground/60 cursor-not-allowed"
                      />
                      <p className="text-xs text-foreground/60 mt-2">
                        Contact support to change your email
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={
                          user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : ""
                        }
                        disabled
                        className="w-full px-4 py-2 border border-foreground/20 bg-foreground/5 text-foreground/60 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div>
                <h1 className="text-3xl font-bold mb-8">Shipping Address</h1>

                {!editingAddress ? (
                  <div className="bg-card border border-foreground/10 p-8 max-w-2xl">
                    {address ? (
                      <>
                        <p className="text-foreground/70 whitespace-pre-wrap mb-6">
                          {address}
                        </p>
                        <button
                          onClick={() => setEditingAddress(true)}
                          className="btn-secondary"
                        >
                          Edit Address
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-foreground/60 mb-6">
                          No shipping address on file
                        </p>
                        <button
                          onClick={() => setEditingAddress(true)}
                          className="btn-primary"
                        >
                          Add Address
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-card border border-foreground/10 p-8 max-w-2xl">
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full shipping address..."
                      className="w-full px-4 py-3 border border-foreground/20 bg-background focus:outline-none focus:border-accent transition-colors mb-6 h-32 resize-none"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => setEditingAddress(false)}
                        className="btn-elegant-filled"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => {
                          setEditingAddress(false);
                          setAddress(
                            user?.shippingAddress
                              ? JSON.parse(user.shippingAddress)
                              : ""
                          );
                        }}
                        className="btn-elegant"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
