const LS_KEY = 'aat_v9_pro_data';
const defaultState = {
  settings: {
    companyName: 'شركة عمار العاني للتجارة والتوزيع',
    currency: 'دينار عراقي',
    currencySymbol: 'د.ع',
    themePrimary: '#2563eb',
    themeSuccess: '#16a34a',
    themeDanger: '#dc2626',
    allowNegativeStock: false,
    allowDiscount: true,
    maxDiscountPercent: 10,
    returnDays: 7,
    forecastDays: 14,
    lowConsumption1: 10,
    lowConsumption2: 20,
    lowConsumption3: 40,
    minCharsSearch: 1,
    searchSuggestionsLimit: 12,
    requireReasonForManualAdjust: true,
    branches: ['المخزن', 'فرع عمار العاني', 'فرع أبو عمار'],
    categories: ['كهربائيات', 'عدد يدوية', 'صحيات', 'مواد ماء ومجاري', 'براغي'],
  },
  users: [
    {
      username: 'admin', password: '123456', displayName: 'المدير الأعلى', role: 'Super Admin', branch: 'المخزن', active: true,
      permissions: 'ALL'
    }
  ],
  items: [
    { id: uid(), name: 'مصباح LED أبيض 40 واط', shortName:'LED 40W', code:'ELE-LMP-001', barcode:'1000001', category:'كهربائيات', group:'مصابيح', model:'40W', brand:'AAT', unit:'قطعة', pack:'12', cost:7000, price:9500, min:10, reorder:20, safety:8, max:120, branchStocks:{'المخزن':60,'فرع عمار العاني':12,'فرع أبو عمار':8}, notes:'' },
    { id: uid(), name: 'برغي جبس 3 سم', shortName:'برغي 3سم', code:'BRG-SCR-003', barcode:'1000002', category:'براغي', group:'براغي جبس', model:'3 سم', brand:'AAT', unit:'قطعة', pack:'100', cost:80, price:150, min:300, reorder:500, safety:200, max:5000, branchStocks:{'المخزن':2200,'فرع عمار العاني':300,'فرع أبو عمار':180}, notes:'' },
    { id: uid(), name: 'حنفية مغسلة ستانلس', shortName:'حنفية', code:'SAN-TAP-001', barcode:'1000003', category:'صحيات', group:'حنفيات', model:'ستانلس', brand:'AAT', unit:'قطعة', pack:'1', cost:12000, price:16500, min:5, reorder:8, safety:4, max:60, branchStocks:{'المخزن':20,'فرع عمار العاني':4,'فرع أبو عمار':3}, notes:'' },
  ],
  customers: [
    { id: uid(), name:'زبون نقدي', phone:'', debt:0, type:'نقدي', notes:'' }
  ],
  suppliers: [
    { id: uid(), name:'مورد رئيسي', phone:'', balance:0, notes:'' }
  ],
  sales: [],
  purchases: [],
  saleReturns: [],
  purchaseReturns: [],
  transfers: [],
  stockCounts: [],
  debts: [],
  auditLog: []
};

let state = loadState();
let currentUser = null;
let currentPage = 'dashboard';
let salesCart = [];
let purchaseCart = [];
let activeSettingsTab = 'general';
let activeUsersTab = 'users';

const pageDefs = [
  ['dashboard','لوحة التحكم','نظرة تنفيذية سريعة'],
  ['sales','البيع (POS)','نظام بيع سريع واحترافي'],
  ['purchases','الشراء','إدارة مشتريات الشركة'],
  ['items','الأصناف','تعريف وتعديل الأصناف'],
  ['inventory','المخزون والجرد','أرصدة وتحكم ومراجعة'],
  ['customers','العملاء','إدارة العملاء والديون'],
  ['suppliers','الموردون','إدارة الموردين والمشتريات'],
  ['debts','الديون والمستحقات','كشف الديون والمدفوعات'],
  ['transfers','التحويلات','التحويل بين المواقع'],
  ['reports','التقارير والربح','تقارير تشغيل وربحية'],
  ['suggestions','المقترحات والتنبيهات','نظام اقتراحات ذكي'],
  ['users','المستخدمون والصلاحيات','إنشاء مستخدمين وتحكم كامل'],
  ['settings','الإعدادات المفتوحة','تعديل كل شيء من مكانه']
];

const permissionMap = {
  dashboard:'لوحة التحكم', sales:'البيع', purchases:'الشراء', items:'الأصناف', inventory:'المخزون والجرد',
  customers:'العملاء', suppliers:'الموردون', debts:'الديون', transfers:'التحويلات', reports:'التقارير',
  profit:'تقرير الربح', suggestions:'المقترحات', settings:'الإعدادات', users:'إدارة المستخدمين',
  editPrice:'تعديل الأسعار', editCost:'تعديل الكلفة', deleteRecords:'حذف السجلات', manualStockAdjust:'تعديل الرصيد يدوياً',
  importExport:'الاستيراد والتصدير', printInvoices:'طباعة الفواتير', printBarcode:'طباعة الباركود', returns:'الإرجاعات'
};

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function loadState(){ try { return { ...structuredClone(defaultState), ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }; } catch(e){ return structuredClone(defaultState); } }
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); applyTheme(); renderAll(); }
function money(n){ return `${Number(n||0).toLocaleString('ar-IQ')} ${state.settings.currencySymbol}`; }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function audit(action, detail){ if(!currentUser) return; state.auditLog.unshift({ id:uid(), at:new Date().toISOString(), user:currentUser.username, branch:currentUser.branch, action, detail }); state.auditLog = state.auditLog.slice(0, 5000); }
function hasPerm(key){ return currentUser && (currentUser.permissions==='ALL' || currentUser.permissions?.includes(key)); }
function byCodeNameBarcode(q){ q=(q||'').trim().toLowerCase(); return state.items.filter(it => [it.name,it.shortName,it.code,it.barcode,it.category,it.group,it.model,it.brand].some(v => String(v||'').toLowerCase().includes(q))); }
function totalStock(item){ return Object.values(item.branchStocks||{}).reduce((a,b)=>a+Number(b||0),0); }
function forecastForItem(item, days=14){
  const since = Date.now() - days*24*3600*1000;
  const sold = state.sales.flatMap(inv=>inv.lines.map(line=>({...line, branch:inv.branch, date:inv.date}))).filter(l=>l.itemId===item.id && new Date(l.date).getTime()>=since).reduce((a,b)=>a+Number(b.qty||0),0);
  return sold;
}
function itemStatus(item){
  const stock = totalStock(item);
  if(stock <= Number(item.min||0)) return {label:'حرج', cls:'danger'};
  if(stock <= Number(item.reorder||0)) return {label:'يحتاج طلب', cls:'warning'};
  if(stock > Number(item.max||0) && Number(item.max||0)>0) return {label:'فائض', cls:'primary'};
  return {label:'طبيعي', cls:'success'};
}
function computeProfit(){
  return state.sales.reduce((sum,inv)=> sum + inv.lines.reduce((s,l)=> s + ((Number(l.price)-Number(l.cost))*Number(l.qty)),0), 0)
    - state.saleReturns.reduce((sum,inv)=> sum + inv.lines.reduce((s,l)=> s + ((Number(l.price)-Number(l.cost))*Number(l.qty)),0), 0);
}
function branchSalesTotal(branch){ return state.sales.filter(s=>s.branch===branch).reduce((a,b)=>a+b.total,0); }
function lowStockItems(){ return state.items.filter(i => totalStock(i) <= Number(i.reorder||0)); }
function suggestedPurchases(){
  return state.items.map(item=>{
    const consumption = forecastForItem(item, Number(state.settings.forecastDays||14));
    const stock = totalStock(item);
    const needed = Math.max(0, consumption + Number(item.safety||0) - stock);
    return {item, consumption, stock, needed};
  }).filter(x=> x.needed > 0 || x.stock <= Number(x.item.reorder||0)).sort((a,b)=>b.needed-a.needed).slice(0,30);
}

