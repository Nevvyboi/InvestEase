const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const fmtZAR = n => new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR",maximumFractionDigits:2}).format(Number(n)||0);
const ZAR = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
};

function safeGet(obj, path, fallback = null) {
    try {
      return path.split('.').reduce((o, k) => (o && k in o ? o[k] : undefined), obj) ?? fallback;
    } catch {
      return fallback;
    }
}

function titleCase(str=""){
    return String(str).toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase());
}

function catDisplayName(obj){
    if(!obj) return null;
    return obj.name || obj.categoryName || obj.displayName || obj.description || obj.label || null;
}

async function getJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} for ${url}: ${text}`);
    }
    return res.json();
}

function createFloatingShapes() {
    const container = document.querySelector('.bgElements');
    if (!container) return;
    setInterval(() => {
        const shape = document.createElement('div');
        shape.className = 'floatingShape';
        shape.style.left = Math.random() * 100 + 'vw';
        const size = Math.random() * 100 + 50;
        shape.style.width = shape.style.height = size + 'px';
        shape.style.animationDuration = Math.random() * 15 + 10 + 's';
        shape.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(shape);
        setTimeout(() => shape.remove(), 25000);
    }, 3000);
}

document.querySelectorAll('.navItem').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.navItem').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        item.style.transform = 'translateX(12px) scale(0.98)';
        setTimeout(() => (item.style.transform = item.classList.contains('active') ? '' : 'translateX(8px)'), 150);
    });

    item.addEventListener('mouseenter', () => {
        if (!item.classList.contains('active')) item.style.transform = 'translateX(8px)';
    });
    item.addEventListener('mouseleave', () => {
        if (!item.classList.contains('active')) item.style.transform = '';
    });
});

document.addEventListener('mousemove', e => {
    const orbs = document.querySelectorAll('.gradientOrb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    orbs.forEach((orb, i) => {
        const speed = 0.5 + i * 0.2;
        const xPos = (x - 0.5) * speed * 50;
        const yPos = (y - 0.5) * speed * 50;
        orb.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    createFloatingShapes();

    document.querySelectorAll('.balanceCard, .accountCard, .activitySection').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        setTimeout(() => {
            el.style.transition = 'all .6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 100);
    });
});

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const body = document.body;
        const icon = themeBtn.querySelector('i');
        const text = themeBtn.querySelector('span');

        const dark = body.getAttribute('dataTheme') === 'dark';
        if (dark) {
            body.removeAttribute('dataTheme');
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('dataTheme', 'dark');
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        }
        themeBtn.style.transform = 'scale(0.95)';
        setTimeout(() => (themeBtn.style.transform = 'scale(1)'), 150);
    });

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.setAttribute('dataTheme', 'dark');
        themeBtn.querySelector('i').className = 'fas fa-sun';
        themeBtn.querySelector('span').textContent = 'Light Mode';
    }
}

document.querySelectorAll('.colorOption').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.colorOption').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        const colorScheme = option.getAttribute('dataColor');
        if (colorScheme === 'indigo') document.body.removeAttribute('dataColor');
        else document.body.setAttribute('dataColor', colorScheme);
        localStorage.setItem('colorScheme', colorScheme);
        option.style.transform = 'scale(0.95)';
        setTimeout(() => { option.style.transform = ''; }, 150);
        showColorChangeNotification(colorScheme);
    });
});

function loadColorScheme() {
    const saved = localStorage.getItem('colorScheme');
    if (!saved) return;
    if (saved === 'indigo') document.body.removeAttribute('dataColor');
    else document.body.setAttribute('dataColor', saved);
    document.querySelectorAll('.colorOption').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('dataColor') === saved) opt.classList.add('active');
    });
}

function showColorChangeNotification(colorScheme) {
    const colorNames = {
        indigo: 'Indigo Blue',
        emerald: 'Emerald Green',
        rose: 'Rose Pink',
        amber: 'Amber Orange',
        purple: 'Royal Purple',
        teal: 'Teal Cyan'
    };
    const notification = document.createElement('div');
    notification.style.cssText = `position:fixed;top:32px;right:32px;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;padding:16px 24px;border-radius:16px;box-shadow:var(--shadow-xl);z-index:1000;opacity:0;transform:translateY(-20px);transition:all .3s ease;font-weight:500;`;
    notification.textContent = `Switched to ${colorNames[colorScheme]}`;
    document.body.appendChild(notification);
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

let connectionState = { isConnected:false, tokenExpiry:null, timerInterval:null };

function updateConnectionStatus(status, message = '') {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const connectionMessage = document.getElementById('connectionMessage');
    const messageText = document.getElementById('messageText');
    if (!statusIndicator || !statusText || !connectionMessage || !messageText) return;

    statusIndicator.classList.remove('connected', 'disconnected', 'connecting');
    switch(status) {
        case 'connecting':
            statusIndicator.classList.add('connecting');
            statusText.textContent = 'Connecting to Sandbox...';
            showConnectionMessage('Establishing connection to Investec Sandbox...', 'info');
            break;
        case 'connected':
            statusIndicator.classList.add('connected');
            statusText.textContent = 'Sandbox Connected';
            showConnectionMessage('Successfully connected to Investec Sandbox!', 'success');
            connectionState.isConnected = true;
            startTokenTimer();
            break;
        case 'disconnected':
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Sandbox Disconnected';
            showConnectionMessage(message || 'Connection to sandbox lost', 'error');
            connectionState.isConnected = false;
            stopTokenTimer();
            break;
        case 'expired':
            statusIndicator.classList.add('disconnected');
            statusText.textContent = 'Token Expired';
            showConnectionMessage('Sandbox token has expired. Please reconnect.', 'error');
            connectionState.isConnected = false;
            break;
    }
}

function showConnectionMessage(message, type) {
    const connectionMessage = document.getElementById('connectionMessage');
    const messageText = document.getElementById('messageText');
    if (!connectionMessage || !messageText) return;

    connectionMessage.classList.remove('error', 'success');
    if (type === 'error') connectionMessage.classList.add('error');
    else if (type === 'success') connectionMessage.classList.add('success');

    messageText.textContent = message;
    connectionMessage.style.display = 'flex';
    if (type === 'success') setTimeout(() => (connectionMessage.style.display = 'none'), 5000);
}

function startTokenTimer() {
    connectionState.tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
    if (connectionState.timerInterval) clearInterval(connectionState.timerInterval);
    connectionState.timerInterval = setInterval(updateTokenTimer, 1000);
    updateTokenTimer();
}

function stopTokenTimer() {
    if (connectionState.timerInterval) {
        clearInterval(connectionState.timerInterval);
        connectionState.timerInterval = null;
    }
    const tokenTimer = document.getElementById('tokenTimer');
    if (tokenTimer) {
        tokenTimer.textContent = 'Not connected';
        tokenTimer.classList.remove('expired');
    }
}

function updateTokenTimer() {
  if (!connectionState.isConnected || !connectionState.tokenExpiry) return;
  const now = new Date();
  const timeLeft = connectionState.tokenExpiry - now;
  const tokenTimer = document.getElementById('tokenTimer');
  if (!tokenTimer) return;

  if (timeLeft <= 0) {
    updateConnectionStatus('expired');
    tokenTimer.textContent = 'Token expired - Refreshing...';
    tokenTimer.classList.add('expired');
    showConnectionMessage('Token expired. Refreshing page to reconnect...', 'info');
    setTimeout(() => window.location.reload(), 3000);
    return;
  }

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  tokenTimer.textContent = `Token expires in ${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  tokenTimer.classList.remove('expired');
  if (timeLeft < 5 * 60 * 1000) {
    tokenTimer.style.background = '#fff3cd';
    tokenTimer.style.color = '#856404';
  }
}

