/**
 * ==============================================================================
 * CRÈME & COFFEE WEB APPLICATION
 * Clean, structured and modular client-side application architecture.
 * ==============================================================================
 */

// ==============================================================================
// 1. CONSTANTS & CONFIGURATION
// ==============================================================================

const STORAGE_KEYS = {
    USERS: "cc_users",
    PRODUCTS: "cc_products",
    ORDERS: "cc_orders",
    CURRENT_USER: "cc_currentUser",
    CART: "cc_cart"
};

const DEFAULT_ADMIN = {
    name: "Administrator",
    email: "admin@creme.com",
    password: "admin123",
    role: "admin"
};

// Category Icons / Emojis for arranged grouped view
const CATEGORY_ICONS = {
    "Pastries": "🥐",
    "Coffee": "☕",
    "Cakes": "🍰"
};

// ==============================================================================
// 2. FALLBACK DATA (For local file:// execution without web server)
// ==============================================================================

const FALLBACK_PRODUCTS = [
    {
        id: 1,
        name: "Butter Croissant",
        category: "Pastries",
        description: "Golden, flaky and buttery goodness in every bite.",
        price: 150,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700"
    },
    {
        id: 2,
        name: "Artisan Bread",
        category: "Pastries",
        description: "Freshly baked bread with a soft and delicious center.",
        price: 200,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700"
    },
    {
        id: 3,
        name: "Classic Cappuccino",
        category: "Coffee",
        description: "Rich espresso topped with smooth creamy milk foam.",
        price: 280,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700"
    },
    {
        id: 4,
        name: "Chocolate Cake",
        category: "Cakes",
        description: "Moist chocolate cake with rich chocolate frosting.",
        price: 150,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700"
    },
    {
        id: 5,
        name: "Iced Coffee",
        category: "Coffee",
        description: "A refreshing coffee blend for everyday cravings.",
        price: 95,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700"
    },
    {
        id: 6,
        name: "Vanilla Cupcakes",
        category: "Pastries",
        description: "Soft vanilla cupcakes topped with sweet buttercream.",
        price: 75,
        image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=700"
    }
];

const FALLBACK_ARCHITECTURE = {
    layers: [
        {
            name: "Client: what visitors see (index.html + css/style.css)",
            items: [
                "Home, Menu, About, Contact",
                "Login and Register forms",
                "Customer dashboard",
                "Admin dashboard"
            ]
        },
        {
            name: "Application logic (js/app.js)",
            items: [
                "Session and role guard",
                "Search, category filtering, cart and checkout",
                "Product, order and customer management"
            ]
        },
        {
            name: "Data (JSON + browser storage)",
            items: [
                "data/product.json: starting catalogue",
                "localStorage: users, products, orders, cart, session"
            ]
        }
    ],
    roles: [
        { role: "Guest", can: "Browse and search the menu. Adding to the cart asks them to log in." },
        { role: "Customer", can: "Register, log in, fill a cart, place orders and follow each order's status." },
        { role: "Admin", can: "Add, edit and delete products, change order status, and see customers and orders." }
    ],
    production: "This version keeps everything in the browser, so it is a demo. For real customers, move users, products and orders to a server API with a database, hash passwords, and check roles on the server."
};

// ==============================================================================
// 3. STORAGE & STATE MANAGEMENT
// ==============================================================================

const Storage = {
    get(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Could not save " + key, error);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Could not remove " + key, error);
        }
    }
};

// Application State
let users = Storage.get(STORAGE_KEYS.USERS, []);
let products = Storage.get(STORAGE_KEYS.PRODUCTS, null);
let orders = Storage.get(STORAGE_KEYS.ORDERS, []);
let currentUser = Storage.get(STORAGE_KEYS.CURRENT_USER, null);
let cart = Storage.get(STORAGE_KEYS.CART, []);

// UI Filter / Sort State
let selectedCategory = "all";
let currentSort = "featured";
let searchQuery = "";

// ==============================================================================
// 4. INITIALIZATION & DATA LOADING
// ==============================================================================

