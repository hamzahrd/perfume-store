import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: 'men' | 'women' | 'unisex';
  price: number;
  discountPrice?: number | null;
  imageUrl: string;
  imageGallery?: string[];
  sizes: string[];
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  stock: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['men', 'women', 'unisex'], required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    imageUrl: { type: String },
    imageGallery: [{ type: String }],
    sizes: { type: [String], default: ['30ml', '50ml', '100ml'] },
    topNotes: { type: String },
    heartNotes: { type: String },
    baseNotes: { type: String },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
