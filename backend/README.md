# My Website Database

This project bootstraps a PostgreSQL database for an e-commerce website using Node.js + TypeScript + Sequelize.

It includes:
- Models for users, products, carts, orders, and payments
- A simple migration script (`npm run migrate`) that creates tables based on the models
- A seed script (`npm run seed`) that inserts demo data

## Project Structure

```
my-website-database
├── src
│   ├── app.ts               # Entry point of the application
│   ├── config
│   │   └── index.ts         # Configuration settings
│   ├── db
│   │   ├── index.ts         # Database connection and setup
│   │   ├── migrations
│   │   │   └── index.ts     # Database migration functions
│   │   ├── models
│   │   │   └── index.ts     # Data models
│   │   └── seeds
│   │       └── index.ts     # Seed data functions
│   └── types
│       └── index.ts         # TypeScript interfaces and types
├── package.json              # npm configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-website-database
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create your environment file:
   - Copy `.env.example` to `.env`
   - Adjust `DB_HOST`, `DB_USER`, `DB_PASSWORD` as needed

5. Start PostgreSQL (choose one):

   Option A (recommended): Docker
   ```
   docker compose up -d
   ```

   Option B: Existing PostgreSQL install
   - Ensure PostgreSQL is running and reachable on `DB_HOST:DB_PORT`
   - Create the database (example): open and run `../CREATE DATABASE mywebsite;.sql`

6. Create tables:
   ```
   npm run migrate
   ```

7. Insert demo data (optional):
   ```
   npm run seed
   ```

8. Quick DB connectivity check:
   ```
   npm start
   ```

## Local Preview (recommended)

1. Start Docker Desktop (must be running).
2. Start Postgres:
   ```
   docker compose up -d
   ```
3. Create tables + seed products:
   ```
   npm run migrate
   npm run seed
   ```
4. Start API server:
   ```
   npm start
   ```

### View daily orders

- API endpoint (in browser):
  - `http://localhost:3000/api/admin/orders`
  - `http://localhost:3000/api/admin/orders?date=YYYY-MM-DD`
- CLI:
  ```
  npm run view-data -- --date=YYYY-MM-DD
  ```

### Instant preview mode (no Postgres/Docker)

If you just want to see it working immediately, use SQLite:

1. Set these env vars in `.env`:
   ```
   DB_DIALECT=sqlite
   DB_SQLITE_STORAGE=./dev.sqlite
   ```
2. Run:
   ```
   npm run migrate
   npm run seed
   ```

The seed script will print an example order with its items + payments.

## Usage Guidelines

- Models are defined in `src/db/models/index.ts`.
- The migration script in `src/db/migrations/index.ts` currently uses `sequelize.sync()` to create missing tables.
   If you later need production-grade, versioned migrations, we can switch to `sequelize-cli` migrations.
- The seed script in `src/db/seeds/index.ts` inserts sample users/products/cart/order/payment rows.

Security note: do not store full card numbers or CVV in your database. Store only provider tokens/IDs + non-sensitive card metadata (e.g., brand, last4, expiry) if needed.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.