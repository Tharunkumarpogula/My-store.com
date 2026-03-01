# ModernShop - E-commerce Website

A complete responsive e-commerce website built with HTML, CSS, and JavaScript for Indian customers.

## Features

- **Responsive Design**: Mobile-first approach with responsive layouts
- **Modern UI/UX**: Clean, minimal design with black, white, and blue/green accents
- **Complete E-commerce Functionality**:
  - Homepage with hero section, featured products, categories, testimonials
  - Shop page with filtering and sorting
  - Product detail pages
  - Shopping cart with GST calculation (18%)
  - Checkout process
  - About and Contact pages
- **Local Storage Integration**: Cart persistence using localStorage
- **SEO Optimized**: Proper meta tags and structured content
- **Indian Market Ready**: INR currency, Indian customer focus

## Project Structure

```
PROJECT/
├── index.html              # Homepage
├── shop.html               # Shop page
├── product.html            # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── about.html              # About page
├── contact.html            # Contact page
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   └── main.js             # Main JavaScript
└── images/                 # Placeholder images
```

## How to Deploy

### On Local Server
1. Install Live Server extension in VS Code or use Python's built-in server:
   ```
   python -m http.server 8000
   ```

### On Hostinger
1. Log in to your Hostinger control panel
2. Go to Websites → File Manager
3. Upload all files to the public_html folder
4. Ensure index.html is in the root directory

### On GoDaddy
1. Access GoDaddy hosting control panel
2. Use File Manager or FTP to upload files
3. Upload all files to the root directory (htdocs/www)
4. Ensure index.html is present

## Connecting Payment Gateway (Razorpay)

To integrate real payment processing:

1. Sign up for a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your Key ID and Key Secret from the dashboard
3. Replace the placeholder Razorpay code in checkout.html:

```javascript
// Add this script in checkout.html
const options = {
    key: "YOUR_KEY_ID", // Enter your key ID here
    amount: totalAmount * 100, // Amount in paise
    currency: "INR",
    name: "ModernShop",
    description: "Order Payment",
    image: "https://your-logo-url.com/logo.png",
    handler: function (response){
        // Payment successful
        alert("Payment successful!");
        // Process order
    },
    prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone
    },
    notes: {
        address: "Customer's Address"
    },
    theme: {
        color: "#007bff"
    }
};

const rzp = new Razorpay(options);
rzp.open();
```

## Connecting Backend (Node.js/PHP)

### With Node.js + Express
1. Create a server.js file:
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// API routes
app.get('/api/products', (req, res) => {
    // Return product data
});

app.post('/api/cart', (req, res) => {
    // Handle cart operations
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### With PHP
1. Create API endpoints:
```php
<?php
header('Content-Type: application/json');

// Get products
if ($_GET['action'] === 'getProducts') {
    $products = json_decode(file_get_contents('products.json'), true);
    echo json_encode($products);
}

// Handle cart
if ($_POST['action'] === 'updateCart') {
    $cartData = $_POST['cart'];
    // Process cart data
    echo json_encode(['success' => true]);
}
?>
```

Then modify the JavaScript to call these endpoints instead of using localStorage.

## Customization Options

### Colors
Edit style.css to change color scheme:
- Primary: `#007bff` (blue) or `#28a745` (green)
- Secondary: Adjust complementary colors accordingly

### Fonts
Currently using Poppins from Google Fonts. Change in all HTML files' head sections.

### Products
Modify the `products` array in main.js to add your actual product data.

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS, Android)

## Performance Tips

1. Optimize images before production
2. Minify CSS and JavaScript for production
3. Use CDN for static assets
4. Implement lazy loading for images
5. Add caching headers on the server

## Troubleshooting

Q: Cart items don't persist after page refresh?
A: Ensure localStorage is enabled in the browser

Q: Images not showing?
A: Replace placeholder images with actual product images

Q: Payment options not working?
A: Implement actual payment gateway integration

---

Made with ❤️ for Indian customers