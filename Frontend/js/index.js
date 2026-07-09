/* =====================================================================
   1. API CONFIG — put your real endpoint URLs here.
   Every function below tries the real endpoint first; if it's not
   live yet (network error / 404), it silently falls back to local
   mock data so the UI keeps working while you build the backend.
===================================================================== */
const API_BASE = "https://expense-tracker-8bi2.onrender.com"; // e.g. "https://api.yourapp.com"

const API = {
  getTransactions: `${API_BASE}/transactions/get_expense`,

  addTransaction: `${API_BASE}/transactions/Add_expense`,

  editTransaction: (id) =>
        `${API_BASE}/transactions/edit_expense/${id}`,

  deleteTransaction: (id) =>
        `${API_BASE}/transactions/delete_expense/${id}`,
  categories: `${API_BASE}/transactions/categories`,
  reports:             `${API_BASE}/api/reports`,              // GET ?from=&to=
  reportsPdf:          `${API_BASE}/api/reports/pdf`,          // GET (file download)
  reportsExcel:        `${API_BASE}/api/reports/excel`,        // GET (file download)
  profile:             `${API_BASE}/auth/profile`,              // GET,
  updatePassword:      `${API_BASE}/api/profile/password`,     // POST
  settings:            `${API_BASE}/api/settings`,             // GET, PUT
};

// Generic fetch helper. Every call site uses this so swapping to real
// endpoints later requires no structural changes — just make sure your
// backend returns JSON shaped like the mock data below.
async function apiFetch(url, options = {}) {

    // Get token from localStorage or sessionStorage
    const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

    try {

        const response = await fetch(url, {

            ...options,

            headers: {

                "Content-Type": "application/json",

                ...(token && {
                    "Authorization": `Bearer ${token}`
                }),

                ...(options.headers || {})

            }

        });

        // Unauthorized
        if (response.status === 401) {

            alert("Session expired. Please login again.");

            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("user");

            window.location.href = "login.html";

            return;
        }

        if (!response.ok) {

            const error=await response.json()
            console.log(error);
            alert(JSON.stringify(error,null,2))
            throw new Error(`HTTP Error:"${response.status}`);
            
            

        }

        return await response.json();

    }
    catch (err) {

        console.error(err);

        return null;

    }

}

/* =====================================================================
   2. MOCK DATA — used until your endpoints above are live.
   Replace/remove as each endpoint comes online.
===================================================================== */

let transactions=[]



const monthlyDataMock = [
  { month: "Jan", income: 42000, expense: 30000 }, { month: "Feb", income: 48000, expense: 32000 },
  { month: "Mar", income: 45000, expense: 35000 }, { month: "Apr", income: 60000, expense: 42000 },
  { month: "May", income: 50000, expense: 38000 }, { month: "Jun", income: 55000, expense: 40000 },
  { month: "Jul", income: 58000, expense: 45000 }, { month: "Aug", income: 52000, expense: 30000 },
  { month: "Sep", income: 30000, expense: 20000 }, { month: "Oct", income: 15000, expense: 10000 },
  { month: "Nov", income: 62000, expense: 44000 }, { month: "Dec", income: 60000, expense: 46000 },
];

let profileData = {};

const categoryColors = {
  "Food & Dining": "#6366f1", "Shopping": "#ef4444", "Bills & Utilities": "#f59e0b",
  "Transport": "#10b981", "Entertainment": "#3b82f6", "Salary": "#22c55e",
  "Freelance": "#22c55e", "Others": "#94a3b8",
};
const incomeCategories = ["Salary", "Freelance", "Others"];
const expenseCategories = ["Food & Dining", "Shopping", "Bills & Utilities", "Transport", "Entertainment", "Others"];

const pageTitles = {
  dashboard: "Dashboard", transactions: "Transactions", analytics: "Analytics",
  reports: "Reports", profile: "Profile", settings: "Settings"
};

function formatINR(n) { return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 }); }
function formatDate(iso) { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }

