import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem extends Document {
  userId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  quantity: number;
  selectedSize?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    userId: { type: Schema.Types.Mixed, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    selectedSize: { type: String },
  },
  { timestamps: true }
);

// Index for quick lookups
cartItemSchema.index({ userId: 1, productId: 1 });

export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);
