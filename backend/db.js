/**
 * Base de données JSON — stockage persistant sans dépendance native.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'database.json');

function load() {
  try {
    if (fs.existsSync(FILE)) {
      const d = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
      // Migration progressive
      if (!d.clients) d.clients = [];
      if (!d.quotes) d.quotes = [];
      if (!d.nextClientId) d.nextClientId = 1;
      if (!d.nextQuoteId) d.nextQuoteId = 1;
      return d;
    }
  } catch (_) {}
  return { orders: [], clients: [], quotes: [], nextId: 1, nextClientId: 1, nextQuoteId: 1 };
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const data = load();

function now() {
  return new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }).replace(',', '');
}

const db = {
  // ─── Orders ─────────────────────────────────────────────────────────────────
  insertOrder(fields) {
    const order = { id: data.nextId++, ...fields, status: 'pending', created_at: now() };
    data.orders.unshift(order);
    save(data);
    return order;
  },

  getAllOrders() { return [...data.orders]; },

  getOrderById(id) { return data.orders.find((o) => o.id === id) || null; },

  getOrdersByEmail(email) {
    const norm = (email || '').trim().toLowerCase();
    return data.orders.filter((o) => (o.client_email || '').toLowerCase() === norm);
  },

  updateStatus(id, status) {
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    save(data);
    return { ...order };
  },

  deleteOrder(id) {
    const idx = data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    data.orders.splice(idx, 1);
    save(data);
    return true;
  },

  getStats() {
    const todayStr = new Date().toLocaleDateString('fr-FR');
    return {
      total: data.orders.length,
      pending: data.orders.filter((o) => o.status === 'pending').length,
      today: data.orders.filter((o) => o.created_at.startsWith(todayStr)).length,
      completed: data.orders.filter((o) => o.status === 'completed').length,
    };
  },

  // ─── Clients ────────────────────────────────────────────────────────────────
  findClientByEmail(email) {
    const norm = (email || '').trim().toLowerCase();
    return data.clients.find((c) => c.email === norm) || null;
  },

  createClient({ name, email, phone, passwordHash }) {
    const client = {
      id: data.nextClientId++,
      name,
      email: email.trim().toLowerCase(),
      phone: phone || '',
      passwordHash,
      createdAt: now(),
    };
    data.clients.push(client);
    save(data);
    return client;
  },

  // ─── Devis & Factures ───────────────────────────────────────────────────────
  createQuote(fields) {
    const year = new Date().getFullYear();
    const prefix = fields.type === 'facture' ? 'FAC' : 'DEV';
    const count = data.quotes.filter((q) => q.type === fields.type && q.reference.includes(String(year))).length + 1;
    const reference = `${prefix}-${year}-${String(count).padStart(3, '0')}`;

    const quote = {
      id: data.nextQuoteId++,
      reference,
      ...fields,
      status: 'sent',
      signedAt: null,
      createdAt: now(),
    };
    data.quotes.push(quote);
    save(data);
    return quote;
  },

  getAllQuotes() { return [...data.quotes].reverse(); },

  getQuotesByClientEmail(email) {
    const norm = (email || '').trim().toLowerCase();
    return data.quotes.filter((q) => (q.clientEmail || '').toLowerCase() === norm).reverse();
  },

  getQuoteById(id) { return data.quotes.find((q) => q.id === id) || null; },

  updateQuoteStatus(id, status, extra = {}) {
    const quote = data.quotes.find((q) => q.id === id);
    if (!quote) return null;
    Object.assign(quote, { status, ...extra });
    save(data);
    return { ...quote };
  },

  deleteQuote(id) {
    const idx = data.quotes.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    data.quotes.splice(idx, 1);
    save(data);
    return true;
  },
};

module.exports = db;