/* =====================================================================
   3. ROUTER — the whole SPA mechanism. No <a href>, no reload.
===================================================================== */
function navigateTo(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const navBtn = document.querySelector(`.nav-link[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add("active");
  document.getElementById("pageTitle").textContent = pageTitles[page];

  if (page === "dashboard") renderDashboard();
  if (page === "transactions") renderTransactionsPage();
  if (page === "analytics") renderAnalytics();
  if (page === "reports") renderReports();
  if (page === "profile") renderProfile();
  if (page === "settings") renderSettings();
}
document.getElementById("nav").addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-link");
  if (btn) navigateTo(btn.dataset.page);
});
document.addEventListener("click", (e) => {
  const navEl = e.target.closest("[data-nav]");
  if (navEl) navigateTo(navEl.dataset.nav);
});

/* =====================================================================
   4. DATA LOADING — tries your API first, falls back to mock data.
===================================================================== */

async function loadTransactions() {
  const data = await apiFetch(API.getTransactions);
  if (data) 
    transactions = data;
  return transactions;
}
async function createTransactionApi(payload) {
  const data = await apiFetch(API.addTransaction, { method: "POST", body: JSON.stringify(payload) });
  return data; // null if API not connected — caller handles local fallback
}
async function updateTransactionApi(id, payload) {
  const data = await apiFetch(API.editTransaction(id), { method: "PUT", body: JSON.stringify(payload) });
  return data;
}
async function deleteTransactionApi(id) {
  const data = await apiFetch(API.deleteTransaction(id), { method: "DELETE" });
  return data;
}

/* =====================================================================
   5. RENDER: DASHBOARD
===================================================================== */
async function renderDashboard() {
  await loadTransactions();
  

  const income = transactions.filter(t => t.category.type === "Income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.category.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const cards = [
    { label: "Current Balance", value: formatINR(balance), tint: "#e0f2fe", color: "#0ea5e9", icon: "◈", change: "+12.5%", dir: "up" },
    { label: "Total Income", value: formatINR(income), tint: "#ecfdf5", color: "#10b981", icon: "↑", change: "+8.3%", dir: "up" },
    { label: "Total Expense", value: formatINR(expense), tint: "#fef2f2", color: "#ef4444", icon: "↓", change: "-5.2%", dir: "down" },
    { label: "Total Transactions", value: transactions.length, tint: "#f5f3ff", color: "#8b5cf6", icon: "▤", change: "+10.8%", dir: "up" },
  ];
  document.getElementById("dashCards").innerHTML = cards.map(c => `
    <div class="card">
      <div class="stat-top"><span class="stat-label">${c.label}</span>
        <div class="stat-icon" style="background:${c.tint}; color:${c.color};">${c.icon}</div></div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-change ${c.dir}">${c.dir === "up" ? "↗" : "↘"} ${c.change} <span class="muted">&nbsp;from last month</span></div>
    </div>`).join("");

  document.getElementById("dashTxBody").innerHTML = transactions.slice(0, 5).map(t => txRowHtml(t, true)).join("");
  renderDonut("donutChart", "dashCatList", false);
  renderMonthlyChart("monthlyChart", monthlyDataMock);
}

function renderDonut(donutElId, legendElId, showAmounts) {
  const catTotals = {};
  transactions.filter(t => t.category.type === "Expense").forEach(t => { catTotals[t.category.name] = (catTotals[t.category.name] || 0) + t.amount; });
  const catTotal = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1;

  let parts = [], cumulative = 0;
  Object.entries(catTotals).forEach(([cat, val]) => {
    const pct = (val / catTotal) * 100;
    parts.push(`${categoryColors[cat] || "#94a3b8"} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  });
  document.getElementById(donutElId).style.background = `conic-gradient(${parts.join(", ")})`;

  document.getElementById(legendElId).innerHTML = Object.entries(catTotals).map(([cat, val]) => `
    <div class="legend-row">
      <span class="legend-dot" style="background:${categoryColors[cat] || "#94a3b8"};"></span>
      <span class="legend-name">${cat}</span>
      ${showAmounts ? `<span class="legend-amt">${formatINR(val)}</span>` : ""}
      <span class="legend-pct">${Math.round((val / catTotal) * 100)}%</span>
    </div>`).join("");
}

