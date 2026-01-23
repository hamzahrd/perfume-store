import mongoose, { Types } from "mongoose";
import { User, IUser } from "./models/User";
import { Product, IProduct } from "./models/Product";
import { CartItem, ICartItem } from "./models/CartItem";
import { Order, IOrder } from "./models/Order";
import { OrderItem, IOrderItem } from "./models/OrderItem";
import { ENV } from './_core/env';
import { WhatsAppService } from './whatsapp';

let isConnected = false;

// Connect to MongoDB
export async function getDb() {
  if (isConnected) {
    return true;
  }

  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
    return false;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL);
    isConnected = true;
    console.log("[Database] Connected to MongoDB");
    return true;
  } catch (error) {
    console.warn("[Database] Failed to connect to MongoDB:", error);
    isConnected = false;
    return false;
  }
}


// User functions
export async function upsertUser(user: Partial<IUser>): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const connected = await getDb();
  if (!connected) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const updateData: any = {
      openId: user.openId,
      lastSignedIn: new Date(),
    };

    if (user.name !== undefined) updateData.name = user.name ?? null;
    if (user.email !== undefined) updateData.email = user.email ?? null;
    if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod ?? null;
    if (user.role !== undefined) {
      updateData.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      updateData.role = 'admin';
    }

    await User.findOneAndUpdate(
      { openId: user.openId },
      updateData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const connected = await getDb();
  if (!connected) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const user = await User.findOne({ openId });
    return user ? user.toObject() : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error);
    return undefined;
  }
}

export async function getUserById(id: string | number) {
  const connected = await getDb();
  if (!connected) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const user = await User.findById(id);
    return user ? user.toObject() : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user by id:", error);
    return undefined;
  }
}


// Product functions
export async function getProducts(category?: string) {
  const connected = await getDb();
  if (!connected) return [];

  try {
    let query;
    if (category && category !== 'all') {
      query = Product.find({ isActive: true, category });
    } else {
      query = Product.find({ isActive: true });
    }

    const products = await query.lean();
    return products || [];
  } catch (error) {
    console.error("[Database] Failed to get products:", error);
    return [];
  }
}

export async function getProductById(id: string | number) {
  const connected = await getDb();
  if (!connected) return undefined;

  try {
    const product = await Product.findById(id).lean();
    return product || undefined;
  } catch (error) {
    console.error("[Database] Failed to get product by id:", error);
    return undefined;
  }
}

export async function searchProducts(query: string) {
  const connected = await getDb();
  if (!connected) return [];

  try {
    // Search in name and description fields
    const products = await Product.find(
      {
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }
    ).lean();

    return products || [];
  } catch (error) {
    console.error("[Database] Failed to search products:", error);
    return [];
  }
}


// Cart functions
export async function getCartItems(userId: string | number) {
  const connected = await getDb();
  if (!connected) return [];

  try {
    const items = await CartItem.find({ userId: String(userId) })
      .populate('productId')
      .lean();
    
    return items.map((item: any) => ({
      ...item,
      product: item.productId,
    })) || [];
  } catch (error) {
    console.error("[Database] Failed to get cart items:", error);
    return [];
  }
}

