require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const httpServer = createServer(app);
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

// ─── Mailer ───────────────────────────────────────────────────────────────────
let resendClient = null;
let transporter = null; // fallback Nodemailer (mode test local)

async function setupMailer() {
  const { RESEND_API_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE } = process.env;

  if (RESEND_API_KEY) {
    // ✅ Priorité 1 : Resend (HTTP — fonctionne sur Railway)
    resendClient = new Resend(RESEND_API_KEY);
    console.log('📧  Resend configuré (envoi HTTP)');
  } else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // Priorité 2 : SMTP classique
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    console.log('📧  SMTP configuré avec', SMTP_HOST);
  } else {
    // Priorité 3 : Ethereal (test local uniquement)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧  Mode test email activé — compte:', testAccount.user);
    console.log("   (Les aperçus d'email seront affichés dans ce terminal)");
  }
}

async function sendEmails(order) {
  const serviceLabel = SERVICE_LABELS[order.service] || order.service;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pronett.fr';
  const siteUrl = process.env.SITE_URL || 'http://localhost:5173';

  const tr = (label, value, bg) =>
    `<tr style="background:${bg}"><td style="padding:10px 14px;color:#64748b;font-weight:600;white-space:nowrap">${label}</td><td style="padding:10px 14px">${value}</td></tr>`;

  const orderTable = `
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${tr('Service', serviceLabel, '#fff')}
      ${tr('Client', order.client_name, '#f8fafc')}
      ${tr('Email', `<a href="mailto:${order.client_email}">${order.client_email}</a>`, '#fff')}
      ${tr('Téléphone', `<a href="tel:${order.client_phone}">${order.client_phone}</a>`, '#f8fafc')}
      ${tr('Adresse', order.address, '#fff')}
      ${tr('Date', order.date, '#f8fafc')}
      ${tr('Créneau', order.time_slot, '#fff')}
      ${order.surface_area ? tr('Surface', order.surface_area, '#f8fafc') : ''}
      ${order.notes ? tr('Notes', order.notes, '#fff') : ''}
    </table>`;

  const wrap = (content) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9">
      <div style="background:linear-gradient(135deg,#1d4ed8,#0ea5e9);padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
        <div style="font-size:32px">🧹</div>
        <h1 style="margin:8px 0 4px;color:#fff;font-size:24px">ProNett</h1>
        <p style="margin:0;color:#bfdbfe;font-size:14px">Service professionnel de nettoyage</p>
      </div>
      <div style="background:#fff;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        ${content}
      </div>
    </div>`;

  const adminHtml = wrap(`
    <h2 style="color:#1d4ed8;margin-top:0">Commande #${order.id}</h2>
    <p style="color:#475569">Une nouvelle demande vient d'être soumise.</p>
    ${orderTable}
    <div style="margin-top:24px;text-align:center">
      <a href="${siteUrl}/admin" style="background:#1d4ed8;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
        Voir le tableau de bord →
      </a>
    </div>`);

  const clientHtml = wrap(`
    <p>Bonjour <strong>${order.client_name}</strong>,</p>
    <p style="color:#475569">Nous avons bien reçu votre demande de <strong>${serviceLabel}</strong>. Notre équipe vous contactera rapidement.</p>
    <div style="background:#eff6ff;border-left:4px solid #1d4ed8;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0">
      <p style="margin:0 0 8px;color:#1e40af;font-weight:700">Récapitulatif</p>
      <p style="margin:4px 0;color:#334155">📅 Date : <strong>${order.date}</strong></p>
      <p style="margin:4px 0;color:#334155">🕐 Créneau : <strong>${order.time_slot}</strong></p>
      <p style="margin:4px 0;color:#334155">📍 Adresse : <strong>${order.address}</strong></p>
    </div>
    <p style="color:#475569">Cordialement,<br><strong>L'équipe ProNett</strong></p>`);

  if (resendClient) {
    // ─── Resend (production Railway) ──────────────────────────────
    const fromAddr = 'ProNett <onboarding@resend.dev>';

    const [adminRes, clientRes] = await Promise.all([
      resendClient.emails.send({
        from: fromAddr,
        to: adminEmail,
        subject: `🔔 Nouvelle commande #${order.id} — ${serviceLabel}`,
        html: adminHtml,
      }),
      resendClient.emails.send({
        from: fromAddr,
        to: order.client_email,
        subject: `✅ Demande reçue — ProNett #${order.id}`,
        html: clientHtml,
      }),
    ]);

    console.log('📧  Email admin envoyé (Resend):', adminRes?.data?.id || adminRes?.error);
    console.log('📧  Email client envoyé (Resend):', clientRes?.data?.id || clientRes?.error);
  } else if (transporter) {
    // ─── Nodemailer fallback (SMTP ou Ethereal local) ─────────────
    const adminInfo = await transporter.sendMail({
      from: '"ProNett App" <noreply@pronett.fr>',
      to: adminEmail,
      subject: `🔔 Nouvelle commande #${order.id} — ${serviceLabel}`,
      html: adminHtml,
    });
    const adminPreview = nodemailer.getTestMessageUrl(adminInfo);
    if (adminPreview) console.log('\n📧  Email admin →', adminPreview);

    const clientInfo = await transporter.sendMail({
      from: '"ProNett" <noreply@pronett.fr>',
      to: order.client_email,
      subject: `✅ Demande reçue — ProNett #${order.id}`,
      html: clientHtml,
    });
    const clientPreview = nodemailer.getTestMessageUrl(clientInfo);
    if (clientPreview) console.log('📧  Email client →', clientPreview, '\n');
  } else {
    console.warn('⚠️  Aucun mailer configuré — emails non envoyés');
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === (process.env.ADMIN_PASSWORD || 'Admin2024!')) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

app.get('/api/stats', (_req, res) => {
  res.json(db.getStats());
});

app.get('/api/orders', (_req, res) => {
  res.json(db.getAllOrders());
});

app.post('/api/orders', async (req, res) => {
  const { service, client_name, client_email, client_phone, address, date, time_slot, surface_area, notes } = req.body;

  if (!service || !client_name || !client_email || !client_phone || !address || !date || !time_slot) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const order = db.insertOrder({ service, client_name, client_email, client_phone, address, date, time_slot, surface_area: surface_area || null, notes: notes || null });

  io.emit('new_order', order);
  sendEmails(order).catch((err) => console.error('Erreur email:', err));

  res.status(201).json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }
  const order = db.updateStatus(parseInt(req.params.id), status);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  io.emit('order_updated', order);
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  db.deleteOrder(parseInt(req.params.id));
  io.emit('order_deleted', { id: parseInt(req.params.id) });
  res.json({ success: true });
});

// ─── Servir le frontend buildé (production) ──────────────────────────────────
const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
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
  console.log(`\n🚀  Serveur ProNett démarré — http://localhost:${PORT}`);
  console.log(`   Tableau de bord admin → http://localhost:${PORT}/admin\n`);
});
