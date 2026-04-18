const state = { cart: [], user: null, items: [] };

const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const loginMsg = document.getElementById('loginMsg');

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return response.json();
}

async function initDatabase() {
  const result = await api('/api/init');
  loginMsg.textContent = result.message || result.error || '';
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  if (!result.success) return loginMsg.textContent = result.message || 'فشل تسجيل الدخول';
  state.user = result.user;
  document.getElementById('welcomeUser').textContent = `- ${result.user.full_name} (${result.user.role_name})`;
  loginScreen.classList.remove('active');
  mainScreen.classList.add('active');
  loadAll();
}

function logout() {
  state.user = null;
  mainScreen.classList.remove('active');
  loginScreen.classList.add('active');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  if (tabName === 'reports') loadReports();
}

function updateClock() {
  const el = document.getElementById('clockBox');
  if (el) el.textContent = new Date().toLocaleString('ar-IQ');
}
setInterval(updateClock, 1000);
updateClock();

async function loadStats() {
  const result = await api('/api/stats');
  if (!result.success) return;
  document.getElementById('statCustomers').textContent = result.data.customers;
  document.getElementById('statSuppliers').textContent = result.data.suppliers;
  document.getElementById('statItems').textContent = result.data.items;
  document.getElementById('statInvoices').textContent = result.data.invoices;
  document.getElementById('statSales').textContent = result.data.salesTotal;
  document.getElementById('statUsers').textContent = result.data.users;
}

async function loadCustomers() {
  const result = await api('/api/customers');
  const body = document.getElementById('customersBody');
  body.innerHTML = '';
  if (!result.success) return;
  result.data.forEach(c => body.innerHTML += `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.phone || ''}</td><td>${c.balance}</td></tr>`);
}