function renderMonthlyChart(elId, data) {
  const maxVal = Math.max(...data.flatMap(m => [m.income, m.expense]));
  document.getElementById(elId).innerHTML = data.map(m => `
    <div class="chart-month">
      <div class="chart-bars">
        <div class="chart-bar income" style="height:${(m.income / maxVal) * 100}%;"></div>
        <div class="chart-bar expense" style="height:${(m.expense / maxVal) * 100}%;"></div>
      </div>
      <div class="chart-month-label">${m.month}</div>
    </div>`).join("");
}

/* =====================================================================
   6. RENDER: TRANSACTIONS PAGE (search, filters, pagination)
===================================================================== */
let txPage = 1;
const TX_PER_PAGE = 5;

function populateFilterOptions() {
  const sel = document.getElementById("txCategoryFilter");
  const allCats = [...new Set([...incomeCategories, ...expenseCategories])];
  sel.innerHTML = `<option value="">All Categories</option>` + allCats.map(c => `<option value="${c}">${c}</option>`).join("");
}

function getFilteredTransactions() {
  const search = document.getElementById("txSearch").value.toLowerCase();
  const cat = document.getElementById("txCategoryFilter").value;
  const type = document.getElementById("txTypeFilter").value;
  return transactions.filter(t =>
    (!search || t.desc.toLowerCase().includes(search)) &&
    (!cat || t.category === cat) &&
    (!type || t.type === type)
  );
}

async function renderTransactionsPage() {
  await loadTransactions();
  populateFilterOptions();
  renderTransactionsTable();
}

function renderTransactionsTable() {
  const filtered = getFilteredTransactions();
  const totalPages = Math.max(1, Math.ceil(filtered.length / TX_PER_PAGE));
  txPage = Math.min(txPage, totalPages);
  const start = (txPage - 1) * TX_PER_PAGE;
  const pageRows = filtered.slice(start, start + TX_PER_PAGE);

  document.getElementById("txBody").innerHTML = pageRows.length
    ? pageRows.map(t => txRowHtml(t, false)).join("")
    : `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:24px 0;">No transactions found.</td></tr>`;

  document.getElementById("txPagination").innerHTML = Array.from({ length: totalPages }, (_, i) => i + 1)
    .map(p => `<button class="page-btn ${p === txPage ? "active" : ""}" data-page-num="${p}">${p}</button>`).join("");
}

document.getElementById("txSearch").addEventListener("input", () => { txPage = 1; renderTransactionsTable(); });
document.getElementById("txCategoryFilter").addEventListener("change", () => { txPage = 1; renderTransactionsTable(); });
document.getElementById("txTypeFilter").addEventListener("change", () => { txPage = 1; renderTransactionsTable(); });
document.getElementById("txPagination").addEventListener("click", (e) => {
  const btn = e.target.closest(".page-btn");
  if (btn) { txPage = Number(btn.dataset.pageNum); renderTransactionsTable(); }
});

function txRowHtml(t, compact) {
  const color = categoryColors[t.category] || "#94a3b8";
  const typeClass = t.category.type === "Income" ? "income" : "expense";
  const sign = t.category.type === "Income" ? "+" : "-";
  const arrow = t.category.type === "Income" ? "↑" : "↓";
  return `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.description}</td>
      <td><span class="pill" style="background:${color}1A; color:${color};">${t.category.name}</span></td>
      <td><span class="type-tag ${typeClass}">${arrow} ${t.category.type}</span></td>
      <td class="text-right ${typeClass}" style="font-weight:500;">${sign} ${formatINR(t.amount)}</td>
      ${compact ? "" : `
      <td class="text-right">
        <div class="row-actions">
          <button class="icon-action edit" onclick="openEditModal(${t.id})">✎</button>
          <button class="icon-action delete" onclick="handleDeleteTransaction(${t.id})">🗑</button>
        </div>
      </td>`}
    </tr>`;
}

async function handleDeleteTransaction(id) {
  await deleteTransactionApi(id); // no-op locally if API not connected yet
  transactions = transactions.filter(t => t.id !== id);
  renderTransactionsTable();
}

