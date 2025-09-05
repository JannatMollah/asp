// Products data from products.json 
fetch('products.json')
  .then(res => res.json())
  .then(data => loadProducts(data))

// Load products on home page
function loadProducts(products) {
  const productGrid = document.querySelector('.product-grid');

  // Clear any existing placeholder
  productGrid.innerHTML = '';

  // Create product cards
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.product_name}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.product_name}</h3>
        <div class="product-code">Code: ${product.product_code}</div>
        <div class="product-price">৳${product.price}</div>
        <a href="#" class="add-to-cart" data-id="${product.id}">Add to Cart</a>
      </div>
    `;

    productGrid.appendChild(productCard);
  });

  // Add event listeners to Add to Cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = parseInt(this.getAttribute('data-id'));
      const product = products.find(p => p.id === productId);

      if (product) {
        cart.addItem(product);
      }
    });
  });
}

// Cart management
class Cart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartCount();
  }

  loadCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.updateCartCount();
  }

  updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);

    cartCountElements.forEach(element => {
      element.textContent = totalItems;
    });
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.product_name,
        price: parseFloat(product.price),
        image: product.image_url,
        code: product.product_code,
        quantity: quantity
      });
    }

    this.saveCart();
    this.showNotification(`${product.product_name} added to cart`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(id);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #d10073;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 0.5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 50);
    }, 500);
  }
}

// Initialize cart
const cart = new Cart();

// Page-specific functionality
document.addEventListener('DOMContentLoaded', function () {
  // Common functionality for all pages
  updateCartDisplay();

  // Page-specific functionality
  if (document.querySelector('.product-grid')) {
    // Home page
    loadProducts();
  } else if (document.querySelector('.cart-table')) {
    // Cart page
    loadCartPage();
  } else if (document.querySelector('.checkout-form')) {
    // Checkout page
    loadCheckoutPage();
  }
});

// Load cart page
function loadCartPage() {
  const cartTableBody = document.querySelector('.cart-table tbody');
  const cartSummary = document.querySelector('.cart-summary');
  const emptyCart = document.querySelector('.empty-cart');

  if (cart.items.length === 0) {
    cartTableBody.parentElement.style.display = 'none';
    cartSummary.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  // Hide empty cart messages
  emptyCart.style.display = 'none';

  // Clear existing rows
  cartTableBody.innerHTML = '';

  // Add cart items to table
  cart.items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <img src="${item.image}" alt="${item.name}" class="product-image">
      </td>
      <td>${item.name}</td>
      <td>৳${item.price.toFixed(2)}</td>
      <td>
        <div class="quantity-controls">
          <a href="#" class="quantity-btn minus" data-id="${item.id}">-</a>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <a href="#" class="quantity-btn plus" data-id="${item.id}">+</a>
        </div>
      </td>
      <td>৳${(item.price * item.quantity).toFixed(2)}</td>
      <td>
        <a href="#" class="remove-btn" data-id="${item.id}">Remove</a>
      </td>
    `;

    cartTableBody.appendChild(row);
  });

  // Update cart total
  const totalElement = document.querySelector('.cart-total');
  totalElement.textContent = `Total: ৳${cart.getTotal().toFixed(2)}`;

  // Add event listeners
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = parseInt(this.getAttribute('data-id'));
      cart.removeItem(productId);
      loadCartPage(); // Reload the cart page
    });
  });

  document.querySelectorAll('.quantity-btn.minus').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = parseInt(this.getAttribute('data-id'));
      const item = cart.items.find(item => item.id === productId);

      if (item && item.quantity > 1) {
        cart.updateQuantity(productId, item.quantity - 1);
        loadCartPage(); // Reload the cart page
      }
    });
  });

  document.querySelectorAll('.quantity-btn.plus').forEach(button => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const productId = parseInt(this.getAttribute('data-id'));
      const item = cart.items.find(item => item.id === productId);

      if (item) {
        cart.updateQuantity(productId, item.quantity + 1);
        loadCartPage(); // Reload the cart page
      }
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function () {
      const productId = parseInt(this.getAttribute('data-id'));
      const quantity = parseInt(this.value) || 1;

      cart.updateQuantity(productId, quantity);
      loadCartPage(); // Reload the cart page
    });
  });

  // Continue shopping button
  document.querySelector('.continue-shopping').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

// Load checkout page
function loadCheckoutPage() {
  const checkoutForm = document.querySelector('.checkout-form');
  const orderConfirmation = document.querySelector('.order-confirmation');

  // If cart is empty, redirect to home page
  if (cart.items.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  // Show form, hide confirmation initially
  if (checkoutForm) checkoutForm.style.display = 'block';
  if (orderConfirmation) orderConfirmation.style.display = 'none';

  // Set total amount
  const totalAmountInput = document.getElementById('total_amount');
  if (totalAmountInput) {
    totalAmountInput.value = `৳${cart.getTotal().toFixed(2)}`;
  }

  // Form submission
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form data
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        payment_method: document.getElementById('payment_method').value,
        payment_phone_number: document.getElementById('payment_phone_number')?.value || '',
        payment_TXID_number: document.getElementById('payment_TXID_number')?.value || '',
        total: cart.getTotal(),
        items: cart.items,
        order_id: generateOrderId()
      };

      // Save order to localStorage (simulating database storage)
      saveOrder(formData);

      // Show confirmation
      if (checkoutForm) checkoutForm.style.display = 'none';
      if (orderConfirmation) {
        orderConfirmation.style.display = 'block';
        document.querySelector('.order-id').textContent = `Order ID: ${formData.order_id}`;
      }

      // Clear cart
      cart.clear();
    });
  }

  // Payment method toggle
  const paymentMethodSelect = document.getElementById('payment_method');
  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', function () {
      const extraFields = document.getElementById('extra_payment_fields');

      if (this.value === 'COD') {
        extraFields.style.display = 'none';
      } else {
        extraFields.style.display = 'block';
      }
    });
  }
}

// Generate a random order ID
function generateOrderId() {
  return 'ASP-' + Math.floor(100000 + Math.random() * 900000);
}

// Save order to localStorage
function saveOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push({
    ...orderData,
    date: new Date().toISOString()
  });
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Update cart display on all pages
function updateCartDisplay() {
  cart.updateCartCount();
}

