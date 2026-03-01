import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'mywebsite',
    dialect: (process.env.DB_DIALECT ?? 'postgres') as 'postgres' | 'sqlite',
    sqliteStorage: process.env.DB_SQLITE_STORAGE ?? './dev.sqlite',
  },
};

export default config;