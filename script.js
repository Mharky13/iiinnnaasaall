let cart = [];
let total = 0;
let pendingItem = null;
let salesHistory = JSON.parse(localStorage.getItem('inasal_sales')) || [];

window.onload = () => {
    checkDailyReset();
    updateDashboard();
};

function checkDailyReset() {
    const lastResetDate = localStorage.getItem('inasal_last_reset');
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
        salesHistory = [];
        localStorage.setItem('inasal_sales', JSON.stringify(salesHistory));
        localStorage.setItem('inasal_last_reset', today);
    }
}

function adjustQty(amount) {
    const qtyInput = document.getElementById('item-qty');
    if (!qtyInput) return;
    let currentVal = parseInt(qtyInput.value) || 1;
    let newVal = currentVal + amount;
    if (newVal < 1) newVal = 1;
    qtyInput.value = newVal;
}

function processQuantityLogic(finalName, finalPrice) {
    const qtyInput = document.getElementById('item-qty');
    const quantityToAdd = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    const existingItem = cart.find(item => item.name === finalName);
    
    if (existingItem) {
        existingItem.quantity += quantityToAdd;
    } else {
        cart.push({ id: Date.now(), name: finalName, price: finalPrice, quantity: quantityToAdd });
    }
    if (qtyInput) qtyInput.value = 1;
}

function updateItemPrice(itemId, newTotalDisplay) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    const newPrice = parseFloat(newTotalDisplay);
    if (!isNaN(newPrice) && newPrice >= 0) {
        item.price = newPrice / item.quantity;
        updateCartUI();
    }
}

function addToCart(name, price) {
    pendingItem = { name, price };
    document.getElementById('rice-product-name').innerText = name;
    document.getElementById('rice-modal').style.display = 'flex';
}

function confirmRice(isUnli) {
    if (!pendingItem) return;
    let finalName = pendingItem.name + (isUnli ? " (Unli)" : " (Reg)");
    let finalPrice = pendingItem.price + (isUnli ? 20 : 0);
    processQuantityLogic(finalName, finalPrice);
    closeRiceModal();
    updateCartUI();
}

function changeCartQty(itemId, amount) {
    const item = cart.find(i => i.id === itemId);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        updateCartUI();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalQty;
    cartList.innerHTML = '';
    total = 0;

    cart.forEach((item) => {
        const itemSubtotal = item.price * item.quantity;
        total += itemSubtotal;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style = "display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee;";
        div.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:5px;">
                <span style="font-weight:600; font-size:14px;">${item.name}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button onclick="changeCartQty(${item.id}, -1)" style="width:30px; height:30px; background:#f0f0f0; border:1px solid #ddd; border-radius:4px; cursor:pointer;">-</button>
                    <span style="min-width:20px; text-align:center; font-weight:bold;">${item.quantity}</span>
                    <button onclick="changeCartQty(${item.id}, 1)" style="width:30px; height:30px; background:#f0f0f0; border:1px solid #ddd; border-radius:4px; cursor:pointer;">+</button>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="display:flex; align-items:center; background:#f9f9f9; padding:4px 8px; border-radius:6px; border:1px solid #ddd;">
                    <span style="font-size:0.8rem; color:#666;">₱</span>
                    <input type="number"
                        class="price-edit-input"
                        value="${itemSubtotal.toFixed(2)}"
                        onchange="updateItemPrice(${item.id}, this.value)"
                        style="width:75px; border:none; background:transparent; font-weight:800; text-align:right; font-family:inherit; outline:none; font-size:1rem;">
                </div>
                <button onclick="removeFromCart(${item.id})" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:20px;">✕</button>
            </div>`;
        cartList.appendChild(div);
    });
    totalEl.innerText = `₱${total.toFixed(2)}`;
    calculateChange();
}

function toggleHistory() {
    document.getElementById('history-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function saveOrderToHistory(items, totalValue) {
    const now = new Date();
    const orderRecord = {
        id: "REC-" + Date.now().toString().slice(-4),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemDetails: items.map(i => `${i.name} (x${i.quantity})`).join(", "),
        total: totalValue
    };
    salesHistory.push(orderRecord);
    localStorage.setItem('inasal_sales', JSON.stringify(salesHistory));
    updateDashboard();
}

function updateDashboard() {
    const historyList = document.getElementById('history-items-list');
    const revenueDisplay = document.getElementById('total-revenue-display');
    const ordersDisplay = document.getElementById('total-orders-display');
    if (!historyList) return;

    let totalRevenue = 0;
    historyList.innerHTML = "";
    [...salesHistory].reverse().forEach(order => {
        totalRevenue += order.total;
        historyList.innerHTML += `
            <div style="padding:15px 0; border-bottom:1px solid #eee; display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#888;">
                    <span>${order.date} • ${order.time}</span>
                    <span style="font-weight:bold; color:#2e7d32;">₱${order.total.toFixed(2)}</span>
                </div>
                <div style="font-size:0.9rem; font-weight:500;">${order.itemDetails}</div>
            </div>`;
    });
    if (revenueDisplay) revenueDisplay.innerText = `₱${totalRevenue.toFixed(2)}`;
    if (ordersDisplay) ordersDisplay.innerText = salesHistory.length;
}

function clearHistory() {
    if (confirm("Delete all sales records for today?")) {
        salesHistory = [];
        localStorage.removeItem('inasal_sales');
        updateDashboard();
        if (document.getElementById('history-sidebar').classList.contains('active')) toggleHistory();
    }
}

// --- 5. UTILITIES ---
function calculateChange() {
    const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
    const changeEl = document.getElementById('change-total');
    if (changeEl) {
        const change = cash - total;
        changeEl.innerText = `₱${Math.max(0, change).toFixed(2)}`;
        changeEl.style.color = (cash >= total && total > 0) ? "#2ECC71" : "#ff4444";
    }
}

function placeOrder() {
    const cash = parseFloat(document.getElementById('cash-amount').value) || 0;
    if (cart.length === 0) return alert("⚠️ Add items to basket first!");
    if (cash < total) return alert("❌ Insufficient cash!");

    saveOrderToHistory(cart, total);
    showReceipt(cash, (cash - total));
}

function showReceipt(cash, change) {
    document.getElementById('receipt-date').innerText = new Date().toLocaleString();
    const list = document.getElementById('receipt-items-list');
    list.innerHTML = cart.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${i.name} x${i.quantity}</span>
            <span>₱${(i.price * i.quantity).toFixed(2)}</span>
        </div>`).join('');
    
    document.getElementById('r-total').innerText = `₱${total.toFixed(2)}`;
    document.getElementById('r-cash').innerText = `₱${cash.toFixed(2)}`;
    document.getElementById('r-change').innerText = `₱${change.toFixed(2)}`;
    document.getElementById('receipt-modal').style.display = 'flex';
}

function closeReceipt() {
    document.getElementById('receipt-modal').style.display = 'none';
    cart = [];
    document.getElementById('cash-amount').value = '';
    updateCartUI();
    if (document.getElementById('cart-sidebar').classList.contains('active')) toggleCart();
}

function closeRiceModal() { document.getElementById('rice-modal').style.display = 'none'; }
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}
