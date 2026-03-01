import bcrypt from 'bcryptjs';
import { connectToDatabase, sequelize } from '..';
import { initModels } from '../models';

const main = async () => {
    try {
        await connectToDatabase();
        const models = initModels(sequelize);
        const { User, Product } = models;

        // Clear existing data for a fresh start in dev
        await sequelize.sync({ force: true });
        console.log('Database synced (all tables dropped and recreated).');

        const passwordHash = await bcrypt.hash('Password123!', 10);
        const user = await User.create({
            username: 'demo_user',
            email: 'demo@example.com',
            mobileNumber: '9123456789',
            passwordHash,
        });

        const products = [
            {
                name: 'Premium Cotton Navy T-Shirt',
                description: 'A luxurious, breathable navy blue t-shirt made from 100% long-staple cotton. Perfect for a clean, minimalist look.',
                priceCents: 129900, // ₹ 1,299
                currency: 'INR',
                imageUrl: 'images/premium-tshirt.png',
                isActive: true,
            },
            {
                name: 'Noise-Cancelling Wireless Headphones',
                description: 'State-of-the-art active noise cancelling headphones with 40-hour battery life and high-fidelity sound.',
                priceCents: 1899900, // ₹ 18,999
                currency: 'INR',
                imageUrl: 'images/premium-headphones.png',
                isActive: true,
            },
            {
                name: 'Luxury Titanium Smartwatch',
                description: 'An elegant titanium-body smartwatch featuring a sapphire glass display, advanced health tracking, and 10-day battery.',
                priceCents: 2499900, // ₹ 24,999
                currency: 'INR',
                imageUrl: 'images/premium-smartwatch.png',
                isActive: true,
            },
            {
                name: 'Portable Wood-Finish Bluetooth Speaker',
                description: 'A beautiful blend of modern tech and classic design, delivering rich, room-filling audio in a compact footprint.',
                priceCents: 549900, // ₹ 5,499
                currency: 'INR',
                imageUrl: 'images/premium-speaker.png',
                isActive: true,
            },
            {
                name: 'Ultra-Thin Professional Laptop',
                description: 'High-performance laptop with a stunning 4K display, powerful processor, and all-day battery life for creators on the go.',
                priceCents: 8999900, // ₹ 89,999
                currency: 'INR',
                imageUrl: 'images/premium-laptop.png',
                isActive: true,
            },
            {
                name: 'Designer Aviator Gold Sunglasses',
                description: 'Classic aviator silhouette with modern gold-plated frames and polarized lenses for ultimate UV protection and style.',
                priceCents: 799900, // ₹ 7,999
                currency: 'INR',
                imageUrl: 'images/premium-sunglasses.png',
                isActive: true,
            },
            {
                name: 'Advanced Facial Revitalizing Cream',
                description: 'A premium skincare solution with organic extracts to hydrate and rejuvenate your skin overnight.',
                priceCents: 349900, // ₹ 3,499
                currency: 'INR',
                imageUrl: 'images/facecream.jpg',
                isActive: true,
            },
            {
                name: 'Professional Granite Cookware Set',
                description: '10-piece non-stick granite cookware set with heat-resistant handles, ideal for gourmet cooking.',
                priceCents: 1249900, // ₹ 12,499
                currency: 'INR',
                imageUrl: 'images/cookware.jpg',
                isActive: true,
            },
            {
                name: 'Pure Leather Casual Sneakers',
                description: 'Handcrafted genuine leather sneakers designed for comfort and long-lasting durability.',
                priceCents: 459900, // ₹ 4,599
                currency: 'INR',
                imageUrl: 'images/product-placeholder.jpg',
                isActive: true,
            },
            {
                name: 'Smart Fitness Band Pro',
                description: 'Lightweight fitness tracker with heart rate monitoring, sleep analysis, and water resistance up to 50m.',
                priceCents: 199900, // ₹ 1,999
                currency: 'INR',
                imageUrl: 'images/smartwatch.jpg',
                isActive: true,
            }
        ];

        await Product.bulkCreate(products);
        console.log('Premium products seeded successfully.');

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

void main();