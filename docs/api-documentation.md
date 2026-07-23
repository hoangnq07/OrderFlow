# OrderFlow — REST API Reference Documentation

Base API Endpoint: `http://localhost:8080/api/v1`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 1. Authentication APIs (`/api/v1/auth`)

### 1.1 Register User
- **POST** `/api/v1/auth/register`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe"
}
```
- **Response `201 Created`**:
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "USER"
  }
}
```

### 1.2 Login User
- **POST** `/api/v1/auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "status": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "d7a8b9c0...",
    "tokenType": "Bearer",
    "expiresIn": 900000
  }
}
```

---

## 2. Product & Category APIs (`/api/v1/products`, `/api/v1/categories`)

### 2.1 List Products (Paginated)
- **GET** `/api/v1/products?page=0&size=10&sortBy=id&sortDir=asc`
- **Auth**: Public
- **Response `200 OK`**:
```json
{
  "status": 200,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Laptop Gaming Pro",
        "slug": "laptop-gaming-pro",
        "description": "High performance laptop",
        "price": 1299.99,
        "stock": 50,
        "categoryId": 1,
        "categoryName": "Electronics",
        "imageUrl": "https://example.com/laptop.jpg",
        "active": true
      }
    ],
    "pageNo": 0,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

### 2.2 Product Detail (Cached)
- **GET** `/api/v1/products/{id}`
- **Auth**: Public

### 2.3 Full-Text Search
- **GET** `/api/v1/products/search?q=laptop`
- **Auth**: Public

### 2.4 Create Product (Admin Only)
- **POST** `/api/v1/products`
- **Auth**: `ADMIN`

---

## 3. Redis Shopping Cart APIs (`/api/v1/cart`)

### 3.1 Get Cart
- **GET** `/api/v1/cart`
- **Auth**: `USER` / `ADMIN`
- **Response `200 OK`**:
```json
{
  "status": 200,
  "data": {
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "productName": "Laptop Gaming Pro",
        "unitPrice": 1299.99,
        "quantity": 2,
        "subtotal": 2599.98
      }
    ],
    "totalAmount": 2599.98,
    "totalItems": 2
  }
}
```

### 3.2 Add Item to Cart
- **POST** `/api/v1/cart/items`
- **Auth**: `USER`
- **Request Body**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

---

## 4. Order APIs (`/api/v1/orders`, `/api/v1/admin/orders`)

### 4.1 Create Order
- **POST** `/api/v1/orders`
- **Auth**: `USER`
- **Request Body**:
```json
{
  "shippingAddress": "123 Main St, New York, NY",
  "note": "Please deliver during business hours"
}
```
- **Response `201 Created`**:
```json
{
  "status": 201,
  "message": "Order created successfully",
  "data": {
    "id": 101,
    "userId": 1,
    "status": "PENDING",
    "totalAmount": 2599.98,
    "shippingAddress": "123 Main St, New York, NY",
    "items": [
      {
        "productId": 1,
        "productName": "Laptop Gaming Pro",
        "quantity": 2,
        "unitPrice": 1299.99,
        "subtotal": 2599.98
      }
    ],
    "createdAt": "2026-07-23T14:00:00Z"
  }
}
```

### 4.2 List My Orders
- **GET** `/api/v1/orders?page=0&size=10`
- **Auth**: `USER`

### 4.3 Update Order Status (Admin Only)
- **PUT** `/api/v1/admin/orders/{id}/status`
- **Auth**: `ADMIN`
- **Request Body**:
```json
{
  "status": "CONFIRMED"
}
```
