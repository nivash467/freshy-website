document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('nav ul');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('show');
        });
    }

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Antigravity Hover Effect for Products
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const productName = card.querySelector('.product-name').textContent.toLowerCase();
                card.style.display = productName.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // --- Cart Logic ---
    // Currency conversion settings
    const USD_TO_INR = 83.5;
    const CURRENCY_SYMBOL = '₹';

    window.formatRupeeFromUsd = function(usd) {
        return `${CURRENCY_SYMBOL}${(usd * USD_TO_INR).toFixed(2)}`;
    };
    const formatRupeeFromUsd = window.formatRupeeFromUsd;

    // Convert visible product prices from USD to INR and store original USD as data attribute
    document.querySelectorAll('.product-price').forEach(el => {
        const text = el.textContent || '';
        const numbers = text.match(/[0-9]+(?:\.[0-9]+)?/g);
        if (!numbers) return;
        // Use the last number as the actual selling price (handles "$4.50 $3.15" cases)
        const priceUsd = parseFloat(numbers[numbers.length - 1]);
        el.dataset.usd = priceUsd;
        el.innerHTML = el.innerHTML.replace(/\$([0-9]+(?:\.[0-9]+)?)/g, (m, p1) => {
            const n = parseFloat(p1);
            return `${CURRENCY_SYMBOL}${(n * USD_TO_INR).toFixed(2)}`;
        });
    });
    updateCartCount();

    // Add to Cart Interaction
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-cart-btn')) {
            const card = e.target.closest('.product-card');
            const name = card.querySelector('.product-name').textContent;
            const priceEl = card.querySelector('.product-price');
            // Prefer stored USD value (data-usd) so conversion isn't applied twice
            const price = parseFloat(priceEl.dataset.usd || priceEl.textContent.replace(/[^0-9.]/g, ''));
            const image = card.querySelector('.product-img').getAttribute('src');

            addToCart({ name, price, image });
        }
    });

    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }

        localStorage.setItem('freshyCart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(badge => {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? 'flex' : 'none';
        });
    }

    // Load Cart Page Logic
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }

    window.changeQuantity = function (index, change) {
        let cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            localStorage.setItem('freshyCart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    };

    window.removeItem = function (index) {
        let cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        if (cart[index]) {
            cart.splice(index, 1);
            localStorage.setItem('freshyCart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    };

    function renderCart() {
        const cartContainer = document.querySelector('.cart-items-container');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');

        if (!cartContainer) return;

        let cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        cartContainer.innerHTML = '';

        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Your cart is empty. <a href="shop.html" style="color:var(--primary-green);">Go Shopping</a></td></tr>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const row = document.createElement('tr');
                row.innerHTML = `
            <td>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                <span>${item.name}</span>
              </div>
            </td>
            <td>${formatRupeeFromUsd(item.price)}</td>
            <td>
              <div class="quantity-controls">
                  <button onclick="changeQuantity(${index}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button onclick="changeQuantity(${index}, 1)">+</button>
              </div>
            </td>
            <td>${formatRupeeFromUsd(itemTotal)}</td>
            <td><button onclick="removeItem(${index})" style="color: red; background: none; border: none; cursor: pointer;"><i class="fas fa-trash"></i></button></td>
          `;
                cartContainer.appendChild(row);
            });
        }

        if (subtotalEl) subtotalEl.textContent = formatRupeeFromUsd(total);
        if (totalEl) totalEl.textContent = formatRupeeFromUsd(total);
    }

    window.proceedToCheckout = function() {
        const cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        window.location.href = 'checkout.html';
    };

    // Checkout Page Logic
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckout();
    }

    function loadCheckout() {
        const cart = JSON.parse(localStorage.getItem('freshyCart')) || [];
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }

        const orderItems = document.getElementById('orderItems');
        const subtotalEl = document.getElementById('checkoutSubtotal');
        const totalEl = document.getElementById('checkoutTotal');

        let total = 0;
        let itemsHtml = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatRupeeFromUsd(itemTotal)}</span>
                </div>
            `;
        });

        if (orderItems) orderItems.innerHTML = itemsHtml;
        if (subtotalEl) subtotalEl.textContent = formatRupeeFromUsd(total);
        if (totalEl) totalEl.textContent = formatRupeeFromUsd(total);

        // Payment method toggle
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('cardDetails').style.display = e.target.value === 'card' ? 'block' : 'none';
                document.getElementById('upiDetails').style.display = e.target.value === 'upi' ? 'block' : 'none';
            });
        });

        // Form submission
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            localStorage.removeItem('freshyCart');
            alert(`Order placed successfully! Payment method: ${paymentMethod.toUpperCase()}`);
            window.location.href = 'index.html';
        });
    }
});
