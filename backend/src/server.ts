import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, sequelize } from './db';
import { initModels } from './db/models';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Models
const models = initModels(sequelize);

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await models.Product.findAll({
            where: { isActive: true }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, mobileNumber, password } = req.body;
        // Note: In a real app, we'd hash the password here
        const user = await models.User.create({
            username,
            email,
            mobileNumber,
            passwordHash: password, // Placeholder for hashed password
        });
        res.status(201).json({ id: user.id, username: user.username, email: user.email });
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

        res.json({ id: user.id, username: user.username, email: user.email });
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