export async function addToCart(userId: string | number, productId: string | number, quantity: number, selectedSize?: string) {
  const connected = await getDb();
  if (!connected) return;

  try {
    const existing = await CartItem.findOne({ userId: String(userId), productId: String(productId) });

    if (existing) {
      existing.quantity += quantity;
      await existing.save();
    } else {
      await CartItem.create({
        userId: String(userId),
        productId: String(productId),
        quantity,
        selectedSize,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to add to cart:", error);
  }
}

export async function removeFromCart(cartItemId: string) {
  const connected = await getDb();
  if (!connected) return;

  try {
    await CartItem.findByIdAndDelete(cartItemId);
  } catch (error) {
    console.error("[Database] Failed to remove from cart:", error);
  }
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const connected = await getDb();
  if (!connected) return;

  try {
    await CartItem.findByIdAndUpdate(cartItemId, { quantity });
  } catch (error) {
    console.error("[Database] Failed to update cart item:", error);
  }
}


// Order functions
export async function createOrder(userId: string | number, totalAmount: number, shippingAddress: any, email: string) {
  const connected = await getDb();
  if (!connected) return undefined;

  try {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = await Order.create({
      userId,
      orderNumber,
      totalAmount,
      status: 'pending',
      shippingAddress,
      email,
    });

    // Get cart items for this user to add to the order
    const userCartItems = await CartItem.find({ userId: String(userId) }).populate('productId');

    // Add each cart item to order items and clear the cart
    for (const cartItem of userCartItems) {
      const product = cartItem.productId as any;

      // When populated, productId is a document; use its _id
      if (product && product._id) {
        await OrderItem.create({
          orderId: order._id,
          productId: product._id,
          quantity: cartItem.quantity,
          unitPrice: product.discountPrice || product.price,
          selectedSize: cartItem.selectedSize,
        });
      }
    }

    // Clear the user's cart after order creation
    await CartItem.deleteMany({ userId: String(userId) });

    // Get order items to send in WhatsApp notification
    const orderItems = await OrderItem.find({ orderId: order._id });

    // Send WhatsApp notification about the new order
    try {
      await WhatsAppService.sendOrderNotification(order.toObject(), orderItems);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      // Don't fail the order creation if WhatsApp notification fails
    }

    return order.toObject();
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    return undefined;
  }
}

export async function createGuestOrder(
  productIds: (string | number)[],
  totalAmount: number,
  customerName: string,
  customerCity: string,
  customerPhone: string,
  customerAddress: string,
  customerEmail: string
) {
  const connected = await getDb();
  if (!connected) return undefined;

  try {
    console.log("createGuestOrder called with address:", customerAddress);

    const orderNumber = `GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const shippingData = {
      name: customerName,
      city: customerCity,
      phone: customerPhone,
      address: customerAddress
    };

    console.log("Saving shippingAddress:", JSON.stringify(shippingData));

    // Create order with userId = 0 for guest orders
    const order = await Order.create({
      userId: 0,
      orderNumber,
      totalAmount,
      status: 'pending',
      shippingAddress: shippingData,
      email: customerEmail || 'guess@gmail.com',
    });

    // Add each product to order items
    for (const productId of productIds) {
      const product = await Product.findById(productId);

      if (product) {
        await OrderItem.create({
          orderId: order._id,
          productId: product._id,
          quantity: 1,
          unitPrice: product.discountPrice || product.price,
          selectedSize: '50ml',
        });
      }
    }

    return order.toObject();
  } catch (error) {
    console.error("[Database] Failed to create guest order:", error);
    return undefined;
  }
}

export async function getOrderById(orderId: string) {
  const connected = await getDb();
  if (!connected) return undefined;

  try {
    const order = await Order.findById(orderId).lean();
    return order || undefined;
  } catch (error) {
    console.error("[Database] Failed to get order by id:", error);
    return undefined;
  }
}

export async function getUserOrders(userId: string | number) {
  const connected = await getDb();
  if (!connected) return [];

  try {
    const orders = await Order.find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .lean();
    return orders || [];
  } catch (error) {
    console.error("[Database] Failed to get user orders:", error);
    return [];
  }
}

export async function getAllOrders() {
  const connected = await getDb();
  if (!connected) return [];

  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();
    return orders || [];
  } catch (error) {
    console.error("[Database] Failed to get all orders:", error);
    return [];
  }
}

export async function deleteOrder(orderId: string) {
  const connected = await getDb();
  if (!connected) return;

  try {
    // First delete all order items
    await OrderItem.deleteMany({ orderId });

    // Then delete the order
    await Order.findByIdAndDelete(orderId);
  } catch (error) {
    console.error("[Database] Failed to delete order:", error);
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const connected = await getDb();
  if (!connected) return;

  try {
    await Order.findByIdAndUpdate(orderId, { status });
  } catch (error) {
    console.error("[Database] Failed to update order status:", error);
  }
}

export async function addOrderItem(orderId: string, productId: string | number, quantity: number, unitPrice: number, selectedSize?: string) {
  const connected = await getDb();
  if (!connected) return;

  try {
    await OrderItem.create({
      orderId: new Types.ObjectId(orderId),
      productId: new Types.ObjectId(String(productId)),
      quantity,
      unitPrice,
      selectedSize,
    });
  } catch (error) {
    console.error("[Database] Failed to add order item:", error);
  }
}

export async function getOrderItems(orderId: string) {
  const connected = await getDb();
  if (!connected) return [];

  try {
    // Get order items with product details
    const items = await OrderItem.find({ orderId })
      .populate('productId')
      .lean();

    return items.map((item: any) => ({
      ...item,
      product: item.productId,
    })) || [];
  } catch (error) {
    console.error("[Database] Failed to get order items:", error);
    return [];
  }
}
