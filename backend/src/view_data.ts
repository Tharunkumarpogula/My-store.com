import { connectToDatabase, sequelize } from './db';
import { initModels } from './db/models';
import dotenv from 'dotenv';

dotenv.config();

const viewData = async () => {
    try {
        await connectToDatabase();
        const models = initModels(sequelize);

        console.log('\n--- USERS ---');
        const users = await models.User.findAll();
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            console.table(users.map(u => ({
                id: u.id,
                username: u.username,
                email: u.email,
                mobile: u.mobileNumber
            })));
        }

        console.log('\n--- ORDERS ---');
        const orders = await models.Order.findAll({
            include: [{ model: models.User, as: 'user' }]
        });
        if (orders.length === 0) {
            console.log('No orders found.');
        } else {
            console.table(orders.map(o => ({
                id: o.id,
                user: o.user?.username || 'Unknown',
                status: o.status,
                total: `₹ ${(o.totalCents / 100).toLocaleString()}`,
                date: (o as any).createdAt
            })));
        }

        console.log('\n--- PRODUCTS ---');
        const products = await models.Product.findAll();
        if (products.length === 0) {
            console.log('No products found.');
        } else {
            console.table(products.map(p => ({
                id: p.id,
                name: p.name,
                price: `₹ ${(p.priceCents / 100).toLocaleString()}`,
                active: p.isActive
            })));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error viewing data:', error);
        process.exit(1);
    }
};

viewData();
