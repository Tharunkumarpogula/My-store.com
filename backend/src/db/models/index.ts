import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare mobileNumber: string;
  declare passwordHash: string;
  declare role: CreationOptional<'customer' | 'retailer'>;
  declare profilePictureUrl: CreationOptional<string | null>;

  // Retailer specific fields
  declare businessMode: CreationOptional<string | null>;
  declare shopCategory: CreationOptional<string | null>;
  declare businessVerificationStatus: CreationOptional<'pending' | 'verified' | 'rejected' | null>;
  declare photoIdUrl: CreationOptional<string | null>;

  declare carts?: NonAttribute<Cart[]>;
  declare orders?: NonAttribute<Order[]>;
  declare paymentMethods?: NonAttribute<PaymentMethod[]>;
  declare products?: NonAttribute<Product[]>; // Products owned by retailer
}

export class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>; // Retailer ID
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare priceCents: number;
  declare currency: CreationOptional<string>;
  declare imageUrl: CreationOptional<string | null>;
  declare category: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
}

export class Cart extends Model<InferAttributes<Cart>, InferCreationAttributes<Cart>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare status: CreationOptional<'active' | 'converted' | 'abandoned'>;

  declare user?: NonAttribute<User>;
  declare items?: NonAttribute<CartItem[]>;
}

export class CartItem extends Model<InferAttributes<CartItem>, InferCreationAttributes<CartItem>> {
  declare id: CreationOptional<string>;
  declare cartId: ForeignKey<Cart['id']>;
  declare productId: ForeignKey<Product['id']>;
  declare quantity: number;
  declare unitPriceCents: number;
  declare currency: CreationOptional<string>;

  declare cart?: NonAttribute<Cart>;
  declare product?: NonAttribute<Product>;
}

export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare status: CreationOptional<'pending' | 'paid' | 'cancelled' | 'refunded'>;
  declare totalCents: number;
  declare currency: CreationOptional<string>;

  declare user?: NonAttribute<User>;
  declare items?: NonAttribute<OrderItem[]>;
  declare payments?: NonAttribute<Payment[]>;
}

export class OrderItem extends Model<InferAttributes<OrderItem>, InferCreationAttributes<OrderItem>> {
  declare id: CreationOptional<string>;
  declare orderId: ForeignKey<Order['id']>;
  declare productId: ForeignKey<Product['id']>;
  declare quantity: number;
  declare unitPriceCents: number;
  declare currency: CreationOptional<string>;

  declare order?: NonAttribute<Order>;
  declare product?: NonAttribute<Product>;
}

export class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare orderId: ForeignKey<Order['id']>;
  declare userId: ForeignKey<User['id']>;
  declare provider: string;
  declare providerPaymentId: CreationOptional<string | null>;
  declare amountCents: number;
  declare currency: CreationOptional<string>;
  declare status: CreationOptional<'initiated' | 'succeeded' | 'failed' | 'refunded'>;

  declare order?: NonAttribute<Order>;
  declare user?: NonAttribute<User>;
}

export class PaymentMethod extends Model<InferAttributes<PaymentMethod>, InferCreationAttributes<PaymentMethod>> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User['id']>;
  declare provider: string;
  declare providerMethodId: string;
  declare brand: CreationOptional<string | null>;
  declare last4: CreationOptional<string | null>;
  declare expMonth: CreationOptional<number | null>;
  declare expYear: CreationOptional<number | null>;
  declare isDefault: CreationOptional<boolean>;
  declare billingName: CreationOptional<string | null>;
  declare billingEmail: CreationOptional<string | null>;

  declare user?: NonAttribute<User>;
}

export type DbModels = {
  User: typeof User;
  Product: typeof Product;
  Cart: typeof Cart;
  CartItem: typeof CartItem;
  Order: typeof Order;
  OrderItem: typeof OrderItem;
  Payment: typeof Payment;
  PaymentMethod: typeof PaymentMethod;
};

let modelsCache: DbModels | null = null;

export const initModels = (sequelize: Sequelize): DbModels => {
  if (modelsCache) return modelsCache;

  User.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
      mobileNumber: { type: DataTypes.STRING(20), allowNull: false },
      passwordHash: { type: DataTypes.TEXT, allowNull: false },
      role: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'customer' },
      profilePictureUrl: { type: DataTypes.TEXT, allowNull: true },
      businessMode: { type: DataTypes.STRING(50), allowNull: true },
      shopCategory: { type: DataTypes.STRING(50), allowNull: true },
      businessVerificationStatus: { type: DataTypes.STRING(16), allowNull: true },
      photoIdUrl: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize, tableName: 'users' },
  );

  Product.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: true }, // Optional for now
      name: { type: DataTypes.TEXT, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priceCents: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'INR' },
      imageUrl: { type: DataTypes.TEXT, allowNull: true },
      category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'electronics' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'products' },
  );

  Cart.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'active' },
    },
    {
      sequelize,
      tableName: 'carts',
      indexes: [{ unique: false, fields: ['user_id', 'status'] }],
    },
  );

  CartItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      cartId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unitPriceCents: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    },
    {
      sequelize,
      tableName: 'cart_items',
      indexes: [{ unique: true, fields: ['cart_id', 'product_id'] }],
    },
  );

  Order.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'pending' },
      totalCents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    },
    { sequelize, tableName: 'orders' },
  );

  OrderItem.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      orderId: { type: DataTypes.UUID, allowNull: false },
      productId: { type: DataTypes.UUID, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unitPriceCents: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
    },
    { sequelize, tableName: 'order_items' },
  );

  Payment.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      orderId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      provider: { type: DataTypes.STRING(64), allowNull: false },
      providerPaymentId: { type: DataTypes.STRING(128), allowNull: true },
      amountCents: { type: DataTypes.INTEGER, allowNull: false },
      currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'initiated' },
    },
    { sequelize, tableName: 'payments' },
  );

  PaymentMethod.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      provider: { type: DataTypes.STRING(64), allowNull: false },
      providerMethodId: { type: DataTypes.STRING(191), allowNull: false },
      brand: { type: DataTypes.STRING(32), allowNull: true },
      last4: { type: DataTypes.STRING(4), allowNull: true },
      expMonth: { type: DataTypes.INTEGER, allowNull: true },
      expYear: { type: DataTypes.INTEGER, allowNull: true },
      isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      billingName: { type: DataTypes.TEXT, allowNull: true },
      billingEmail: { type: DataTypes.STRING(254), allowNull: true },
    },
    {
      sequelize,
      tableName: 'payment_methods',
      indexes: [{ unique: true, fields: ['provider', 'provider_method_id'] }],
    },
  );

  // Associations
  User.hasMany(Cart, { foreignKey: 'userId', as: 'carts' });
  Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
  CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
  Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
  CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments', onDelete: 'CASCADE' });
  Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
  Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(PaymentMethod, { foreignKey: 'userId', as: 'paymentMethods', onDelete: 'CASCADE' });
  PaymentMethod.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
  Product.belongsTo(User, { foreignKey: 'userId', as: 'retailer' });

  modelsCache = {
    User,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    PaymentMethod,
  };

  return modelsCache;
};