async function initialize() {
    if (!products) {
        try {
            // First try structured path data/product.json, fallback to root product.json
            let response = await fetch("data/product.json");
            if (!response.ok) {
                response = await fetch("product.json");
            }
            if (!response.ok) throw new Error("Could not load products JSON");

            const data = await response.json();
            products = data.products;
            Storage.set(STORAGE_KEYS.PRODUCTS, products);
        } catch (error) {
            console.warn(error.message + " - using built-in catalog data.");
            products = FALLBACK_PRODUCTS.map(product => ({ ...product }));
        }
    }

    renderCategoryTabs();
    renderProducts();
    updateHeader();

    if (currentUser) {
        showDashboard();
    } else {
        showPage("home");
    }

    setupEventListeners();
}

// ==============================================================================
// 5. ROUTING & PAGE NAVIGATION
// ==============================================================================

function showPage(page) {
    if (["userDashboard", "adminDashboard"].includes(page)) {
        if (!currentUser) {
            alert("Please login first.");
            page = "login";
        }
    }

    if (page === "adminDashboard" && currentUser?.role !== "admin") {
        alert("Administrator access required.");
        page = "home";
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    const target = document.getElementById(page);
    if (target) {
        target.classList.remove("hidden");
    }

    if (page === "menu") {
        renderCategoryTabs();
        renderProducts();
    }
    if (page === "architecture") renderArchitecture();
    if (page === "adminDashboard") renderAdmin();
    if (page === "userDashboard") renderUser();
}

function showDashboard() {
    if (currentUser?.role === "admin") {
        showPage("adminDashboard");
    } else if (currentUser) {
        showPage("userDashboard");
    }
}

// ==============================================================================
// 6. HEADER & SESSION CONTROLS
// ==============================================================================

function updateHeader() {
    const header = document.getElementById("headerActions");
    if (!header) return;

    if (!currentUser) {
        header.innerHTML = `
            <button class="outline-btn" onclick="showPage('login')">Login</button>
            <button class="main-btn" onclick="showPage('register')">Register</button>
        `;
        return;
    }

    header.innerHTML = `
        <button class="outline-btn" onclick="showDashboard()">My Account</button>
        <button class="main-btn" onclick="logout()">Logout</button>
    `;
}

// ==============================================================================
// 7. AUTHENTICATION (Register, Login, Logout)
// ==============================================================================

function setupEventListeners() {
    // Registration Form
    const regForm = document.getElementById("registerForm");
    if (regForm) {
        regForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const name = document.getElementById("regName").value.trim();
            const email = document.getElementById("regEmail").value.trim().toLowerCase();
            const password = document.getElementById("regPassword").value;
            const confirm = document.getElementById("regConfirm").value;

            if (password !== confirm) {
                alert("Passwords do not match.");
                return;
            }

            users = Storage.get(STORAGE_KEYS.USERS, []);
            const existing = users.find(user => user.email === email);

            if (existing || email === DEFAULT_ADMIN.email) {
                alert("Email address already registered.");
                return;
            }

            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                role: "user"
            };

            users.push(newUser);
            Storage.set(STORAGE_KEYS.USERS, users);

            alert("Registration successful! Please login.");
            this.reset();
            showPage("login");
        });
    }

    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;

            let account = null;

            if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
                account = DEFAULT_ADMIN;
            } else {
                users = Storage.get(STORAGE_KEYS.USERS, []);
                account = users.find(user => user.email === email && user.password === password);
            }

            if (!account) {
                alert("Invalid email or password.");
                return;
            }

            currentUser = {
                name: account.name,
                email: account.email,
                role: account.role,
                id: account.id || "admin"
            };

            Storage.set(STORAGE_KEYS.CURRENT_USER, currentUser);

            cart = Storage.get("cc_cart_" + currentUser.email, []);
            Storage.set(STORAGE_KEYS.CART, cart);

            this.reset();
            updateHeader();
            showDashboard();
        });
    }

    // Admin Add Product Form
    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", function(event) {
            event.preventDefault();

            if (currentUser?.role !== "admin") {
                alert("Unauthorized access.");
                return;
            }

            const product = {
                id: Date.now(),
                name: document.getElementById("productName").value.trim(),
                description: document.getElementById("productDescription").value.trim(),
                price: Number(document.getElementById("productPrice").value),
                image: document.getElementById("productImage").value.trim(),
                category: document.getElementById("productCategory").value
            };

            if (!product.name || !product.description || !product.image || product.price <= 0) {
                alert("Please enter valid product details.");
                return;
            }

            products.push(product);
            Storage.set(STORAGE_KEYS.PRODUCTS, products);

            this.reset();
            renderAdmin();
            renderCategoryTabs();
            renderProducts();

            alert("Product successfully added!");
        });
    }
}

