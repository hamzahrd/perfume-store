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
          userId: user._id?.toString(),
          email: user.email || "",
          role: user.role,
        });

        return {
          success: true,
          user: {
            id: user._id?.toString(),
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
        await updateUserLastSignedIn(user._id?.toString());

        // Generate tokens
        const accessToken = generateAccessToken({
          userId: user._id?.toString(),
          email: user.email || "",
          role: user.role,
        });

        const refreshToken = generateRefreshToken({
          userId: user._id?.toString(),
          email: user.email || "",
          role: user.role,
        });

        return {
          success: true,
          user: {
            id: user._id?.toString(),
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
      .input(z.object({ id: z.string() }))
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

        const { Product } = await import("./models/Product");

        const product = await Product.create({
          name: input.name,
          description: input.description,
          category: input.category,
          price: input.price,
          discountPrice: input.discountPrice || undefined,
          imageUrl: input.imageUrl,
          imageGallery: input.imageGallery || [],
          sizes: input.sizes,
          topNotes: input.topNotes,
          heartNotes: input.heartNotes,
          baseNotes: input.baseNotes,
          stock: input.stock,
          isActive: true,
        });

        return { success: true, id: product._id?.toString() };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
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

        const { Product } = await import("./models/Product");

        await Product.findByIdAndUpdate(input.id, {
          name: input.name,
          description: input.description,
          category: input.category,
          price: input.price,
          discountPrice: input.discountPrice || undefined,
          imageUrl: input.imageUrl,
          imageGallery: input.imageGallery || [],
          sizes: input.sizes,
          topNotes: input.topNotes,
          heartNotes: input.heartNotes,
          baseNotes: input.baseNotes,
          stock: input.stock,
        });

        return { success: true, id: input.id };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // Only admins can delete products
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete products");
        }

        const { Product } = await import("./models/Product");

        // Soft delete by setting isActive to false
        await Product.findByIdAndUpdate(input.id, { isActive: false });

        return { success: true };
      }),
  }),

  // Cart router
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getCartItems(ctx.user._id?.toString() || '');
    }),

    addItem: protectedProcedure
      .input(
        z.object({
          productId: z.string(),
          quantity: z.number().min(1),
          selectedSize: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await addToCart(ctx.user._id?.toString() || '', input.productId, input.quantity, input.selectedSize);
        return { success: true };
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.string() }))
      .mutation(async ({ input }) => {
        await removeFromCart(input.cartItemId);
        return { success: true };
      }),

    updateItem: protectedProcedure
      .input(z.object({ cartItemId: z.string(), quantity: z.number().min(1) }))
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
          ctx.user._id?.toString(),
          input.totalAmount,
          input.shippingAddress,
          ctx.user.email || "guess@gmail.com"
        );
        
        if (!order) {
          throw new Error("Failed to create order");
        }
        
        // Get order items
        const orderItems = await getOrderItems(order._id?.toString());
        
        // Send WhatsApp notification with customer info
        const customerInfo = {
          name: input.customerName || ctx.user.name || "",
          city: input.customerCity || "",
          phone: input.customerPhone || "",
        };
        
        await sendOrderToWhatsApp(order, orderItems, customerInfo);
        
        return {
          ...order,
          id: order._id?.toString(),
        };
      }),
    
    createGuest: publicProcedure
      .input(
        z.object({
          productIds: z.array(z.string()),
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
        const orderItems = await getOrderItems(order._id?.toString());
        
        // Send WhatsApp notification
        const customerInfo = {
          name: input.customerName,
          city: input.customerCity,
          phone: input.customerPhone,
        };
        
        await sendOrderToWhatsApp(order, orderItems, customerInfo);
        
        return {
          ...order,
          id: order._id?.toString(),
        };
      }),

    sendToWhatsApp: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
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
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return getOrderById(input.id);
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return getAllOrders();
      }
      return getUserOrders(ctx.user._id?.toString());
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
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
      .input(z.object({ orderId: z.string() }))
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
        const { Order } = await import("./models/Order");
        const order = await Order.findOne({ orderNumber: input.orderNumber }).lean();
        return order || null;
      }),

    getItems: publicProcedure
      .input(z.object({ orderId: z.string() }))
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