/* =====================================================================
   7. RENDER: ANALYTICS
===================================================================== */
async function renderAnalytics() {
  await loadTransactions();

  const catTotals = {};
  transactions.filter(t => t.category.type === "Expense").forEach(t => { catTotals[t.category.name] = (catTotals[t.category.name] || 0) + t.amount; });
  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];

  const incomeTx = transactions.filter(t => t.category.type === "Income");
  const expenseTx = transactions.filter(t => t.category.type === "Expense");
  const highestIncome = incomeTx.sort((a, b) => b.amount - a.amount)[0];
  const avgMonthlyExpense = expenseTx.length ? expenseTx.reduce((s, t) => s + t.amount, 0) / 6 : 0; // placeholder divisor
  const avgMonthlyIncome = incomeTx.length ? incomeTx.reduce((s, t) => s + t.amount, 0) / 6 : 0;

  const cards = [
    { label: "Highest Expense", value: top ? formatINR(top[1]) : "-", sub: top ? `in ${top[0]}` : "", tint: "#fdf2f8", color: "#ec4899", icon: "↓" },
    { label: "Highest Income", value: highestIncome ? formatINR(highestIncome.amount) : "-", sub: highestIncome ? highestIncome.category.name : "", tint: "#ecfdf5", color: "#10b981", icon: "↑" },
    { label: "Avg. Monthly Expense", value: formatINR(Math.round(avgMonthlyExpense)), sub: "", tint: "#fff7ed", color: "#f59e0b", icon: "◔" },
    { label: "Avg. Monthly Income", value: formatINR(Math.round(avgMonthlyIncome)), sub: "", tint: "#eff6ff", color: "#3b82f6", icon: "◈" },
  ];
  document.getElementById("analyticsCards").innerHTML = cards.map(c => `
    <div class="card">
      <div class="stat-top"><span class="stat-label">${c.label}</span>
        <div class="stat-icon" style="background:${c.tint}; color:${c.color};">${c.icon}</div></div>
      <div class="stat-value" style="font-size:16px;">${c.value}</div>
      ${c.sub ? `<div class="stat-sub">${c.sub}</div>` : ""}
    </div>`).join("");

  renderDonut("analyticsDonut", "analyticsCatList", true);
  renderMonthlyChart("analyticsChart", monthlyDataMock.slice(3, 7)); // Apr–Jul like mockup

  document.getElementById("mostSpentCat").textContent = top ? top[0]: "-";
  const byDay = {};
  expenseTx.forEach(t => { byDay[t.date] = (byDay[t.date] || 0) + t.amount; });
  const topExpenseDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("highestExpenseDay").textContent = topExpenseDay ? `${formatDate(topExpenseDay[0])} — ${formatINR(topExpenseDay[1])}` : "-";
  document.getElementById("highestIncomeDay").textContent = highestIncome ? `${formatDate(highestIncome.date)} — ${formatINR(highestIncome.amount)}` : "-";
}

/* =====================================================================
   8. RENDER: REPORTS
===================================================================== */
async function renderReports() {
  await loadTransactions();
  const today = new Date().toISOString().slice(0, 10);
  const from = document.getElementById("reportFrom");
  const to = document.getElementById("reportTo");
  if (!from.value) from.value = "2026-06-01";
  if (!to.value) to.value = today;
  renderReportTable();
}