async function testSandboxConnection() {
    try {
        updateConnectionStatus('connecting');
        const response = await fetch('/api/accounts');
        if (!response.ok) throw new Error(`HTTP ${response.status}: Connection failed`);
        const data = await response.json();
        console.log('Sandbox connection successful:', data);
        updateConnectionStatus('connected');
        setTimeout(loadAccountData, 1000);
    } catch (error) {
        console.error('Sandbox connection failed:', error);
        updateConnectionStatus('disconnected', `Connection failed: ${error.message}`);
        setTimeout(testSandboxConnection, 10000);
    }
}

const elTotal   = document.getElementById('totalBalance');
const elSavings = document.getElementById('savingsBalance');
const elCheque  = document.getElementById('chequeBalance');

function bucketForAccount(acct) {
    const name = (acct.productName || '').toLowerCase();
    const type = (acct.accountType || '').toLowerCase();

    if (type.includes('current') || type.includes('cheque') || name.includes('private bank') || name.includes('current account') || name.includes('cheque'))
        return 'cheque';

    if (type.includes('savings') || name.includes('savings') || name.includes('prime') || name.includes('money market') || name.includes('call') || name.includes('flexible savings') || name.includes('tax free'))
        return 'savings';

    return 'other';
}

let allAccounts = [];
let balancesMap = new Map();
let grandTotal = 0, savingsTotal = 0, chequeTotal = 0;

