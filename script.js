self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/Radiant-Medical-Center/',
        '/Radiant-Medical-Center/index.html',
        '/Radiant-Medical-Center/styles/styles1.css',
        '/Radiant-Medical-Center/styles/styles2.css',
        '/Radiant-Medical-Center/script.js',
        '/Radiant-Medical-Center/favicon_package/favicon_package/android-chrome-192x192.png',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      console.log('ServiceWorker registered with scope: ', registration.scope);
    }).catch(function(error) {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

// Initialize medicines data
const medicines = Array.from({ length: 50 }, (_, i) => ({
id: i + 1,
name: `Medicine ${i + 1}`,
price: parseFloat((Math.random() * 100).toFixed(2)),
}));

// Store medicines in localStorage (if not already stored)
if (!localStorage.getItem('medicines')) {
localStorage.setItem('medicines', JSON.stringify(medicines));
}

// Add to Cart Function
function addToCart(id) {
const cart = JSON.parse(localStorage.getItem('cart')) || {}; // Get cart or initialize empty object
const medicine = medicines.find(m => m.id === id); // Find medicine by ID

if (medicine) {
    if (!cart[id]) {
        cart[id] = { ...medicine, quantity: 1 }; // Add new item to the cart
    } else {
        cart[id].quantity++; // Increment quantity if already in cart
    }
    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    alert(`${medicine.name} added to the cart!`);
}
}

// Display Medicines on the Index Page
if (document.getElementById('medicineGrid')) {
const medicineGrid = document.getElementById('medicineGrid');
medicines.forEach(medicine => {
    const item = document.createElement('div');
    item.className = 'medicine-item';
    item.innerHTML = `
        <h3>${medicine.name}</h3>
        <p>Price: $${medicine.price.toFixed(2)}</p>
        <button onclick="addToCart(${medicine.id})">Add to Cart</button>
    `;
    medicineGrid.appendChild(item);
});
}

// Render Cart Items on Cart Page
function renderCart() {
if (!document.getElementById('cartItems')) return;

const cart = JSON.parse(localStorage.getItem('cart')) || {};
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
cartItems.innerHTML = ''; // Clear existing items
let total = 0;

Object.values(cart).forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <span>${item.name}</span>
        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
        <span>Price: $${item.price.toFixed(2)}</span>
        <span id="total-${item.id}">Total: $${itemTotal.toFixed(2)}</span>
        <button onclick="removeFromCart(${item.id})">Remove</button>
    `;
    cartItems.appendChild(div);
});

cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Update Quantity in Cart
function updateQuantity(id, quantity) {
const cart = JSON.parse(localStorage.getItem('cart')) || {};
if (cart[id]) {
    cart[id].quantity = Math.max(1, parseInt(quantity, 10)); // Ensure quantity is at least 1
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart(); // Re-render the cart
}
}

// Remove Item from Cart
function removeFromCart(id) {
const cart = JSON.parse(localStorage.getItem('cart')) || {};
delete cart[id]; // Remove item by ID
localStorage.setItem('cart', JSON.stringify(cart));
renderCart(); // Re-render the cart
}

// Payment Form Handling
if (document.getElementById('paymentForm')) {
document.getElementById('paymentForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Payment Successful!');
    localStorage.removeItem('cart'); // Clear the cart after payment
    window.location.href = 'index.html'; // Redirect to the index page
});
}

// Render Cart on Cart Page Load
if (document.getElementById('cartItems')) {
renderCart();
}

// Add a Cart Button to Navigate to Cart Page
if (document.getElementById('cartButton')) {
document.getElementById('cartButton').addEventListener('click', () => {
    window.location.href = 'cart.html';
});
}

// Initialize cart and favorites arrays
let cart = [];
let favorites = [];

// Retrieve cart items from localStorage when the page loads
window.onload = function() {
loadCart();   // Load the cart from localStorage
loadFavorites(); // Load favorites from localStorage
displayCart();  // Display the current cart
};

// Add item to cart (function called from the product page)
function addToCart(name, price) {
// Check if the item already exists in the cart
let itemExists = cart.find(cartItem => cartItem.name === name);

if (itemExists) {
  // If the item exists, increase the quantity
  itemExists.quantity++;
} else {
  // If the item doesn't exist, add it to the cart with quantity 1
  const item = { name, price, quantity: 1 };
  cart.push(item);
}

// Save the updated cart to localStorage
localStorage.setItem('cart', JSON.stringify(cart));
displayCart();  // Update the display
}

// Display the items in the cart
function displayCart() {
const cartContainer = document.getElementById('cartContainer');
cartContainer.innerHTML = '';  // Clear the cart container before re-displaying

let total = 0;  // Initialize the total price

// Display each item in the cart
cart.forEach(item => {
  const itemTotalPrice = item.price * item.quantity;  // Calculate total price for the item
  total += itemTotalPrice;  // Add item total to overall total price

  const itemElement = document.createElement('div');
  itemElement.classList.add('cart-item');

  const itemContent = `
    <span>${item.name} - $${item.price}</span>
    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.name}', this.value)">
    <span> - $${itemTotalPrice.toFixed(2)}</span>  <!-- Display item total price -->
    <button onclick="removeItem('${item.name}')">Remove</button>
  `;
  
  itemElement.innerHTML = itemContent;
  cartContainer.appendChild(itemElement);
});

// Display the total price at the bottom
const totalElement = document.createElement('div');
totalElement.classList.add('cart-total');
totalElement.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
cartContainer.appendChild(totalElement);

// If the cart is empty
if (cart.length === 0) {
  cartContainer.textContent = 'Your cart is empty.';
}
}

// Update the quantity of an item in the cart
function updateQuantity(name, quantity) {
// Find the item in the cart
const item = cart.find(cartItem => cartItem.name === name);
if (item) {
  item.quantity = parseInt(quantity);  // Update the quantity
  localStorage.setItem('cart', JSON.stringify(cart));  // Save to localStorage
  displayCart();  // Update the display
}
}

// Remove an item from the cart
function removeItem(name) {
// Filter out the item to be removed
cart = cart.filter(cartItem => cartItem.name !== name);
localStorage.setItem('cart', JSON.stringify(cart));  // Save updated cart to localStorage
displayCart();  // Update the display
}

// Add the current cart to favorites
function addToFavorites() {
if (cart.length > 0) {
  favorites = [...cart];  // Copy the cart to favorites
  localStorage.setItem('favorites', JSON.stringify(favorites));  // Save favorites to localStorage
  alert('Cart added to Favorites!');
} else {
  alert('Your cart is empty. Cannot add to favorites.');
}
}

// Apply the saved favorites to the cart
function applyFavorites() {
const savedFavorites = JSON.parse(localStorage.getItem('favorites'));

if (savedFavorites && Array.isArray(savedFavorites) && savedFavorites.length > 0) {
  cart = [...savedFavorites];  // Apply the saved favorites to the cart
  localStorage.setItem('cart', JSON.stringify(cart));  // Save the updated cart to localStorage
  displayCart();  // Update the display
  alert('Favorites applied to cart!');
} else {
  alert('No favorites to apply.');
}
}

// Load the cart from localStorage
function loadCart() {
const savedCart = JSON.parse(localStorage.getItem('cart'));
if (savedCart && Array.isArray(savedCart)) {
  cart = savedCart;  // Assign saved cart to cart variable
}
}

// Load the favorites from localStorage
function loadFavorites() {
const savedFavorites = JSON.parse(localStorage.getItem('favorites'));
if (savedFavorites && Array.isArray(savedFavorites)) {
  favorites = savedFavorites;  // Assign saved favorites to favorites variable
}
}

