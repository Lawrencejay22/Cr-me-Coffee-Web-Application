// =====================================
// CREME & COFFEE WEBSITE APPLICATION
// =====================================

const getData = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const saveData = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Could not save " + key, error);
    }
};

// Default administrator (DEMO ONLY)
const adminAccount = {
    name: "Administrator",
    email: "admin@creme.com",
    password: "admin123",
    role: "admin"
};

// Initialize website data
let users = getData("cc_users", []);
let products = getData("cc_products", null);
let orders = getData("cc_orders", []);
let currentUser = getData("cc_currentUser", null);
let cart = getData("cc_cart", []);

// Used only if product.json cannot be fetched (for example when index.html is
// opened by double-clicking it). Keep in sync with product.json.
const FALLBACK_PRODUCTS = [
    {
        "id": 1,
        "name": "Butter Croissant",
        "category": "Pastries",
        "description": "Golden, flaky and buttery goodness in every bite.",
        "price": 150,
        "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700"
    },
    {
        "id": 2,
        "name": "Artisan Bread",
        "category": "Pastries",
        "description": "Freshly baked bread with a soft and delicious center.",
        "price": 200,
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=700"
    },
    {
        "id": 3,
        "name": "Classic Cappuccino",
        "category": "Coffee",
        "description": "Rich espresso topped with smooth creamy milk foam.",
        "price": 280,
        "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700"
    },
    {
        "id": 4,
        "name": "Chocolate Cake",
        "category": "Cakes",
        "description": "Moist chocolate cake with rich chocolate frosting.",
        "price": 150,
        "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700"
    },
    {
        "id": 5,
        "name": "Iced Coffee",
        "category": "Coffee",
        "description": "A refreshing coffee blend for everyday cravings.",
        "price": 95,
        "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700"
    },
    {
        "id": 6,
        "name": "Vanilla Cupcakes",
        "category": "Pastries",
        "description": "Soft vanilla cupcakes topped with sweet buttercream.",
        "price": 75,
        "image": "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=700"
    }
];

// Load products from JSON on first visit
async function initialize() {
    if (!products) {
        try {
            const response = await fetch("product.json");

            if (!response.ok) throw new Error("Could not load products");

            const data = await response.json();
            products = data.products;

            saveData("cc_products", products);
        } catch (error) {
            console.warn(error.message + " - using built-in products. Serve the folder with a local server to load product.json.");
            products = FALLBACK_PRODUCTS.map(product => ({ ...product }));
        }
    }

    renderProducts();
    updateHeader();

    if (currentUser) {
        showDashboard();
    } else {
        showPage("home");
    }
}

// =====================================
// PAGE NAVIGATION
// =====================================

function showPage(page) {
    if (["userDashboard", "adminDashboard"].includes(page)) {
        if (!currentUser) {
            alert("Please login first.");
            page = "login";
        }
    }

    if (page === "adminDashboard" &&
        currentUser?.role !== "admin") {
        alert("Administrator access required.");
        page = "home";
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page)?.classList.remove("hidden");

    if (page === "menu") renderProducts();
    if (page === "architecture") renderArchitecture();
    if (page === "adminDashboard") renderAdmin();
    if (page === "userDashboard") renderUser();
}

// =====================================
// HEADER
// =====================================

function updateHeader() {
    const header = document.getElementById("headerActions");

    if (!currentUser) {
        header.innerHTML = `
            <button class="outline-btn"
                onclick="showPage('login')">Login</button>
            <button class="main-btn"
                onclick="showPage('register')">Register</button>
        `;
        return;
    }

    header.innerHTML = `
        <button class="outline-btn"
            onclick="showDashboard()">My Account</button>
        <button class="main-btn"
            onclick="logout()">Logout</button>
    `;
}

function showDashboard() {
    if (currentUser?.role === "admin") {
        showPage("adminDashboard");
    } else if (currentUser) {
        showPage("userDashboard");
    }
}

