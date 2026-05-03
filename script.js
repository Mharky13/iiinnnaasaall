let cart = [];
let total = 0;

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
    if (navigator.vibrate) navigator.vibrate(50);
}

function clearCart() {
    if (confirm("Clear your entire order?")) {
        cart = [];
        document.getElementById('cash-amount').value = '';
        updateCartUI();
    }
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    cartCount.innerText = cart.length;
    cartList.innerHTML = '';
    total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="empty-msg" style="text-align:center; color:#555; margin-top:40px;">Basket is empty</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <span style="color:#2ECC71; font-weight:800;">₱${item.price.toFixed(2)}</span>
            `;
            cartList.appendChild(div);
        });
    }

    totalEl.innerText = `₱${total.toFixed(2)}`;
    calculateChange();
}

function calculateChange() {
    const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
    const changeEl = document.getElementById('change-total');
    
    if (cash >= total && total > 0) {
        const change = cash - total;
        changeEl.innerText = `₱${change.toFixed(2)}`;
        changeEl.style.color = "#2ECC71";
    } else {
        changeEl.innerText = `₱0.00`;
        changeEl.style.color = "#ff4444";
    }
}

function placeOrder() {
    const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
    
    if (cart.length === 0) return alert("Add items first!");
    if (cash < total) return alert("Insufficient cash!");

    const itemsList = cart.map(i => i.name).join(", ");
    const change = cash - total;
    
    const message = `NEW ORDER:\nItems: ${itemsList}\nTotal: ₱${total.toFixed(2)}\nCash: ₱${cash.toFixed(2)}\nChange: ₱${change.toFixed(2)}`;
    
    // Change this to your real number
    window.location.href = `sms:+639123456789?body=${encodeURIComponent(message)}`;
}
function placeOrder() {
    const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
    
    if (cart.length === 0) return alert("Add items first!");
    if (cash < total) return alert("Insufficient cash!");

    const itemsList = cart.map(i => i.name).join(", ");
    const change = cash - total;
    
    // 1. Generate SMS message
    const message = `INASAL ORDER:\nItems: ${itemsList}\nTotal: ₱${total.toFixed(2)}\nCash: ₱${cash.toFixed(2)}\nChange: ₱${change.toFixed(2)}`;
    
    // 2. Open SMS app
    window.location.href = `sms:+639123456789?body=${encodeURIComponent(message)}`;

    // 3. Show Digital Receipt
    showReceipt(cash, change);
}

function showReceipt(cash, change) {
    const modal = document.getElementById('receipt-modal');
    const itemsList = document.getElementById('receipt-items-list');
    
    // Set Date
    document.getElementById('receipt-date').innerText = new Date().toLocaleString();
    
    // Fill Items
    itemsList.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'receipt-item-row';
        div.innerHTML = `<span>${item.name}</span><span>₱${item.price.toFixed(2)}</span>`;
        itemsList.appendChild(div);
    });

    // Fill Totals
    document.getElementById('r-total').innerText = `₱${total.toFixed(2)}`;
    document.getElementById('r-cash').innerText = `₱${cash.toFixed(2)}`;
    document.getElementById('r-change').innerText = `₱${change.toFixed(2)}`;

    modal.style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
    clearCart(); // Wipes data for the next customer
    toggleCart(); // Closes the sidebar
}

document.getElementById('overlay').onclick = toggleCart;