async function addCustomer() {
  const payload = { name: customerName.value, phone: customerPhone.value, address: customerAddress.value, balance: customerBalance.value };
  const result = await api('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
  if (result.success) {
    customerName.value = customerPhone.value = customerAddress.value = customerBalance.value = '';
    loadCustomers(); loadStats();
  }
}

async function loadSuppliers() {
  const result = await api('/api/suppliers');
  const body = document.getElementById('suppliersBody');
  body.innerHTML = '';
  if (!result.success) return;
  result.data.forEach(s => body.innerHTML += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.phone || ''}</td><td>${s.balance}</td></tr>`);
}

async function addSupplier() {
  const payload = { name: supplierName.value, phone: supplierPhone.value, address: supplierAddress.value, balance: supplierBalance.value };
  const result = await api('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) });
  if (result.success) {
    supplierName.value = supplierPhone.value = supplierAddress.value = supplierBalance.value = '';
    loadSuppliers(); loadStats();
  }
}

async function loadItems() {
  const result = await api('/api/items');
  const body = document.getElementById('itemsBody');
  body.innerHTML = '';
  if (!result.success) return;
  state.items = result.data || [];
  result.data.forEach(i => body.innerHTML += `<tr><td>${i.id}</td><td>${i.code || ''}</td><td>${i.name}</td><td>${i.price}</td><td>${i.quantity}</td></tr>`);
  renderQuickItems();
}

async function addItem() {
  const payload = { code: itemCode.value, name: itemName.value, unit_name: itemUnit.value, price: itemPrice.value, quantity: itemQty.value };
  const result = await api('/api/items', { method: 'POST', body: JSON.stringify(payload) });
  if (result.success) {
    itemCode.value = itemName.value = itemPrice.value = itemQty.value = '';
    itemUnit.value = 'قطعة';
    loadItems(); loadStats();
  }
}

function renderQuickItems() {
  const box = document.getElementById('quickItems');
  if (!box) return;
  box.innerHTML = '';
  state.items.slice(0, 12).forEach(item => {
    box.innerHTML += `<button class="quick-item" onclick="pickQuickItem(${item.id})">${item.name}<br><small>${item.price}</small></button>`;
  });
}

window.pickQuickItem = function(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;
  saleBarcode.value = item.code || '';
  saleItemName.value = item.name;
  salePrice.value = item.price;
  saleQty.value = 1;
}

function findItem() {
  const code = saleBarcode.value.trim();
  const name = saleItemName.value.trim();
  const item = state.items.find(x => (code && x.code === code) || (name && x.name === name));
  if (!item) return alert('المادة غير موجودة');
  saleItemName.value = item.name;
  salePrice.value = item.price;
  saleQty.value = saleQty.value || 1;
}

function addSaleLine() {
  const code = saleBarcode.value.trim();
  const name = saleItemName.value.trim();
  const quantity = Number(saleQty.value || 0);
  const price = Number(salePrice.value || 0);
  const found = state.items.find(x => (code && x.code === code) || x.name === name);
  if (!name || quantity <= 0) return;
  state.cart.push({ id: found?.id, code, name, quantity, price });
  saleBarcode.value = ''; saleItemName.value = ''; saleQty.value = 1; salePrice.value = '';
  renderCart();
}

function removeCartLine(index) {
  state.cart.splice(index, 1);
  renderCart();
}
window.removeCartLine = removeCartLine;

function clearCart() {
  state.cart = [];
  renderCart();
}

function renderCart() {
  const body = document.getElementById('saleCartBody');
  body.innerHTML = '';
  let total = 0;
  state.cart.forEach((line, index) => {
    const lineTotal = line.quantity * line.price;
    total += lineTotal;
    body.innerHTML += `<tr><td>${line.name}</td><td>${line.quantity}</td><td>${line.price}</td><td>${lineTotal}</td><td><button class="secondary small-btn" onclick="removeCartLine(${index})">حذف</button></td></tr>`;
  });
  document.getElementById('cartTotal').textContent = total.toFixed(2);
}

async function saveInvoice() {
  if (state.cart.length === 0) return;
  const payload = { customer_name: saleCustomer.value, notes: saleNotes.value, items: state.cart };
  const result = await api('/api/sales', { method: 'POST', body: JSON.stringify(payload) });
  if (result.success) {
    state.cart = [];
    saleNotes.value = '';
    renderCart();
    loadSales(); loadItems(); loadStats();
  } else alert(result.message || result.error || 'تعذر حفظ الفاتورة');
}

async function loadSales() {
  const result = await api('/api/sales');
  const body = document.getElementById('salesBody');
  body.innerHTML = '';
  if (!result.success) return;
  result.data.forEach(s => body.innerHTML += `<tr><td>${s.id}</td><td>${s.customer_name || ''}</td><td>${s.total}</td><td>${new Date(s.created_at).toLocaleString('ar-IQ')}</td></tr>`);
}

async function loadUsers() {
  const result = await api('/api/users');
  const body = document.getElementById('usersBody');
  body.innerHTML = '';
  if (!result.success) return;
  result.data.forEach(u => body.innerHTML += `<tr><td>${u.id}</td><td>${u.username}</td><td>${u.full_name}</td><td>${u.role_name}</td><td>${u.is_active ? 'فعال' : 'موقوف'}</td></tr>`);
}

async function addUser() {
  const payload = { username: userUsername.value, password: userPassword.value, full_name: userFullName.value, role_name: userRole.value };
  const result = await api('/api/users', { method: 'POST', body: JSON.stringify(payload) });
  if (result.success) {
    userUsername.value = userPassword.value = userFullName.value = '';
    userRole.value = 'كاشير';
    loadUsers(); loadStats();
  } else alert(result.message || result.error || 'تعذر إضافة المستخدم');
}

async function saveRole() {
  const permissions = [...document.querySelectorAll('.perm-check:checked')].map(x => {
    const [module_name, action_name] = x.value.split(':');
    return { module_name, action_name };
  });
  const payload = { role_name: roleName.value, description: roleDescription.value, permissions };
  const result = await api('/api/roles', { method: 'POST', body: JSON.stringify(payload) });
  document.getElementById('rolesMsg').textContent = result.message || result.error || '';
}

async function loadReports() {
  const result = await api('/api/reports');
  if (!result.success) return;
  topItemsBody.innerHTML = '';
  recentInvoicesBody.innerHTML = '';
  lowStockBody.innerHTML = '';
  dailySalesBody.innerHTML = '';
  result.data.topItems.forEach(r => topItemsBody.innerHTML += `<tr><td>${r.item_name}</td><td>${r.qty}</td><td>${r.total}</td></tr>`);
  result.data.recentInvoices.forEach(r => recentInvoicesBody.innerHTML += `<tr><td>${r.id}</td><td>${r.customer_name || ''}</td><td>${r.total}</td></tr>`);
  result.data.lowStock.forEach(r => lowStockBody.innerHTML += `<tr><td>${r.name}</td><td>${r.quantity}</td><td>${r.price}</td></tr>`);
  result.data.dailySales.forEach(r => dailySalesBody.innerHTML += `<tr><td>${r.day}</td><td>${r.total}</td></tr>`);
}

function loadAll() {
  loadStats(); loadCustomers(); loadSuppliers(); loadItems(); loadSales(); loadUsers(); loadReports();
}

document.getElementById('initBtn').addEventListener('click', initDatabase);
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
document.getElementById('addCustomerBtn').addEventListener('click', addCustomer);
document.getElementById('addSupplierBtn').addEventListener('click', addSupplier);
document.getElementById('addItemBtn').addEventListener('click', addItem);
document.getElementById('refreshItemsBtn').addEventListener('click', loadItems);
document.getElementById('findItemBtn').addEventListener('click', findItem);
document.getElementById('addSaleLineBtn').addEventListener('click', addSaleLine);
document.getElementById('clearCartBtn').addEventListener('click', clearCart);
document.getElementById('saveInvoiceBtn').addEventListener('click', saveInvoice);
document.getElementById('addUserBtn').addEventListener('click', addUser);
document.getElementById('saveRoleBtn').addEventListener('click', saveRole);
