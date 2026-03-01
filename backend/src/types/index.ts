export interface User {
    id: string;
    username: string;
    email: string;
    mobileNumber: string;
    passwordHash: string;
    profilePictureUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    priceCents: number;
    currency: string;
    imageUrl?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPriceCents: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPriceCents: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    provider: string;
    providerPaymentId?: string | null;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}