function accountIcon(productName = "") {
    const p = productName.toLowerCase();
    if (p.includes("saving")) return "fa-piggy-bank";
    if (p.includes("invest")) return "fa-chart-line";
    return "fa-university";
}

function accountCard(acc, balNum) {
    const masked = acc.accountNumber ? acc.accountNumber : "";
    return `
      <div class="accountCard">
        <div class="accountHeader">
          <div class="accountInfo">
            <h3>${acc.accountName || acc.referenceName || "Account"}</h3>
            <p>${masked}</p>
          </div>
          <div class="accountIcon">
            <i class="fas ${accountIcon(acc.productName)}"></i>
          </div>
        </div>
        <div class="accountBalance">
          <div class="accountAmount">${fmtZAR(balNum)}</div>
          <div class="productName">${acc.productName || ""}</div>
        </div>
      </div>`;
}

function renderDashboardAccounts() {
    const grid = document.getElementById("dashAccountsGrid");
    if (!grid) return;
    const list = (allAccounts || []).slice(0, 3);
    grid.innerHTML = list.map(acc => {
        const bal = balancesMap.get(acc.accountId) || {};
        const n = typeof bal.currentBalance === "number" ? bal.currentBalance :
                  typeof bal.availableBalance === "number" ? bal.availableBalance : 0;
        return accountCard(acc, n);
    }).join("");
}

function renderAllAccounts() {
    const grid = document.getElementById("allAccountsGrid");
    if (!grid) return;
    const list = allAccounts || [];
    grid.innerHTML = list.map(acc => {
        const bal = balancesMap.get(acc.accountId) || {};
        const n = typeof bal.currentBalance === "number" ? bal.currentBalance :
                  typeof bal.availableBalance === "number" ? bal.availableBalance : 0;
        return accountCard(acc, n);
    }).join("");
}

function updateQuickStats({ accounts, balancesMap, savingsTotal, chequeTotal, grandTotal }) {
    setText("statAccountsCount", `${accounts.length}`);
    const savingsShare = grandTotal > 0 ? (savingsTotal / grandTotal) * 100 : 0;
    setText("statSavingsShare", `${savingsShare.toFixed(1)}%`);
    let largest = { name: "", value: 0 };
    for (const acc of accounts) {
        const b = balancesMap.get(acc.accountId) || { availableBalance: 0, currentBalance: 0 };
        const val = (typeof b.availableBalance === "number" ? b.availableBalance : 0);
        if (val > largest.value) largest = { name: acc.accountName || acc.referenceName || "Account", value: val };
    }
    setText("statLargestValue", fmtZAR(largest.value));
    setText("statLargestName", largest.name || "Largest account");
    const avg = accounts.length ? grandTotal / accounts.length : 0;
    setText("statAvgBalance", fmtZAR(avg));
}