function renderReportTable() {
  const from = document.getElementById("reportFrom").value;
  const to = document.getElementById("reportTo").value;
  const filtered = transactions.filter(t => (!from || t.date >= from) && (!to || t.date <= to));

  document.getElementById("reportBody").innerHTML = filtered.length
    ? filtered.map(t => txRowHtml(t, true)).join("")
    : `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:24px 0;">No transactions in this range.</td></tr>`;

  const income = filtered.filter(t => t.category.type === "Income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter(t => t.category.type === "Expense").reduce((s, t) => s + t.amount, 0);
  document.getElementById("reportTotalIncome").textContent = formatINR(income);
  document.getElementById("reportTotalExpense").textContent = formatINR(expense);
  document.getElementById("reportNetBalance").textContent = formatINR(income - expense);
}

document.getElementById("generateReportBtn").addEventListener("click", renderReportTable);

// TODO: point these at API.reportsPdf / API.reportsExcel — typically these
// endpoints return a file (blob) rather than JSON, e.g.:
//   const res = await fetch(API.reportsPdf + `?from=${from}&to=${to}`);
//   const blob = await res.blob();
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a'); a.href = url; a.download = 'report.pdf'; a.click();
document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  alert("Wire this up to " + API.reportsPdf);
});
document.getElementById("downloadExcelBtn").addEventListener("click", () => {
  alert("Wire this up to " + API.reportsExcel);
});

/* =====================================================================
   9. RENDER: PROFILE
===================================================================== */
async function renderProfile() {
  const data = await apiFetch(API.profile);
  if (data) profileData = data;
  document.getElementById("profileName").textContent = profileData.username;
  document.getElementById("profileEmail").textContent = profileData.email;
  document.getElementById("profilePhone").textContent = profileData.phone;
  document.getElementById("profileMemberSince").textContent = profileData.memberSince;

  const initials = profileData.username.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  document.getElementById("profileInitials").textContent = initials;
  document.getElementById("topAvatarInitials").textContent = initials;
  document.getElementById("topUserName").textContent = profileData.username.split(" ").slice(0, 2).join(" ");
  document.getElementById("dashUserName").textContent = profileData.username.split(" ").slice(0, 2).join(" ");
}

document.getElementById("avatarEditBtn").addEventListener("click", () => {
  alert("Wire this up to a file picker + PUT " + API.profile);
});

document.querySelectorAll(".toggle-pw").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

document.getElementById("passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // stops page reload on submit
  const current = document.getElementById("currentPassword").value;
  const next = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (next !== confirm) { alert("New password and confirmation don't match."); return; }

  const result = await apiFetch(API.updatePassword, {
    method: "POST",
    body: JSON.stringify({ currentPassword: current, newPassword: next }),
  });
  alert(result ? "Password updated." : "API not connected yet — this would call " + API.updatePassword);
  e.target.reset();
});

/* =====================================================================
   10. RENDER: SETTINGS (tabs are a mini-router within this one page)
===================================================================== */
let settingsData = { language: "English", currency: "INR (₹)", dateFormat: "DD/MM/YYYY", theme: "light" };

const settingsTabContent = {
  general: () => `
    <div class="field"><label>Language</label>
      <select id="setLanguage"><option>English</option><option>Tamil</option><option>Hindi</option></select></div>
    <div class="field"><label>Currency</label>
      <select id="setCurrency"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select></div>
    <div class="field"><label>Date Format</label>
      <select id="setDateFormat"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
    <div class="field"><label>Theme</label>
      <div class="theme-options">
        <label><input type="radio" name="theme" value="light" checked> Light</label>
        <label><input type="radio" name="theme" value="dark"> Dark</label>
      </div>
    </div>
    <button class="btn btn-primary" id="saveSettingsBtn">Save Changes</button>`,
  appearance: () => `<div class="placeholder">Appearance settings — same pattern, add your fields here.</div>`,
  currency: () => `<div class="placeholder">Currency settings — same pattern, add your fields here.</div>`,
  notifications: () => `<div class="placeholder">Notification preferences — same pattern, add your fields here.</div>`,
  security: () => `<div class="placeholder">Security settings (2FA, sessions) — same pattern, add your fields here.</div>`,
  backup: () => `<div class="placeholder">Backup & export data — same pattern, add your fields here.</div>`,
};

function renderSettingsTab(tab) {
  document.querySelectorAll(".settings-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.settings-tab[data-tab="${tab}"]`).classList.add("active");
  document.getElementById("settingsPanel").innerHTML = settingsTabContent[tab]();

  if (tab === "general") {
    document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
      const payload = {
        language: document.getElementById("setLanguage").value,
        currency: document.getElementById("setCurrency").value,
        dateFormat: document.getElementById("setDateFormat").value,
        theme: document.querySelector('input[name="theme"]:checked').value,
      };
      const result = await apiFetch(API.settings, { method: "PUT", body: JSON.stringify(payload) });
      alert(result ? "Settings saved." : "API not connected yet — this would PUT to " + API.settings);
    });
  }
}

