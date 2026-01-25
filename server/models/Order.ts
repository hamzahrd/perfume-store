import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  userId: string | number | Types.ObjectId;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: any;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.Mixed, required: true },
    orderNumber: { type: String, required: true, unique: true },
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingAddress: { type: Schema.Types.Mixed },
    email: { type: String },
  },
  { timestamps: true }
);

// Index for quick lookups
orderSchema.index({ userId: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
