import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, cartItems, orders, orderItems, type Order } from "../drizzle/schema";
import { ENV } from './_core/env';
import { WhatsAppService } from './whatsapp';

// Utility function to parse JSON fields in products
function parseProductJsonFields(product: any) {
  // Parse sizes field
  if (typeof product.sizes === 'string') {
    try {
      product.sizes = JSON.parse(product.sizes);
    } catch (e) {
      console.error('Error parsing sizes:', e);
      product.sizes = ["30ml", "50ml", "100ml"]; // Default sizes
    }
  }
  // Parse imageGallery field
  if (typeof product.imageGallery === 'string') {
    try {
      product.imageGallery = JSON.parse(product.imageGallery);
    } catch (e) {
      console.error('Error parsing imageGallery:', e);
      product.imageGallery = [];
    }
  }
  return product;
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];

  let query;
  if (category && category !== 'all') {
    query = db.select().from(products).where(
      and(eq(products.isActive, true), eq(products.category, category as any))
    );
  } else {
    query = db.select().from(products).where(eq(products.isActive, true));
  }

  const results = await query;

  // Parse JSON fields for each product
  return results.map(parseProductJsonFields);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? parseProductJsonFields(result[0]) : undefined;
}

export async function searchProducts(query: string) {
  const db = await getDb();
  if (!db) return [];
  // Simple search - in production, use full-text search
  const results = await db.select().from(products).where(
    eq(products.isActive, true)
  );
  
  // Parse JSON fields for each product
  return results.map(parseProductJsonFields);
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      cart: cartItems,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

  return rows.map((row) => ({
    ...row.cart,
    product: row.product ? parseProductJsonFields(row.product) : undefined,
  }));
}

export async function addToCart(userId: number, productId: number, quantity: number, selectedSize?: string) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      userId,
      productId,
      quantity,
      selectedSize,
    });
  }
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, cartItemId));
}

// Order queries
export async function createOrder(userId: number, totalAmount: number, shippingAddress: any, email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(orders).values({
    userId,
    orderNumber,
    totalAmount: totalAmount.toString() as any,
    status: 'pending',
    shippingAddress: JSON.stringify(shippingAddress),
    email,
  });
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = result.length > 0 ? result[0] : undefined;
  
  if (order) {
    // Get cart items for this user to add to the order
    const userCartItems = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    
    // Add each cart item to order items and clear the cart
    for (const cartItem of userCartItems) {
      // Get the product to get the current price
      const productResult = await db.select().from(products).where(eq(products.id, cartItem.productId)).limit(1);
      const product = productResult.length > 0 ? productResult[0] : undefined;
      
      if (product) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: product.discountPrice || product.price,
          selectedSize: cartItem.selectedSize,
        });
      }
    }
    
    // Clear the user's cart after order creation
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    
    // Get order items to send in WhatsApp notification
    const orderItemsResult = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    
    // Send WhatsApp notification about the new order
    try {
      await WhatsAppService.sendOrderNotification(order, orderItemsResult);
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      // Don't fail the order creation if WhatsApp notification fails
    }
  }
  
  return order;
}

export async function createGuestOrder(
  productIds: number[],
  totalAmount: number,
  customerName: string,
  customerCity: string,
  customerPhone: string,
  customerAddress: string,
  customerEmail: string
) {
  const db = await getDb();
  if (!db) return undefined;
  
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
  await db.insert(orders).values({
    userId: 0,
    orderNumber,
    totalAmount: totalAmount.toString() as any,
    status: 'pending',
    shippingAddress: JSON.stringify(shippingData),
    email: customerEmail || 'guest@example.com',
  });
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = result.length > 0 ? result[0] : undefined;
  
  if (order) {
    // Add each product to order items
    for (const productId of productIds) {
      const productResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      const product = productResult.length > 0 ? productResult[0] : undefined;
      
      if (product) {
        await db.insert(orderItems).values({
          orderId: order.id,
          productId: product.id,
          quantity: 1,
          unitPrice: product.discountPrice || product.price,
          selectedSize: '50ml',
        });
      }
    }
  }
  
  return order;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function deleteOrder(orderId: number) {
  const db = await getDb();
  if (!db) return;
  
  // First delete all order items
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
  
  // Then delete the order
  await db.delete(orders).where(eq(orders.id, orderId));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function addOrderItem(orderId: number, productId: number, quantity: number, unitPrice: number, selectedSize?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(orderItems).values({
    orderId,
    productId,
    quantity,
    unitPrice: unitPrice.toString(),
    selectedSize,
  });
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get order items with product details
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  
  // Fetch product details for each item
  const itemsWithProducts = await Promise.all(
    items.map(async (item) => {
      const productResult = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      const product = productResult.length > 0 ? parseProductJsonFields(productResult[0]) : null;
      return {
        ...item,
        product,
      };
    })
  );
  
  return itemsWithProducts;
}
