import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronLeft, Plus, Edit, Trash2, Package, ShoppingBag, Upload, Eye, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "unisex",
    price: 0,
    discountPrice: null as number | null,
    imageUrl: "",
    sizes: ["30ml", "50ml", "100ml"],
    topNotes: "",
    heartNotes: "",
    baseNotes: "",
    stock: 0,
  });

  const { data: products = [] } = trpc.products.list.useQuery({});
  const { data: orders = [] } = trpc.orders.getUserOrders.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: selectedOrderItems = [] } = trpc.orders.getItems.useQuery(
    { orderId: selectedOrderId || "" },
    { enabled: !!selectedOrderId }
  );

  const utils = trpc.useUtils();

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setShowProductForm(false);
      setProductForm({
        name: "",
        description: "",
        category: "unisex",
        price: 0,
        discountPrice: null,
        imageUrl: "",
        sizes: ["30ml", "50ml", "100ml"],
        topNotes: "",
        heartNotes: "",
        baseNotes: "",
        stock: 0,
      });
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        category: "unisex",
        price: 0,
        discountPrice: null,
        imageUrl: "",
        sizes: ["30ml", "50ml", "100ml"],
        topNotes: "",
        heartNotes: "",
        baseNotes: "",
        stock: 0,
      });
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated!");
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Order deleted!");
      setSelectedOrderId(null);
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete order");
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const formData = new FormData();
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const blob = e.target?.result as ArrayBuffer;
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "x-file-ext": ext,
            },
            body: blob,
          });

          if (!response.ok) throw new Error("Upload failed");
          
          const data = await response.json();
          if (data.success) {
            setProductForm({ ...productForm, imageUrl: data.url });
            setImagePreview(data.url);
            toast.success("Image uploaded successfully!");
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Upload failed");
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploadingImage(false);
    }
  };

  // Populate form when editing
  useEffect(() => {
    if (editingProduct && showProductForm) {
      setProductForm({
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        price: editingProduct.price,
        discountPrice: editingProduct.discountPrice || null,
        imageUrl: editingProduct.imageUrl,
        sizes: editingProduct.sizes || ["30ml", "50ml", "100ml"],
        topNotes: editingProduct.topNotes || "",
        heartNotes: editingProduct.heartNotes || "",
        baseNotes: editingProduct.baseNotes || "",
        stock: editingProduct.stock,
      });
      setImagePreview(editingProduct.imageUrl);
    }
  }, [editingProduct, showProductForm]);

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/">
            <div className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
              Back Home
            </div>
          </Link>

          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-foreground/60 mb-8">
              You don't have permission to access this page
            </p>
            <Link href="/">
              <div className="btn-elegant-filled cursor-pointer">Back Home</div>
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
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold tracking-tight font-serif">
              PERFUME
            </a>
          </Link>
          <span className="text-sm text-accent font-semibold">Admin</span>
        </div>
      </header>

      <div className="container py-8 md:py-12">
        <Link href="/">
          <div className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-8 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
            Back Home
          </div>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div 
            onClick={() => setActiveTab("products")}
            className="border border-foreground/10 p-6 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <p className="text-sm text-foreground/60 mb-2">Total Products</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div 
            onClick={() => {
              setActiveTab("orders");
              setStatusFilter(null);
            }}
            className="border border-foreground/10 p-6 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <p className="text-sm text-foreground/60 mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div 
            onClick={() => {
              setActiveTab("orders");
              setStatusFilter("pending");
            }}
            className="border border-foreground/10 p-6 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          >
            <p className="text-sm text-foreground/60 mb-2">Pending Orders</p>
            <p className="text-3xl font-bold">
              {orders.filter((o: any) => o.status === "pending").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-foreground/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "products"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-3 font-semibold transition-colors ${
              activeTab === "orders"
                ? "text-accent border-b-2 border-accent"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Orders
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(!showProductForm);
                }}
                className="btn-elegant-filled flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className="bg-card border border-foreground/10 p-8 mb-8">
                <h3 className="text-xl font-bold mb-6">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = {
                      ...productForm,
                      price: Number(productForm.price),
                      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
                      stock: Number(productForm.stock),
                    };

                    if (editingProduct) {
                      updateProductMutation.mutate({
                        id: editingProduct._id,
                        ...formData,
                      });
                    } else {
                      createProductMutation.mutate(formData);
                    }
                  }}
                  className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Eau de Parfum"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Category
                    </label>
                    <select 
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent">
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Price (DH)
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Stock
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Product Image
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block w-full px-4 py-3 border border-foreground/20 bg-background cursor-pointer hover:border-accent transition-colors text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            Choose Image
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file);
                              }
                            }}
                            className="hidden"
                            disabled={isUploadingImage}
                          />
                        </label>
                      </div>
                      {imagePreview && (
                        <div className="w-32 h-32 border border-foreground/20 rounded overflow-hidden">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {isUploadingImage && (
                      <p className="text-sm text-accent mt-2">Uploading image...</p>
                    )}
                    {productForm.imageUrl && !isUploadingImage && (
                      <p className="text-sm text-green-500 mt-2">Image uploaded ✓</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Product description..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 border border-foreground/20 bg-background focus:outline-none focus:border-accent h-24 resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="btn-elegant"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={createProductMutation.isPending || updateProductMutation.isPending || isUploadingImage}
                      className="btn-elegant-filled disabled:opacity-50"
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending ? (isUploadingImage ? "Uploading..." : (editingProduct ? "Updating..." : "Creating...")) : (editingProduct ? "Update Product" : "Add Product")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {products.map((product: any) => (
                <div
                  key={product._id}
                  className="border border-foreground/10 p-6 flex items-center justify-between hover:border-accent/50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-foreground/60 capitalize">
                      {product.category} • {product.price} DH • Stock: {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingProduct(product)}
                      className="p-2 hover:bg-foreground/5 transition-colors"
                      title="View product details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 hover:bg-foreground/5 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive transition-colors" onClick={() => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        deleteProductMutation.mutate({ id: product._id });
                      }
                    }}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Orders</h2>

            {orders.length === 0 ? (
              <p className="text-foreground/60">No orders yet</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-1">
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {orders
                      .filter((order: any) => !statusFilter || order.status === statusFilter)
                      .map((order: any) => (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrderId(order._id)}
                        className={`border p-4 cursor-pointer transition-all ${
                          selectedOrderId === order._id
                            ? "border-accent bg-accent/5"
                            : "border-foreground/10 hover:border-accent/50"
                        }`}
                      >
                        <h3 className="font-semibold text-sm">
                          #{order.orderNumber}
                        </h3>
                        <p className="text-xs text-foreground/60">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="font-bold text-accent text-sm mt-2">
                          {order.totalAmount} DH
                        </p>
                        <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-500/20 text-purple-700' :
                          order.status === 'delivered' ? 'bg-green-500/20 text-green-700' :
                          'bg-red-500/20 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="lg:col-span-2">
                  {selectedOrderId ? (
                    (() => {
                      const order = orders.find((o: any) => o._id === selectedOrderId);
                      return (
                        <div className="border border-foreground/10 p-6">
                          <h3 className="text-xl font-bold mb-6">
                            Order #{order?.orderNumber}
                          </h3>

                          {/* Status and Action Buttons */}
                          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-foreground/10">
                            <div>
                              <p className="text-sm text-foreground/60 mb-1">Status</p>
                              <select
                                value={order?.status}
                                onChange={(e) => updateOrderStatusMutation.mutate({
                                  orderId: order?._id?.toString() || selectedOrderId || "",
                                  status: e.target.value,
                                })}
                                className="w-full px-2 py-1 border border-foreground/20 bg-background focus:outline-none focus:border-accent capitalize"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this order?")) {
                                    deleteOrderMutation.mutate({ orderId: order?._id?.toString() || selectedOrderId || "" });
                                  }
                                }}
                                className="w-full px-4 py-1 bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Order
                              </button>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-foreground/10">
                            <div>
                              <p className="text-sm text-foreground/60 mb-1">Customer Email</p>
                              <p className="font-semibold">{order?.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60 mb-1">Total Amount</p>
                              <p className="font-bold text-lg">{order?.totalAmount} DH</p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60 mb-1">Order Number</p>
                              <p className="font-semibold">#{order?.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-foreground/60 mb-1">Date</p>
                              <p className="font-semibold">
                                {order?.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="mb-6 pb-6 border-b border-foreground/10">
                            <p className="text-sm font-semibold text-foreground/60 mb-3">Shipping Address</p>
                            {order?.shippingAddress ? (
                              <div className="text-sm space-y-1">
                                <p><span className="font-semibold">Name:</span> {order.shippingAddress.name}</p>
                                <p><span className="font-semibold">Address:</span> {order.shippingAddress.address}</p>
                                <p><span className="font-semibold">City:</span> {order.shippingAddress.city}</p>
                                <p><span className="font-semibold">Phone:</span> {order.shippingAddress.phone}</p>
                              </div>
                            ) : (
                              <p className="text-foreground/60">No shipping address</p>
                            )}
                          </div>

                          {/* Order Items */}
                          <div>
                            <p className="text-sm font-semibold text-foreground/60 mb-3">Items</p>
                            {selectedOrderItems.length > 0 ? (
                              <div className="space-y-4">
                                {selectedOrderItems.map((item: any) => (
                                  <div key={item._id} className="flex gap-4 p-4 bg-foreground/5 rounded-lg">
                                    {/* Product Image */}
                                    {item.product?.imageUrl && (
                                      <div className="flex-shrink-0 w-24 h-24">
                                        <img
                                          src={item.product.imageUrl}
                                          alt={item.product?.name || "Product"}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </div>
                                    )}
                                    {/* Product Details */}
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm">
                                        {item.product?.name || item.productId || "Product"}
                                      </p>
                                      <p className="text-xs text-foreground/60">Qty: {item.quantity}</p>
                                      {item.selectedSize && (
                                        <p className="text-xs text-foreground/60">Size: {item.selectedSize}</p>
                                      )}
                                      <p className="text-xs text-foreground/60 mt-1">
                                        Category: {item.product?.category || "N/A"}
                                      </p>
                                    </div>
                                    {/* Price */}
                                    <div className="text-right">
                                      <p className="font-bold">{item.unitPrice * item.quantity} DH</p>
                                      <p className="text-xs text-foreground/60">{item.unitPrice} DH each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-foreground/60 text-sm">No items</p>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="border border-foreground/10 p-6 text-center text-foreground/60">
                      Select an order to view details
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product View Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-foreground/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-foreground/10 sticky top-0 bg-background">
                <h2 className="text-2xl font-bold">{viewingProduct.name}</h2>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="p-1 hover:bg-foreground/10 rounded transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Product Image */}
                {viewingProduct.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={viewingProduct.imageUrl}
                      alt={viewingProduct.name}
                      className="max-w-xs h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Category</p>
                    <p className="font-semibold capitalize">{viewingProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Stock</p>
                    <p className="font-semibold">{viewingProduct.stock} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Price</p>
                    <p className="font-semibold text-lg">{viewingProduct.price} DH</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Discount Price</p>
                    <p className="font-semibold">{viewingProduct.discountPrice ? `${viewingProduct.discountPrice} DH` : "N/A"}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-foreground/60 mb-2">Description</p>
                  <p className="text-foreground whitespace-pre-wrap">{viewingProduct.description}</p>
                </div>

                {/* Sizes */}
                <div>
                  <p className="text-sm font-semibold text-foreground/60 mb-2">Available Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.sizes && viewingProduct.sizes.map((size: string) => (
                      <span key={size} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fragrance Notes */}
                {(viewingProduct.topNotes || viewingProduct.heartNotes || viewingProduct.baseNotes) && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-foreground/5 rounded-lg">
                    {viewingProduct.topNotes && (
                      <div>
                        <p className="text-xs text-foreground/60 font-semibold mb-1">Top Notes</p>
                        <p className="text-sm">{viewingProduct.topNotes}</p>
                      </div>
                    )}
                    {viewingProduct.heartNotes && (
                      <div>
                        <p className="text-xs text-foreground/60 font-semibold mb-1">Heart Notes</p>
                        <p className="text-sm">{viewingProduct.heartNotes}</p>
                      </div>
                    )}
                    {viewingProduct.baseNotes && (
                      <div>
                        <p className="text-xs text-foreground/60 font-semibold mb-1">Base Notes</p>
                        <p className="text-sm">{viewingProduct.baseNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-4 pt-4 border-t border-foreground/10">
                  <button
                    onClick={() => {
                      setViewingProduct(null);
                      setEditingProduct(viewingProduct);
                      setShowProductForm(true);
                    }}
                    className="flex-1 btn-elegant-filled flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Product
                  </button>
                  <button
                    onClick={() => setViewingProduct(null)}
                    className="flex-1 btn-elegant"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
