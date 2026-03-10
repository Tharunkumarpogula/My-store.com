import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { connectToDatabase, sequelize } from './db';
import { initModels } from './db/models';
import { Op } from 'sequelize';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Models
const models = initModels(sequelize);

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = process.env.ADMIN_TOKEN;
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

        const product = await models.Product.create({
            name,
            description,
            priceCents: Math.round(Number(price) * 100),
            currency: 'INR',
            imageUrl: imageUrl || 'images/product-placeholder.jpg',
            category,
            userId, // Link to retailer
            isActive: true
        });

        res.status(201).json(product);
    } catch (error: any) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const category = typeof req.query.category === 'string' ? req.query.category : undefined;
        const where: any = { isActive: true };
        if (category) {
            where.category = category;
        }
        const products = await models.Product.findAll({ where });
        res.json(products);
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
        const products = await models.Product.findAll({ where: { id: { [Op.in]: productIds } } });
        const productsById = new Map(products.map(p => [p.id, p] as const));
        const missing = productIds.filter(id => !productsById.has(id));

        if (missing.length > 0) {
            return res.status(400).json({
                error: 'Some productIds were not found in the database. Make sure the frontend loaded products from the backend before checkout.',
                missingProductIds: missing,
            });
        }

        const [user] = await models.User.findOrCreate({
            where: { email },
            defaults: {
                username: `guest_${crypto.randomBytes(6).toString('hex')}`,
                email,
                mobileNumber,
                // Placeholder: this project does not yet implement password hashing/auth for guests.
                passwordHash: crypto.randomBytes(24).toString('hex'),
                profilePictureUrl: null,
            },
        });

        const currency = String(body.currency ?? 'INR');

        const orderItems = normalizedItems.map((i: any) => {
            const product = productsById.get(i.productId)!;
            return {
                productId: product.id,
                quantity: i.quantity,
                unitPriceCents: product.priceCents,
                currency: product.currency ?? currency,
            };
        });

        const totalCents = orderItems.reduce((sum: number, i: any) => sum + i.unitPriceCents * i.quantity, 0);

        const result = await sequelize.transaction(async (t) => {
            const order = await models.Order.create(
                {
                    userId: user.id,
                    status: 'pending',
                    totalCents,
                    currency,
                },
                { transaction: t },
            );

            await models.OrderItem.bulkCreate(
                orderItems.map((i: any) => ({
                    ...i,
                    orderId: order.id,
                })),
                { transaction: t },
            );

            await models.Payment.create(
                {
                    orderId: order.id,
                    userId: user.id,
                    provider: paymentMethod,
                    providerPaymentId: null,
                    amountCents: totalCents,
                    currency,
                    status: paymentMethod === 'cod' ? 'initiated' : 'initiated',
                },
                { transaction: t },
            );

            return order;
        });

        return res.status(201).json({ orderId: result.id });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const where: any = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
                return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
            }

            where.createdAt = { [Op.between]: [start, end] };
        }

        const orders = await models.Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: models.User, as: 'user' },
                {
                    model: models.OrderItem,
                    as: 'items',
                    include: [{ model: models.Product, as: 'product' }],
                },
                { model: models.Payment, as: 'payments' },
            ],
        });

        return res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const where: any = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);

            if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
                return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD' });
            }

            where.createdAt = { [Op.between]: [start, end] };
        }

        const orders = await models.Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: models.User, as: 'user' },
                {
                    model: models.OrderItem,
                    as: 'items',
                    include: [{ model: models.Product, as: 'product' }],
                },
                { model: models.Payment, as: 'payments' },
            ],
        });

        return res.json(orders);
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, mobileNumber, password, role, businessMode, shopCategory, photoIdUrl } = req.body;
        // Note: In a real app, we'd hash the password here
        const user = await models.User.create({
            username,
            email,
            mobileNumber,
            passwordHash: password, // Placeholder for hashed password
            role: role || 'customer',
            businessMode,
            shopCategory,
            photoIdUrl,
            businessVerificationStatus: role === 'retailer' ? 'pending' : null
        });
        res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error: any) {
        console.error('Error registering user:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await models.User.findOne({ where: { email } });

        if (!user || user.passwordHash !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            businessVerificationStatus: user.businessVerificationStatus
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Sync database and start server
const start = async () => {
    try {
        await connectToDatabase();
        console.log('Database connected');

        // In dev, we might want to sync models
        // await sequelize.sync({ alter: true });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

start();
