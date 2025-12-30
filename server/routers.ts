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
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  addOrderItem,
  getOrderItems,
} from "./db";
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
          imageUrl: z.string().url(),
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
          sizes: JSON.stringify(input.sizes),
          topNotes: input.topNotes,
          heartNotes: input.heartNotes,
          baseNotes: input.baseNotes,
          stock: input.stock,
          isActive: true,
        });

        return { success: true, id: (result as any).insertId };
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
        })
      )
      .mutation(async ({ ctx, input }) => {
        const order = await createOrder(
          ctx.user.id,
          input.totalAmount,
          input.shippingAddress,
          ctx.user.email || ""
        );
        return order;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getOrderById(input.id);
      }),

    getUserOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),

    getItems: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return getOrderItems(input.orderId);
      }),

    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can update order status
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized");
        }
        await updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),

    addItem: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
          selectedSize: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addOrderItem(
          input.orderId,
          input.productId,
          input.quantity,
          input.unitPrice,
          input.selectedSize
        );
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
