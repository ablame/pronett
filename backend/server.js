require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const httpServer = createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || 'luminett-jwt-secret-2026';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// ─── Labels des services ──────────────────────────────────────────────────────
const SERVICE_LABELS = {
  conteneurs: 'Nettoyage de conteneurs',
  domicile: 'Nettoyage domicile',
  bureau: 'Nettoyage bureau / local',
  travaux: 'Nettoyage après travaux',
  vitres: 'Vitres / façades',
};

// ─── Rate limiting ────────────────────────────────────────────────────────────
const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  if (rec.blockedUntil > now) {
    const wait = Math.ceil((rec.blockedUntil - now) / 60000);
    return { ok: false, message: `Trop de tentatives. Réessayez dans ${wait} min.` };
  }
  return { ok: true };
}

function recordFail(ip) {
  const rec = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  rec.count++;
  if (rec.count >= 5) { rec.blockedUntil = Date.now() + 15 * 60 * 1000; rec.count = 0; }
  loginAttempts.set(ip, rec);
}

function clearAttempts(ip) { loginAttempts.delete(ip); }

// ─── JWT middleware ───────────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const d = jwt.verify(token, JWT_SECRET);
    if (d.type !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    next();
  } catch { res.status(401).json({ error: 'Session expirée, reconnectez-vous.' }); }
}

function clientAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    const d = jwt.verify(token, JWT_SECRET);
    if (d.type !== 'client') return res.status(403).json({ error: 'Accès refusé' });
    req.clientEmail = d.email;
    req.clientId = d.id;
    req.clientName = d.name;
    next();
  } catch { res.status(401).json({ error: 'Session expirée, reconnectez-vous.' }); }
}

// ─── Mailer ───────────────────────────────────────────────────────────────────
let resendClient = null;
let transporter = null;

async function setupMailer() {
  const { RESEND_API_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE } = process.env;
  if (RESEND_API_KEY) {
    resendClient = new Resend(RESEND_API_KEY);
    console.log('📧  Resend configuré (envoi HTTP)');
  } else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_SECURE === 'true', auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    console.log('📧  SMTP configuré avec', SMTP_HOST);
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧  Mode test email — compte:', testAccount.user);
  }
}

function wrapEmail(content) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9">
    <div style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
      <div style="font-size:32px">🧹</div>
      <h1 style="margin:8px 0 4px;color:#fff;font-size:24px">LumiNett</h1>
      <p style="margin:0;color:#bfdbfe;font-size:14px">Service professionnel de nettoyage</p>
    </div>
    <div style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">${content}</div>
  </div>`;
}

async function sendEmail(to, subject, html) {
  const from = 'LumiNett <onboarding@resend.dev>';
  if (resendClient) {
    const r = await resendClient.emails.send({ from, to, subject, html });
    console.log(`📧  Email → ${to}:`, r?.data?.id || r?.error);
  } else if (transporter) {
    const info = await transporter.sendMail({ from: '"LumiNett" <noreply@luminett.fr>', to, subject, html });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧  Email → ${to}:`, preview);
  }
}

async function sendOrderEmails(order) {
  const serviceLabel = SERVICE_LABELS[order.service] || order.service;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@luminett.fr';
  const siteUrl = process.env.SITE_URL || 'http://localhost:5173';

  const tr = (l, v, bg) => `<tr style="background:${bg}"><td style="padding:10px 14px;color:#64748b;font-weight:600;white-space:nowrap">${l}</td><td style="padding:10px 14px">${v}</td></tr>`;
  const table = `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${tr('Service', serviceLabel, '#fff')}${tr('Client', order.client_name, '#f8fafc')}
    ${tr('Email', `<a href="mailto:${order.client_email}">${order.client_email}</a>`, '#fff')}
    ${tr('Téléphone', `<a href="tel:${order.client_phone}">${order.client_phone}</a>`, '#f8fafc')}
    ${tr('Adresse', order.address, '#fff')}${tr('Date', order.date, '#f8fafc')}
    ${tr('Créneau', order.time_slot, '#fff')}
    ${order.surface_area ? tr('Surface', order.surface_area, '#f8fafc') : ''}
    ${order.notes ? tr('Notes', order.notes, '#fff') : ''}
  </table>`;

  await Promise.all([
    sendEmail(adminEmail, `🔔 Nouvelle commande #${order.id} — ${serviceLabel}`,
      wrapEmail(`<h2 style="color:#1d4ed8;margin-top:0">Commande #${order.id}</h2>
        <p style="color:#475569">Nouvelle demande reçue.</p>${table}
        <div style="margin-top:24px;text-align:center">
          <a href="${siteUrl}/admin" style="background:#1d4ed8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Voir le tableau de bord →</a>
        </div>`)),
    sendEmail(order.client_email, `✅ Demande reçue — LumiNett #${order.id}`,
      wrapEmail(`<p>Bonjour <strong>${order.client_name}</strong>,</p>
        <p style="color:#475569">Nous avons bien reçu votre demande de <strong>${serviceLabel}</strong>. Notre équipe vous contactera sous <strong>48h</strong>.</p>
        <div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
          <p style="margin:0 0 8px;color:#1e40af;font-weight:700">Récapitulatif</p>
          <p style="margin:4px 0;color:#334155">📅 Date : <strong>${order.date}</strong></p>
          <p style="margin:4px 0;color:#334155">🕐 Créneau : <strong>${order.time_slot}</strong></p>
          <p style="margin:4px 0;color:#334155">📍 Adresse : <strong>${order.address}</strong></p>
        </div>
        <p style="color:#475569">Cordialement,<br><strong>L'équipe LumiNett</strong></p>`)),
  ]);
}

