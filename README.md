# 🥐 Crème & Coffee | Artisan Bakery & Café

An artisan bakery and coffee shop web application crafted with pure HTML5, modern CSS3, and modular vanilla JavaScript.

---

## 📁 Project Architecture & File Organization

The project is structured into clean, intuitive directories:

```
Pastries/
├── index.html                 # Main website entry point
├── README.md                  # Documentation and project guide
├── css/
│   └── style.css              # Custom styling, typography, themes & responsive layouts
├── js/
│   └── app.js                 # Structured application logic & state management
└── data/
    ├── product.json           # Initial product catalog (categories, pricing, details)
    └── architecture.json      # System architecture specification
```

---

## ✨ Features & Arranged Highlights

### 1. 🗂 Arranged Product Catalog
- **Category Sections & Tabs**: Products are neatly arranged into categories (**🥐 Pastries**, **☕ Coffee**, **🍰 Cakes**).
- **Interactive Category Filtering**: One-click filter tabs to view specific categories or all items with item counts.
- **Multiple Sorting Options**:
  - Featured / Grouped Category View
  - Price: Low to High
  - Price: High to Low
  - Name: A to Z / Z to A
- **Instant Search**: Real-time search with keyword stemming.
- **Visual Category Badges**: Every product card displays a chic category badge.

### 2. 🛒 Shopping Cart & Orders
- Customer cart management with real-time total calculations.
- Quantity increment / decrement and item removal.
- One-click checkout with order history tracking.

### 3. 🔐 User & Admin Dashboards
- **Customer Account**: Registration, login, active shopping cart, and order status tracking.
- **Administrator Dashboard**:
  - Real-time statistics: Total Products, Registered Users, Total Orders.
  - Full Product CRUD (Add new items with image & category, Edit price/description, Delete).
  - Customer order status updates (`Pending`, `Preparing`, `Completed`, `Cancelled`).

### 4. 📐 System Architecture Viewer
- Visual layer-by-layer breakdown of the client-side MVC/Flux flow.
- Fallback support for running offline or via `file://`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@creme.com` | `admin123` |
| **Customer** | *(Register any account in the Register tab)* | *(Your choice)* |

---

## 🚀 How to Run

### Method 1: Local Server (Recommended)
You can serve the directory with any static server:
```bash
# Using Python
python -m http.server 8000

# Using Node / npx
npx serve
```
Then visit `http://localhost:8000` in your web browser.

### Method 2: Direct Open
Double-click `index.html` to open directly in any modern browser. Built-in fallbacks ensure the catalog and architecture load smoothly even on `file://`.
