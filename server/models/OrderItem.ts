import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem extends Document {
  orderId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    selectedSize: { type: String },
  },
  { timestamps: true }
);

// Index for quick lookups
orderItemSchema.index({ orderId: 1 });

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);
