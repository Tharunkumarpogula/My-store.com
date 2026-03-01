// Global variables
let products = [];
const API_URL = 'http://localhost:3000/api';

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        products = await response.json();

        // Map backend field names to frontend if they differ
        // For example, backend might use priceCents and imageUrl
        products = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.priceCents / 100, // Assuming priceCents on backend
            originalPrice: (p.priceCents / 100) * 1.5, // Mocking original price
            category: p.category || 'electronics',
            image: p.imageUrl || p.image,
            rating: p.rating || 4.5,
            description: p.description,
            specifications: p.specifications || []
        }));

        initializeApp();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback or error message for user
        showNotification('Failed to load products. Please check if the backend is running.', 'error');
    }
}


// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    loadUserCart(); // Load user's cart based on email if logged in
    fetchProducts(); // This will call initializeApp after fetching
});

function initializeApp() {
    updateCartCount();
    loadFeaturedProducts();
    loadAllProducts();
    setupEventListeners();

    // Render cart items if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartItems();
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function () {
            filterProducts();
        });
    }

    // Sort by
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function () {
            sortProducts();
        });
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with ${email}!`);
            newsletterForm.reset();
        });
    }

    // Cart icon click
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function () {
            window.location.href = 'cart.html';
        });
    }
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart(); // Use the new saveCart function
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        showNotification(`${item.name} removed from cart`, 'success');
    }

    cart = cart.filter(item => item.id != productId);
    saveCart(); // Use the new saveCart function
    updateCartCount();
    renderCartItems();
}

function updateCartItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);

    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > 10) {
        showNotification('Maximum quantity is 10 per item', 'error');
        return;
    }

    const item = cart.find(item => item.id == productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        saveCart(); // Use the new saveCart function
        updateCartCount();
        renderCartItems();
        showNotification(`Quantity updated from ${oldQuantity} to ${newQuantity}`, 'success');
    }
}

function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;

    const featuredProducts = products.slice(0, 8); // Get first 8 products

    featuredContainer.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${product.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadAllProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${product.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;

    const selectedCategory = categoryFilter.value;
    const productsGrid = document.getElementById('products-grid');

    if (!productsGrid) return;

    let filteredProducts = products;

    if (selectedCategory) {
        filteredProducts = products.filter(product => product.category === selectedCategory);
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${product.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function sortProducts() {
    const sortBy = document.getElementById('sort-by');
    if (!sortBy) return;

    const sortValue = sortBy.value;
    const productsGrid = document.getElementById('products-grid');
    const categoryFilter = document.getElementById('category-filter');

    if (!productsGrid) return;

    let sortedProducts = [...products];

    // Apply category filter first
    if (categoryFilter && categoryFilter.value) {
        sortedProducts = sortedProducts.filter(product => product.category === categoryFilter.value);
    }

    // Then sort
    switch (sortValue) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }

    productsGrid.innerHTML = sortedProducts.map(product => `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${product.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet</p>
                <button class="btn btn-primary" onclick="smoothNavigate('shop.html')">Continue Shopping</button>
                <button class="btn btn-secondary" onclick="smoothNavigate('login.html')">Login to Save Cart</button>
            </div>
        `;
        updateCartSummary();
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id == item.id);
        if (!product) return '';

        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${product.name}</h3>
                    <p class="cart-item-price">₹ ${product.price.toLocaleString('en-IN')}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" onchange="updateCartItemQuantity(${item.id}, this.value)">
                            <button class="quantity-btn plus" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${item.id})" title="Remove item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="item-total">
                        Total: ₹ ${(product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const gstElement = document.getElementById('gst');
    const totalElement = document.getElementById('total');

    if (!subtotalElement || !shippingElement || !gstElement || !totalElement) return;

    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id == item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
    const gst = subtotal * 0.18;
    const total = subtotal + shipping + gst;

    subtotalElement.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
    shippingElement.textContent = `₹ ${shipping.toLocaleString('en-IN')}`;
    gstElement.textContent = `₹ ${(gst).toLocaleString('en-IN')}`;
    totalElement.textContent = `₹ ${total.toLocaleString('en-IN')}`;

    // Also update order summary on checkout page
    updateOrderSummary();
}

function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryGst = document.getElementById('summary-gst');
    const summaryTotal = document.getElementById('summary-total');

    if (!summaryItems) return;

    if (cart.length === 0) {
        summaryItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    summaryItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id == item.id);
        if (!product) return '';

        return `
            <div class="summary-item">
                <div class="item-info">
                    <h4>${product.name}</h4>
                    <p>Qty: ${item.quantity} × ₹ ${product.price.toLocaleString('en-IN')}</p>
                </div>
                <span>₹ ${(product.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `;
    }).join('');

    if (summarySubtotal && summaryShipping && summaryGst && summaryTotal) {
        const subtotal = cart.reduce((sum, item) => {
            const product = products.find(p => p.id == item.id);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
        const gst = subtotal * 0.18;
        const total = subtotal + shipping + gst;

        summarySubtotal.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
        summaryShipping.textContent = `₹ ${shipping.toLocaleString('en-IN')}`;
        summaryGst.textContent = `₹ ${(gst).toLocaleString('en-IN')}`;
        summaryTotal.textContent = `₹ ${total.toLocaleString('en-IN')}`;
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Enhanced Cart Functionality
function buyNow(productId, quantity = 1) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    // Add to cart first
    addToCart(productId, quantity);

    // Show loading and redirect to checkout
    showLoading();
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1500);
}

function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Smooth page transitions
function smoothNavigate(url) {
    showLoading();
    setTimeout(() => {
        window.location.href = url;
    }, 800);
}

// Enhanced page transition on all links
document.addEventListener('DOMContentLoaded', function () {
    // Add smooth transitions to all internal links
    const links = document.querySelectorAll('a[href^="#"], a:not([href^="http"])');
    links.forEach(link => {
        if (link.getAttribute('href') !== '#' && !link.classList.contains('nav-menu')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href && href !== 'javascript:void(0)') {
                    smoothNavigate(href);
                }
            });
        }
    });

    // Add loading on form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function () {
            showLoading();
        });
    });
});

// Login/Logout functionality
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const cartIcon = document.querySelector('.cart-icon');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.querySelector('.login-btn');

    // Show/hide login/logout buttons
    if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? 'none' : 'block';
    }

    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
    }

    if (cartIcon) {
        cartIcon.addEventListener('click', function () {
            if (!isLoggedIn) {
                smoothNavigate('login.html');
                return;
            }
            smoothNavigate('cart.html');
        });
    }
}

function logout() {
    showLoading();
    setTimeout(() => {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('demoOTP');

        // Clear cart from localStorage but keep it in memory temporarily
        const currentCart = [...cart]; // Save current cart

        // Clear localStorage cart
        localStorage.removeItem('cart');

        // Restore cart to memory (so user can see it if they log back in quickly)
        cart = currentCart;

        showNotification('You have been logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 800);
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Enhanced cart functions with email persistence
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    // Save cart to localStorage
    saveCart(); // Use the new saveCart function
    updateCartCount();

    // If user is logged in, also save to email-specific storage
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
    }

    showNotification(`${product.name} added to cart!`, 'success');
}

// Page transition effects
function smoothRedirect(url) {
    showLoading();
    setTimeout(() => {
        window.location.href = url;
    }, 800);
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    initializeApp();

    // Add loading screen to all pages
    window.addEventListener('beforeunload', function () {
        showLoading();
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Expose functions to global scope for inline event handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.renderCartItems = renderCartItems;
window.updateCartSummary = updateCartSummary;
window.buyNow = buyNow;
window.logout = logout;
window.showNotification = showNotification;
window.smoothRedirect = smoothRedirect;
window.smoothNavigate = smoothNavigate;

// Initialize cart after all functions are defined
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load user's cart based on email if logged in
function loadUserCart() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    if (isLoggedIn && userEmail) {
        // Try to load cart specific to user email
        const userCart = localStorage.getItem(`cart_${userEmail}`);
        if (userCart) {
            cart = JSON.parse(userCart);
        } else {
            // If no email-specific cart, try general cart
            const generalCart = localStorage.getItem('cart');
            if (generalCart) {
                cart = JSON.parse(generalCart);
            }
        }
    } else {
        // Load general cart
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    }

    updateCartCount();
}

// Save cart to both general and user-specific storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));

    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));
    }
}