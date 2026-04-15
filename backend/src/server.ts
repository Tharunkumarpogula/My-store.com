import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from './config';
import { connectToDatabase } from './db';
import { OrderModel, ProductModel, ReviewModel, UserModel, sellerPublicProjection } from './db/models';

dotenv.config();

const app = express();
export { app };
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = config.admin.token;
    if (!token) {
        // Dev-friendly default: if no token is configured, don't block.
        return next();
    }

    const auth = String(req.headers.authorization ?? '');
    const expected = `Bearer ${token}`;
    if (auth !== expected) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return next();
};

// Routes
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, imageUrl, category, userId } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, Price, and Category are required' });
        }

        const priceCents = Math.round(Number(price) * 100);
        if (!Number.isFinite(priceCents) || priceCents < 0) {
            return res.status(400).json({ error: 'Invalid price' });
        }

        const product = await ProductModel.create({
            name,
            description: description || null,
            priceCents,
            currency: 'INR',
            imageUrl: imageUrl || 'images/product-placeholder.jpg',
            category,
            userId: userId || null,
            isActive: true,
        });

        return res.status(201).json(product.toJSON());
    } catch (error: any) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        const actingUserId = String(req.body.userId ?? req.headers['x-user-id'] ?? '');

        const product = await ProductModel.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.userId && actingUserId && product.userId !== actingUserId) {
            return res.status(403).json({ error: 'Forbidden: not your product' });
        }

        const { name, description, price, imageUrl, category, isActive } = req.body;

        if (typeof name === 'string' && name.trim()) product.name = name.trim();
        if (typeof description === 'string') product.description = description;
        if (typeof imageUrl === 'string') product.imageUrl = imageUrl;
        if (typeof category === 'string' && category.trim()) product.category = category.trim();
        if (typeof isActive === 'boolean') product.isActive = isActive;

        if (price !== undefined) {
            const priceCents = Math.round(Number(price) * 100);
            if (!Number.isFinite(priceCents) || priceCents < 0) {
                return res.status(400).json({ error: 'Invalid price' });
            }
            product.priceCents = priceCents;
        }

        await product.save();
        return res.json(product.toJSON());
    } catch (error: any) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        const actingUserId = String(req.query.userId ?? req.headers['x-user-id'] ?? '');

        const product = await ProductModel.findById(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.userId && actingUserId && product.userId !== actingUserId) {
            return res.status(403).json({ error: 'Forbidden: not your product' });
        }

        // Soft delete: keep the record, just hide from customers
        product.isActive = false;
        await product.save();

        return res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : undefined;
        const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
        const includeInactive = String(req.query.includeInactive ?? '') === 'true';

        const filter: any = {};
        if (category) filter.category = category;

        if (userId) {
            filter.userId = userId;
            if (!includeInactive) filter.isActive = true;
        } else {
            filter.isActive = true;
        }

        const docs = await ProductModel.find(filter).sort({ createdAt: -1 });
        res.json(docs.map(d => d.toJSON()));
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const body = (req.body ?? {}) as any;
        const customer = body.customer ?? {};
        const items = body.items;
        const paymentMethod = String(body.paymentMethod ?? 'cod');

        const email = String(customer.email ?? '').trim();
        const mobileNumber = String(customer.mobileNumber ?? '').trim();
        const customerName = String(customer.name ?? '').trim();

        if (!email || !mobileNumber) {
            return res.status(400).json({ error: 'Missing customer email or mobileNumber' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order items are required' });
        }

        const normalizedItems = items
            .map((i: any) => ({
                productId: String(i.productId ?? ''),
                quantity: Number(i.quantity ?? 0),
            }))
            .filter((i: any) => i.productId && Number.isFinite(i.quantity) && i.quantity > 0);

        if (normalizedItems.length === 0) {
            return res.status(400).json({ error: 'Order items are invalid' });
        }

        const productIds = Array.from(new Set(normalizedItems.map((i: any) => i.productId)));
        const products = await ProductModel.find({ _id: { $in: productIds }, isActive: true });
        const productsById = new Map(products.map(p => [p.id, p] as const));
        const missing = productIds.filter(id => !productsById.has(id));

        if (missing.length > 0) {
            return res.status(400).json({
                error: 'Some productIds were not found in the database. Make sure the frontend loaded products from the backend before checkout.',
                missingProductIds: missing,
            });
        }

        let user = await UserModel.findOne({ email });
        if (!user) {
            const guestPasswordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
            user = await UserModel.create({
                username: `guest_${crypto.randomBytes(6).toString('hex')}`,
                email,
                mobileNumber,
                passwordHash: guestPasswordHash,
                role: 'customer',
            });
        }

        const currency = String(body.currency ?? 'INR');

        const orderItems = normalizedItems.map((i: any) => {
            const product = productsById.get(i.productId)!;
            return {
                productId: product.id,
                sellerId: product.userId ?? null,
                quantity: i.quantity,
                unitPriceCents: product.priceCents,
                currency: product.currency ?? currency,
                product: {
                    name: product.name,
                    imageUrl: product.imageUrl ?? null,
                    category: product.category ?? 'electronics',
                },
            };
        });

        const totalCents = orderItems.reduce((sum: number, i: any) => sum + i.unitPriceCents * i.quantity, 0);

        // Store as a single document for simple local MongoDB use (no multi-document transaction required)
        const order = await OrderModel.create({
            userId: user.id,
            status: 'pending',
            totalCents,
            currency,
            customer: {
                name: customerName || null,
                email,
                mobileNumber,
            },
            items: orderItems,
            payments: [
                {
                    provider: paymentMethod,
                    providerPaymentId: null,
                    amountCents: totalCents,
                    currency,
                    status: 'initiated',
                    createdAt: new Date(),
                },
            ],
        });

        return res.status(201).json({ orderId: order.id });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const filter: any = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
                return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
            }

            filter.createdAt = { $gte: start, $lte: end };
        }

        const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
        return res.json(orders.map(o => o.toJSON()));
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const filter: any = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
                return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
            }

            filter.createdAt = { $gte: start, $lte: end };
        }

        const orders = await OrderModel.find(filter).sort({ createdAt: -1 });
        return res.json(orders.map(o => o.toJSON()));
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const {
            username,
            email,
            mobileNumber,
            password,
            role,
            businessMode,
            shopCategory,
            shopName,
            shopDescription,
            contactPhone,
            contactEmail,
            locationCity,
            locationState,
            locationCountry,
            profilePictureUrl,
            photoIdUrl,
            gstin,
            bankAccountMasked,
        } = req.body;

        if (!username || !email || !mobileNumber || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const normalizedRole = role === 'retailer' ? 'retailer' : 'customer';

        const passwordHash = await bcrypt.hash(String(password), 10);
        const user = await UserModel.create({
            username: String(username).trim(),
            email: String(email).toLowerCase(),
            mobileNumber: String(mobileNumber).trim(),
            passwordHash,
            role: normalizedRole,

            profilePictureUrl:
                typeof profilePictureUrl === 'string' && profilePictureUrl.trim() ? profilePictureUrl.trim() : null,

            businessMode: businessMode || null,
            shopCategory: shopCategory || null,
            photoIdUrl: photoIdUrl || null,
            businessVerificationStatus: normalizedRole === 'retailer' ? 'pending' : null,

            shopName: shopName || null,
            shopDescription: shopDescription || null,
            contactPhone: contactPhone || null,
            contactEmail: contactEmail || null,
            locationCity: locationCity || null,
            locationState: locationState || null,
            locationCountry: locationCountry || 'India',

            gstin: gstin || null,
            bankAccountMasked: bankAccountMasked || null,
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            businessVerificationStatus: user.businessVerificationStatus,
        });
    } catch (error: any) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email: String(email).toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const ok = await bcrypt.compare(String(password), String(user.passwordHash));
        if (!ok) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            businessVerificationStatus: user.businessVerificationStatus,
            shopCategory: user.shopCategory ?? null,
            businessMode: user.businessMode ?? null,
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Seller profile endpoints
app.get('/api/sellers/:id/public', async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        const seller = await UserModel.findById(id);
        if (!seller) return res.status(404).json({ error: 'Seller not found' });
        return res.json(sellerPublicProjection(seller));
    } catch (error) {
        console.error('Error fetching seller public profile:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/sellers/:id/profile', async (req, res) => {
    try {
        const id = String(req.params.id ?? '');
        const actingUserId = String(req.headers['x-user-id'] ?? req.body.userId ?? '');

        if (!actingUserId || actingUserId !== id) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const seller = await UserModel.findById(id);
        if (!seller) return res.status(404).json({ error: 'Seller not found' });

        const {
            shopName,
            shopDescription,
            contactPhone,
            contactEmail,
            locationCity,
            locationState,
            locationCountry,
            photoIdUrl,
            gstin,
            bankAccountMasked,
            profilePictureUrl,
        } = req.body;

        if (typeof shopName === 'string') seller.shopName = shopName;
        if (typeof shopDescription === 'string') seller.shopDescription = shopDescription;
        if (typeof contactPhone === 'string') seller.contactPhone = contactPhone;
        if (typeof contactEmail === 'string') seller.contactEmail = contactEmail;
        if (typeof locationCity === 'string') seller.locationCity = locationCity;
        if (typeof locationState === 'string') seller.locationState = locationState;
        if (typeof locationCountry === 'string') seller.locationCountry = locationCountry;
        if (typeof profilePictureUrl === 'string') seller.profilePictureUrl = profilePictureUrl;
        if (typeof photoIdUrl === 'string') seller.photoIdUrl = photoIdUrl;
        if (typeof gstin === 'string') seller.gstin = gstin;
        if (typeof bankAccountMasked === 'string') seller.bankAccountMasked = bankAccountMasked;

        await seller.save();
        return res.json({ success: true });
    } catch (error: any) {
        console.error('Error updating seller profile:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Reviews endpoints
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = String(req.params.id ?? '');
        const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 }).limit(50);
        const totalReviews = await ReviewModel.countDocuments({ productId });
        const avgAgg = await ReviewModel.aggregate([
            { $match: { productId } },
            { $group: { _id: '$productId', avg: { $avg: '$rating' } } },
        ]);
        const averageRating = avgAgg.length > 0 ? Number(avgAgg[0].avg) : 0;

        return res.json({
            productId,
            averageRating,
            totalReviews,
            reviews: reviews.map(r => r.toJSON()),
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/products/:id/reviews', async (req, res) => {
    try {
        const productId = String(req.params.id ?? '');
        const { userId, userDisplayName, rating, title, text } = req.body;

        const r = Number(rating);
        if (!Number.isFinite(r) || r < 1 || r > 5) {
            return res.status(400).json({ error: 'Rating must be 1..5' });
        }
        if (!text || String(text).trim().length < 3) {
            return res.status(400).json({ error: 'Review text is required' });
        }

        const exists = await ProductModel.exists({ _id: productId });
        if (!exists) return res.status(404).json({ error: 'Product not found' });

        const review = await ReviewModel.create({
            productId,
            userId: userId || null,
            userDisplayName: userDisplayName || null,
            rating: r,
            title: title || null,
            text: String(text),
        });

        return res.status(201).json(review.toJSON());
    } catch (error: any) {
        console.error('Error creating review:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Sync database and start server
export const start = async () => {
    try {
        await connectToDatabase();
        console.log('Database connected (MongoDB)');

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

// Only listen when running this file directly (local dev / VM).
// In Vercel serverless, this module is imported and must NOT call listen().
// Guard against ESM bundles where `require` is not defined.
const isMainModule = typeof require !== 'undefined' && require.main === module;
if (isMainModule) {
    void start();
}
