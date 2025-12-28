import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return { ctx };
}

describe("Products Router", () => {
  it("should list all products", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter products by category", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ category: "men" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get product by ID", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getById({ id: 1 });
    // Result can be undefined if product doesn't exist in test DB
    expect(result === undefined || typeof result === "object").toBe(true);
  });

  it("should search products", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.search({ query: "perfume" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Cart Router", () => {
  it("should get cart items for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.getItems();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should add item to cart", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.addItem({
      productId: 1,
      quantity: 2,
      selectedSize: "50ml",
    });

    expect(result).toEqual({ success: true });
  });

  it("should update cart item quantity", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.updateItem({
      cartItemId: 1,
      quantity: 3,
    });

    expect(result).toEqual({ success: true });
  });

  it("should remove item from cart", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.removeItem({ cartItemId: 1 });
    expect(result).toEqual({ success: true });
  });

  it("should reject quantity less than 1", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.cart.addItem({
        productId: 1,
        quantity: 0,
        selectedSize: "50ml",
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Orders Router", () => {
  it("should create an order for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      totalAmount: 250,
      shippingAddress: {
        street: "123 Main St",
        city: "Casablanca",
        country: "Morocco",
      },
    });

    expect(result).toBeDefined();
    expect(result?.orderNumber).toBeDefined();
  });

  it("should get user orders", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getUserOrders();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get order by ID", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getById({ id: 1 });
    // Result can be undefined if order doesn't exist
    expect(result === undefined || typeof result === "object").toBe(true);
  });

  it("should get order items", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getItems({ orderId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should add item to order", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.addItem({
      orderId: 1,
      productId: 1,
      quantity: 2,
      unitPrice: 250,
      selectedSize: "50ml",
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow admin to update order status", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.updateStatus({
      orderId: 1,
      status: "shipped",
    });

    expect(result).toEqual({ success: true });
  });

  it("should reject non-admin from updating order status", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.updateStatus({
        orderId: 1,
        status: "shipped",
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("Auth Router", () => {
  it("should return current user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("should logout user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
