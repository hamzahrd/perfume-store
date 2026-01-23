# MongoDB Migration Guide

## Overview
Successfully migrated from MySQL + Drizzle ORM to MongoDB + Mongoose ORM.

## Changes Made

### 1. Database Models Created (`server/models/`)
- `User.ts` - User authentication and profile data
- `Product.ts` - Product catalog with categories, prices, and inventory
- `CartItem.ts` - Shopping cart items
- `Order.ts` - Customer orders
- `OrderItem.ts` - Individual items within orders

### 2. Core Files Updated

#### Server Side
- **`server/db.ts`** - Completely rewritten to use Mongoose instead of Drizzle
  - All database queries now use Mongoose methods (`.find()`, `.create()`, `.findByIdAndUpdate()`, etc.)
  - Connection management updated for MongoDB
  
- **`server/auth-db.ts`** - Updated authentication functions for Mongoose
  - User lookup and registration updated
  
- **`server/routers.ts`** - Updated tRPC routers
  - Changed ID types from `number` to `string` (MongoDB ObjectIds)
  - Updated product CRUD operations
  - Updated cart and order operations
  
- **`server/_core/context.ts`** - Updated user type from Drizzle to Mongoose

#### Client Side
- **Updated ID references across all pages:**
  - `product.id` → `product._id`
  - `order.id` → `order._id` 
  - `user.id` → `user._id`
  
- **Files modified:**
  - `client/src/pages/ProductDetail.tsx`
  - `client/src/pages/Products.tsx`
  - `client/src/pages/Home.tsx`
  - `client/src/pages/Cart.tsx`
  - `client/src/pages/OrderConfirmation.tsx`
  - `client/src/pages/Account.tsx`
  - `client/src/pages/AdminDashboard.tsx`
  - `client/src/pages/PackSelection.tsx`
  - `client/src/components/CartDrawer.tsx`

### 3. Environment Configuration

**`.env` file updated:**
```env
# Old MySQL connection
DATABASE_URL="mysql://root@localhost:3307/perfume_store"

# New MongoDB connection
DATABASE_URL="mongodb://localhost:27017/perfume_store"
```

**For MongoDB Atlas (Cloud):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/perfume_store"
```

## Key Type Changes

### IDs
- **Before:** `number` (auto-increment integers)
- **After:** `string` (MongoDB ObjectIds like `"507f1f77bcf86cd799439011"`)

### Prices
- **Before:** `string` (stored as text in MySQL)
- **After:** `number` (native Number type in MongoDB)

### User ID
- **Mixed Type:** Can be `string | number | Types.ObjectId` to support both authenticated users (ObjectId) and guest users (0)

## Installation

The required package `mongoose` has already been installed:
```bash
npm install mongoose --legacy-peer-deps
```

## Next Steps

### 1. Set Up MongoDB Database

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
mongod --dbpath /data/db

# Database will be available at: mongodb://localhost:27017/perfume_store
```

**Option B: MongoDB Atlas (Recommended for Production)**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Update `.env` with your connection string:
```env
DATABASE_URL="mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/perfume_store?retryWrites=true&w=majority"
```

### 2. Migrate Existing Data (Optional)

If you have existing MySQL data to migrate:

1. Export data from MySQL
2. Transform to MongoDB format
3. Import using `mongoimport` or Mongoose scripts

### 3. Start the Application

```bash
npm run dev
```

## Testing Checklist

- [ ] User registration and login
- [ ] Product listing and search
- [ ] Add to cart
- [ ] Place order
- [ ] View order history
- [ ] Admin dashboard
- [ ] WhatsApp notifications

## Schema Differences

### Products
| MySQL (Drizzle) | MongoDB (Mongoose) |
|-----------------|---------------------|
| `price: string` | `price: number` |
| `discountPrice: string` | `discountPrice: number` |
| `sizes: JSON string` | `sizes: string[]` (native array) |
| `imageGallery: JSON string` | `imageGallery: string[]` (native array) |

### Orders
| MySQL (Drizzle) | MongoDB (Mongoose) |
|-----------------|---------------------|
| `totalAmount: string` | `totalAmount: number` |
| `shippingAddress: JSON string` | `shippingAddress: Mixed` (native object) |

### Cart & OrderItems
| MySQL (Drizzle) | MongoDB (Mongoose) |
|-----------------|---------------------|
| `productId: number` | `productId: ObjectId` (with ref) |
| `userId: number` | `userId: Mixed` (string or number) |

## Benefits of MongoDB

1. **Flexible Schema** - Easy to add new fields without migrations
2. **Native JSON** - No need to stringify/parse arrays and objects
3. **Scalability** - Better horizontal scaling
4. **Cloud Ready** - MongoDB Atlas provides free tier and easy deployment
5. **Developer Experience** - Mongoose provides excellent TypeScript support

## Troubleshooting

### Connection Issues
```typescript
// Check if MongoDB is running
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
```

### Type Errors
- Make sure all `id` references are changed to `_id`
- Use `.toString()` when passing ObjectIds to functions expecting strings
- Use `as any` for temporary type bypasses (fix properly later)

## Rollback Plan

If you need to rollback to MySQL:
1. Restore from Git: `git checkout <previous-commit>`
2. Update `.env` back to MySQL connection
3. Run: `npm install`

## Support

For MongoDB documentation:
- Mongoose: https://mongoosejs.com/docs/
- MongoDB: https://docs.mongodb.com/

For Mongoose migration from SQL:
- https://mongoosejs.com/docs/migrating_to_6.html