// =====================================
// REGISTRATION
// =====================================

document.getElementById("registerForm")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    users = getData("cc_users", []);

    const existing = users.find(user => user.email === email);

    if (existing || email === adminAccount.email) {
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
    saveData("cc_users", users);

    alert("Registration successful! Please login.");

    this.reset();
    showPage("login");
});

// =====================================
// LOGIN
// =====================================

document.getElementById("loginForm")
.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    let account = null;

    if (email === adminAccount.email &&
        password === adminAccount.password) {
        account = adminAccount;
    } else {
        users = getData("cc_users", []);
        account = users.find(user =>
            user.email === email &&
            user.password === password
        );
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

    saveData("cc_currentUser", currentUser);

    cart = getData("cc_cart_" + currentUser.email, []);

    saveData("cc_cart", cart);

    this.reset();

    updateHeader();
    showDashboard();
});

// =====================================
// LOGOUT
// =====================================

function logout() {
    currentUser = null;
    cart = [];

    localStorage.removeItem("cc_currentUser");
    localStorage.removeItem("cc_cart");

    updateHeader();
    showPage("home");

    alert("You have successfully logged out.");
}

// =====================================
// PRODUCTS
// =====================================

function renderProducts() {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    const search = (
        document.getElementById("searchProduct")?.value || ""
    ).toLowerCase();

    // "pastry" should match the "Pastries" category, so compare singular forms too
    const singular = text => text.toLowerCase().split(/\s+/)
        .map(word => word.replace(/ies$/, "y").replace(/s$/, "")).join(" ");
    const query = singular(search.trim());

    const filtered = (products || []).filter(product => {
        const text = [product.name, product.category, product.description].join(" ");
        return text.toLowerCase().includes(search) ||
            singular(text).includes(query);
    });

    grid.innerHTML = filtered.map(product => `
        <article class="product-card">
            <img src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}">

            <div class="product-info">
                <h3>${escapeHTML(product.name)}</h3>
                <p>${escapeHTML(product.description)}</p>
                <span class="price">
                    ₱${Number(product.price).toFixed(2)}
                </span>

                <button class="main-btn"
                    onclick="addToCart(${Number(product.id)})">
                    Add to Cart
                </button>
            </div>
        </article>
    `).join("") || "<p>No products found.</p>";
}

// =====================================
// SHOPPING CART
// =====================================

