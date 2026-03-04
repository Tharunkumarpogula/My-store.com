// Global variables
// Initialize cart FIRST so all functions always see a valid array
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
const API_URL = 'http://localhost:3000/api';

const MOCK_PRODUCTS = [
    {
        id: 'p1',
        name: 'Premium Cotton Navy T-Shirt',
        description: 'Breathable, minimal and comfortable. Perfect for daily wear.',
        price: 1299,
        originalPrice: 1949,
        category: 'fashion',
        image: 'images/premium-tshirt.png',
        rating: 4.8
    },
    {
        id: 'p2',
        name: 'Noise-Cancelling Wireless Headphones',
        description: 'Rich sound, comfort fit, and long battery life.',
        price: 18999,
        originalPrice: 28499,
        category: 'electronics',
        image: 'images/premium-headphones.png',
        rating: 4.9
    },
    {
        id: 'p3',
        name: 'Luxury Titanium Smartwatch',
        description: 'Premium build with health tracking and long battery.',
        price: 24999,
        originalPrice: 37499,
        category: 'electronics',
        image: 'images/premium-smartwatch.png',
        rating: 4.7
    },
    {
        id: 'p4',
        name: 'Portable Bluetooth Speaker',
        description: 'Compact speaker with punchy bass for your room and travel.',
        price: 5499,
        originalPrice: 8249,
        category: 'electronics',
        image: 'images/premium-speaker.png',
        rating: 4.6
    },
    {
        id: 'p5',
        name: 'Advanced Facial Revitalizing Cream',
        description: 'Hydrates, nourishes, and revitalizes overnight.',
        price: 3499,
        originalPrice: 5249,
        category: 'beauty',
        image: 'images/facecream.jpg',
        rating: 4.5
    },
    {
        id: 'p6',
        name: 'Professional Granite Cookware Set (10 pcs)',
        description: 'Non-stick cookware with heat-resistant handles for daily cooking.',
        price: 12499,
        originalPrice: 18749,
        category: 'home-kitchen',
        image: 'images/cookware.jpg',
        rating: 4.6
    },
    {
        id: 'p7',
        name: 'Classic Blue Denim Jeans',
        description: 'Comfort stretch denim with a modern fit.',
        price: 1999,
        originalPrice: 2999,
        category: 'fashion',
        image: 'images/Classic Blue Denim Jeans.png',
        rating: 4.4
    },
    {
        id: 'p8',
        name: 'Essential White T-Shirt',
        description: 'Soft cotton tee that pairs with everything.',
        price: 699,
        originalPrice: 1049,
        category: 'fashion',
        image: 'images/tshirt.jpg',
        rating: 4.3
    },
    {
        id: 'p9',
        name: 'Smart Fitness Band',
        description: 'Steps, heart-rate, sleep tracking, and notifications.',
        price: 1999,
        originalPrice: 2999,
        category: 'electronics',
        image: 'images/smartwatch.jpg',
        rating: 4.4
    },
    {
        id: 'p10',
        name: 'Premium Coffee Maker',
        description: 'Brew rich coffee at home with consistent taste.',
        price: 3999,
        originalPrice: 5999,
        category: 'home-kitchen',
        image: 'images/Premium Coffee Maker.png',
        rating: 4.5
    },
    {
        id: 'p11',
        name: 'Studio Headphones',
        description: 'Clear audio with comfortable ear cups for long sessions.',
        price: 2999,
        originalPrice: 4499,
        category: 'electronics',
        image: 'images/headphones.jpg',
        rating: 4.4
    },
    {
        id: 'p12',
        name: 'Compact Home Speaker',
        description: 'Everyday speaker for music, podcasts, and calls.',
        price: 2499,
        originalPrice: 3749,
        category: 'electronics',
        image: 'images/speaker.jpg',
        rating: 4.3
    }
];

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        let data = await response.json();

        if (data && data.length > 0) {
            products = data.map(p => ({
                id: p.id,
                name: p.name,
                price: p.priceCents ? p.priceCents / 100 : (p.price || 0),
                originalPrice: (p.priceCents ? p.priceCents / 100 : (p.price || 0)) * 1.5,
                category: p.category || 'electronics',
                image: p.imageUrl || p.image || 'images/product-placeholder.jpg',
                rating: p.rating || 4.5,
                description: p.description,
                specifications: p.specifications || []
            }));
        } else {
            // Fallback to mock if data is empty
            products = [...MOCK_PRODUCTS];
        }

        initializeApp();
    } catch (error) {
        console.warn('Backend not available, using mock data:', error);
        products = [...MOCK_PRODUCTS];
        initializeApp();

        // Only show error if really needed, but mock data lets us proceed
        if (window.location.pathname.includes('login.html')) {
            showNotification('Using offline mode. Backend authentication unavailable.', 'warning');
        }
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

    // Render product detail if on product page (support both /product and /product.html)
    if (window.location.pathname.includes('product') || document.getElementById('product-name')) {
        renderProductDetail();
    }

    // Render cart items if on cart page (support both /cart and /cart.html)
    if (window.location.pathname.includes('cart') || document.getElementById('cart-items')) {
        renderCartItems();
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
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

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');

            // Close other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    otherQuestion.nextElementSibling.style.maxHeight = null;
                    otherQuestion.querySelector('i').classList.remove('rotate');
                }
            });

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.classList.remove('rotate');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                icon.classList.add('rotate');
            }
        });
    });
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        // Show total quantity of all items, not just unique items count
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function addToCart(productId, quantity = 1) {
    // If a page calls addToCart() without a productId (older markup),
    // try to infer it from the product detail URL.
    if (!productId) {
        const params = new URLSearchParams(window.location.search);
        const inferredId = params.get('id');
        if (inferredId) {
            productId = inferredId;
        }
    }

    // Prefer product from the currently loaded list; if for some reason
    // it's not there, fall back to MOCK_PRODUCTS so the button still works.
    let product = products.find(p => p.id == productId);
    if (!product) {
        product = MOCK_PRODUCTS.find(p => p.id == productId);
    }
    if (!product) {
        showNotification('Unable to add to cart: product not found', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        // Increase limit from 10 to 99
        if (existingItem.quantity > 99) existingItem.quantity = 99;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: Math.min(quantity, 99)
        });
    }

    saveCart();
    updateCartCount();

    // Also update UI if on cart page
    if (typeof renderCartItems === 'function') {
        renderCartItems();
    }

    showNotification(`${product.name} added to cart!`, 'success');
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

    if (newQuantity > 99) {
        showNotification('Maximum quantity is 99 per item', 'error');
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

    featuredContainer.innerHTML = featuredProducts.map(product => {
        const originalPrice = (typeof product.originalPrice === 'number' ? product.originalPrice : product.price * 1.5);
        return `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/product-placeholder.jpg';">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function loadAllProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => {
        const originalPrice = (typeof product.originalPrice === 'number' ? product.originalPrice : product.price * 1.5);
        return `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/product-placeholder.jpg';">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
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

    productsGrid.innerHTML = filteredProducts.map(product => {
        const originalPrice = (typeof product.originalPrice === 'number' ? product.originalPrice : product.price * 1.5);
        return `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/product-placeholder.jpg';">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
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

    productsGrid.innerHTML = sortedProducts.map(product => {
        const originalPrice = (typeof product.originalPrice === 'number' ? product.originalPrice : product.price * 1.5);
        return `
        <div class="product-card">
            <div class="product-image" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/product-placeholder.jpg';">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
                <div class="rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating}/5)</span>
                </div>
                <div class="price">
                    ₹ ${product.price.toLocaleString('en-IN')}
                    <span class="original-price">₹ ${originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="product-actions-btn">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="buy-now-btn" onclick="buyNow('${product.id}')">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
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
        // Prefer latest product info if available, but fall back to cart snapshot.
        const product = products.find(p => p.id == item.id);
        const name = (product && product.name) || item.name || 'Product';
        const price = (product && typeof product.price === 'number') ? product.price : (typeof item.price === 'number' ? item.price : 0);
        const image = (product && product.image) || item.image || 'images/product-placeholder.jpg';

        return `
            <div class="cart-item">
                <img src="${image}" alt="${name}" class="cart-item-image" onerror="this.onerror=null;this.src='images/product-placeholder.jpg';">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${name}</h3>
                    <p class="cart-item-price">₹ ${price.toLocaleString('en-IN')}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-controls-small">
                            <button class="qty-btn-small" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})" title="Decrease quantity">-</button>
                            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" onchange="updateCartItemQuantity('${item.id}', this.value)">
                            <button class="qty-btn-small" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})" title="Increase quantity">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove item">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    <div class="item-total" style="margin-top: 10px; font-weight: 600;">
                        Item Total: ₹ ${(price * item.quantity).toLocaleString('en-IN')}
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
        const price = (product && typeof product.price === 'number') ? product.price : (typeof item.price === 'number' ? item.price : 0);
        return sum + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
    const gst = Math.round(subtotal * 0.18);
    const total = Math.round(subtotal + shipping + gst);

    subtotalElement.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
    shippingElement.textContent = `₹ ${shipping.toLocaleString('en-IN')}`;
    gstElement.textContent = `₹ ${gst.toLocaleString('en-IN')}`;
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
        const name = (product && product.name) || item.name || 'Product';
        const price = (product && typeof product.price === 'number') ? product.price : (typeof item.price === 'number' ? item.price : 0);

        return `
            <div class="summary-item">
                <div class="item-info">
                    <h4>${name}</h4>
                    <p>Qty: ${item.quantity} × ₹ ${price.toLocaleString('en-IN')}</p>
                </div>
                <span>₹ ${(price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `;
    }).join('');

    if (summarySubtotal && summaryShipping && summaryGst && summaryTotal) {
        const subtotal = cart.reduce((sum, item) => {
            const product = products.find(p => p.id == item.id);
            const price = (product && typeof product.price === 'number') ? product.price : (typeof item.price === 'number' ? item.price : 0);
            return sum + (price * item.quantity);
        }, 0);

        const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 99) : 0;
        const gst = Math.round(subtotal * 0.18);
        const total = Math.round(subtotal + shipping + gst);

        summarySubtotal.textContent = `₹ ${subtotal.toLocaleString('en-IN')}`;
        summaryShipping.textContent = `₹ ${shipping.toLocaleString('en-IN')}`;
        summaryGst.textContent = `₹ ${gst.toLocaleString('en-IN')}`;
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
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.querySelector('.login-btn');

    // Show/hide login/logout buttons
    if (loginBtn) {
        loginBtn.style.display = isLoggedIn ? 'none' : 'block';
    }

    if (logoutBtn) {
        logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
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
// Consolidated addToCart above

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

    // initializeApp() is triggered by fetchProducts() after product data loads.
    // Calling it here caused duplicate renders + duplicate event bindings.

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

function renderProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    // If products aren't loaded yet, bail out. initializeApp() will call again after fetch.
    if (!products || products.length === 0) return;

    const product = products.find(p => p.id == productId) || products[0];
    if (!product) return;

    const imageEl = document.getElementById('main-product-image');
    if (imageEl) {
        imageEl.src = product.image;
        imageEl.onerror = function () {
            this.onerror = null;
            this.src = 'images/product-placeholder.jpg';
        };
    }

    // Update thumbnails (the HTML has placeholder thumbnails hardcoded)
    document.querySelectorAll('.thumbnail-images .thumbnail').forEach((thumb) => {
        thumb.src = product.image;
        thumb.alt = `${product.name} thumbnail`;
        thumb.onerror = function () {
            this.onerror = null;
            this.src = 'images/product-placeholder.jpg';
        };
    });

    const nameEl = document.getElementById('product-name');
    if (nameEl) nameEl.textContent = product.name;

    const priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = `₹ ${product.price.toLocaleString('en-IN')}`;

    const original = (typeof product.originalPrice === 'number' ? product.originalPrice : product.price * 1.5);
    const originalEl = document.getElementById('product-original-price');
    if (originalEl) originalEl.textContent = `₹ ${Math.round(original).toLocaleString('en-IN')}`;

    const discountEl = document.getElementById('product-discount');
    if (discountEl) {
        const discountPct = original > 0 ? Math.round(((original - product.price) / original) * 100) : 0;
        discountEl.textContent = discountPct > 0 ? `${discountPct}% OFF` : '';
    }

    const descEl = document.getElementById('product-description');
    if (descEl && product.description) descEl.textContent = product.description;

    // Wire up buttons using selected quantity
    const qtyInput = document.getElementById('quantity');
    const getQty = () => {
        const parsed = parseInt(qtyInput && qtyInput.value ? qtyInput.value : '1', 10);
        return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 99) : 1;
    };

    const addBtn = document.getElementById('add-to-cart-btn') || document.querySelector('.product-actions .add-to-cart');
    if (addBtn) {
        addBtn.onclick = () => addToCart(product.id, getQty());
    }

    const buyNowBtn = document.getElementById('buy-now-btn') || document.querySelector('.product-actions .buy-now');
    if (buyNowBtn) {
        buyNowBtn.onclick = () => buyNow(product.id, getQty());
    }
}

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