async function loadAccountData() {
    try {
        const accResp = await getJSON('/api/accounts');
        allAccounts = safeGet(accResp, 'data.accounts', []) || [];
        balancesMap.clear();
        grandTotal = savingsTotal = chequeTotal = 0;

        for (const acct of allAccounts) {
            const accountId = acct.accountId || acct.account_id || acct.id;
            if (!accountId) continue;
            try {
                const balResp = await getJSON(`/api/balance/${encodeURIComponent(accountId)}`);
                const bal = safeGet(balResp, 'data', {});
                const current = Number(bal.currentBalance ?? bal.availableBalance ?? 0);
                if (!Number.isFinite(current)) continue;
                balancesMap.set(accountId, bal);
                grandTotal += current;
                const bucket = bucketForAccount(acct);
                if (bucket === 'savings') savingsTotal += current;
                else if (bucket === 'cheque') chequeTotal += current;
            } catch (err) {
                console.error('Balance fetch failed for', accountId, err);
            }
        }

        if (elTotal)   elTotal.textContent   = fmtZAR(grandTotal);
        if (elSavings) elSavings.textContent = fmtZAR(savingsTotal);
        if (elCheque)  elCheque.textContent  = fmtZAR(chequeTotal);

        updateQuickStats({ accounts: allAccounts, balancesMap, savingsTotal, chequeTotal, grandTotal });
        renderDashboardAccounts();
        if (!$("#accountsView") || $("#accountsView").style.display !== "none") renderAllAccounts();

        initTransfersView();
    } catch (err) {
        console.error('Account load failed:', err);
    }
}

function txIconFor(type, desc="") {
    const t = (type || desc || "").toLowerCase();
    if (t.includes("fee")) return "fa-receipt";
    if (t.includes("card") || t.includes("purchase")) return "fa-credit-card";
    if (t.includes("salary") || t.includes("deposit")) return "fa-building";
    if (t.includes("transfer")) return "fa-right-left";
    if (t.includes("atm")) return "fa-building-columns";
    return "fa-arrow-right-arrow-left";
}

async function loadTransactionsForAccount(accountId) {
    const list = $("#txList");
    if (!list || !accountId) return;
    list.innerHTML = `<div class="activityItem">Loading transactions...</div>`;
    try {
        const txRes = await fetch(
            `/api/accounts/${encodeURIComponent(accountId)}/transactions?all=true`,
            { headers:{ Accept:"application/json" } }
        );

        const data = await txRes.json().catch(()=>({}));
        console.log("TX payload:", data);

        const tx = (data && (data.data?.transactions || data.transactions)) || [];
        if (!tx.length) { list.innerHTML = `<div class="activityItem">No recent transactions.</div>`; return; }
        list.innerHTML = tx.slice(0, 50).map(t => {
          const amount = Number(t.amount || 0);
          const desc = t.description || t.reference || t.type || "Transaction";
          const when = t.timestamp || t.postDate || t.date || "";
          const amtClass = amount < 0 ? "neg" : "pos";
          return `
              <div class="txItem">
                <div class="txIcon"><i class="fas ${txIconFor(t.type, desc)}"></i></div>
                <div class="txInfo">
                    <div class="txTitle" title="${desc.replace(/"/g,'&quot;')}">${desc}</div>
                    <div class="txMeta">${when}</div>
                </div>
                <div class="txAmount ${amtClass}">${fmtZAR(amount)}</div>
              </div>`;
        }).join("");
    } catch (e) {
        console.error(e);
        list.innerHTML = `<div class="activityItem">Failed to load transactions.</div>`;
    }
}

function populateAccountSelect(selectEl, accounts, { excludeId = null } = {}) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    (accounts||[]).forEach(a => {
        const id = a.accountId || a.id || a.account_id;
        if (!id) return;
        if (excludeId && String(excludeId) === String(id)) return;
        const name = a.accountName || a.referenceName || "Account";
        const masked = a.accountNumber ? ` •••• ${String(a.accountNumber).slice(-4)}` : "";
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = `${name}${masked}`;
        selectEl.appendChild(opt);
    });
}
function pmBuildRow(beneficiaries) {
    const row = document.createElement("div");
    row.className = "pmRow";

    const sel = document.createElement("select");
    beneficiaries.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b.beneficiaryId || b.id;
        opt.textContent = `${b.name || b.beneficiaryName} — ${b.bank || b.bankName || ""}`;
        sel.appendChild(opt);
    });

    const amt = document.createElement("input");
    amt.type = "number"; amt.min = "0"; amt.step = "0.01"; amt.placeholder = "Amount (ZAR)";

    const myRef = document.createElement("input");
    myRef.type = "text"; myRef.maxLength = 20; myRef.placeholder = "My reference";

    const theirRef = document.createElement("input");
    theirRef.type = "text"; theirRef.maxLength = 20; theirRef.placeholder = "Their reference";

    const rm = document.createElement("button");
    rm.type = "button"; rm.className = "pmRemove"; rm.textContent = "Remove";
    rm.addEventListener("click", ()=> row.remove());

    row.append(sel, amt, myRef, theirRef, rm);
    return row;
}

