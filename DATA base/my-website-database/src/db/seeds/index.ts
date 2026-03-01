import bcrypt from 'bcryptjs';
import { connectToDatabase, sequelize } from '..';
import { initModels } from '../models';

const main = async () => {
    try {
        await connectToDatabase();
        const { User, Product, Cart, CartItem, Order, OrderItem, Payment } = initModels(sequelize);

        const passwordHash = await bcrypt.hash('Password123!', 10);
        const user = await User.create({
            username: 'demo',
            email: 'demo@example.com',
            mobileNumber: '9999999999',
            passwordHash,
            profilePictureUrl: null,
        });

        const product1 = await Product.create({
            name: 'T-Shirt',
            description: 'Basic cotton t-shirt',
            priceCents: 1999,
            currency: 'USD',
            imageUrl: null,
            isActive: true,
        });

        const product2 = await Product.create({
            name: 'Sneakers',
            description: 'Comfortable everyday sneakers',
            priceCents: 5999,
            currency: 'USD',
            imageUrl: null,
            isActive: true,
        });

        const cart = await Cart.create({ userId: user.id, status: 'active' });
        await CartItem.bulkCreate([
            {
                cartId: cart.id,
                productId: product1.id,
                quantity: 2,
                unitPriceCents: product1.priceCents,
                currency: product1.currency,
            },
            {
                cartId: cart.id,
                productId: product2.id,
                quantity: 1,
                unitPriceCents: product2.priceCents,
                currency: product2.currency,
            },
        ]);

        const totalCents = 2 * product1.priceCents + 1 * product2.priceCents;
        const order = await Order.create({
            userId: user.id,
            status: 'paid',
            totalCents,
            currency: 'USD',
        });

        await OrderItem.bulkCreate([
            {
                orderId: order.id,
                productId: product1.id,
                quantity: 2,
                unitPriceCents: product1.priceCents,
                currency: 'USD',
            },
            {
                orderId: order.id,
                productId: product2.id,
                quantity: 1,
                unitPriceCents: product2.priceCents,
                currency: 'USD',
            },
        ]);

        await Payment.create({
            orderId: order.id,
            userId: user.id,
            provider: 'demo',
            providerPaymentId: 'demo_txn_001',
            amountCents: totalCents,
            currency: 'USD',
            status: 'succeeded',
        });

        const hydratedOrder = await Order.findByPk(order.id, {
            include: [{ association: 'items' }, { association: 'payments' }],
        });

        console.log('Seed data inserted successfully.');
        console.log('Example order (with items + payments):');
        console.log(JSON.stringify(hydratedOrder?.toJSON(), null, 2));
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

void main();