function logout() {
    currentUser = null;
    cart = [];

    Storage.remove(STORAGE_KEYS.CURRENT_USER);
    Storage.remove(STORAGE_KEYS.CART);

    updateHeader();
    showPage("home");

    alert("You have successfully logged out.");
}

// ==============================================================================
// 8. MENU & PRODUCT CATALOG (Arranging, Category Filtering & Sorting)
// ==============================================================================

function getCategories() {
    const list = products || [];
    const set = new Set();
    list.forEach(p => {
        if (p.category) set.add(p.category);
    });
    return Array.from(set);
}

function renderCategoryTabs() {
    const container = document.getElementById("categoryTabs");
    if (!container) return;

    const categories = getCategories();
    let html = `
        <button class="category-btn ${selectedCategory === 'all' ? 'active' : ''}"
            onclick="filterCategory('all')">
            All Items (${(products || []).length})
        </button>
    `;

    categories.forEach(cat => {
        const count = (products || []).filter(p => p.category === cat).length;
        const icon = CATEGORY_ICONS[cat] ? CATEGORY_ICONS[cat] + " " : "";
        const isActive = selectedCategory === cat ? "active" : "";
        html += `
            <button class="category-btn ${isActive}"
                onclick="filterCategory('${escapeHTML(cat)}')">
                ${icon}${escapeHTML(cat)} (${count})
            </button>
        `;
    });

    container.innerHTML = html;
}

function filterCategory(category) {
    selectedCategory = category;
    renderCategoryTabs();
    renderProducts();
}

function handleSort(order) {
    currentSort = order;
    renderProducts();
}

function handleSearch() {
    searchQuery = (document.getElementById("searchProduct")?.value || "").trim().toLowerCase();
    renderProducts();
}

function sortProductsList(list) {
    const sorted = [...list];
    switch (currentSort) {
        case "price-asc":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-desc":
            return sorted.sort((a, b) => b.price - a.price);
        case "name-asc":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case "featured":
        default:
            return sorted;
    }
}

function renderProductCard(product) {
    const icon = CATEGORY_ICONS[product.category] ? CATEGORY_ICONS[product.category] + " " : "";
    return `
        <article class="product-card">
            <div class="product-image-container">
                <img src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy">
                <span class="category-badge">${icon}${escapeHTML(product.category || 'General')}</span>
            </div>

            <div class="product-info">
                <h3>${escapeHTML(product.name)}</h3>
                <p>${escapeHTML(product.description)}</p>
                <div class="product-footer">
                    <span class="price">₱${Number(product.price).toFixed(2)}</span>
                </div>
                <button class="main-btn" onclick="addToCart(${Number(product.id)})">
                    Add to Cart
                </button>
            </div>
        </article>
    `;
}

function renderProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    const rawSearch = (document.getElementById("searchProduct")?.value || "").toLowerCase().trim();

    // Word stemming / singular check
    const singular = text => text.toLowerCase().split(/\s+/)
        .map(word => word.replace(/ies$/, "y").replace(/s$/, "")).join(" ");
    const query = singular(rawSearch);

    // 1. Filter by category
    let filtered = products || [];
    if (selectedCategory !== "all") {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // 2. Filter by search query
    if (rawSearch) {
        filtered = filtered.filter(product => {
            const text = [product.name, product.category, product.description].join(" ");
            return text.toLowerCase().includes(rawSearch) || singular(text).includes(query);
        });
    }

    // Empty result state
    if (!filtered.length) {
        grid.innerHTML = `<div class="empty-state">No products found matching your selection.</div>`;
        return;
    }

    // 3. ARRANGED VIEW:
    // If user is browsing "All", has no active search, and sort is "Featured",
    // arrange products cleanly grouped by Category sections!
    if (selectedCategory === "all" && !rawSearch && currentSort === "featured") {
        const categories = getCategories();
        let sectionsHTML = "";

        categories.forEach(category => {
            const items = filtered.filter(p => p.category === category);
            if (!items.length) return;

            const icon = CATEGORY_ICONS[category] ? CATEGORY_ICONS[category] + " " : "";
            sectionsHTML += `
                <div class="category-section" style="grid-column: 1 / -1;">
                    <div class="category-section-header">
                        <h3 class="category-section-title">${icon}${escapeHTML(category)}</h3>
                        <span class="category-item-count">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div class="product-grid">
                        ${items.map(renderProductCard).join("")}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = sectionsHTML;
        return;
    }

    // 4. Filtered / Sorted flat grid view
    const sorted = sortProductsList(filtered);
    grid.innerHTML = sorted.map(renderProductCard).join("");
}

// ==============================================================================
// 9. SHOPPING CART & CHECKOUT
// ==============================================================================

function saveCart() {
    Storage.set(STORAGE_KEYS.CART, cart);
    if (currentUser) {
        Storage.set("cc_cart_" + currentUser.email, cart);
    }
}

function addToCart(id) {
    if (!currentUser || currentUser.role !== "user") {
        alert("Please login as a customer to add products.");
        showPage("login");
        return;
    }

    const product = products.find(item => item.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });
    }

    saveCart();
    alert(product.name + " added to cart!");
    renderUser();
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    saveCart();
    renderUser();
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderUser();
}

function checkout() {
    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!confirm("Confirm your order worth ₱" + total.toFixed(2) + "?")) return;

    orders.push({
        id: Date.now(),
        customer: currentUser.name,
        email: currentUser.email,
        items: [...cart],
        total,
        status: "Pending",
        date: new Date().toLocaleString()
    });

    Storage.set(STORAGE_KEYS.ORDERS, orders);

    cart = [];
    saveCart();
    renderUser();

    alert("Your order has been placed successfully!");
}

// ==============================================================================
// 10. USER DASHBOARD
// ==============================================================================

function renderUser() {
    if (!currentUser) return;

    const userNameEl = document.getElementById("userName");
    if (userNameEl) userNameEl.textContent = currentUser.name;

    const profileEmailEl = document.getElementById("profileEmail");
    if (profileEmailEl) profileEmailEl.textContent = "Email: " + currentUser.email;

    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
        cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    const container = document.getElementById("cartItems");
    if (container) {
        container.innerHTML = cart.map(item => `
            <div class="cart-row">
                <div>
                    <strong>${escapeHTML(item.name)}</strong>
                    <p>₱${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
                <div>
                    <button onclick="changeQuantity(${item.id}, -1)">−</button>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeCartItem(${item.id})">Remove</button>
                </div>
            </div>
        `).join("") || "<p>Your cart is empty.</p>";
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartTotalEl = document.getElementById("cartTotal");
    if (cartTotalEl) {
        cartTotalEl.textContent = "Total: ₱" + total.toFixed(2);
    }

    const mine = orders.filter(order => order.email === currentUser.email).reverse();
    const myOrdersEl = document.getElementById("myOrders");
    if (myOrdersEl) {
        myOrdersEl.innerHTML = mine.map(order => `
            <div class="cart-row">
                <div>
                    <strong>Order #${order.id}</strong>
                    <p>${order.items.map(item => item.quantity + " × " + escapeHTML(item.name)).join(", ")}</p>
                    <small>${escapeHTML(order.date)} · ₱${Number(order.total).toFixed(2)}</small>
                </div>
                <span>${escapeHTML(order.status)}</span>
            </div>
        `).join("") || "<p>You have not placed any orders yet.</p>";
    }
}

// ==============================================================================
// 11. ADMIN DASHBOARD & PRODUCT CRUD
// ==============================================================================

function renderAdmin() {
    if (currentUser?.role !== "admin") return;

    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("totalOrders").textContent = orders.length;

    // Arrange products in admin panel grouped by category or sorted
    const sortedProducts = [...products].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

    document.getElementById("adminProductList").innerHTML = sortedProducts.map(product => `
        <div class="admin-row">
            <div>
                <strong>${escapeHTML(product.name)}</strong>
                <p>₱${Number(product.price).toFixed(2)} | <span style="color:var(--caramel);font-weight:600;">${escapeHTML(product.category)}</span></p>
            </div>
            <div>
                <button onclick="editProduct(${product.id})">Edit</button>
                <button onclick="deleteProduct(${product.id})">Delete</button>
            </div>
        </div>
    `).join("") || "<p>No products available.</p>";

    document.getElementById("adminUserList").innerHTML = users.map(user => `
        <div class="admin-row">
            <div>
                <strong>${escapeHTML(user.name)}</strong>
                <p>${escapeHTML(user.email)}</p>
            </div>
            <span>Customer</span>
        </div>
    `).join("") || "<p>No registered customers.</p>";

    document.getElementById("adminOrderList").innerHTML = orders.map(order => `
        <div class="admin-row">
            <div>
                <strong>Order #${order.id}</strong>
                <p>${escapeHTML(order.customer)} - ₱${Number(order.total).toFixed(2)}</p>
                <small>${escapeHTML(order.date)}</small>
            </div>
            <div>
                <select onchange="updateOrderStatus(${order.id}, this.value)">
                    <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
                    <option ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                    <option ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
            </div>
        </div>
    `).join("") || "<p>No orders yet.</p>";
}

function deleteProduct(id) {
    if (currentUser?.role !== "admin") return;
    if (!confirm("Delete this product?")) return;

    products = products.filter(product => product.id !== id);
    Storage.set(STORAGE_KEYS.PRODUCTS, products);

    renderAdmin();
    renderCategoryTabs();
    renderProducts();
}

function editProduct(id) {
    if (currentUser?.role !== "admin") return;

    const product = products.find(item => item.id === id);
    if (!product) return;

    const name = prompt("Product name:", product.name);
    if (name === null) return;

    const price = prompt("Product price:", product.price);
    if (price === null) return;

    const description = prompt("Product description:", product.description);
    if (description === null) return;

    const newPrice = Number(price);

    if (!name.trim() || !description.trim() || !Number.isFinite(newPrice) || newPrice <= 0) {
        alert("Invalid product details.");
        return;
    }

    product.name = name.trim();
    product.price = newPrice;
    product.description = description.trim();

    Storage.set(STORAGE_KEYS.PRODUCTS, products);

    renderAdmin();
    renderCategoryTabs();
    renderProducts();

    alert("Product updated!");
}

function updateOrderStatus(id, status) {
    if (currentUser?.role !== "admin") return;

    const order = orders.find(item => item.id === id);
    if (!order) return;

    order.status = status;
    Storage.set(STORAGE_KEYS.ORDERS, orders);
    renderAdmin();
}

// ==============================================================================
// 12. SYSTEM ARCHITECTURE VIEWER
// ==============================================================================

async function renderArchitecture() {
    const layers = document.getElementById("archLayers");
    if (!layers || layers.dataset.ready) return;

    let data = null;

    try {
        let response = await fetch("data/architecture.json");
        if (!response.ok) {
            response = await fetch("architecture.json");
        }
        if (!response.ok) throw new Error("Could not load architecture.json");
        data = await response.json();
    } catch {
        console.warn("Using fallback architecture data.");
        data = FALLBACK_ARCHITECTURE;
    }

    layers.innerHTML = data.layers.map(layer => `
        <div class="arch-layer">
            <h3>${escapeHTML(layer.name)}</h3>
            <ul>${layer.items.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </div>
    `).join('<div class="arch-arrow" aria-hidden="true">↓</div>');

    document.getElementById("archRoles").innerHTML = data.roles.map(role => `
        <div><strong>${escapeHTML(role.role)}</strong>${escapeHTML(role.can)}</div>
    `).join("");

    document.getElementById("archNote").textContent = data.production;
    layers.dataset.ready = "true";
}

// ==============================================================================
// 13. UTILITY FUNCTIONS
// ==============================================================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ==============================================================================
// START APPLICATION
// ==============================================================================

initialize();