async function submitPayMultiple() {
    const fromHost = document.getElementById("pmFrom");
    const fromId = fromHost?.dataset?.selectedId;
    if (!fromId) { showConnectionMessage("Pick a 'From' account", "error"); return; }

    const rows = Array.from(document.querySelectorAll("#pmList .pmRow"));
    if (!rows.length) { showConnectionMessage("Add at least one beneficiary", "error"); return; }

    const paymentList = [];
    for (const r of rows) {
        const [sel, amt, myRef, theirRef] = r.querySelectorAll("select, input");
        const amount = Number(amt.value || 0);
        if (!sel.value || !(amount > 0)) continue;
        paymentList.push({
            beneficiaryId: sel.value,
            amount: amount.toFixed(2),
            myReference: (myRef.value || "").slice(0,20),
            theirReference: (theirRef.value || "").slice(0,20)
        });

    }
    if (!paymentList.length) { showConnectionMessage("Please enter valid amounts", "error"); return; }

    try {
        console.log("PayMultiple payload:", { accountId: fromId, paymentList });

        const res = await fetch("/api/pay-multiple", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ accountId: fromId, paymentList })
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data?.error || "Payment failed");
        showConnectionMessage("Payments submitted to sandbox.", "success");
    } catch (err) {
        console.error(err);
        showConnectionMessage(`Pay multiple error: ${err.message}`, "error");
    }
}

function initialsFrom(name="") {
    const parts = String(name).trim().split(/\s+/);
    return ((parts[0]?.[0]||"") + (parts[1]?.[0]||"")).toUpperCase();
}


function buildRoundSelect(containerId, accounts, onChange, initialId=null) {
    const host = document.getElementById(containerId);
    if (!host) return;

    // ---- Native <select> fallback (works with your current HTML) ----
    const isSelect = host.tagName && host.tagName.toLowerCase() === 'select';
    if (isSelect) {
        // populate
        host.innerHTML = '';
        (accounts || []).forEach(a => {
            const id = a.accountId || a.id;
            if (!id) return;
            const name = a.accountName || a.referenceName || 'Account';
            const masked = a.accountNumber ? ` •••• ${String(a.accountNumber).slice(-4)}` : '';
            const opt = document.createElement('option');
            opt.value = String(id);
            opt.textContent = `${name}${masked}`;
            host.appendChild(opt);
        });

        // set initial
        const initial = initialId || (accounts && accounts[0] && (accounts[0].accountId || accounts[0].id));
        if (initial) host.value = String(initial);
        host.dataset.selectedId = host.value || '';

        // fire change once on init
        if (typeof onChange === 'function') onChange(host.value || '');

        // wire change events
        host.addEventListener('change', () => {
            host.dataset.selectedId = host.value || '';
            if (typeof onChange === 'function') onChange(host.value || '');
        });
        return; // done with native select
    }

    // ---- Custom roundSelect widget (if host is a <div>) ----
    host.classList.add("roundSelect");
    host.innerHTML = `
        <button type="button" class="roundSelect-trigger" aria-haspopup="listbox" aria-expanded="false">••</button>
        <div class="roundSelect-menu" role="listbox"></div>
    `;

    const trigger = host.querySelector(".roundSelect-trigger");
    const menu    = host.querySelector(".roundSelect-menu");

    menu.innerHTML = (accounts || []).map(a => {
        const id   = a.accountId || a.id;
        const name = a.accountName || a.referenceName || "Account";
        const masked = a.accountNumber ? `•••• ${String(a.accountNumber).slice(-4)}` : "";
        return `
          <div class="roundSelect-item" role="option" data-id="${id}">
              <div class="roundSelect-badge">${initialsFrom(name)}</div>
              <div>
                  <div class="roundSelect-name">${name}</div>
                  <div class="roundSelect-sub">${masked}</div>
              </div>
          </div>
        `;
    }).join("");

    let currentId = initialId || (accounts?.[0]?.accountId || accounts?.[0]?.id);
    const setTriggerText = (id) => {
        const acc = (accounts||[]).find(a => String(a.accountId || a.id) === String(id));
        const name = acc ? (acc.accountName || acc.referenceName || "Account") : "••";
        trigger.textContent = initialsFrom(name);
    };
    setTriggerText(currentId);
    host.dataset.selectedId = currentId;

    trigger.addEventListener("click", () => {
        const open = host.classList.toggle("open");
        trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
        if (!host.contains(e.target)) {
            host.classList.remove("open");
            trigger.setAttribute("aria-expanded", "false");
        }
    });

    menu.querySelectorAll(".roundSelect-item").forEach(item => {
        item.addEventListener("click", () => {
            const id = item.getAttribute("data-id");
            currentId = id;
            host.dataset.selectedId = currentId;
            setTriggerText(id);
            host.classList.remove("open");
            trigger.setAttribute("aria-expanded", "false");
            if (typeof onChange === 'function') onChange(id);
        });
    });

    if (currentId && typeof onChange === 'function') onChange(currentId);
}


