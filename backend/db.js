/**
 * Base de données JSON — stockage persistant sans dépendance native.
 * Fichier: database.json
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'database.json');

function load() {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    }
  } catch (_) {}
  return { orders: [], nextId: 1 };
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const data = load();

function now() {
  return new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }).replace(',', '');
}

const db = {
  insertOrder(fields) {
    const order = {
      id: data.nextId++,
      ...fields,
      status: 'pending',
      created_at: now(),
    };
    data.orders.unshift(order);
    save(data);
    return order;
  },

  getAllOrders() {
    return [...data.orders];
  },

  getOrderById(id) {
    return data.orders.find((o) => o.id === id) || null;
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
};

module.exports = db;
