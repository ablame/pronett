import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Bell, LogOut, RefreshCw, Trash2, Search, Filter,
  Phone, Mail, MapPin, Calendar, Clock, Maximize2, X,
  FileText, Plus, Send, CheckCircle, Eye, ChevronDown,
} from 'lucide-react';
import { SERVICES, STATUS_CONFIG, QUOTE_STATUS_CONFIG, type Order, type Stats, type Quote, type QuoteItem } from '../types';
import Captcha from '../components/Captcha';

// ── Audio ─────────────────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

function showBrowserNotif(order: Order) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const service = SERVICES.find((s) => s.id === order.service);
  new Notification('🔔 Nouvelle commande LumiNett', {
    body: `${service?.icon ?? ''} ${service?.label ?? order.service} — ${order.client_name}`,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'À l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

// Token helper
function getToken() { return sessionStorage.getItem('admin_token') || ''; }
function apiFetch(url: string, opts?: RequestInit) {
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

// Print document
function printDocument(quote: Quote) {
  const win = window.open('', '_blank');
  if (!win) return;
  const typeLabel = quote.type === 'facture' ? 'FACTURE' : 'DEVIS';
  const rows = quote.items.map((i) => `<tr><td>${i.description}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${Number(i.unitPrice).toFixed(2)} €</td><td style="text-align:right">${(i.quantity * i.unitPrice).toFixed(2)} €</td></tr>`).join('');
  win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${typeLabel} ${quote.reference}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:40px;background:white}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0}.logo{font-size:22px;font-weight:700;color:#1d4ed8}.doc-type{text-align:right}.doc-type h1{font-size:26px;font-weight:700}.doc-type p{color:#64748b;font-size:13px;margin-top:4px}.parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px}.party h3{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:8px}.party p{font-size:14px;color:#334155;line-height:1.7}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#1d4ed8;color:white;padding:10px 14px;text-align:left;font-size:13px}th:not(:first-child){text-align:right}td{padding:10px 14px;font-size:13px;border-bottom:1px solid #e2e8f0}td:not(:first-child){text-align:right}tr:nth-child(even) td{background:#f8fafc}.totals{margin-left:auto;width:260px}.totals td,.totals th{background:none!important;border:none;padding:6px 14px;font-size:14px}.total-final{font-size:17px;font-weight:700;color:#1d4ed8}.notes{margin-top:24px;background:#f8fafc;padding:14px;border-radius:8px;font-size:13px}.signed{margin-top:24px;background:#f0fdf4;border:1px solid #86efac;padding:14px;border-radius:8px;font-size:13px}.footer{margin-top:48px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px}@media print{body{padding:20px}}</style></head><body>
<div class="header"><div class="logo">🧹 LumiNett</div><div class="doc-type"><h1>${typeLabel}</h1><p>Réf : ${quote.reference}</p><p>Date : ${quote.createdAt}</p>${quote.validUntil ? `<p>Valide jusqu'au : ${quote.validUntil}</p>` : ''}</div></div>
<div class="parties"><div class="party"><h3>Prestataire</h3><p><strong>LumiNett</strong><br>Service professionnel de nettoyage<br>Tél : 06 10 85 49 18<br>contact@luminett.fr</p></div><div class="party"><h3>Client</h3><p><strong>${quote.clientName}</strong><br>${quote.clientEmail}${quote.clientPhone ? `<br>${quote.clientPhone}` : ''}</p></div></div>
<table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix HT</th><th style="text-align:right">Total HT</th></tr></thead><tbody>${rows}</tbody></table>
<table class="totals"><tr><th>Sous-total HT</th><td>${Number(quote.subtotal).toFixed(2)} €</td></tr><tr><th>TVA (${quote.taxRate}%)</th><td>${Number(quote.taxAmount).toFixed(2)} €</td></tr><tr class="total-final"><th>Total TTC</th><td>${Number(quote.total).toFixed(2)} €</td></tr></table>
${quote.notes ? `<div class="notes"><strong>Notes :</strong> ${quote.notes}</div>` : ''}
${quote.signedAt ? `<div class="signed">✅ <strong>Signé électroniquement</strong> le ${quote.signedAt} — ${quote.clientName} (${quote.clientEmail})</div>` : ''}
<div class="footer">LumiNett — contact@luminett.fr — 06 10 85 49 18 — Document généré le ${new Date().toLocaleDateString('fr-FR')}</div>
<script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

const STATUSES = [
  { key: 'all', label: 'Toutes' }, { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' }, { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminées' }, { key: 'cancelled', label: 'Annulées' },
] as const;

const NEXT_STATUS: Record<string, { label: string; value: string; color: string }[]> = {
  pending:     [{ label: '✅ Confirmer', value: 'confirmed', color: 'bg-blue-500 text-white' }, { label: '❌ Annuler', value: 'cancelled', color: 'bg-red-100 text-red-600' }],
  confirmed:   [{ label: '🔄 Démarrer', value: 'in_progress', color: 'bg-purple-500 text-white' }, { label: '❌ Annuler', value: 'cancelled', color: 'bg-red-100 text-red-600' }],
  in_progress: [{ label: '✔️ Terminer', value: 'completed', color: 'bg-emerald-500 text-white' }],
  completed:   [],
  cancelled:   [{ label: '🔄 Rouvrir', value: 'pending', color: 'bg-amber-100 text-amber-700' }],
};

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaOk) { setError('Veuillez répondre au captcha'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects');
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setCaptchaReset((n) => n + 1);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-sky-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧹</div>
          <h1 className="text-2xl font-bold text-slate-800">LumiNett Pro</h1>
          <p className="text-slate-500 text-sm mt-1">Espace administrateur</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@luminett.fr" className="input-field" autoFocus required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="input-field" required />
          </div>
          <Captcha onVerified={setCaptchaOk} reset={captchaReset} />
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">❌ {error}</p>}
          <button type="submit" disabled={loading || !email || !password || !captchaOk} className="btn-primary w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">Accès réservé à l'administrateur</p>
      </div>
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange, onDelete, isNew }: {
  order: Order; onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void; isNew: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const service = SERVICES.find((s) => s.id === order.service);
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const actions = NEXT_STATUS[order.status] ?? [];

  return (
    <div className={`card p-5 transition-all duration-500 ${isNew ? 'ring-2 ring-blue-400 shadow-blue-100 shadow-lg animate-slide-up' : 'hover:shadow-md'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{service?.icon ?? '🧹'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">{order.client_name}</span>
              <span className="text-slate-400 text-xs">#{order.id}</span>
              {isNew && <span className="badge bg-blue-500 text-white text-xs animate-pulse">NOUVEAU</span>}
            </div>
            <p className="text-sm text-slate-500 truncate">{service?.label ?? order.service}</p>
          </div>
        </div>
        <span className={`badge ${statusCfg.color} shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />{statusCfg.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1.5 text-slate-600"><Calendar size={13} className="text-blue-400 shrink-0" /><span className="truncate">{formatDateFR(order.date)}</span></div>
        <div className="flex items-center gap-1.5 text-slate-600"><Clock size={13} className="text-blue-400 shrink-0" /><span className="truncate">{order.time_slot}</span></div>
        <div className="flex items-center gap-1.5 text-slate-600 col-span-2"><MapPin size={13} className="text-blue-400 shrink-0" /><span className="truncate">{order.address}</span></div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm mb-4">
        <a href={`tel:${order.client_phone}`} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"><Phone size={13} />{order.client_phone}</a>
        <a href={`mailto:${order.client_email}`} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"><Mail size={13} />{order.client_email}</a>
      </div>
      {expanded && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1.5 mb-3 animate-fade-in">
          {order.surface_area && <p className="text-slate-600"><span className="font-semibold">Surface :</span> {order.surface_area}</p>}
          {order.notes && <p className="text-slate-600"><span className="font-semibold">Notes :</span> {order.notes}</p>}
          <p className="text-slate-400 text-xs">Reçu {timeAgo(order.created_at)}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button key={a.value} onClick={() => onStatusChange(order.id, a.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 ${a.color}`}>{a.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Détails">
            {expanded ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => onDelete(order.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quote Form ────────────────────────────────────────────────────────────────
function QuoteForm({ orders, onCreated, onCancel }: {
  orders: Order[]; onCreated: () => void; onCancel: () => void;
}) {
  const [type, setType] = useState<'devis' | 'facture'>('devis');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [taxRate, setTaxRate] = useState(20);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill from existing order
  function selectOrder(orderId: string) {
    const o = orders.find((o) => String(o.id) === orderId);
    if (!o) return;
    setClientEmail(o.client_email);
    setClientName(o.client_name);
    setClientPhone(o.client_phone);
    const svc = SERVICES.find((s) => s.id === o.service);
    setItems([{ description: svc?.label ?? o.service, quantity: 1, unitPrice: 0 }]);
  }

  function addItem() { setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]); }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof QuoteItem, value: string | number) {
    setItems(items.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const taxAmount = subtotal * taxRate / 100;
  const total = subtotal + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientEmail || !clientName || items.some((i) => !i.description)) {
      setError('Remplissez tous les champs obligatoires'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({ type, clientEmail, clientName, clientPhone, items, taxRate, notes, validUntil: validUntil || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally { setLoading(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-800 text-lg">Nouveau document</h3>
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type + pré-rempli */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              {(['devis', 'facture'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${type === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  {t === 'devis' ? '📋 Devis' : '🧾 Facture'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pré-remplir depuis commande</label>
            <select onChange={(e) => selectOrder(e.target.value)} className="input-field" defaultValue="">
              <option value="">Choisir une commande...</option>
              {orders.map((o) => <option key={o.id} value={o.id}>#{o.id} — {o.client_name}</option>)}
            </select>
          </div>
        </div>

        {/* Client */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email client *</label>
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom client *</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="input-field" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
            <input type="text" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="input-field" placeholder="06 XX XX XX XX" />
          </div>
          {type === 'devis' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valide jusqu'au</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="input-field" />
            </div>
          )}
        </div>

        {/* Articles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Articles *</label>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
              <Plus size={13} /> Ajouter une ligne
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qté</div>
              <div className="col-span-3 text-right">Prix HT (€)</div>
              <div className="col-span-1" />
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                  className="col-span-6 input-field text-sm py-2" placeholder="Description de la prestation" required />
                <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 1)}
                  className="col-span-2 input-field text-sm py-2 text-right" />
                <input type="number" min="0" step="0.01" value={item.unitPrice || ''} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="col-span-3 input-field text-sm py-2 text-right" placeholder="0.00" />
                <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                  className="col-span-1 p-2 text-slate-300 hover:text-red-500 disabled:opacity-20 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* TVA + Total */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field text-sm" rows={2} placeholder="Instructions, conditions particulières..." />
          </div>
          <div className="w-52 space-y-1 bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Sous-total HT</span><span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="shrink-0">TVA</span>
              <select value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <option value={0}>0%</option><option value={10}>10%</option><option value={20}>20%</option>
              </select>
              <span>{taxAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
              <span>Total TTC</span><span className="text-blue-600">{total.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">❌ {error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors">Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Send size={15} />{loading ? 'Envoi...' : 'Créer et envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Quote Card ────────────────────────────────────────────────────────────────
function QuoteCard({ quote, onDelete, onStatusChange }: {
  quote: Quote; onDelete: (id: number) => void; onStatusChange: (id: number, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = QUOTE_STATUS_CONFIG[quote.status] ?? QUOTE_STATUS_CONFIG.sent;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">{quote.reference}</span>
            <span className={`badge ${statusCfg.color}`}>{statusCfg.label}</span>
            <span className="text-xs text-slate-400">{quote.type === 'facture' ? '🧾 Facture' : '📋 Devis'}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{quote.clientName} — {quote.clientEmail}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-slate-800">{Number(quote.total).toFixed(2)} €</p>
          <p className="text-xs text-slate-400 mt-0.5">TTC</p>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1 mb-3 animate-fade-in">
          <p className="text-slate-500 text-xs">Créé le {quote.createdAt}</p>
          {quote.validUntil && <p className="text-slate-600">Valide jusqu'au : {quote.validUntil}</p>}
          {quote.signedAt && <p className="text-emerald-600 font-medium">✅ Signé le {quote.signedAt}</p>}
          {quote.notes && <p className="text-slate-600">Notes : {quote.notes}</p>}
          <div className="pt-2 space-y-1">
            {quote.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-600">{item.description} × {item.quantity}</span>
                <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
        <div className="flex gap-2">
          {quote.status === 'signed' && (
            <button onClick={() => onStatusChange(quote.id, 'paid')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
              💳 Marquer payé
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => printDocument(quote)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Imprimer/PDF">
            <FileText size={14} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Détails">
            {expanded ? <X size={14} /> : <Eye size={14} />}
          </button>
          <button onClick={() => onDelete(quote.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('admin_token'));
  const [tab, setTab] = useState<'orders' | 'quotes'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, today: 0, completed: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifBadge, setNotifBadge] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg); setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    const [ordersRes, statsRes] = await Promise.all([apiFetch('/api/orders'), apiFetch('/api/stats')]);
    if (ordersRes.status === 401) { sessionStorage.removeItem('admin_token'); setAuthed(false); return; }
    const [ordersData, statsData] = await Promise.all([ordersRes.json(), statsRes.json()]);
    setOrders(ordersData); setStats(statsData);
  }, []);

  const fetchQuotes = useCallback(async () => {
    const res = await apiFetch('/api/quotes');
    if (res.ok) setQuotes(await res.json());
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchData(); fetchQuotes();
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    const s = io('/', { path: '/socket.io' });
    setSocket(s);
    s.on('new_order', (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      setStats((prev) => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1, today: prev.today + 1 }));
      setNewIds((prev) => new Set(prev).add(order.id));
      setNotifBadge((n) => n + 1);
      playBeep(); showBrowserNotif(order);
      showToast(`🔔 Nouvelle commande #${order.id} — ${order.client_name}`);
      setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(order.id); return s; }), 5000);
    });
    s.on('order_updated', (updated: Order) => { setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o)); fetchData(); });
    s.on('order_deleted', ({ id }: { id: number }) => { setOrders((prev) => prev.filter((o) => o.id !== id)); fetchData(); });
    s.on('new_quote', () => fetchQuotes());
    return () => { s.disconnect(); };
  }, [authed, fetchData, fetchQuotes, showToast]);

  const handleStatusChange = async (id: number, status: string) => {
    await apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette commande ?')) return;
    await apiFetch(`/api/orders/${id}`, { method: 'DELETE' });
  };
  const handleQuoteDelete = async (id: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    await apiFetch(`/api/quotes/${id}`, { method: 'DELETE' });
    fetchQuotes();
  };
  const handleQuoteStatus = async (id: number, status: string) => {
    await apiFetch(`/api/quotes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    fetchQuotes();
  };
  const handleLogout = () => { sessionStorage.removeItem('admin_token'); setAuthed(false); };

  if (!authed) return <LoginScreen onLogin={(token) => { sessionStorage.setItem('admin_token', token); setAuthed(true); }} />;

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [o.client_name, o.client_email, o.client_phone, o.address, o.service].some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-blue-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-up max-w-sm">{toastMsg}</div>
      )}

      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧹</span>
            <div>
              <h1 className="font-bold text-lg leading-none">LumiNett</h1>
              <p className="text-blue-200 text-xs">Tableau de bord</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { fetchData(); fetchQuotes(); setNotifBadge(0); }}
              className="relative p-2 hover:bg-white/15 rounded-xl transition-colors" title="Actualiser">
              <Bell size={20} />
              {notifBadge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{notifBadge > 9 ? '9+' : notifBadge}</span>}
            </button>
            <button onClick={fetchData} className="p-2 hover:bg-white/15 rounded-xl transition-colors" title="Rafraîchir"><RefreshCw size={18} /></button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm px-3 py-2 hover:bg-white/15 rounded-xl transition-colors"><LogOut size={16} /> Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'text-slate-600', bg: 'bg-white' },
            { label: 'En attente', value: stats.pending, icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: "Aujourd'hui", value: stats.today, icon: '📅', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Terminées', value: stats.completed, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 border border-slate-100 shadow-sm`}>
              <div className="flex items-center justify-between mb-2"><span className="text-2xl">{icon}</span><span className={`text-3xl font-bold ${color}`}>{value}</span></div>
              <p className="text-slate-500 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
          <button onClick={() => setTab('orders')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            📋 Commandes <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'orders' ? 'bg-white/25' : 'bg-slate-100'}`}>{orders.length}</span>
          </button>
          <button onClick={() => setTab('quotes')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'quotes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            📄 Devis & Factures <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'quotes' ? 'bg-white/25' : 'bg-slate-100'}`}>{quotes.length}</span>
          </button>
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Filter size={14} className="text-slate-400 mr-1" />
                  {STATUSES.map(({ key, label }) => (
                    <button key={key} onClick={() => setFilter(key)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filter === key ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {label}{key !== 'all' && <span className="ml-1 opacity-70">({orders.filter((o) => o.status === key).length})</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">📭</div><p className="font-semibold text-lg">Aucune commande</p><p className="text-sm mt-1">Les nouvelles commandes apparaîtront ici en temps réel.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((order) => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} onDelete={handleDelete} isNew={newIds.has(order.id)} />)}
              </div>
            )}
            {filtered.length > 0 && <p className="text-center text-slate-400 text-sm mt-6">{filtered.length} commande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}</p>}
          </>
        )}

        {/* Quotes Tab */}
        {tab === 'quotes' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-500 text-sm">{quotes.length} document{quotes.length > 1 ? 's' : ''}</p>
              <button onClick={() => setShowQuoteForm(!showQuoteForm)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
                {showQuoteForm ? <X size={15} /> : <Plus size={15} />}{showQuoteForm ? 'Annuler' : 'Nouveau document'}
              </button>
            </div>
            {showQuoteForm && <div className="mb-6"><QuoteForm orders={orders} onCreated={() => { setShowQuoteForm(false); fetchQuotes(); showToast('📄 Document créé et envoyé au client'); }} onCancel={() => setShowQuoteForm(false)} /></div>}
            {quotes.length === 0 && !showQuoteForm ? (
              <div className="text-center py-20 text-slate-400"><div className="text-5xl mb-4">📄</div><p className="font-semibold text-lg">Aucun document</p><p className="text-sm mt-1">Créez votre premier devis ou facture.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {quotes.map((q) => <QuoteCard key={q.id} quote={q} onDelete={handleQuoteDelete} onStatusChange={handleQuoteStatus} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