function initTransfersView() {
    buildRoundSelect(
        "txAccountSelect",
        allAccounts,
        (id) => loadTransactionsForAccount(id),
        allAccounts?.[0]?.accountId
    );

    (async () => {

        if (!benefAll?.length) {
            try { await loadBeneficiaryData(); } catch {}
        }

        buildRoundSelect(
            "pmFrom",
            allAccounts,
            () => {},
            allAccounts?.[0]?.accountId
        );

        const pmList = document.getElementById("pmList");
        document.getElementById("pmAdd")?.addEventListener("click", () => {
            pmList.appendChild(pmBuildRow(benefAll || []));
        });
        document.getElementById("pmFormInitialized") || (()=>{
            pmList.appendChild(pmBuildRow(benefAll || []));
            const marker = document.createElement("input");
            marker.type = "hidden"; marker.id = "pmFormInitialized";
            document.getElementById("payMultipleForm").appendChild(marker);
        })();

        document.getElementById("payMultipleForm")?.addEventListener("submit", (e)=>{
            e.preventDefault();
            const btn = document.getElementById("pmSubmit");
            if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
            submitPayMultiple().finally(()=>{ if (btn) { btn.disabled = false; btn.textContent = "Send Payments"; } });
        });
    })();
}

let benefAll = [];
let benefCats = [];

function benefInitials(name="") {
    const parts = (name||"").trim().split(/\s+/);
    return (parts[0]?.[0]||"") + (parts[1]?.[0]||"");
}

function renderBeneficiaries(list) {
    const grid = document.getElementById("benefGrid");
    if (!grid) return;
    if (!list || !list.length) { grid.innerHTML = "<p>No beneficiaries found.</p>"; return; }
    grid.innerHTML = list.map(b => {
        const name = b.name || b.beneficiaryName || "Beneficiary";
        const account = b.accountNumber || b.account || "";
        const bankRaw = b.bank || b.bankName || b.bankShortName || b.bankDescription || "";
        const bank = titleCase(bankRaw);
        const catName = getCategoryName(b.categoryId) || "Uncategorised";
        return `<div class="benefCard" data-cat="${b.categoryId||''}">
          <div class="avatar">${benefInitials(name)}</div>

          <div class="info">
              <h4>${name}</h4>
              <p>${bank}${bank && account ? " " : ""}${account ? account : ""}</p>

              <div class="benefMeta">
                  ${ (b.referenceName || b.name) ? `<span class="metaItem" title="Reference name">${b.referenceName || b.name}</span>` : `` }
                  ${ b.referenceAccountNumber ? `<span class="metaItem" title="Reference account">${b.referenceAccountNumber}</span>` : `` }
                  ${ (b.lastPaymentAmount || b.lastPaymentDate) ?
                      `<span class="metaItem" title="Last payment">${b.lastPaymentAmount ? fmtZAR(b.lastPaymentAmount) : ""}${b.lastPaymentDate ? ` • ${b.lastPaymentDate}` : ""}</span>`
                      : `` }
              </div>
            </div>
            <div class="cardRight">
                ${ b.fasterPaymentAllowed ? `<span class="fastBadge" title="Faster payments allowed">Faster</span>` : `` }
                <div class="categoryTag" title="${catName}">${catName}</div>
            </div>
        </div>`;
    }).join("");
}

