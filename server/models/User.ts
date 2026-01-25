import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  openId: string;
  email?: string;
  name?: string;
  password?: string;
  passwordHash?: string;
  loginMethod?: string;
  role: 'user' | 'admin';
  shippingAddress?: string;
  lastSignedIn?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    openId: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    password: { type: String },
    passwordHash: { type: String },
    loginMethod: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    shippingAddress: { type: String },
    lastSignedIn: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