function ensureDefaults(){
  if(!state.users?.length) state.users = structuredClone(defaultState.users);
  if(!state.items) state.items = [];
  if(!state.customers?.length) state.customers = structuredClone(defaultState.customers);
  if(!state.suppliers?.length) state.suppliers = structuredClone(defaultState.suppliers);
}
ensureDefaults();

const els = {
  loginBtn: document.getElementById('loginBtn'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  loginScreen: document.getElementById('loginScreen'),
  mainApp: document.getElementById('mainApp'),
  logoutBtn: document.getElementById('logoutBtn'),
  sidebarNav: document.getElementById('sidebarNav'),
  pageTitle: document.getElementById('pageTitle'),
  pageSubtitle: document.getElementById('pageSubtitle'),
  currentUserLabel: document.getElementById('currentUserLabel'),
  dashboardSection: document.getElementById('dashboardSection'),
  salesSection: document.getElementById('salesSection'),
  purchasesSection: document.getElementById('purchasesSection'),
  itemsSection: document.getElementById('itemsSection'),
  inventorySection: document.getElementById('inventorySection'),
  customersSection: document.getElementById('customersSection'),
  suppliersSection: document.getElementById('suppliersSection'),
  debtsSection: document.getElementById('debtsSection'),
  transfersSection: document.getElementById('transfersSection'),
  reportsSection: document.getElementById('reportsSection'),
  suggestionsSection: document.getElementById('suggestionsSection'),
  settingsSection: document.getElementById('settingsSection'),
  usersSection: document.getElementById('usersSection'),
  globalSearch: document.getElementById('globalSearch'),
  globalSuggestions: document.getElementById('globalSuggestions'),
  backupBtn: document.getElementById('backupBtn'),
  restoreBtn: document.getElementById('restoreBtn'),
  restoreFile: document.getElementById('restoreFile')
};

els.loginBtn.onclick = () => {
  const user = state.users.find(u => u.username === els.loginUsername.value.trim() && u.password === els.loginPassword.value.trim() && u.active !== false);
  if(!user) return alert('اسم المستخدم أو الرقم السري غير صحيح');
  currentUser = user;
  els.loginScreen.classList.add('hidden');
  els.mainApp.classList.remove('hidden');
  els.currentUserLabel.textContent = `${currentUser.displayName} — ${currentUser.role}`;
  applyTheme();
  renderAll();
};
els.logoutBtn.onclick = () => { currentUser = null; els.mainApp.classList.add('hidden'); els.loginScreen.classList.remove('hidden'); };
els.backupBtn.onclick = () => downloadFile(`${safeName(state.settings.companyName)}_backup.json`, JSON.stringify(state,null,2), 'application/json');
els.restoreBtn.onclick = () => els.restoreFile.click();
els.restoreFile.onchange = async (e) => {
  const file = e.target.files[0]; if(!file) return;
  const text = await file.text();
  try {
    state = JSON.parse(text);
    saveState();
    alert('تم استيراد النسخة الاحتياطية');
  } catch(err){ alert('ملف النسخة غير صالح'); }
};

els.globalSearch.addEventListener('input', () => renderGlobalSuggestions());
document.addEventListener('click', (e)=>{
  if(!els.globalSearch.contains(e.target) && !els.globalSuggestions.contains(e.target)) els.globalSuggestions.classList.add('hidden');
});

function renderGlobalSuggestions(){
  const q = els.globalSearch.value.trim();
  const min = Number(state.settings.minCharsSearch||1);
  if(q.length < min){ els.globalSuggestions.classList.add('hidden'); return; }
  const limit = Number(state.settings.searchSuggestionsLimit||12);
  const items = byCodeNameBarcode(q).slice(0, limit).map(i=>({type:'صنف', label:i.name, sub:`${i.code} • ${i.category}`, page:'items', id:i.id}));
  const customers = state.customers.filter(c=> c.name.includes(q) || String(c.phone||'').includes(q)).slice(0,4).map(c=>({type:'عميل', label:c.name, sub:c.phone||'', page:'customers', id:c.id}));
  const suppliers = state.suppliers.filter(s=> s.name.includes(q) || String(s.phone||'').includes(q)).slice(0,4).map(s=>({type:'مورد', label:s.name, sub:s.phone||'', page:'suppliers', id:s.id}));
  const invoices = [...state.sales.map(s=>({prefix:'بيع', id:s.id, label:s.invoiceNo})), ...state.purchases.map(p=>({prefix:'شراء', id:p.id, label:p.invoiceNo}))]
    .filter(x=>x.label?.includes(q)).slice(0,4).map(x=>({type:x.prefix, label:x.label, sub:'فاتورة', page:x.prefix==='بيع'?'sales':'purchases', id:x.id}));
  const results = [...items, ...customers, ...suppliers, ...invoices];
  if(!results.length){ els.globalSuggestions.innerHTML = `<div class="suggestion-item muted">لا توجد نتائج</div>`; els.globalSuggestions.classList.remove('hidden'); return; }
  els.globalSuggestions.innerHTML = results.map(r=>`<div class="suggestion-item" onclick="openSearchResult('${r.page}','${r.id}')"><strong>${r.label}</strong><br><small>${r.type} — ${r.sub}</small></div>`).join('');
  els.globalSuggestions.classList.remove('hidden');
}
window.openSearchResult = (page, id) => { currentPage = page; els.globalSuggestions.classList.add('hidden'); renderAll(); scrollToHighlight(id, page); };
function scrollToHighlight(id, page){ setTimeout(()=>{ const el = document.querySelector(`[data-highlight="${page}:${id}"]`); if(el){ el.scrollIntoView({behavior:'smooth', block:'center'}); el.style.outline = '3px solid #bfdbfe'; setTimeout(()=> el.style.outline='', 1800);} }, 250); }

function renderAll(){
  if(!currentUser) return;
  renderSidebar();
  renderDashboard();
  renderSales();
  renderPurchases();
  renderItems();
  renderInventory();
  renderCustomers();
  renderSuppliers();
  renderDebts();
  renderTransfers();
  renderReports();
  renderSuggestions();
  renderSettings();
  renderUsers();
  showPage(currentPage);
}

function renderSidebar(){
  els.sidebarNav.innerHTML = pageDefs.filter(([key])=>hasPerm(key)).map(([key,label])=>`<button class="${currentPage===key?'active':''}" onclick="setPage('${key}')"><span>${label}</span><span>◀</span></button>`).join('');
}
window.setPage = (page) => { currentPage = page; showPage(page); };
function showPage(page){
  const secMap = {dashboard:'dashboardSection', sales:'salesSection', purchases:'purchasesSection', items:'itemsSection', inventory:'inventorySection', customers:'customersSection', suppliers:'suppliersSection', debts:'debtsSection', transfers:'transfersSection', reports:'reportsSection', suggestions:'suggestionsSection', settings:'settingsSection', users:'usersSection'};
  Object.values(secMap).forEach(id=> els[id].classList.add('hidden'));
  els[secMap[page]].classList.remove('hidden');
  const meta = pageDefs.find(p=>p[0]===page); els.pageTitle.textContent = meta?.[1] || ''; els.pageSubtitle.textContent = meta?.[2] || '';
  renderSidebar();
}

function renderDashboard(){
  const today = todayStr();
  const salesToday = state.sales.filter(s=>s.date===today).reduce((a,b)=>a+b.total,0);
  const purchasesToday = state.purchases.filter(s=>s.date===today).reduce((a,b)=>a+b.total,0);
  const profitTotal = computeProfit();
  const low = lowStockItems().length;
  const topItems = [...state.items].sort((a,b)=>forecastForItem(b,14)-forecastForItem(a,14)).slice(0,5);
  els.dashboardSection.innerHTML = `
    <div class="cards-4">
      ${statCard('مبيعات اليوم', money(salesToday), 'primary')}
      ${statCard('مشتريات اليوم', money(purchasesToday), 'purple')}
      ${statCard('الربح التراكمي', money(profitTotal), 'success')}
      ${statCard('مواد تحتاج متابعة', String(low), 'danger')}
    </div>
    <div class="card-grid-2">
      <div class="card">
        <h3 class="section-title">اختصارات سريعة</h3>
        <div class="quick-actions no-print">
          <button onclick="setPage('sales')">💰 فاتورة بيع جديدة</button>
          <button onclick="setPage('purchases')">🛒 فاتورة شراء جديدة</button>
          <button onclick="setPage('items')">📦 إضافة صنف</button>
          <button onclick="setPage('reports')">📈 تقارير الربح</button>
        </div>
      </div>
      <div class="card">
        <h3 class="section-title">أفضل الفروع</h3>
        <ul class="simple-list">
          ${state.settings.branches.map(br=>`<li><strong>${br}</strong><br><small class="muted">مبيعات: ${money(branchSalesTotal(br))}</small></li>`).join('')}
        </ul>
      </div>
    </div>
    <div class="card-grid-2">
      <div class="card">
        <h3 class="section-title">أكثر المواد صرفاً خلال 14 يوم</h3>
        <ul class="simple-list">
          ${topItems.map(item=>`<li>${item.name}<br><small class="muted">صرف: ${forecastForItem(item,14)} • رصيد: ${totalStock(item)}</small></li>`).join('') || '<li class="muted">لا توجد بيانات كافية</li>'}
        </ul>
      </div>
      <div class="card">
        <h3 class="section-title">تنبيهات فورية</h3>
        <ul class="simple-list">
          ${suggestedPurchases().slice(0,6).map(x=>`<li><span class="badge ${itemStatus(x.item).cls}">${itemStatus(x.item).label}</span> ${x.item.name}<br><small class="muted">المقترح: ${x.needed} • المتوقع 14 يوم: ${x.consumption}</small></li>`).join('') || '<li class="muted">لا توجد تنبيهات حالياً</li>'}
        </ul>
      </div>
    </div>`;
}
function statCard(label, value, cls){ return `<div class="card stat-card"><div class="label">${label}</div><div class="value">${value}</div><div class="badge ${cls}">${cls==='danger'?'تنبيه':cls==='success'?'جيد':'مؤشر'}</div></div>`; }

function renderSales(){
  if(!hasPerm('sales')) return;
  const options = state.items.map(i=>`<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} — ${escapeHtml(i.code)} — ${money(i.price)}</option>`).join('');
  const branchOptions = state.settings.branches.map(b=>`<option ${currentUser.branch===b?'selected':''}>${b}</option>`).join('');
  const customerOptions = state.customers.map(c=>`<option value="${escapeHtml(c.name)}"></option>`).join('');
  els.salesSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card">
      <h3 class="section-title">نظام البيع (POS)</h3>
      <div class="form-grid-3">
        <div><label class="field-label">الموقع</label><select id="saleBranch">${branchOptions}</select></div>
        <div><label class="field-label">العميل</label><input id="saleCustomer" list="customerList" placeholder="زبون نقدي" /></div>
        <div><label class="field-label">تاريخ الفاتورة</label><input id="saleDate" type="date" value="${todayStr()}" /></div>
      </div>
      <datalist id="customerList">${customerOptions}</datalist>
      <div class="form-grid-4" style="margin-top:12px">
        <div><label class="field-label">بحث عن مادة</label><input id="saleSearch" list="itemsListSearch" placeholder="اكتب حرف واحد أو باركود أو كود" /></div>
        <div><label class="field-label">الكمية</label><input id="saleQty" type="number" min="1" value="1" /></div>
        <div><label class="field-label">السعر</label><input id="salePrice" type="number" min="0" value="0" /></div>
        <div class="no-print" style="display:flex;align-items:end"><button class="primary-btn full" onclick="addSaleLine()">إضافة للسلة</button></div>
      </div>
      <datalist id="itemsListSearch">${options}</datalist>
      <div class="card cart-box" style="margin-top:16px">
        <div class="flex-row" style="justify-content:space-between"><h4>سلة البيع</h4><button class="small-btn no-print" onclick="salesCart=[]; renderSales()">تفريغ</button></div>
        <div>${salesCart.length ? salesCart.map((l,idx)=>`<div class="cart-line"><div>${escapeHtml(l.name)}<br><small class="muted">${l.qty} × ${money(l.price)}</small></div><div><strong>${money(l.qty*l.price)}</strong><br><button class="small-btn no-print" onclick="salesCart.splice(${idx},1); renderSales()">حذف</button></div></div>`).join('') : '<p class="muted">لا توجد عناصر في السلة</p>'}</div>
      </div>
    </div>
    <div class="card">
      <h3 class="section-title">إنهاء الفاتورة</h3>
      <div class="form-grid-2">
        <div><label class="field-label">نسبة الخصم %</label><input id="saleDiscount" type="number" min="0" max="100" value="0" ${!state.settings.allowDiscount?'disabled':''} /></div>
        <div><label class="field-label">ملاحظات</label><input id="saleNotes" placeholder="اختياري" /></div>
      </div>
      <div class="total-box" style="margin:16px 0">${money(calcSaleTotal())}</div>
      <div class="flex-row no-print">
        <button class="success-btn" onclick="saveSaleInvoice()">حفظ الفاتورة</button>
        <button class="outline-btn" onclick="printLastSale()">طباعة آخر فاتورة</button>
      </div>
      <div class="notice" style="margin-top:16px">العملة المعتمدة: ${state.settings.currency} — الطباعة: احترافية — النظام مفتوح لإضافة فروع لاحقاً.</div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 class="section-title">آخر فواتير البيع</h3>
    <div class="table-wrap"><table><thead><tr><th>رقم الفاتورة</th><th>التاريخ</th><th>الموقع</th><th>العميل</th><th>الإجمالي</th><th class="no-print">إجراء</th></tr></thead>
    <tbody>${state.sales.slice(0,20).map(inv=>`<tr data-highlight="sales:${inv.id}"><td>${inv.invoiceNo}</td><td>${inv.date}</td><td>${inv.branch}</td><td>${inv.customer}</td><td>${money(inv.total)}</td><td class="no-print"><button class="small-btn" onclick="printInvoiceById('sale','${inv.id}')">طباعة</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">لا توجد فواتير بيع</td></tr>'}</tbody></table></div>
  </div>`;
}
window.addSaleLine = () => {
  const query = val('saleSearch');
  const item = findItemSmart(query);
  if(!item) return alert('المادة غير موجودة');
  const qty = Number(val('saleQty')||1); if(qty<=0) return alert('الكمية غير صحيحة');
  const price = Number(val('salePrice')||item.price||0);
  salesCart.push({ itemId:item.id, name:item.name, qty, price, cost:item.cost });
  setVal('saleSearch',''); setVal('saleQty',1); setVal('salePrice',0); renderSales();
};
window.saveSaleInvoice = () => {
  if(!salesCart.length) return alert('السلة فارغة');
  const branch = val('saleBranch');
  for(const line of salesCart){
    const item = state.items.find(i=>i.id===line.itemId);
    const available = Number(item.branchStocks?.[branch]||0);
    if(!state.settings.allowNegativeStock && available < line.qty) return alert(`المخزون غير كافٍ للمادة: ${item.name}`);
  }
  for(const line of salesCart){
    const item = state.items.find(i=>i.id===line.itemId);
    item.branchStocks[branch] = Number(item.branchStocks[branch]||0) - Number(line.qty);
  }
  const discountPct = Math.min(Number(val('saleDiscount')||0), Number(state.settings.maxDiscountPercent||100));
  const subtotal = salesCart.reduce((a,b)=>a+b.qty*b.price,0);
  const discountValue = subtotal * discountPct / 100;
  const total = subtotal - discountValue;
  const invoice = { id:uid(), invoiceNo:`S-${Date.now()}`, date: val('saleDate')||todayStr(), branch, customer: val('saleCustomer')||'زبون نقدي', notes: val('saleNotes'), discountPct, discountValue, lines: structuredClone(salesCart), subtotal, total };
  state.sales.unshift(invoice); salesCart=[]; audit('حفظ فاتورة بيع', invoice.invoiceNo); saveState(); alert('تم حفظ فاتورة البيع');
};
window.printLastSale = () => { if(!state.sales.length) return alert('لا توجد فواتير'); printInvoice('sale', state.sales[0]); };

function renderPurchases(){
  if(!hasPerm('purchases')) return;
  const options = state.items.map(i=>`<option value="${escapeHtml(i.name)}">${escapeHtml(i.name)} — ${escapeHtml(i.code)} — ${money(i.cost)}</option>`).join('');
  const branchOptions = state.settings.branches.map(b=>`<option>${b}</option>`).join('');
  const supplierOptions = state.suppliers.map(s=>`<option value="${escapeHtml(s.name)}"></option>`).join('');
  els.purchasesSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card">
      <h3 class="section-title">نظام الشراء</h3>
      <div class="form-grid-3">
        <div><label class="field-label">الموقع المستلم</label><select id="purchaseBranch">${branchOptions}</select></div>
        <div><label class="field-label">المورد</label><input id="purchaseSupplier" list="supplierList" placeholder="مورد رئيسي" /></div>
        <div><label class="field-label">تاريخ الفاتورة</label><input id="purchaseDate" type="date" value="${todayStr()}" /></div>
      </div>
      <datalist id="supplierList">${supplierOptions}</datalist>
      <div class="form-grid-4" style="margin-top:12px">
        <div><label class="field-label">بحث عن مادة</label><input id="purchaseSearch" list="itemsListPurchase" placeholder="اسم / باركود / كود" /></div>
        <div><label class="field-label">الكمية</label><input id="purchaseQty" type="number" min="1" value="1" /></div>
        <div><label class="field-label">الكلفة</label><input id="purchaseCost" type="number" min="0" value="0" /></div>
        <div class="no-print" style="display:flex;align-items:end"><button class="primary-btn full" onclick="addPurchaseLine()">إضافة للسلة</button></div>
      </div>
      <datalist id="itemsListPurchase">${options}</datalist>
      <div class="card cart-box" style="margin-top:16px">
        <div class="flex-row" style="justify-content:space-between"><h4>سلة الشراء</h4><button class="small-btn no-print" onclick="purchaseCart=[]; renderPurchases()">تفريغ</button></div>
        <div>${purchaseCart.length ? purchaseCart.map((l,idx)=>`<div class="cart-line"><div>${escapeHtml(l.name)}<br><small class="muted">${l.qty} × ${money(l.cost)}</small></div><div><strong>${money(l.qty*l.cost)}</strong><br><button class="small-btn no-print" onclick="purchaseCart.splice(${idx},1); renderPurchases()">حذف</button></div></div>`).join('') : '<p class="muted">لا توجد عناصر في السلة</p>'}</div>
      </div>
    </div>
    <div class="card">
      <h3 class="section-title">إنهاء فاتورة الشراء</h3>
      <div class="total-box" style="margin:16px 0">${money(calcPurchaseTotal())}</div>
      <div class="flex-row no-print">
        <button class="success-btn" onclick="savePurchaseInvoice()">حفظ فاتورة الشراء</button>
        <button class="outline-btn" onclick="printLastPurchase()">طباعة آخر فاتورة</button>
      </div>
      <div class="hint-box" style="margin-top:16px">أي فاتورة شراء تحدث الكلفة والمخزون تلقائياً.</div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <h3 class="section-title">آخر فواتير الشراء</h3>
    <div class="table-wrap"><table><thead><tr><th>رقم الفاتورة</th><th>التاريخ</th><th>الموقع</th><th>المورد</th><th>الإجمالي</th><th class="no-print">إجراء</th></tr></thead>
    <tbody>${state.purchases.slice(0,20).map(inv=>`<tr data-highlight="purchases:${inv.id}"><td>${inv.invoiceNo}</td><td>${inv.date}</td><td>${inv.branch}</td><td>${inv.supplier}</td><td>${money(inv.total)}</td><td class="no-print"><button class="small-btn" onclick="printInvoiceById('purchase','${inv.id}')">طباعة</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">لا توجد فواتير شراء</td></tr>'}</tbody></table></div>
  </div>`;
}
window.addPurchaseLine = () => {
  const query = val('purchaseSearch');
  const item = findItemSmart(query);
  if(!item) return alert('المادة غير موجودة');
  const qty = Number(val('purchaseQty')||1); if(qty<=0) return alert('الكمية غير صحيحة');
  const cost = Number(val('purchaseCost')||item.cost||0);
  purchaseCart.push({ itemId:item.id, name:item.name, qty, cost });
  setVal('purchaseSearch',''); setVal('purchaseQty',1); setVal('purchaseCost',0); renderPurchases();
};
window.savePurchaseInvoice = () => {
  if(!purchaseCart.length) return alert('السلة فارغة');
  const branch = val('purchaseBranch');
  for(const line of purchaseCart){
    const item = state.items.find(i=>i.id===line.itemId);
    item.branchStocks[branch] = Number(item.branchStocks[branch]||0) + Number(line.qty);
    item.cost = Number(line.cost);
  }
  const total = purchaseCart.reduce((a,b)=>a+b.qty*b.cost,0);
  const invoice = { id:uid(), invoiceNo:`P-${Date.now()}`, date: val('purchaseDate')||todayStr(), branch, supplier: val('purchaseSupplier')||'مورد رئيسي', lines: structuredClone(purchaseCart), total };
  state.purchases.unshift(invoice); purchaseCart=[]; audit('حفظ فاتورة شراء', invoice.invoiceNo); saveState(); alert('تم حفظ فاتورة الشراء');
};
window.printLastPurchase = () => { if(!state.purchases.length) return alert('لا توجد فواتير'); printInvoice('purchase', state.purchases[0]); };

function renderItems(){
  if(!hasPerm('items')) return;
  const cats = state.settings.categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('');
  const rows = state.items.slice(0,200).map(item=>{
    const st = itemStatus(item);
    return `<tr data-highlight="items:${item.id}"><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.code)}</td><td>${escapeHtml(item.barcode||'')}</td><td>${escapeHtml(item.category)}</td><td>${money(item.cost)}</td><td>${money(item.price)}</td><td>${totalStock(item)}</td><td><span class="badge ${st.cls}">${st.label}</span></td><td class="no-print"><button class="small-btn" onclick="loadItemForEdit('${item.id}')">تعديل</button> <button class="small-btn" onclick="printBarcode('${item.id}')">باركود</button></td></tr>`;
  }).join('');
  els.itemsSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card">
      <h3 class="section-title">إضافة / تعديل صنف</h3>
      <input id="editItemId" type="hidden" />
      <div class="form-grid-3">
        <div><label class="field-label">اسم الصنف</label><input id="itemName" /></div>
        <div><label class="field-label">اسم مختصر</label><input id="itemShortName" /></div>
        <div><label class="field-label">القسم</label><select id="itemCategory">${cats}</select></div>
        <div><label class="field-label">المجموعة</label><input id="itemGroup" /></div>
        <div><label class="field-label">الموديل</label><input id="itemModel" /></div>
        <div><label class="field-label">العلامة</label><input id="itemBrand" /></div>
        <div><label class="field-label">الكود الداخلي</label><input id="itemCode" /></div>
        <div><label class="field-label">الباركود</label><input id="itemBarcode" /></div>
        <div><label class="field-label">الوحدة</label><input id="itemUnit" value="قطعة" /></div>
        <div><label class="field-label">التعبئة</label><input id="itemPack" value="1" /></div>
        <div><label class="field-label">سعر الكلفة</label><input id="itemCost" type="number" /></div>
        <div><label class="field-label">سعر البيع</label><input id="itemPrice" type="number" /></div>
        <div><label class="field-label">الحد الأدنى</label><input id="itemMin" type="number" /></div>
        <div><label class="field-label">حد إعادة الطلب</label><input id="itemReorder" type="number" /></div>
        <div><label class="field-label">كمية الأمان</label><input id="itemSafety" type="number" /></div>
        <div><label class="field-label">الحد الأعلى</label><input id="itemMax" type="number" /></div>
      </div>
      <div class="no-print" style="margin-top:14px" class="flex-row">
        <button class="primary-btn" onclick="saveItem()">حفظ الصنف</button>
        <button class="outline-btn" onclick="clearItemForm()">تفريغ</button>
      </div>
    </div>
    <div class="card">
      <h3 class="section-title">ملخص الأصناف</h3>
      <ul class="simple-list">
        <li>عدد الأصناف: <strong>${state.items.length}</strong></li>
        <li>مواد حرجة: <strong>${lowStockItems().length}</strong></li>
        <li>أصناف كهربائيات: <strong>${state.items.filter(i=>i.category==='كهربائيات').length}</strong></li>
        <li>أصناف براغي: <strong>${state.items.filter(i=>i.category==='براغي').length}</strong></li>
      </ul>
      <div class="hint-box">البحث العام أعلى الشاشة يوصل لأي صنف بسرعة، وطباعة الباركود متاحة من الجدول.</div>
    </div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="flex-row" style="justify-content:space-between"><h3 class="section-title">قائمة الأصناف</h3><small class="muted">للسرعة، العرض الحالي حتى 200 صنف</small></div>
    <div class="table-wrap"><table><thead><tr><th>الصنف</th><th>الكود</th><th>الباركود</th><th>القسم</th><th>الكلفة</th><th>البيع</th><th>الرصيد</th><th>الحالة</th><th class="no-print">إجراء</th></tr></thead><tbody>${rows}</tbody></table></div>
  </div>`;
}
window.saveItem = () => {
  const id = val('editItemId');
  const payload = {
    name: val('itemName'), shortName: val('itemShortName'), category: val('itemCategory'), group: val('itemGroup'), model: val('itemModel'), brand: val('itemBrand'),
    code: val('itemCode'), barcode: val('itemBarcode'), unit: val('itemUnit'), pack: val('itemPack'), cost: Number(val('itemCost')||0), price: Number(val('itemPrice')||0),
    min: Number(val('itemMin')||0), reorder: Number(val('itemReorder')||0), safety: Number(val('itemSafety')||0), max: Number(val('itemMax')||0)
  };
  if(!payload.name || !payload.code) return alert('اسم الصنف والكود الداخلي إجباريان');
  if(id){
    const item = state.items.find(i=>i.id===id); Object.assign(item, payload); audit('تعديل صنف', item.name);
  } else {
    state.items.unshift({ id:uid(), ...payload, branchStocks: Object.fromEntries(state.settings.branches.map(b=>[b,0])), notes:'' }); audit('إضافة صنف', payload.name);
  }
  clearItemForm(); saveState(); alert('تم حفظ الصنف');
};
window.loadItemForEdit = (id) => {
  const item = state.items.find(i=>i.id===id); if(!item) return;
  setVal('editItemId', item.id); setVal('itemName', item.name); setVal('itemShortName', item.shortName); setVal('itemCategory', item.category); setVal('itemGroup', item.group);
  setVal('itemModel', item.model); setVal('itemBrand', item.brand); setVal('itemCode', item.code); setVal('itemBarcode', item.barcode); setVal('itemUnit', item.unit); setVal('itemPack', item.pack);
  setVal('itemCost', item.cost); setVal('itemPrice', item.price); setVal('itemMin', item.min); setVal('itemReorder', item.reorder); setVal('itemSafety', item.safety); setVal('itemMax', item.max);
  currentPage='items'; showPage('items');
};
window.clearItemForm = () => ['editItemId','itemName','itemShortName','itemGroup','itemModel','itemBrand','itemCode','itemBarcode','itemPack','itemCost','itemPrice','itemMin','itemReorder','itemSafety','itemMax'].forEach(id=>setVal(id,''));
window.printBarcode = (id) => {
  const item = state.items.find(i=>i.id===id); if(!item) return;
  const html = `<html dir="rtl"><head><title>Barcode</title><style>body{font-family:Tahoma;padding:20px} .code{font-size:34px;letter-spacing:4px;border:2px solid #000;padding:14px;text-align:center;margin-top:20px}</style></head><body><h2>${escapeHtml(state.settings.companyName)}</h2><h3>${escapeHtml(item.name)}</h3><div class="code">${escapeHtml(item.barcode||item.code)}</div><p>${escapeHtml(item.code)}</p><script>window.print()</script></body></html>`;
  popup(html);
};

function renderInventory(){
  if(!hasPerm('inventory')) return;
  els.inventorySection.innerHTML = `
  <div class="card-grid-3">
    ${state.settings.branches.map(br=>`<div class="card"><h3 class="section-title">${br}</h3><ul class="simple-list">${state.items.slice(0,6).map(i=>`<li>${escapeHtml(i.name)}<br><small class="muted">${Number(i.branchStocks?.[br]||0)} ${escapeHtml(i.unit)}</small></li>`).join('')}</ul></div>`).join('')}
  </div>
  <div class="card" style="margin-top:16px">
    <h3 class="section-title">الجرد والتسوية</h3>
    <div class="form-grid-4">
      <div><label class="field-label">الموقع</label><select id="countBranch">${state.settings.branches.map(b=>`<option>${b}</option>`).join('')}</select></div>
      <div><label class="field-label">المادة</label><input id="countItemSearch" list="countItemsList" /></div>
      <div><label class="field-label">الكمية الفعلية</label><input id="countQty" type="number" /></div>
      <div class="no-print" style="display:flex;align-items:end"><button class="primary-btn full" onclick="saveCountAdjustment()">حفظ الجرد</button></div>
    </div>
    <datalist id="countItemsList">${state.items.map(i=>`<option value="${escapeHtml(i.name)}"></option>`).join('')}</datalist>
    <div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>التاريخ</th><th>الموقع</th><th>الصنف</th><th>كمية النظام</th><th>الفعلي</th><th>الفرق</th></tr></thead><tbody>${state.stockCounts.slice(0,40).map(c=>`<tr><td>${c.date}</td><td>${c.branch}</td><td>${escapeHtml(c.itemName)}</td><td>${c.systemQty}</td><td>${c.actualQty}</td><td>${c.diff}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">لا توجد عمليات جرد</td></tr>'}</tbody></table></div>
  </div>`;
}
window.saveCountAdjustment = () => {
  const branch = val('countBranch');
  const item = findItemSmart(val('countItemSearch')); if(!item) return alert('المادة غير موجودة');
  const actual = Number(val('countQty')||0); const systemQty = Number(item.branchStocks?.[branch]||0); const diff = actual - systemQty;
  item.branchStocks[branch] = actual;
  state.stockCounts.unshift({ id:uid(), date:todayStr(), branch, itemId:item.id, itemName:item.name, systemQty, actualQty:actual, diff });
  audit('جرد وتسوية', `${item.name} في ${branch}`); saveState(); alert('تم حفظ الجرد والتسوية');
};

function renderCustomers(){
  if(!hasPerm('customers')) return;
  els.customersSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card"><h3 class="section-title">إضافة عميل</h3>
      <div class="form-grid-2">
        <div><label class="field-label">اسم العميل</label><input id="customerName" /></div>
        <div><label class="field-label">الهاتف</label><input id="customerPhone" /></div>
        <div><label class="field-label">النوع</label><select id="customerType"><option>نقدي</option><option>جملة</option><option>مقاول</option></select></div>
        <div><label class="field-label">حد الدين</label><input id="customerDebtLimit" type="number" /></div>
      </div>
      <div class="no-print" style="margin-top:14px"><button class="primary-btn" onclick="saveCustomer()">حفظ العميل</button></div>
    </div>
    <div class="card"><h3 class="section-title">قائمة العملاء</h3><ul class="simple-list">${state.customers.map(c=>`<li data-highlight="customers:${c.id}"><strong>${escapeHtml(c.name)}</strong><br><small class="muted">${escapeHtml(c.phone||'')} • دين: ${money(c.debt||0)}</small></li>`).join('')}</ul></div>
  </div>`;
}
window.saveCustomer = () => { state.customers.unshift({ id:uid(), name:val('customerName'), phone:val('customerPhone'), type:val('customerType'), debtLimit:Number(val('customerDebtLimit')||0), debt:0, notes:''}); audit('إضافة عميل', val('customerName')); saveState(); alert('تم حفظ العميل'); };

function renderSuppliers(){
  if(!hasPerm('suppliers')) return;
  els.suppliersSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card"><h3 class="section-title">إضافة مورد</h3>
      <div class="form-grid-2">
        <div><label class="field-label">اسم المورد</label><input id="supplierName" /></div>
        <div><label class="field-label">الهاتف</label><input id="supplierPhone" /></div>
      </div>
      <div class="no-print" style="margin-top:14px"><button class="primary-btn" onclick="saveSupplier()">حفظ المورد</button></div>
    </div>
    <div class="card"><h3 class="section-title">قائمة الموردين</h3><ul class="simple-list">${state.suppliers.map(s=>`<li data-highlight="suppliers:${s.id}"><strong>${escapeHtml(s.name)}</strong><br><small class="muted">${escapeHtml(s.phone||'')} • رصيد: ${money(s.balance||0)}</small></li>`).join('')}</ul></div>
  </div>`;
}
window.saveSupplier = () => { state.suppliers.unshift({ id:uid(), name:val('supplierName'), phone:val('supplierPhone'), balance:0, notes:''}); audit('إضافة مورد', val('supplierName')); saveState(); alert('تم حفظ المورد'); };

function renderDebts(){
  if(!hasPerm('debts')) return;
  els.debtsSection.innerHTML = `
    <div class="card"><h3 class="section-title">كشف الديون والمستحقات</h3>
      <div class="table-wrap"><table><thead><tr><th>النوع</th><th>الاسم</th><th>الرصيد</th></tr></thead><tbody>
      ${state.customers.filter(c=>Number(c.debt||0)!==0).map(c=>`<tr><td>عميل</td><td>${escapeHtml(c.name)}</td><td>${money(c.debt)}</td></tr>`).join('')}
      ${state.suppliers.filter(s=>Number(s.balance||0)!==0).map(s=>`<tr><td>مورد</td><td>${escapeHtml(s.name)}</td><td>${money(s.balance)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">لا توجد ديون حالياً</td></tr>'}
      </tbody></table></div>
    </div>`;
}

function renderTransfers(){
  if(!hasPerm('transfers')) return;
  els.transfersSection.innerHTML = `
  <div class="card-grid-2">
    <div class="card"><h3 class="section-title">تحويل بين المواقع</h3>
      <div class="form-grid-4">
        <div><label class="field-label">من</label><select id="transferFrom">${state.settings.branches.map(b=>`<option>${b}</option>`).join('')}</select></div>
        <div><label class="field-label">إلى</label><select id="transferTo">${state.settings.branches.map(b=>`<option>${b}</option>`).join('')}</select></div>
        <div><label class="field-label">المادة</label><input id="transferItemSearch" list="transferItemsList" /></div>
        <div><label class="field-label">الكمية</label><input id="transferQty" type="number" /></div>
      </div>
      <datalist id="transferItemsList">${state.items.map(i=>`<option value="${escapeHtml(i.name)}"></option>`).join('')}</datalist>
      <div class="no-print" style="margin-top:14px"><button class="primary-btn" onclick="saveTransfer()">حفظ التحويل</button></div>
    </div>
    <div class="card"><h3 class="section-title">آخر التحويلات</h3><ul class="simple-list">${state.transfers.slice(0,20).map(t=>`<li>${t.from} ← ${t.to}<br><small class="muted">${t.itemName} • ${t.qty} • ${t.date}</small></li>`).join('') || '<li class="muted">لا توجد تحويلات</li>'}</ul></div>
  </div>`;
}
window.saveTransfer = () => {
  const from = val('transferFrom'), to = val('transferTo'); if(from===to) return alert('لا يمكن التحويل لنفس الموقع');
  const item = findItemSmart(val('transferItemSearch')); if(!item) return alert('المادة غير موجودة'); const qty = Number(val('transferQty')||0); if(qty<=0) return alert('الكمية غير صحيحة');
  const available = Number(item.branchStocks?.[from]||0); if(!state.settings.allowNegativeStock && available < qty) return alert('الكمية غير كافية');
  item.branchStocks[from] = available - qty; item.branchStocks[to] = Number(item.branchStocks[to]||0) + qty;
  state.transfers.unshift({ id:uid(), date:todayStr(), from, to, itemId:item.id, itemName:item.name, qty });
  audit('تحويل صنف', `${item.name} ${from} -> ${to}`); saveState(); alert('تم حفظ التحويل');
};

function renderReports(){
  if(!hasPerm('reports')) return;
  const profit = computeProfit();
  const bestItems = [...state.items].sort((a,b)=>forecastForItem(b,14)-forecastForItem(a,14)).slice(0,10);
  els.reportsSection.innerHTML = `
    <div class="cards-4">
      ${statCard('إجمالي الربح', money(profit), 'success')}
      ${statCard('عدد فواتير البيع', state.sales.length, 'primary')}
      ${statCard('عدد فواتير الشراء', state.purchases.length, 'purple')}
      ${statCard('عدد عمليات الجرد', state.stockCounts.length, 'warning')}
    </div>
    <div class="card-grid-2">
      <div class="card"><h3 class="section-title">أفضل الأصناف مبيعاً</h3><ul class="simple-list">${bestItems.map(i=>`<li>${escapeHtml(i.name)}<br><small class="muted">صرف 14 يوم: ${forecastForItem(i,14)} • ربح تقريبي: ${money((i.price-i.cost)*forecastForItem(i,14))}</small></li>`).join('')}</ul></div>
      <div class="card"><h3 class="section-title">تقرير الفروع</h3><ul class="simple-list">${state.settings.branches.map(br=>`<li>${br}<br><small class="muted">مبيعات: ${money(branchSalesTotal(br))}</small></li>`).join('')}</ul></div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="flex-row" style="justify-content:space-between"><h3 class="section-title">تصدير البيانات</h3><div class="no-print"><button class="outline-btn" onclick="exportCSV('items')">تصدير الأصناف CSV</button> <button class="outline-btn" onclick="exportCSV('sales')">تصدير المبيعات CSV</button> <button class="outline-btn" onclick="exportCSV('purchases')">تصدير المشتريات CSV</button></div></div>
      <p class="muted">التصدير الحالي بصيغة CSV وJSON حتى يبقى النظام سريع وخفيف بدون حذف أي شيء.</p>
    </div>`;
}
window.exportCSV = (type) => {
  const map = {
    items: state.items.map(i=>({name:i.name, code:i.code, barcode:i.barcode, category:i.category, cost:i.cost, price:i.price, stock: totalStock(i)})),
    sales: state.sales.flatMap(s=>s.lines.map(l=>({invoice:s.invoiceNo, date:s.date, branch:s.branch, customer:s.customer, item:l.name, qty:l.qty, price:l.price, total:l.qty*l.price}))),
    purchases: state.purchases.flatMap(s=>s.lines.map(l=>({invoice:s.invoiceNo, date:s.date, branch:s.branch, supplier:s.supplier, item:l.name, qty:l.qty, cost:l.cost, total:l.qty*l.cost}))),
  };
  downloadFile(`${type}.csv`, toCSV(map[type]||[]), 'text/csv;charset=utf-8');
};

function renderSuggestions(){
  if(!hasPerm('suggestions')) return;
  const suggestions = suggestedPurchases();
  const stagnant = state.items.filter(i=>forecastForItem(i,30)===0).slice(0,20);
  els.suggestionsSection.innerHTML = `
    <div class="card-grid-2">
      <div class="card"><h3 class="section-title">اقتراحات شراء خلال ${state.settings.forecastDays} يوم</h3><ul class="simple-list">${suggestions.map(s=>`<li><span class="badge ${itemStatus(s.item).cls}">${itemStatus(s.item).label}</span> ${escapeHtml(s.item.name)}<br><small class="muted">المتوفر: ${s.stock} • المتوقع: ${s.consumption} • المقترح: ${s.needed}</small></li>`).join('') || '<li class="muted">لا توجد اقتراحات</li>'}</ul></div>
      <div class="card"><h3 class="section-title">مواد راكدة</h3><ul class="simple-list">${stagnant.map(i=>`<li>${escapeHtml(i.name)}<br><small class="muted">لم يحصل صرف خلال 30 يوم • الرصيد: ${totalStock(i)}</small></li>`).join('') || '<li class="muted">لا توجد مواد راكدة</li>'}</ul></div>
    </div>`;
}

function renderSettings(){
  if(!hasPerm('settings')) return;
  const tabBtn = (id,label)=>`<button class="${activeSettingsTab===id?'active':''}" onclick="activeSettingsTab='${id}'; renderSettings()">${label}</button>`;
  els.settingsSection.innerHTML = `
    <div class="card">
      <h3 class="section-title">الإعدادات المفتوحة</h3>
      <div class="tabs no-print">
        ${tabBtn('general','عام')}
        ${tabBtn('sales','البيع')}
        ${tabBtn('purchases','الشراء')}
        ${tabBtn('inventory','المخزون')}
        ${tabBtn('search','البحث')}
        ${tabBtn('appearance','المظهر')}
        ${tabBtn('branches','الفروع والأقسام')}
        ${tabBtn('final','تحكمات نهائية')}
      </div>
      <div class="tab-panel ${activeSettingsTab!=='general'?'hidden':''}">
        <div class="form-grid-3">
          <div><label class="field-label">اسم الشركة</label><input id="setCompanyName" value="${escapeHtml(state.settings.companyName)}" /></div>
          <div><label class="field-label">العملة</label><input id="setCurrency" value="${escapeHtml(state.settings.currency)}" /></div>
          <div><label class="field-label">رمز العملة</label><input id="setCurrencySymbol" value="${escapeHtml(state.settings.currencySymbol)}" /></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='sales'?'hidden':''}">
        <div class="form-grid-3">
          <div><label class="field-label">السماح بالخصم</label><select id="setAllowDiscount"><option value="true" ${state.settings.allowDiscount?'selected':''}>نعم</option><option value="false" ${!state.settings.allowDiscount?'selected':''}>لا</option></select></div>
          <div><label class="field-label">أقصى خصم %</label><input id="setMaxDiscount" type="number" value="${state.settings.maxDiscountPercent}" /></div>
          <div><label class="field-label">أيام الإرجاع</label><input id="setReturnDays" type="number" value="${state.settings.returnDays}" /></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='purchases'?'hidden':''}">
        <div class="form-grid-2"><div class="notice">نظام الشراء يحدث الكلفة تلقائياً حالياً عند كل فاتورة شراء.</div></div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='inventory'?'hidden':''}">
        <div class="form-grid-3">
          <div><label class="field-label">السماح بمخزون سالب</label><select id="setNegativeStock"><option value="true" ${state.settings.allowNegativeStock?'selected':''}>نعم</option><option value="false" ${!state.settings.allowNegativeStock?'selected':''}>لا</option></select></div>
          <div><label class="field-label">أيام التوقع</label><input id="setForecastDays" type="number" value="${state.settings.forecastDays}" /></div>
          <div><label class="field-label">اشتراط سبب لتعديل الرصيد</label><select id="setRequireReason"><option value="true" ${state.settings.requireReasonForManualAdjust?'selected':''}>نعم</option><option value="false" ${!state.settings.requireReasonForManualAdjust?'selected':''}>لا</option></select></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='search'?'hidden':''}">
        <div class="form-grid-3">
          <div><label class="field-label">أقل عدد أحرف للبحث</label><input id="setMinCharsSearch" type="number" value="${state.settings.minCharsSearch}" /></div>
          <div><label class="field-label">عدد المقترحات</label><input id="setSuggestionsLimit" type="number" value="${state.settings.searchSuggestionsLimit}" /></div>
          <div><label class="field-label">تصنيف 0-10</label><input id="setLow1" type="number" value="${state.settings.lowConsumption1}" /></div>
          <div><label class="field-label">تصنيف 10-20</label><input id="setLow2" type="number" value="${state.settings.lowConsumption2}" /></div>
          <div><label class="field-label">تصنيف 20-40</label><input id="setLow3" type="number" value="${state.settings.lowConsumption3}" /></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='appearance'?'hidden':''}">
        <div class="form-grid-3">
          <div><label class="field-label">اللون الرئيسي</label><input id="setPrimaryColor" type="color" value="${state.settings.themePrimary}" /></div>
          <div><label class="field-label">لون النجاح</label><input id="setSuccessColor" type="color" value="${state.settings.themeSuccess}" /></div>
          <div><label class="field-label">لون الخطر</label><input id="setDangerColor" type="color" value="${state.settings.themeDanger}" /></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='branches'?'hidden':''}">
        <div class="card-grid-2">
          <div><label class="field-label">الفروع (كل سطر فرع)</label><textarea id="setBranches" rows="8">${state.settings.branches.join('\n')}</textarea></div>
          <div><label class="field-label">الأقسام (كل سطر قسم)</label><textarea id="setCategories" rows="8">${state.settings.categories.join('\n')}</textarea></div>
        </div>
      </div>
      <div class="tab-panel ${activeSettingsTab!=='final'?'hidden':''}">
        <div class="notice">هذا القسم مخصص للتحكمات النهائية. أي تعديل هنا ينعكس مباشرة على سلوك النظام.</div>
      </div>
      <div class="no-print" style="margin-top:16px"><button class="primary-btn" onclick="saveSettingsAll()">حفظ الإعدادات</button></div>
    </div>`;
}
window.saveSettingsAll = () => {
  state.settings.companyName = val('setCompanyName') || state.settings.companyName;
  state.settings.currency = val('setCurrency') || state.settings.currency;
  state.settings.currencySymbol = val('setCurrencySymbol') || state.settings.currencySymbol;
  state.settings.allowDiscount = val('setAllowDiscount') === 'true';
  state.settings.maxDiscountPercent = Number(val('setMaxDiscount')||0);
  state.settings.returnDays = Number(val('setReturnDays')||7);
  state.settings.allowNegativeStock = val('setNegativeStock') === 'true';
  state.settings.forecastDays = Number(val('setForecastDays')||14);
  state.settings.requireReasonForManualAdjust = val('setRequireReason') === 'true';
  state.settings.minCharsSearch = Number(val('setMinCharsSearch')||1);
  state.settings.searchSuggestionsLimit = Number(val('setSuggestionsLimit')||12);
  state.settings.lowConsumption1 = Number(val('setLow1')||10);
  state.settings.lowConsumption2 = Number(val('setLow2')||20);
  state.settings.lowConsumption3 = Number(val('setLow3')||40);
  state.settings.themePrimary = val('setPrimaryColor') || state.settings.themePrimary;
  state.settings.themeSuccess = val('setSuccessColor') || state.settings.themeSuccess;
  state.settings.themeDanger = val('setDangerColor') || state.settings.themeDanger;
  state.settings.branches = (val('setBranches')||'').split('\n').map(s=>s.trim()).filter(Boolean);
  state.settings.categories = (val('setCategories')||'').split('\n').map(s=>s.trim()).filter(Boolean);
  // normalize item branch stocks with new branches
  state.items.forEach(item=>{
    const next = {};
    state.settings.branches.forEach(b=> next[b] = Number(item.branchStocks?.[b]||0));
    item.branchStocks = next;
  });
  audit('تعديل إعدادات', 'تحديث شامل للإعدادات'); saveState(); alert('تم حفظ الإعدادات');
};

function renderUsers(){
  if(!hasPerm('users')) return;
  const permEntries = Object.entries(permissionMap);
  const templateRoles = ['Super Admin','Manager','Stock','Branch','Accounting','Custom'];
  els.usersSection.innerHTML = `
    <div class="card-grid-2">
      <div class="card"><h3 class="section-title">إنشاء / تعديل مستخدم</h3>
        <input id="userEditUsername" type="hidden" />
        <div class="form-grid-3">
          <div><label class="field-label">اسم المستخدم</label><input id="newUsername" /></div>
          <div><label class="field-label">الاسم الظاهر</label><input id="newDisplayName" /></div>
          <div><label class="field-label">الرقم السري</label><input id="newPassword" /></div>
          <div><label class="field-label">الدور</label><select id="newRole">${templateRoles.map(r=>`<option>${r}</option>`).join('')}</select></div>
          <div><label class="field-label">الموقع</label><select id="newUserBranch">${state.settings.branches.map(b=>`<option>${b}</option>`).join('')}</select></div>
          <div><label class="field-label">فعال</label><select id="newUserActive"><option value="true">نعم</option><option value="false">لا</option></select></div>
        </div>
        <div class="flex-row" style="margin:12px 0" class="no-print">
          <button class="small-btn" onclick="grantAllPermissions()">كل الصلاحيات</button>
          <button class="small-btn" onclick="clearAllPermissions()">إلغاء الكل</button>
        </div>
        <div class="table-wrap" style="max-height:340px"><table><thead><tr><th>تفعيل</th><th>الميزة</th></tr></thead><tbody>
          ${permEntries.map(([key,label])=>`<tr><td><input type="checkbox" class="perm-check" data-perm="${key}" /></td><td>${label}</td></tr>`).join('')}
        </tbody></table></div>
        <div class="no-print" style="margin-top:16px"><button class="primary-btn" onclick="saveUser()">حفظ المستخدم</button></div>
      </div>
      <div class="card"><h3 class="section-title">قائمة المستخدمين</h3>
        <div class="table-wrap"><table><thead><tr><th>اسم المستخدم</th><th>الدور</th><th>الموقع</th><th>الحالة</th><th class="no-print">إجراء</th></tr></thead><tbody>
        ${state.users.map(u=>`<tr><td>${escapeHtml(u.username)}<br><small class="muted">${escapeHtml(u.displayName)}</small></td><td>${escapeHtml(u.role)}</td><td>${escapeHtml(u.branch||'')}</td><td>${u.active===false?'<span class="badge danger">موقوف</span>':'<span class="badge success">فعال</span>'}</td><td class="no-print"><button class="small-btn" onclick="loadUserForEdit('${u.username}')">تعديل</button> <button class="small-btn" onclick="deleteUser('${u.username}')">حذف</button></td></tr>`).join('')}
        </tbody></table></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3 class="section-title">سجل التعديلات</h3>
      <div class="table-wrap"><table><thead><tr><th>الوقت</th><th>المستخدم</th><th>الإجراء</th><th>التفصيل</th></tr></thead><tbody>
      ${state.auditLog.slice(0,50).map(log=>`<tr><td>${new Date(log.at).toLocaleString('ar-IQ')}</td><td>${escapeHtml(log.user)}</td><td>${escapeHtml(log.action)}</td><td>${escapeHtml(log.detail)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا توجد سجلات</td></tr>'}
      </tbody></table></div>
    </div>`;
}
window.grantAllPermissions = () => document.querySelectorAll('.perm-check').forEach(c=> c.checked = true);
window.clearAllPermissions = () => document.querySelectorAll('.perm-check').forEach(c=> c.checked = false);
window.saveUser = () => {
  const username = val('newUsername').trim(); if(!username) return alert('اسم المستخدم مطلوب');
  const permissions = Array.from(document.querySelectorAll('.perm-check:checked')).map(c=>c.dataset.perm);
  const payload = {
    username, displayName: val('newDisplayName')||username, password: val('newPassword')||'123456', role: val('newRole'), branch: val('newUserBranch'), active: val('newUserActive')==='true', permissions
  };
  if(payload.role==='Super Admin') payload.permissions='ALL';
  const idx = state.users.findIndex(u=>u.username===username);
  if(idx>=0) state.users[idx] = payload; else state.users.push(payload);
  audit('حفظ مستخدم', username); saveState(); alert('تم حفظ المستخدم');
};
window.loadUserForEdit = (username) => {
  const u = state.users.find(x=>x.username===username); if(!u) return;
  setVal('newUsername', u.username); setVal('newDisplayName', u.displayName); setVal('newPassword', u.password); setVal('newRole', u.role); setVal('newUserBranch', u.branch); setVal('newUserActive', String(u.active!==false));
  clearAllPermissions();
  if(u.permissions==='ALL') grantAllPermissions(); else (u.permissions||[]).forEach(p=>{ const el=document.querySelector(`.perm-check[data-perm="${p}"]`); if(el) el.checked=true;});
};
window.deleteUser = (username) => { if(username==='admin') return alert('لا يمكن حذف المدير الافتراضي'); if(!confirm('تأكيد حذف المستخدم؟')) return; state.users = state.users.filter(u=>u.username!==username); audit('حذف مستخدم', username); saveState(); };

function applyTheme(){
  document.documentElement.style.setProperty('--primary', state.settings.themePrimary || '#2563eb');
  document.documentElement.style.setProperty('--success', state.settings.themeSuccess || '#16a34a');
  document.documentElement.style.setProperty('--danger', state.settings.themeDanger || '#dc2626');
}

function findItemSmart(query){
  const q = String(query||'').trim().toLowerCase();
  return state.items.find(i => [i.name,i.shortName,i.code,i.barcode].some(v => String(v||'').toLowerCase() === q))
      || state.items.find(i => [i.name,i.shortName,i.code,i.barcode].some(v => String(v||'').toLowerCase().includes(q)));
}
function calcSaleTotal(){
  const subtotal = salesCart.reduce((a,b)=>a+b.qty*b.price,0); const disc = Math.min(Number(document.getElementById('saleDiscount')?.value||0), Number(state.settings.maxDiscountPercent||100)); return subtotal - (subtotal*disc/100);
}
function calcPurchaseTotal(){ return purchaseCart.reduce((a,b)=>a+b.qty*b.cost,0); }
function escapeHtml(s){ return String(s??'').replace(/[&<>"]/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }
function val(id){ return document.getElementById(id)?.value || ''; }
function setVal(id,v){ const el=document.getElementById(id); if(el) el.value = v; }
function downloadFile(name, content, type){ const blob = new Blob([content], {type}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 500); }
function toCSV(rows){ if(!rows.length) return ''; const cols = Object.keys(rows[0]); const esc = v => '"'+String(v??'').replaceAll('"','""')+'"'; return [cols.join(','), ...rows.map(r=> cols.map(c=>esc(r[c])).join(','))].join('\n'); }
function safeName(s){ return String(s||'file').replace(/[^\w\u0600-\u06FF-]+/g,'_'); }
function popup(html){ const w = window.open('', '_blank', 'width=900,height=700'); w.document.write(html); w.document.close(); }
function printInvoice(type, inv){
  const title = type==='sale' ? 'فاتورة بيع' : 'فاتورة شراء';
  const party = type==='sale' ? inv.customer : inv.supplier;
  const html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Tahoma;padding:24px;color:#111} h1,h2,h3,p{margin:0 0 10px} table{width:100%;border-collapse:collapse;margin-top:16px} th,td{border:1px solid #ddd;padding:10px;text-align:right} .head{display:flex;justify-content:space-between;align-items:flex-start}.box{border:1px solid #ddd;padding:12px;border-radius:10px}.total{margin-top:18px;font-size:22px;font-weight:700}</style></head><body><div class="head"><div><h1>${escapeHtml(state.settings.companyName)}</h1><p>${title}</p><p>العملة: ${escapeHtml(state.settings.currency)}</p></div><div class="box"><p>رقم الفاتورة: ${inv.invoiceNo}</p><p>التاريخ: ${inv.date}</p><p>الموقع: ${inv.branch}</p><p>${type==='sale'?'العميل':'المورد'}: ${escapeHtml(party||'')}</p></div></div><table><thead><tr><th>الصنف</th><th>الكمية</th><th>${type==='sale'?'السعر':'الكلفة'}</th><th>الإجمالي</th></tr></thead><tbody>${inv.lines.map(l=>`<tr><td>${escapeHtml(l.name)}</td><td>${l.qty}</td><td>${money(type==='sale'?l.price:l.cost)}</td><td>${money((type==='sale'?l.price:l.cost)*l.qty)}</td></tr>`).join('')}</tbody></table><div class="total">الإجمالي: ${money(inv.total)}</div><script>window.print()</script></body></html>`;
  popup(html);
}
window.printInvoiceById = (type, id) => {
  const inv = (type==='sale'?state.sales:state.purchases).find(x=>x.id===id); if(!inv) return; printInvoice(type, inv);
};

applyTheme();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
