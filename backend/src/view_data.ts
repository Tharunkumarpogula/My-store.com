import { connectToDatabase, sequelize } from './db';
import { initModels } from './db/models';
import dotenv from 'dotenv';
import { Op } from 'sequelize';

dotenv.config();

const getArgValue = (name: string): string | undefined => {
    const idx = process.argv.findIndex(a => a === name || a.startsWith(`${name}=`));
    if (idx === -1) return undefined;
    const arg = process.argv[idx];
    if (arg.includes('=')) return arg.split('=')[1];
    return process.argv[idx + 1];
};

const viewData = async () => {
    try {
        await connectToDatabase();
        const models = initModels(sequelize);

        const date = getArgValue('--date');
        const ordersWhere: any = {};

        if (date) {
            const start = new Date(`${date}T00:00:00.000Z`);
            const end = new Date(`${date}T23:59:59.999Z`);
            if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
                console.error('Invalid --date. Use YYYY-MM-DD');
                process.exit(1);
            }
            ordersWhere.createdAt = { [Op.between]: [start, end] };
        }

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
            where: ordersWhere,
            order: [['createdAt', 'DESC']],
            include: [
                { model: models.User, as: 'user' },
                { model: models.OrderItem, as: 'items', include: [{ model: models.Product, as: 'product' }] },
                { model: models.Payment, as: 'payments' },
            ]
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