async function sendQuoteEmail(quote) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:5173';
  const typeLabel = quote.type === 'facture' ? 'facture' : 'devis';
  await sendEmail(quote.clientEmail, `📄 Nouveau ${typeLabel} disponible — LumiNett (${quote.reference})`,
    wrapEmail(`<p>Bonjour <strong>${quote.clientName}</strong>,</p>
      <p style="color:#475569">Vous avez reçu un nouveau <strong>${typeLabel}</strong> de LumiNett.</p>
      <div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
        <p style="margin:0 0 4px;color:#1e40af;font-weight:700">Référence : ${quote.reference}</p>
        <p style="margin:0;color:#334155">Montant total TTC : <strong>${Number(quote.total).toFixed(2)} €</strong></p>
        ${quote.validUntil ? `<p style="margin:4px 0 0;color:#64748b;font-size:13px">Valide jusqu'au : ${quote.validUntil}</p>` : ''}
      </div>
      <p style="color:#475569">Connectez-vous à votre espace client pour le consulter${quote.type === 'devis' ? ' et le signer' : ''} :</p>
      <div style="text-align:center;margin-top:24px">
        <a href="${siteUrl}/mon-espace" style="background:#1d4ed8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Accéder à mon espace →</a>
      </div>
      <p style="color:#475569;margin-top:24px">Cordialement,<br><strong>L'équipe LumiNett</strong></p>`));
}

async function sendSignatureNotifEmail(quote) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@luminett.fr';
  await sendEmail(adminEmail, `✅ Devis ${quote.reference} signé par ${quote.clientName}`,
    wrapEmail(`<h2 style="color:#059669;margin-top:0">Devis accepté et signé</h2>
      <p style="color:#475569">Le devis <strong>${quote.reference}</strong> a été signé électroniquement par <strong>${quote.clientName}</strong> (${quote.clientEmail}).</p>
      <p style="color:#475569">Montant : <strong>${Number(quote.total).toFixed(2)} €</strong></p>
      <p style="color:#64748b;font-size:13px">Signé le : ${quote.signedAt}</p>`));
}

// ─── Routes Auth Admin ────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const ip = req.ip;
  const rl = checkRateLimit(ip);
  if (!rl.ok) return res.status(429).json({ error: rl.message });

  const { email, password } = req.body;
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@luminett.fr').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin2024!';

  if ((email || '').toLowerCase() !== adminEmail || password !== adminPassword) {
    recordFail(ip);
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  clearAttempts(ip);
  const token = jwt.sign({ type: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// ─── Routes Auth Client ───────────────────────────────────────────────────────
app.post('/api/client/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Champs obligatoires manquants' });
  if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court (6 caractères min.)' });

  const existing = db.findClientByEmail(email);
  if (existing) return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });

  const passwordHash = await bcrypt.hash(password, 10);
  const client = db.createClient({ name, email, phone, passwordHash });
  const token = jwt.sign({ type: 'client', id: client.id, email: client.email, name: client.name }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, client: { id: client.id, name: client.name, email: client.email } });
});

