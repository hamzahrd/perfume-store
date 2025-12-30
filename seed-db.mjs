import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const perfumes = [
  {
    name: "Oud Noir",
    description: "A luxurious blend of dark oud and exotic spices. This sophisticated fragrance captures the essence of Arabian nights with its deep, woody base.",
    category: "men",
    price: "450.00",
    discountPrice: "380.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Oud+Noir",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Bergamot, Cardamom",
    heartNotes: "Oud, Ambroxan",
    baseNotes: "Sandalwood, Musk",
    stock: 25,
    isActive: true,
  },
  {
    name: "Rose Essence",
    description: "An elegant floral composition featuring premium Bulgarian rose. Perfect for the modern woman who appreciates timeless beauty.",
    category: "women",
    price: "380.00",
    discountPrice: null,
    imageUrl: "https://via.placeholder.com/400x400?text=Rose+Essence",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Lemon, Grapefruit",
    heartNotes: "Bulgarian Rose, Peony",
    baseNotes: "Musk, Sandalwood",
    stock: 30,
    isActive: true,
  },
  {
    name: "Citrus Dream",
    description: "A fresh and invigorating unisex fragrance with bright citrus notes. Ideal for everyday wear with a touch of sophistication.",
    category: "unisex",
    price: "280.00",
    discountPrice: "240.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Citrus+Dream",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Neroli, Grapefruit, Lemon",
    heartNotes: "Lavender, Geranium",
    baseNotes: "Cedarwood, Vetiver",
    stock: 40,
    isActive: true,
  },
  {
    name: "Midnight Whisper",
    description: "A mysterious and sensual fragrance for men. Deep amber and leather notes create an unforgettable impression.",
    category: "men",
    price: "420.00",
    discountPrice: null,
    imageUrl: "https://via.placeholder.com/400x400?text=Midnight+Whisper",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Black Pepper, Cinnamon",
    heartNotes: "Leather, Tobacco",
    baseNotes: "Amber, Vanilla",
    stock: 20,
    isActive: true,
  },
  {
    name: "Blossom Garden",
    description: "A delicate floral fragrance for women with notes of jasmine and gardenia. Romantic and enchanting.",
    category: "women",
    price: "350.00",
    discountPrice: "300.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Blossom+Garden",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Mandarin, Bergamot",
    heartNotes: "Jasmine, Gardenia",
    baseNotes: "Vanilla, Musk",
    stock: 35,
    isActive: true,
  },
  {
    name: "Ocean Breeze",
    description: "A fresh and crisp unisex fragrance inspired by the sea. Perfect for those who love aquatic scents.",
    category: "unisex",
    price: "300.00",
    discountPrice: null,
    imageUrl: "https://via.placeholder.com/400x400?text=Ocean+Breeze",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Sea Salt, Bergamot",
    heartNotes: "Aquatic Notes, Driftwood",
    baseNotes: "Musk, Cedarwood",
    stock: 28,
    isActive: true,
  },
  {
    name: "Spice Trail",
    description: "An exotic blend of warm spices and precious woods for men. A journey through the spice markets of the East.",
    category: "men",
    price: "400.00",
    discountPrice: "340.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Spice+Trail",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Clove, Nutmeg",
    heartNotes: "Cinnamon, Saffron",
    baseNotes: "Agarwood, Vetiver",
    stock: 22,
    isActive: true,
  },
  {
    name: "Velvet Silk",
    description: "A luxurious and sensual fragrance for women. Soft musk and silky florals create an irresistible allure.",
    category: "women",
    price: "390.00",
    discountPrice: null,
    imageUrl: "https://via.placeholder.com/400x400?text=Velvet+Silk",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Plum, Raspberry",
    heartNotes: "Orchid, Musk",
    baseNotes: "Sandalwood, Amber",
    stock: 32,
    isActive: true,
  },
  {
    name: "Forest Walk",
    description: "A natural and grounding unisex fragrance with woody and herbal notes. Like a walk through a pristine forest.",
    category: "unisex",
    price: "320.00",
    discountPrice: "270.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Forest+Walk",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Pine, Eucalyptus",
    heartNotes: "Fir Needle, Moss",
    baseNotes: "Cedarwood, Patchouli",
    stock: 26,
    isActive: true,
  },
  {
    name: "Golden Hour",
    description: "A warm and inviting fragrance for men. Perfect for evening wear with notes of amber and vanilla.",
    category: "men",
    price: "360.00",
    discountPrice: null,
    imageUrl: "https://via.placeholder.com/400x400?text=Golden+Hour",
    sizes: JSON.stringify(["30ml", "50ml", "100ml"]),
    topNotes: "Orange, Ginger",
    heartNotes: "Amber, Tonka",
    baseNotes: "Vanilla, Musk",
    stock: 29,
    isActive: true,
  },
  {
    name: "Signature Collection Pack",
    description: "A curated selection of 3 premium perfumes. Perfect for discovering your signature scent or as a luxury gift.",
    category: "pack",
    price: "1000.00",
    discountPrice: "850.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Signature+Pack",
    sizes: JSON.stringify(["Set"]),
    topNotes: "Assorted",
    heartNotes: "Assorted",
    baseNotes: "Assorted",
    stock: 15,
    isActive: true,
  },
  {
    name: "Discovery Set",
    description: "A luxurious pack of 5 best-selling perfumes in premium packaging. Ideal for fragrance enthusiasts.",
    category: "pack",
    price: "1500.00",
    discountPrice: "1200.00",
    imageUrl: "https://via.placeholder.com/400x400?text=Discovery+Set",
    sizes: JSON.stringify(["Set"]),
    topNotes: "Assorted",
    heartNotes: "Assorted",
    baseNotes: "Assorted",
    stock: 10,
    isActive: true,
  },
];

try {
  console.log("🌱 Seeding database with perfume products and admin user...");

  // Create admin user
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const adminOpenId = `email-${adminEmail}-${Date.now()}`;

  try {
    await connection.execute(
      `INSERT INTO users (openId, email, name, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        adminOpenId,
        adminEmail,
        "Admin User",
        adminPasswordHash,
        "email",
        "admin"
      ]
    );
    console.log(`✓ Created admin user: ${adminEmail} / password: ${adminPassword}`);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`⚠ Admin user already exists: ${adminEmail}`);
    } else {
      throw error;
    }
  }

  for (const perfume of perfumes) {
    await connection.execute(
      `INSERT INTO products (name, description, category, price, discountPrice, imageUrl, sizes, topNotes, heartNotes, baseNotes, stock, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        perfume.name,
        perfume.description,
        perfume.category,
        perfume.price,
        perfume.discountPrice,
        perfume.imageUrl,
        perfume.sizes,
        perfume.topNotes,
        perfume.heartNotes,
        perfume.baseNotes,
        perfume.stock,
        perfume.isActive,
      ]
    );
    console.log(`✓ Added: ${perfume.name}`);
  }

  console.log("\n✅ Database seeded successfully!");
  console.log(`📦 Total products added: ${perfumes.length}`);
} catch (error) {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
} finally {
  await connection.end();
}
