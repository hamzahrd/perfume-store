import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Plus, Edit, Trash2, Package, ShoppingBag, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
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
        imageGallery: [], // Reset image gallery
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

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
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
          <div className="border border-foreground/10 p-6">
            <p className="text-sm text-foreground/60 mb-2">Total Products</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="border border-foreground/10 p-6">
            <p className="text-sm text-foreground/60 mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="border border-foreground/10 p-6">
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
                    createProductMutation.mutate({
                      ...productForm,
                      price: Number(productForm.price),
                      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
                      stock: Number(productForm.stock),
                      imageGallery: productForm.imageGallery, // Include image gallery
                    });
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
                              className="w-full h-24 object-cover border border-foreground/20 rounded"
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
                      disabled={createProductMutation.isPending || isUploadingImage}
                      className="btn-elegant-filled disabled:opacity-50"
                    >
                      {createProductMutation.isPending ? "Creating..." : (isUploadingImage ? "Uploading..." : "Add Product")}
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
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 hover:bg-foreground/5 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive transition-colors">
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
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="border border-foreground/10 p-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{order.totalAmount} DH</p>
                        <select
                          defaultValue={order.status}
                          className="text-sm px-2 py-1 border border-foreground/20 bg-background focus:outline-none focus:border-accent capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/60">
                      Email: {order.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
