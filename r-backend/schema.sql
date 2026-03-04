-- Revised Database Schema for My-store.com (R Backend)
-- Matches the existing TypeScript model structure

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    priceCents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    imageUrl TEXT,
    isActive BOOLEAN DEFAULT 1,
    category TEXT
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    mobileNumber TEXT,
    passwordHash TEXT NOT NULL
);

-- Seed Initial Data for Products
DELETE FROM products;
INSERT INTO products (id, name, description, priceCents, currency, imageUrl, category) VALUES 
('p1', 'Classic Watch', 'Elegant timeless piece', 19999, 'USD', 'images/p1.png', 'Accessories'),
('p2', 'Smart Phone X', 'Latest technology in your hand', 89900, 'USD', 'images/p2.png', 'Electronics'),
('p3', 'Wireless Headphones', 'Crystal clear sound', 14950, 'USD', 'images/p3.png', 'Electronics'),
('p4', 'Running Shoes', 'Comfort for your feet', 7999, 'USD', 'images/p4.png', 'Fashion');
