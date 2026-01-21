import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getProducts,
  getProductById,
  searchProducts,
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItem,
  createOrder,
  createGuestOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  addOrderItem,
  getOrderItems,
} from "./db";
import { WhatsAppService } from "./whatsapp";
import { generateAccessToken, generateRefreshToken } from "./_core/jwt";
import { registerUser, authenticateUser, updateUserLastSignedIn } from "./auth-db";
import { validatePassword } from "./_core/password";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(2),
        })
      )
      .mutation(async ({ input }) => {
        // Validate password strength
        const passwordValidation = validatePassword(input.password);
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.errors.join(", "));
        }

        // Register user
        const user = await registerUser(input.email, input.password, input.name, "user");
        
        if (!user) {
          throw new Error("Failed to create user");
        }

        // Generate tokens
        const accessToken = generateAccessToken({
          userId: user.id,
          email: user.email || "",
          role: user.role,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Authenticate user
        const user = await authenticateUser(input.email, input.password);
        
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Update last signed in
        await updateUserLastSignedIn(user.id);

        // Generate tokens
        const accessToken = generateAccessToken({
          userId: user.id,
          email: user.email || "",
          role: user.role,
        });

        const refreshToken = generateRefreshToken({
          userId: user.id,
          email: user.email || "",
          role: user.role,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products router
  products: router({
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getProducts(input?.category);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchProducts(input.query);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().min(1),
          category: z.string().min(1),
          price: z.number().min(0),
          discountPrice: z.number().min(0).nullable().optional(),
          imageUrl: z.string().min(1), // Changed from .url() to allow relative paths
          imageGallery: z.array(z.string().min(1)).optional(), // Add support for image gallery
          sizes: z.array(z.string()),
          topNotes: z.string().optional(),
          heartNotes: z.string().optional(),
          baseNotes: z.string().optional(),
          stock: z.number().min(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can create products
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create products");
        }

        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");

        const { users, products } = await import("../drizzle/schema").then(m => ({
          users: m.users,
          products: m.products
        }));

        const result = await db.insert(products).values({
          name: input.name,
          description: input.description,
          category: input.category as any,
          price: input.price.toString(),
          discountPrice: input.discountPrice?.toString() || null,
          imageUrl: input.imageUrl,
          imageGallery: input.imageGallery ? JSON.stringify(input.imageGallery) : null, // Store image gallery
          sizes: JSON.stringify(input.sizes),
          topNotes: input.topNotes,
          heartNotes: input.heartNotes,
          baseNotes: input.baseNotes,
          stock: input.stock,
          isActive: true,
        });

        return { success: true, id: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1),
          description: z.string().min(1),
          category: z.string().min(1),
          price: z.number().min(0),
          discountPrice: z.number().min(0).nullable().optional(),
          imageUrl: z.string().min(1),
          imageGallery: z.array(z.string().min(1)).optional(),
          sizes: z.array(z.string()),
          topNotes: z.string().optional(),  
          heartNotes: z.string().optional(),
          baseNotes: z.string().optional(),
          stock: z.number().min(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can update products
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update products");
        }

        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");

        const { products } = await import("../drizzle/schema").then(m => ({
          products: m.products
        }));
        const { eq } = await import("drizzle-orm");

        await db.update(products)
          .set({
            name: input.name,
            description: input.description,
            category: input.category as any,
            price: input.price.toString(),
            discountPrice: input.discountPrice?.toString() || null,
            imageUrl: input.imageUrl,
            imageGallery: input.imageGallery ? JSON.stringify(input.imageGallery) : null,
            sizes: JSON.stringify(input.sizes),
            topNotes: input.topNotes,
            heartNotes: input.heartNotes,
            baseNotes: input.baseNotes,
            stock: input.stock,
          })
          .where(eq(products.id, input.id));

        return { success: true, id: input.id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can delete products
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete products");
        }

        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");

        const { products } = await import("../drizzle/schema").then(m => ({
          products: m.products
        }));
        const { eq } = await import("drizzle-orm");

        // Soft delete by setting isActive to false
        await db.update(products)
          .set({ isActive: false })
          .where(eq(products.id, input.id));

        return { success: true };
      }),
  }),

  // Cart router
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getCartItems(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          selectedSize: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addToCart(ctx.user.id, input.productId, input.quantity, input.selectedSize);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await removeFromCart(input.cartItemId);
        return { success: true };
      }),

    updateItem: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await updateCartItem(input.cartItemId, input.quantity);
        return { success: true };
      }),
  }),

  // Orders router
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          totalAmount: z.number(),
          shippingAddress: z.any(),
          customerName: z.string().optional(),
          customerCity: z.string().optional(),
          customerPhone: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const order = await createOrder(
          ctx.user.id,
          input.totalAmount,
          input.shippingAddress,
          ctx.user.email || ""
        );
        
        if (!order) {
          throw new Error("Failed to create order");
        }
        
        // Get order items
        const orderItems = await getOrderItems(order.id);
        
        // Send WhatsApp notification with customer info
        const customerInfo = {
          name: input.customerName || ctx.user.name || "",
          city: input.customerCity || "",
          phone: input.customerPhone || "",
        };
        
        await sendOrderToWhatsApp(order, orderItems, customerInfo);
        
        return order;
      }),
    
    createGuest: publicProcedure
      .input(
        z.object({
          productIds: z.array(z.number()),
          totalAmount: z.number(),
          customerName: z.string(),
          customerCity: z.string(),
          customerPhone: z.string(),
          customerAddress: z.string().optional(),
          customerEmail: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("Creating guest order with:", input);
        const order = await createGuestOrder(
          input.productIds,
          input.totalAmount,
          input.customerName,
          input.customerCity,
          input.customerPhone,
          input.customerAddress || "",
          input.customerEmail || ""
        );
        
        if (!order) {
          throw new Error("Failed to create order");
        }
        
        // Get order items
        const orderItems = await getOrderItems(order.id);
        
        // Send WhatsApp notification
        const customerInfo = {
          name: input.customerName,
          city: input.customerCity,
          phone: input.customerPhone,
        };
        
        await sendOrderToWhatsApp(order, orderItems, customerInfo);
        
        return order;
      }),

    sendToWhatsApp: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          customerName: z.string(),
          customerCity: z.string(),
          customerPhone: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins can send messages
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can send WhatsApp messages");
        }

        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        const orderItems = await getOrderItems(input.orderId);
        const customerInfo = {
          name: input.customerName,
          city: input.customerCity,
          phone: input.customerPhone,
        };

        const success = await sendOrderToWhatsApp(order, orderItems, customerInfo);
        return { success };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getOrderById(input.id);
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return getAllOrders();
      }
      return getUserOrders(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await deleteOrder(input.orderId);
        return { success: true };
      }),

    getByOrderNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const db = await (await import("./db")).getDb();
        if (!db) return null;
        const { eq } = await import("drizzle-orm");
        const { orders } = await import("../drizzle/schema");
        const result = await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, input.orderNumber))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),

    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderItems(input.orderId);
      }),
  }),
});

// Helper function to send order to WhatsApp
async function sendOrderToWhatsApp(
  order: any,
  orderItems: any[],
  customerInfo: { name: string; city: string; phone: string }
): Promise<boolean> {
  try {
    // Use the WhatsApp service
    const { WhatsAppService } = await import('./whatsapp');
    return await WhatsAppService.sendOrderNotification(order, orderItems, customerInfo);
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

export type AppRouter = typeof appRouter;
