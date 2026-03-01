# API Documentation

Complete API reference for Mango Order Management System Backend.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400,
    "errors": []
  }
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/signup
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "Password@123"
}
```

**Response:** User object with tokens

---

#### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response:** User object with tokens

---

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:** User profile data

---

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

---

#### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "oldPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

---

### Products

#### Get All Products
```http
GET /products?page=1&limit=12&category=<categoryId>&sortBy=price&sortOrder=asc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 12)
- `category` (optional): Filter by category ID
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort field (price, name, rating)
- `sortOrder` (optional): Sort order (asc, desc)
- `search` (optional): Search query

---

#### Get Product by ID
```http
GET /products/:id
```

**Response:** Product details with category and reviews

---

#### Get Featured Products
```http
GET /products/featured?limit=6
```

---

#### Search Products
```http
GET /products/search?q=alphonso
```

---

#### Get Categories
```http
GET /products/categories
```

---

#### Add Review
```http
POST /products/:id/reviews
Authorization: Bearer <token>
```

**Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product!"
}
```

---

### Orders

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "lotSize": "5kg",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "paymentMethod": "card"
}
```

---

#### Get User Orders
```http
GET /orders?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

---

#### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

---

#### Cancel Order
```http
PATCH /orders/:id/cancel
Authorization: Bearer <token>
```

**Body:**
```json
{
  "reason": "Changed my mind"
}
```

---

### Dashboard

#### Get User Stats
```http
GET /dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 10,
      "totalSpent": 500.00,
      "pendingOrders": 2,
      "deliveredOrders": 7
    }
  }
}
```

---

#### Get Order Trends
```http
GET /dashboard/charts/orders?period=month
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: day, week, month, year

---

### Admin Endpoints

All admin endpoints require admin role.

#### Get System Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer <admin_token>
```

---

#### Get All Orders
```http
GET /admin/orders?status=pending&page=1
Authorization: Bearer <admin_token>
```

---

#### Update Order Status
```http
PATCH /admin/orders/:id/status
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "estimatedDelivery": "2024-01-20"
}
```

---

#### Create Product
```http
POST /admin/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `name`: Product name
- `description`: Product description
- `category`: Category ID
- `prices[3kg]`: Price for 3kg
- `prices[5kg]`: Price for 5kg
- `prices[10kg]`: Price for 10kg
- `prices[20kg]`: Price for 20kg
- `stock`: Stock quantity
- `images`: Image files (multiple)

---

## Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes

## Pagination

List endpoints support pagination with `page` and `limit` query parameters.

**Response includes pagination metadata:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Error Handling

Errors include detailed information:
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "errors": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```
