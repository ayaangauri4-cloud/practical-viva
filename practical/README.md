# Secure E-Commerce API

Production-style Express backend for a multi-user e-commerce system with JWT authentication, role-based access control, product management, and order placement.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs password hashing
- JWT access and refresh tokens
- Joi request validation
- express-rate-limit anti-spam protection
- Helmet, CORS, Morgan

## Data Structures

```js
User: {
  id,
  name,
  email,
  passwordHash,
  role,
  createdAt
}

Product: {
  id,
  name,
  price,
  stock,
  category
}

Order: {
  id,
  userId,
  products: [{ productId, quantity }],
  totalAmount,
  status,
  createdAt
}
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` with your MongoDB connection string and strong JWT secrets.

## API Routes

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

Register body:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "secret123",
  "role": "admin"
}
```

Login returns:

```json
{
  "user": {},
  "accessToken": "...",
  "refreshToken": "..."
}
```

Use protected routes with:

```http
Authorization: Bearer <accessToken>
```

### Products

```http
GET    /api/products
POST   /api/products        # admin only
PUT    /api/products/:id    # admin only
DELETE /api/products/:id    # admin only
```

Product body:

```json
{
  "name": "Keyboard",
  "price": 2499,
  "stock": 10,
  "category": "Electronics"
}
```

### Orders

```http
POST /api/orders
GET  /api/orders/mine
GET  /api/orders/:id/total
```

Place order body:

```json
{
  "products": [
    {
      "productId": "6630f5a16ff62b86bc8f10a1",
      "quantity": 2
    }
  ]
}
```

## Logic Challenge

`calculateTotal(orderId)` is exported from `src/controllers/order.controller.js`.

It loads the order, fetches the current product prices, and dynamically computes:

```js
sum(product.price * quantity)
```

Endpoint:

```http
GET /api/orders/:id/total
```

## Security Features

- Passwords are stored as bcrypt hashes.
- Access tokens protect private routes.
- Refresh tokens can generate new access tokens.
- Admin-only middleware protects product create/update/delete.
- Joi strips unknown fields and validates request bodies.
- Rate limiting applies to all `/api` routes.
- Orders reject missing products and out-of-stock quantities.
- Duplicate product lines in one order are merged before stock checks.
- Stock is decremented with conditional updates and restored if order creation fails.
