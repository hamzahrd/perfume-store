// Creates/updates an admin user for email login.
// Run with: node seed-admin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/perfume_store';

const userSchema = new mongoose.Schema({
  openId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  passwordHash: { type: String },
  loginMethod: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  shippingAddress: { type: String },
  lastSignedIn: { type: Date },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const adminEmail = 'admin@example.com';
const adminPassword = 'Admin123!';
const adminName = 'Admin';

async function main() {
  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const openId = `email-${adminEmail}`; // stable openId

  const user = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      openId,
      email: adminEmail,
      name: adminName,
      passwordHash,
      loginMethod: 'email',
      role: 'admin',
      lastSignedIn: new Date(),
    },
    { upsert: true, new: true }
  );

  console.log('Admin user ready:');
  console.log({ email: adminEmail, password: adminPassword, id: user._id?.toString() });
}

main()
  .catch(err => {
    console.error('Admin seed failed:', err);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
