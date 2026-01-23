// Seed script to insert a demo product into MongoDB using the existing DATABASE_URL
// Run with: node seed-mongo.js
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/perfume_store';

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  price: Number,
  discountPrice: Number,
  imageUrl: String,
  imageGallery: [String],
  sizes: [String],
  stock: Number,
  isActive: Boolean,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

try {
  await mongoose.connect(uri);
  await Product.create({
    name: 'Demo Perfume',
    description: 'Fresh citrus demo',
    category: 'men',
    price: 299,
    discountPrice: 249,
    imageUrl: '/uploads/demo.png',
    imageGallery: [],
    sizes: ['50ml', '100ml'],
    stock: 25,
    isActive: true,
  });
  console.log('Seeded 1 product');
} catch (err) {
  console.error('Seed failed:', err);
} finally {
  await mongoose.disconnect();
}