function saveCart() {
    saveData("cc_cart", cart);

    if (currentUser) {
        saveData("cc_cart_" + currentUser.email, cart);
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

function renderUser() {
    if (!currentUser) return;

    document.getElementById("userName").textContent =
        currentUser.name;

    document.getElementById("profileEmail").textContent =
        "Email: " + currentUser.email;

    document.getElementById("cartCount").textContent =
        cart.reduce((sum, item) => sum + item.quantity, 0);

    const container = document.getElementById("cartItems");

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

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    const mine = orders.filter(order => order.email === currentUser.email).reverse();

    document.getElementById("myOrders").innerHTML = mine.map(order => `
        <div class="cart-row">
            <div>
                <strong>Order #${order.id}</strong>
                <p>${order.items.map(item =>
                    item.quantity + " × " + escapeHTML(item.name)).join(", ")}</p>
                <small>${escapeHTML(order.date)} · ₱${Number(order.total).toFixed(2)}</small>
            </div>
            <span>${escapeHTML(order.status)}</span>
        </div>
    `).join("") || "<p>You have not placed any orders yet.</p>";

    document.getElementById("cartTotal").textContent =
        "Total: ₱" + total.toFixed(2);
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    saveCart();
    renderUser();
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);

    saveCart();
    renderUser();
}

// =====================================
// CHECKOUT / ORDER DEMO
// =====================================

function checkout() {
    if (!cart.length) {
        alert("Your cart is empty.");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    if (!confirm("Confirm your order worth ₱" +
        total.toFixed(2) + "?")) return;

    orders.push({
        id: Date.now(),
        customer: currentUser.name,
        email: currentUser.email,
        items: cart,
        total,
        status: "Pending",
        date: new Date().toLocaleString()
    });

    saveData("cc_orders", orders);

    cart = [];
    saveCart();

    renderUser();

    alert("Your order has been placed successfully!");
}

// =====================================
// ADMIN PRODUCT MANAGEMENT
// =====================================

document.getElementById("productForm")
.addEventListener("submit", function(event) {
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

    if (!product.name || !product.description ||
        !product.image || product.price <= 0) {
        alert("Please enter valid product details.");
        return;
    }

    products.push(product);

    saveData("cc_products", products);

    this.reset();

    renderAdmin();
    renderProducts();

    alert("Product successfully added!");
});

function deleteProduct(id) {
    if (currentUser?.role !== "admin") return;

    if (!confirm("Delete this product?")) return;

    products = products.filter(product => product.id !== id);

    saveData("cc_products", products);

    renderAdmin();
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

    const description = prompt(
        "Product description:", product.description
    );
    if (description === null) return;

    const newPrice = Number(price);

    if (!name.trim() || !description.trim() ||
        !Number.isFinite(newPrice) || newPrice <= 0) {
        alert("Invalid product details.");
        return;
    }

    product.name = name.trim();
    product.price = newPrice;
    product.description = description.trim();

    saveData("cc_products", products);

    renderAdmin();
    renderProducts();

    alert("Product updated!");
}

// =====================================
// ADMIN DASHBOARD
// =====================================

function renderAdmin() {
    if (currentUser?.role !== "admin") return;

    document.getElementById("totalProducts").textContent =
        products.length;

    document.getElementById("totalUsers").textContent =
        users.length;

    document.getElementById("totalOrders").textContent =
        orders.length;

    document.getElementById("adminProductList").innerHTML =
        products.map(product => `
            <div class="admin-row">
                <div>
                    <strong>${escapeHTML(product.name)}</strong>
                    <p>₱${Number(product.price).toFixed(2)}
                    | ${escapeHTML(product.category)}</p>
                </div>
                <div>
                    <button onclick="editProduct(${product.id})">
                        Edit
                    </button>
                    <button onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join("") || "<p>No products available.</p>";

    document.getElementById("adminUserList").innerHTML =
        users.map(user => `
            <div class="admin-row">
                <div>
                    <strong>${escapeHTML(user.name)}</strong>
                    <p>${escapeHTML(user.email)}</p>
                </div>
                <span>Customer</span>
            </div>
        `).join("") || "<p>No registered customers.</p>";

    document.getElementById("adminOrderList").innerHTML =
        orders.map(order => `
            <div class="admin-row">
                <div>
                    <strong>Order #${order.id}</strong>
                    <p>${escapeHTML(order.customer)} -
                    ₱${Number(order.total).toFixed(2)}</p>
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

function updateOrderStatus(id, status) {
    if (currentUser?.role !== "admin") return;

    const order = orders.find(item => item.id === id);

    if (!order) return;

    order.status = status;

    saveData("cc_orders", orders);
    renderAdmin();
}

// =====================================
// SYSTEM ARCHITECTURE PAGE (reads architecture.json)
// =====================================

async function renderArchitecture() {
    const layers = document.getElementById("archLayers");
    if (layers.dataset.ready) return;

    try {
        const response = await fetch("architecture.json");
        if (!response.ok) throw new Error("Could not load architecture.json");
        const data = await response.json();

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
    } catch (error) {
        console.error(error);
        layers.innerHTML = "<p>Could not load architecture.json. Open the site through a local server, not by double-clicking the file.</p>";
    }
}

// =====================================
// BASIC HTML OUTPUT ESCAPING
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// =====================================
// START APPLICATION
// =====================================

initialize();