app.post('/api/client/login', async (req, res) => {
  const ip = req.ip;
  const rl = checkRateLimit(ip);
  if (!rl.ok) return res.status(429).json({ error: rl.message });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const client = db.findClientByEmail(email);
  if (!client) { recordFail(ip); return res.status(401).json({ error: 'Identifiants incorrects' }); }

  const match = await bcrypt.compare(password, client.passwordHash);
  if (!match) { recordFail(ip); return res.status(401).json({ error: 'Identifiants incorrects' }); }

  clearAttempts(ip);
  const token = jwt.sign({ type: 'client', id: client.id, email: client.email, name: client.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, client: { id: client.id, name: client.name, email: client.email } });
});

// ─── Routes Client protégées ──────────────────────────────────────────────────
app.get('/api/client/orders', clientAuth, (req, res) => {
  res.json(db.getOrdersByEmail(req.clientEmail));
});

app.get('/api/client/quotes', clientAuth, (req, res) => {
  res.json(db.getQuotesByClientEmail(req.clientEmail));
});

app.patch('/api/client/quotes/:id/sign', clientAuth, async (req, res) => {
  const quote = db.getQuoteById(parseInt(req.params.id));
  if (!quote) return res.status(404).json({ error: 'Document introuvable' });
  if ((quote.clientEmail || '').toLowerCase() !== req.clientEmail.toLowerCase())
    return res.status(403).json({ error: 'Accès refusé' });
  if (quote.status === 'signed') return res.status(400).json({ error: 'Déjà signé' });

  const signedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  const updated = db.updateQuoteStatus(quote.id, 'signed', { signedAt });

  sendSignatureNotifEmail(updated).catch((e) => console.error('Email signature:', e));
  res.json(updated);
});

// ─── Routes Admin ─────────────────────────────────────────────────────────────
app.get('/api/stats', adminAuth, (_req, res) => res.json(db.getStats()));

app.get('/api/orders', adminAuth, (_req, res) => res.json(db.getAllOrders()));

app.post('/api/orders', async (req, res) => {
  const { service, client_name, client_email, client_phone, address, date, time_slot, surface_area, notes } = req.body;
  if (!service || !client_name || !client_email || !client_phone || !address || !date || !time_slot)
    return res.status(400).json({ error: 'Champs obligatoires manquants' });

  const order = db.insertOrder({ service, client_name, client_email, client_phone, address, date, time_slot, surface_area: surface_area || null, notes: notes || null });
  io.emit('new_order', order);
  sendOrderEmails(order).catch((e) => console.error('Erreur email commande:', e));
  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
  const order = db.updateStatus(parseInt(req.params.id), status);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  io.emit('order_updated', order);
  res.json(order);
});

app.delete('/api/orders/:id', adminAuth, (req, res) => {
  db.deleteOrder(parseInt(req.params.id));
  io.emit('order_deleted', { id: parseInt(req.params.id) });
  res.json({ success: true });
});

// Quotes admin
app.get('/api/quotes', adminAuth, (_req, res) => res.json(db.getAllQuotes()));

app.post('/api/quotes', adminAuth, async (req, res) => {
  const { type, clientEmail, clientName, clientPhone, items, taxRate, notes, validUntil, orderId } = req.body;
  if (!type || !clientEmail || !clientName || !items?.length)
    return res.status(400).json({ error: 'Données manquantes' });

  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const taxAmount = subtotal * (Number(taxRate) || 0) / 100;
  const total = subtotal + taxAmount;

  const quote = db.createQuote({ type, clientEmail, clientName, clientPhone: clientPhone || '', items, taxRate: Number(taxRate) || 0, subtotal, taxAmount, total, notes: notes || '', validUntil: validUntil || null, orderId: orderId || null });

  io.emit('new_quote', quote);
  sendQuoteEmail(quote).catch((e) => console.error('Email devis:', e));
  res.status(201).json(quote);
});

app.patch('/api/quotes/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  const quote = db.updateQuoteStatus(parseInt(req.params.id), status);
  if (!quote) return res.status(404).json({ error: 'Document introuvable' });
  res.json(quote);
});

app.delete('/api/quotes/:id', adminAuth, (req, res) => {
  db.deleteQuote(parseInt(req.params.id));
  res.json({ success: true });
});

// ─── Servir le frontend buildé (production) ──────────────────────────────────
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));
  console.log('📁  Frontend servi depuis', FRONTEND_DIST);
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('👤  Admin connecté:', socket.id);
  socket.on('disconnect', () => console.log('👤  Admin déconnecté:', socket.id));
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  await setupMailer();
  console.log(`\n🚀  Serveur LumiNett démarré — http://localhost:${PORT}`);
  console.log(`   Tableau de bord admin → http://localhost:${PORT}/admin\n`);
});
