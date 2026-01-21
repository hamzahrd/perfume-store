import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Plus, Edit, Trash2, Package, ShoppingBag, Upload, Eye, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "unisex",
    price: 0,
    discountPrice: null as number | null,
    imageUrl: "",
    imageGallery: [] as string[], // Add image gallery
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

  const { data: orderItems = [] } = trpc.orders.getItems.useQuery(
    { orderId: expandedOrderId || 0 },
    { enabled: expandedOrderId !== null }
  );

  const utils = trpc.useUtils();

  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully!");
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        category: "unisex",
        price: 0,
        discountPrice: null,
        imageUrl: "",
        imageGallery: [], // Reset image gallery
        sizes: ["30ml", "50ml", "100ml"],
        topNotes: "",
        heartNotes: "",
        baseNotes: "",
        stock: 0,
      });
      setImagePreview("");
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
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
        imageGallery: [],
        sizes: ["30ml", "50ml", "100ml"],
        topNotes: "",
        heartNotes: "",
        baseNotes: "",
        stock: 0,
      });
      setImagePreview("");
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
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

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut de la commande mis à jour!");
      utils.orders.getUserOrders.invalidate();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error(error);
    },
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Commande supprimée avec succès!");
      utils.orders.getUserOrders.invalidate();
      setExpandedOrderId(null);
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploadingImage(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const formData = new FormData();
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const blob = e.target?.result as ArrayBuffer;
          const response = await fetch("/api/upload/upload", {
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

  const handleMultipleImageUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a valid image`);
        continue;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        continue;
      }

      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const blob = e.target?.result as ArrayBuffer;
            const response = await fetch("/api/upload/upload", {
              method: "POST",
              headers: {
                "x-file-ext": ext,
              },
              body: blob,
            });

            if (!response.ok) throw new Error("Upload failed");
            
            const data = await response.json();
            if (data.success) {
              // Add to image gallery
              setProductForm(prev => ({
                ...prev,
                imageGallery: [...prev.imageGallery, data.url]
              }));
              toast.success("Gallery image uploaded successfully!");
            } else {
              throw new Error(data.error || "Upload failed");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed");
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeGalleryImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      imageGallery: prev.imageGallery.filter((_, i) => i !== index)
    }));
  };

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
            <a className="text-2xl font-bold tracking-tight flex items-center gap-2 hover:opacity-70 transition-opacity">
              <img src="/uploads/logo.jpg" alt="Mazaya Parfums" className="h-12 w-auto" />
              <span className="font-serif text-accent">MAZAYA</span>
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
          <button
            onClick={() => setActiveTab("products")}
            className="border border-foreground/10 p-6 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-left rounded-lg"
          >
            <p className="text-sm text-foreground/60 mb-2">Total Products</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className="border border-foreground/10 p-6 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-left rounded-lg"
          >
            <p className="text-sm text-foreground/60 mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className="border border-foreground/10 p-6 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer text-left rounded-lg"
          >
            <p className="text-sm text-foreground/60 mb-2">Pending Orders</p>
            <p className="text-3xl font-bold">
              {orders.filter((o: any) => o.status === "pending").length}
            </p>
          </button>
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
                      imageGallery: productForm.imageGallery,
                    };
                    
                    if (editingProduct) {
                      updateProductMutation.mutate({
                        ...formData,
                        id: editingProduct.id,
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
                            Choose Main Image
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
                            className="w-full h-full object-contain p-2"
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

                  {/* Image Gallery */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Additional Images (Gallery)
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block w-full px-4 py-3 border border-foreground/20 bg-background cursor-pointer hover:border-accent transition-colors text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" />
                            Add to Gallery
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                handleMultipleImageUpload(Array.from(files));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    
                    {/* Display gallery images */}
                    {productForm.imageGallery.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {productForm.imageGallery.map((imgUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imgUrl} 
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-24 object-contain border border-foreground/20 rounded p-1"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
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
                      {(createProductMutation.isPending || updateProductMutation.isPending) 
                        ? (editingProduct ? "Updating..." : "Creating...") 
                        : (isUploadingImage ? "Uploading..." : (editingProduct ? "Update Product" : "Add Product"))}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="space-y-4">
              {products.map((product: any) => (
                <div
                  key={product.id}
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
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        // Parse sizes and imageGallery if they're strings
                        const sizes = typeof product.sizes === 'string' 
                          ? JSON.parse(product.sizes) 
                          : product.sizes || ["30ml", "50ml", "100ml"];
                        const imageGallery = product.imageGallery 
                          ? (typeof product.imageGallery === 'string' 
                              ? JSON.parse(product.imageGallery) 
                              : product.imageGallery)
                          : [];
                        
                        setProductForm({
                          name: product.name,
                          description: product.description,
                          category: product.category,
                          price: parseFloat(product.price),
                          discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
                          imageUrl: product.imageUrl,
                          imageGallery: imageGallery,
                          sizes: sizes,
                          topNotes: product.topNotes || "",
                          heartNotes: product.heartNotes || "",
                          baseNotes: product.baseNotes || "",
                          stock: product.stock,
                        });
                        setImagePreview(product.imageUrl);
                        setShowProductForm(true);
                      }}
                      className="p-2 hover:bg-foreground/5 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                          deleteProductMutation.mutate({ id: product.id });
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                      className="p-2 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                    >
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
            <h2 className="text-2xl font-bold mb-8">Commandes reçues</h2>

            {orders.length === 0 ? (
              <p className="text-foreground/60">Aucune commande pour le moment</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="border-2 border-foreground/10 rounded-lg p-6 hover:border-accent/50 transition-colors bg-card"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-foreground/10">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          Commande #{order.orderNumber || order.id}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right flex items-start gap-3">
                        <div>
                          <p className="text-2xl font-bold text-accent">{order.totalAmount} DH</p>
                          <select
                            value={order.status}
                            onChange={(e) => {
                              updateOrderStatusMutation.mutate({
                                orderId: order.id,
                                status: e.target.value as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
                              });
                            }}
                            className="text-sm px-3 py-1 border border-foreground/20 bg-background rounded focus:outline-none focus:border-accent capitalize mt-2 font-semibold"
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmée</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.orderNumber || order.id}?`)) {
                              deleteOrderMutation.mutate({ orderId: order.id });
                            }
                          }}
                          disabled={deleteOrderMutation.isPending}
                          className="p-2 hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 rounded"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-foreground/10">
                      <div>
                        <p className="text-xs text-foreground/60 font-semibold mb-1">Email</p>
                        <p className="font-semibold">{order.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 font-semibold mb-1">Informations de livraison</p>
                        <div className="font-semibold text-sm space-y-1">
                          {(() => {
                            let shippingInfo;
                            try {
                              shippingInfo = typeof order.shippingAddress === 'string' 
                                ? JSON.parse(order.shippingAddress) 
                                : order.shippingAddress;
                            } catch {
                              return <p>{order.shippingAddress}</p>;
                            }
                            
                            return (
                              <>
                                {shippingInfo.name && <p>👤 {shippingInfo.name}</p>}
                                {shippingInfo.phone && <p>📞 {shippingInfo.phone}</p>}
                                {shippingInfo.address && <p>📍 {shippingInfo.address}</p>}
                                {shippingInfo.city && <p>🏙️ {shippingInfo.city}</p>}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <button
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="text-sm font-semibold text-foreground/70 mb-3 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <span>{expandedOrderId === order.id ? "▼" : "▶"}</span>
                        Articles ({expandedOrderId === order.id ? orderItems.length : "?"})
                      </button>
                      <div className="space-y-2 ml-2">
                        {expandedOrderId === order.id && orderItems.length > 0 ? (
                          orderItems.map((item: any) => (
                            <div key={item.id} className="bg-foreground/5 p-3 rounded border border-foreground/10">
                              <div className="flex items-center gap-4">
                                {item.product?.imageUrl && (
                                  <img 
                                    src={item.product.imageUrl} 
                                    alt={item.product?.name} 
                                    className="w-10 h-10 object-contain rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold">{item.product?.name || "Produit"}</p>
                                  <p className="text-xs text-foreground/60">
                                    Quantité: {item.quantity} × {item.unitPrice} MAD
                                  </p>
                                </div>
                                <p className="font-bold text-accent">
                                  {(item.quantity * parseFloat(item.unitPrice || 0)).toFixed(2)} MAD
                                </p>
                              </div>
                            </div>
                          ))
                        ) : expandedOrderId === order.id ? (
                          <p className="text-sm text-foreground/60 italic">
                            Aucun article trouvé
                          </p>
                        ) : (
                          <p className="text-sm text-foreground/60 italic">
                            Cliquez pour voir les articles
                          </p>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp Contact */}
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        💬 Envoyer par WhatsApp: +212627485020
                      </p>
                      <p className="text-xs text-green-700">
                        Les détails de cette commande seront envoyés à votre numéro WhatsApp
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Product Dialog */}
      <Dialog open={!!viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{viewingProduct?.name}</DialogTitle>
            <DialogDescription className="capitalize text-base">
              {viewingProduct?.category}
            </DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="space-y-6 mt-4">
              {/* Product Image */}
              {viewingProduct.imageUrl && (
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-foreground/5">
                  <img 
                    src={viewingProduct.imageUrl} 
                    alt={viewingProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Image Gallery */}
              {(() => {
                const imageGallery = viewingProduct.imageGallery 
                  ? (typeof viewingProduct.imageGallery === 'string' 
                      ? JSON.parse(viewingProduct.imageGallery) 
                      : viewingProduct.imageGallery)
                  : [];
                
                return imageGallery.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Gallery</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {imageGallery.map((url: string, idx: number) => (
                        <img 
                          key={idx}
                          src={url} 
                          alt={`${viewingProduct.name} ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Price */}
              <div>
                <h4 className="font-semibold mb-2">Price</h4>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-accent">{viewingProduct.price} DH</p>
                  {viewingProduct.discountPrice && (
                    <p className="text-xl text-foreground/50 line-through">{viewingProduct.discountPrice} DH</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-foreground/80">{viewingProduct.description}</p>
              </div>

              {/* Stock */}
              <div>
                <h4 className="font-semibold mb-2">Stock</h4>
                <p className="text-lg">{viewingProduct.stock} units</p>
              </div>

              {/* Sizes */}
              {(() => {
                const sizes = typeof viewingProduct.sizes === 'string' 
                  ? JSON.parse(viewingProduct.sizes) 
                  : viewingProduct.sizes || [];
                
                return sizes.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Available Sizes</h4>
                    <div className="flex gap-2">
                      {sizes.map((size: string, idx: number) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-foreground/10 rounded-full text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Fragrance Notes */}
              {(viewingProduct.topNotes || viewingProduct.heartNotes || viewingProduct.baseNotes) && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Fragrance Notes</h4>
                  {viewingProduct.topNotes && (
                    <div>
                      <p className="text-sm font-medium text-foreground/70">Top Notes</p>
                      <p className="text-foreground/80">{viewingProduct.topNotes}</p>
                    </div>
                  )}
                  {viewingProduct.heartNotes && (
                    <div>
                      <p className="text-sm font-medium text-foreground/70">Heart Notes</p>
                      <p className="text-foreground/80">{viewingProduct.heartNotes}</p>
                    </div>
                  )}
                  {viewingProduct.baseNotes && (
                    <div>
                      <p className="text-sm font-medium text-foreground/70">Base Notes</p>
                      <p className="text-foreground/80">{viewingProduct.baseNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
