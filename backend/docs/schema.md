# E-commerce Database Schema (Preview)

This is a quick preview of the tables and relationships created by the Sequelize models.

## ER Diagram

```mermaid
erDiagram
  USERS ||--o{ CARTS : has
  CARTS ||--o{ CART_ITEMS : contains
  PRODUCTS ||--o{ CART_ITEMS : in

  USERS ||--o{ ORDERS : places
  ORDERS ||--o{ ORDER_ITEMS : includes
  PRODUCTS ||--o{ ORDER_ITEMS : purchased

  ORDERS ||--o{ PAYMENTS : paid_by
  USERS ||--o{ PAYMENTS : makes

  USERS ||--o{ PAYMENT_METHODS : stores

  USERS {
    uuid id PK
    string username UK
    string email UK
    string mobile_number
    string password_hash
    string profile_picture_url
    timestamp created_at
    timestamp updated_at
  }

  PRODUCTS {
    uuid id PK
    string name
    string description
    int price_cents
    string currency
    string image_url
    boolean is_active
    timestamp created_at
    timestamp updated_at
  }

  CARTS {
    uuid id PK
    uuid user_id FK
    string status
    timestamp created_at
    timestamp updated_at
  }

  CART_ITEMS {
    uuid id PK
    uuid cart_id FK
    uuid product_id FK
    int quantity
    int unit_price_cents
    string currency
    timestamp created_at
    timestamp updated_at
  }

  ORDERS {
    uuid id PK
    uuid user_id FK
    string status
    int total_cents
    string currency
    timestamp created_at
    timestamp updated_at
  }

  ORDER_ITEMS {
    uuid id PK
    uuid order_id FK
    uuid product_id FK
    int quantity
    int unit_price_cents
    string currency
    timestamp created_at
    timestamp updated_at
  }

  PAYMENTS {
    uuid id PK
    uuid order_id FK
    uuid user_id FK
    string provider
    string provider_payment_id
    int amount_cents
    string currency
    string status
    timestamp created_at
    timestamp updated_at
  }

  PAYMENT_METHODS {
    uuid id PK
    uuid user_id FK
    string provider
    string provider_method_id
    string brand
    string last4
    int exp_month
    int exp_year
    boolean is_default
    string billing_name
    string billing_email
    timestamp created_at
    timestamp updated_at
  }
```

## Notes

- **Passwords** are stored as `password_hash` (never store plain text passwords).
- **Payment details**: this schema stores provider IDs/tokens + non-sensitive metadata (brand/last4/expiry). Do **not** store full card numbers or CVV.