document.getElementById("settingsTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".settings-tab");
  if (btn) renderSettingsTab(btn.dataset.tab);
});

async function renderSettings() {
  const data = await apiFetch(API.settings);
  if (data) settingsData = data;
  renderSettingsTab("general");
}

/* =====================================================================
   11. ADD / EDIT TRANSACTION MODAL
===================================================================== */
const modalOverlay = document.getElementById("modalOverlay");
const txCategorySelect = document.getElementById("txCategory");

async function populateCategoryOptions(type) {

    const categories = await apiFetch(API.categories);

    if (!categories) return;

    txCategorySelect.innerHTML =
        '<option value="">Select Category</option>';

    categories
        .filter(category => category.type === type)
        .forEach(category => {

            txCategorySelect.innerHTML += `
                <option value="${category.id}">
                    ${category.name}
                </option>
            `;

        });

}

function openAddModal() {
  document.getElementById("modalTitle").textContent = "Add New Transaction";
  document.getElementById("modalSaveBtn").textContent = "Save Transaction";
  document.getElementById("txForm").reset();
  document.getElementById("txEditId").value = "";
  document.getElementById("txDate").value = new Date().toISOString().slice(0, 10);
  populateCategoryOptions("Income");
  modalOverlay.classList.add("open");
}

function openEditModal(id) {
  const t = transactions.find(t => t.id === id);
  if (!t) return;
  document.getElementById("modalTitle").textContent = "Edit Transaction";
  document.getElementById("modalSaveBtn").textContent = "Update Transaction";
  document.getElementById("txEditId").value = t.id;
  document.querySelector(`input[name="type"][value="${t.category.type}"]`).checked = true;
  populateCategoryOptions(t.type);
  txCategorySelect.value = t.category;
  document.getElementById("txAmount").value = t.amount;
  document.getElementById("txDesc").value = t.description;
  document.getElementById("txDate").value = t.date;
  modalOverlay.classList.add("open");
}

function closeModal() { modalOverlay.classList.remove("open"); }

document.getElementById("qaAddIncome").addEventListener("click", () => { openAddModal(); document.querySelector('input[name="type"][value="Income"]').checked = true; populateCategoryOptions("Income"); });
document.getElementById("qaAddExpense").addEventListener("click", () => { openAddModal(); document.querySelector('input[name="type"][value="Expense"]').checked = true; populateCategoryOptions("Expense"); });
document.getElementById("qaStatement").addEventListener("click", () => { alert("Wire this up to " + API.reportsExcel + " or " + API.reportsPdf); });
document.getElementById("txAdd").addEventListener("click", openAddModal);
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalCancel").addEventListener("click", closeModal);
document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener("change", e => populateCategoryOptions(e.target.value)));

document.getElementById("txForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // <-- stops real form submission / page reload
  const editId = document.getElementById("txEditId").value;
  const payload = {
    amount: Number(document.getElementById("txAmount").value),
    description: document.getElementById("txDesc").value,
    date: document.getElementById("txDate").value,
    category_id: txCategorySelect.value
  };
  if (!payload.category_id || !payload.amount || !payload.description || !payload.date) return;

  if (editId) {
    await updateTransactionApi(Number(editId), payload);
    transactions = transactions.map(t => t.id === Number(editId) ? { ...t, ...payload } : t);
  } else {
    const created = await createTransactionApi(payload);
    transactions.unshift(created || { id: Math.max(0, ...transactions.map(t => t.id)) + 1, ...payload });
  }

  closeModal();
  // re-render whichever page is currently visible so numbers stay in sync
  const activePage = document.querySelector(".page.active").id.replace("page-", "");
  navigateTo(activePage);
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  alert("Wire this up to your auth logout endpoint / clear session token.");
});

/* =====================================================================
   12. INITIAL LOAD
===================================================================== */
renderDashboard();