function getCategoryName(id) {
    const c = benefCats.find(x => String(x.id) === String(id));
    return catDisplayName(c);
}

function renderBenefCategories() {

    const sane = [];
    const seen = new Set();
    (benefCats||[]).forEach(c => {
        const nm = catDisplayName(c);
        const key = String(c.id||'') + '::' + String(nm||'').toLowerCase();
        if(nm && !seen.has(key)){ seen.add(key); sane.push({id:c.id, name:nm}); }
    });
    benefCats = sane;

    const wrap = document.getElementById("benefCategories");
    const filterSel = document.getElementById("benefCategoryFilter");
    if (!wrap || !filterSel) return;

    wrap.innerHTML = ["All", ...benefCats.map(c=>c.name)].map((name, idx) => {
        const id = idx === 0 ? "" : benefCats[idx-1].id;
        const label = idx === 0 ? "All" : (name?.[0] || "?");
        return `<button class="benefCategoryChip${idx===0?" active":""}" data-id="${id}" title="${name}">${label}</button>`;
    }).join("");

    filterSel.innerHTML = `<option value="">All categories</option>` + benefCats.map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    wrap.querySelectorAll(".benefCategoryChip").forEach(chip => {
        chip.addEventListener("click", () => {
            wrap.querySelectorAll(".benefCategoryChip").forEach(c=>c.classList.remove("active"));
            chip.classList.add("active");
            const id = chip.getAttribute("data-id");
            applyBenefFilters({ categoryId: id || "" });
            filterSel.value = id || "";
        });
    });

    filterSel.addEventListener("change", (e)=>{
        const id = e.target.value;

        wrap.querySelectorAll(".benefCategoryChip").forEach(c=>c.classList.toggle("active", (c.getAttribute("data-id")||"") === (id||"")));
        applyBenefFilters({ categoryId: id || "" });
    });
}

function applyBenefFilters({ categoryId = "", search = null } = {}) {
    const q = ((search ?? document.getElementById("benefSearch")?.value) || "").toLowerCase();
    const filtered = benefAll.filter(b => {
        const inCat = !categoryId || String(b.categoryId) === String(categoryId);
        const name = (b.name || b.beneficiaryName || "").toLowerCase();
        const bank = (b.bank || b.bankName || "").toLowerCase();
        return inCat && (!q || name.includes(q) || bank.includes(q));
    });
    renderBeneficiaries(filtered);
    updateBenefCount(filtered.length);
}

async function loadBeneficiaryData() {
    try {
        const [benefRes, catsRes] = await Promise.all([
            getJSON("/api/beneficiaries"),
            getJSON("/api/beneficiary-categories")
        ]);
        benefAll = (benefRes?.data || benefRes?.beneficiaries || []);
        benefCats = (catsRes?.data || catsRes?.categories || []);
        renderBenefCategories();
        applyBenefFilters({});
        updateBenefCount(benefAll.length);
    } catch (e) {
        console.error("Failed to load beneficiaries", e);
        const grid = document.getElementById("benefGrid");
        if (grid) grid.innerHTML = "<p>Could not load beneficiaries.</p>";
    }
}

function renderDocuments(items){
    const list = document.getElementById("docsList");
    if(!list) return;
    if(!items || !items.length){
        list.innerHTML = '<div class="docEmpty">No documents found for that range.</div>';
        return;
    }
    list.innerHTML = items.map(d => {
        const type = d.type || d.documentType || 'Document';
        const date = d.date || d.documentDate || d.statementDate || d.createdDate || '';
        const desc = d.description || d.documentDescription || '';

        const jsonStr = encodeURIComponent(JSON.stringify(d, null, 2));
        return `<div class="docRow">
          <div class="docType">${type}</div>
          <div class="docDate">${date}</div>
          <div class="docDesc">${desc}</div>
          <div class="docsActions right">
              <button class="docDlBtn" onclick="window.open('data:text/plain;charset=utf-8,${jsonStr}','_blank')">Open</button>
          </div>
        </div>`;
    }).join("");
}

async function fetchDocuments(){
    const docSel = document.getElementById("docAccountSelect");

    const acc = docSel?.dataset?.selectedId || docSel?.value || "";
    const from = document.getElementById("docFromDate")?.value;
    const to   = document.getElementById("docToDate")?.value;

    if(!acc || !from || !to){
        showConnectionMessage("Pick account and date range first.", "error"); return;
    }
    const list = document.getElementById("docsList");
    if(list) list.innerHTML = '<div class="docEmpty">Loading...</div>';
    try{
        const url = `/api/documents?accountId=${encodeURIComponent(acc)}&fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`;
        const res = await fetch(url, {headers:{Accept:'application/json'}});
        const data = await res.json().catch(()=>({}));
        const docs = data?.data?.documents || data?.documents || [];
        renderDocuments(docs);
    }catch(e){
        console.error(e);
        if(list) list.innerHTML = '<div class="docEmpty">Failed to load documents.</div>';
    }
}

function initDocumentsView(){
    const accSel = document.getElementById("docAccountSelect");
    if(!accSel) return;
    buildRoundSelect(
        "docAccountSelect",
        allAccounts,
        () => {},
        allAccounts?.[0]?.accountId
    );
    const now = new Date();
    const to = now.toISOString().slice(0,10);
    const fromDate = new Date(now.getTime() - 89*24*3600*1000).toISOString().slice(0,10);
    const fromEl = document.getElementById("docFromDate");
    const toEl   = document.getElementById("docToDate");
    if(fromEl && !fromEl.value) fromEl.value = fromDate;
    if(toEl   && !toEl.value)   toEl.value   = to;

    document.getElementById("docFetchBtn")?.addEventListener("click", (e)=>{
        e.preventDefault();
        fetchDocuments();
    });
}

function showView(name) {
    const viewIds = {
        dashboard: "dashboardView",
        accounts: "accountsView",
        transactions: "transactionsView",
        beneficiaries: "beneficiariesView",
        documents: "documentsView"
    };

    const targetId = viewIds[name];
    if (!targetId || !document.getElementById(targetId)) {
        name = 'dashboard';
    }

    Object.values(viewIds).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (viewIds[name] === id) ? "" : "none";
    });

    if (name === 'accounts') {
        renderAllAccounts();
    } else if (name === 'transactions') {
        initTransactionsView();
    } else if (name === 'beneficiaries') {
        loadBeneficiaryData();
    } else if (name === 'documents') {
        initDocumentsView();
        loadBeneficiaryData();
    }

    document.querySelectorAll('.navItem').forEach(n => n.classList.remove('active'));
    const active = document.querySelector(`.navItem[data-nav="${name}"]`);
    if (active) active.classList.add('active');
}

document.addEventListener('click', (e) => {
    const item = e.target.closest('.navItem');
    if (item?.dataset?.nav) { e.preventDefault();
      showView(item.dataset.nav);
  }
});

document.querySelector('.viewAll')?.addEventListener('click', (e) => { e.preventDefault(); showView('accounts'); });

document.getElementById('backToDashboard')?.addEventListener('click', () => showView('dashboard'));
document.getElementById('backToDashboardFromTransfers')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('dashboard'); });

document.addEventListener('DOMContentLoaded', () => {
    loadColorScheme();
    testSandboxConnection();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !connectionState.isConnected) {
        testSandboxConnection();
    }
});

document.getElementById('backToDashboardFromBenefs')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('dashboard'); });
document.getElementById('backToDashboardFromDocs')?.addEventListener('click', (e)=>{ e.preventDefault(); showView('dashboard'); });

const benefHeader = document.querySelector('#beneficiariesView .sectionTitle');
if (benefHeader) {
    const count = document.createElement('span');
    count.id = 'benefCount';
    count.style.marginLeft = '8px';
    count.style.opacity = '.8';
    count.style.fontSize = '0.8em';
    benefHeader.appendChild(count);
}

const updateBenefCount = (n) => {
    const el = document.getElementById('benefCount');
    if(el) el.textContent = `(${n})`;
};
