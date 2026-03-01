import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Calendar, Clock, MapPin, FileText,
  LogOut, UserCircle, ChevronRight, Eye, EyeOff, CheckCircle, X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Captcha from '../components/Captcha';
import { STATUS_CONFIG, QUOTE_STATUS_CONFIG, SERVICES, type Order, type Quote, type ClientUser } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getToken() { return localStorage.getItem('client_token') || ''; }
function clientFetch(url: string, opts?: RequestInit) {
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
}

function printQuote(quote: Quote) {
  const win = window.open('', '_blank');
  if (!win) return;
  const typeLabel = quote.type === 'facture' ? 'FACTURE' : 'DEVIS';
  const rows = quote.items.map((i) => `<tr><td>${i.description}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">${Number(i.unitPrice).toFixed(2)} €</td><td style="text-align:right">${(i.quantity * i.unitPrice).toFixed(2)} €</td></tr>`).join('');
  win.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${typeLabel} ${quote.reference}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:40px;background:white}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0}.logo{font-size:22px;font-weight:700;color:#1d4ed8}.doc-type{text-align:right}.doc-type h1{font-size:26px;font-weight:700}.doc-type p{color:#64748b;font-size:13px;margin-top:4px}.parties{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px}.party h3{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:8px}.party p{font-size:14px;color:#334155;line-height:1.7}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#1d4ed8;color:white;padding:10px 14px;text-align:left;font-size:13px}th:not(:first-child){text-align:right}td{padding:10px 14px;font-size:13px;border-bottom:1px solid #e2e8f0}td:not(:first-child){text-align:right}tr:nth-child(even) td{background:#f8fafc}.totals{margin-left:auto;width:260px}.totals td,.totals th{background:none!important;border:none;padding:6px 14px;font-size:14px}.total-final{font-size:17px;font-weight:700;color:#1d4ed8}.signed{margin-top:24px;background:#f0fdf4;border:1px solid #86efac;padding:14px;border-radius:8px;font-size:13px}.footer{margin-top:48px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px}@media print{body{padding:20px}}</style></head><body>
<div class="header"><div class="logo">🧹 LumiNett</div><div class="doc-type"><h1>${typeLabel}</h1><p>Réf : ${quote.reference}</p><p>Date : ${quote.createdAt}</p>${quote.validUntil ? `<p>Valide jusqu'au : ${quote.validUntil}</p>` : ''}</div></div>
<div class="parties"><div class="party"><h3>Prestataire</h3><p><strong>LumiNett</strong><br>Service professionnel de nettoyage<br>Tél : 06 10 85 49 18<br>contact@luminett.fr</p></div><div class="party"><h3>Client</h3><p><strong>${quote.clientName}</strong><br>${quote.clientEmail}</p></div></div>
<table><thead><tr><th>Description</th><th style="text-align:right">Qté</th><th style="text-align:right">Prix HT</th><th style="text-align:right">Total HT</th></tr></thead><tbody>${rows}</tbody></table>
<table class="totals"><tr><th>Sous-total HT</th><td>${Number(quote.subtotal).toFixed(2)} €</td></tr><tr><th>TVA (${quote.taxRate}%)</th><td>${Number(quote.taxAmount).toFixed(2)} €</td></tr><tr class="total-final"><th>Total TTC</th><td>${Number(quote.total).toFixed(2)} €</td></tr></table>
${quote.signedAt ? `<div class="signed">✅ <strong>Signé électroniquement</strong> le ${quote.signedAt} — ${quote.clientName} (${quote.clientEmail})</div>` : ''}
<div class="footer">LumiNett — contact@luminett.fr — 06 10 85 49 18 — Document généré le ${new Date().toLocaleDateString('fr-FR')}</div>
<script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

// ── Sign Modal ────────────────────────────────────────────────────────────────
function SignModal({ quote, onSigned, onClose }: { quote: Quote; onSigned: () => void; onClose: () => void }) {
  const [cgvChecked, setCgvChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSign() {
    if (!cgvChecked) { setError("Veuillez accepter les CGV pour signer."); return; }
    setLoading(true); setError('');
    try {
      const res = await clientFetch(`/api/client/quotes/${quote.id}/sign`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSigned();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la signature');
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 text-lg">Signer le document</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        {/* Récap du document */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-slate-800">{quote.reference}</p>
              <p className="text-slate-500 text-sm">{quote.type === 'devis' ? 'Devis' : 'Facture'} — {quote.createdAt}</p>
            </div>
            <p className="font-bold text-blue-600 text-lg">{Number(quote.total).toFixed(2)} €</p>
          </div>
          <div className="space-y-1">
            {quote.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-slate-600">
                <span>{item.description} × {item.quantity}</span>
                <span>{(item.quantity * item.unitPrice).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          {quote.notes && <p className="text-slate-500 text-xs mt-3 pt-3 border-t border-slate-200">Notes : {quote.notes}</p>}
        </div>

        {/* CGV checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-5 p-4 rounded-xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all">
          <input type="checkbox" checked={cgvChecked} onChange={(e) => setCgvChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
          <span className="text-sm text-slate-600 leading-relaxed">
            J'ai lu et j'accepte les{' '}
            <Link to="/cgv" target="_blank" className="text-blue-600 hover:underline font-medium">Conditions Générales de Vente</Link>
            {' '}de LumiNett. Je reconnais que cette signature électronique a valeur contractuelle.
          </span>
        </label>

        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4">❌ {error}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-colors">Annuler</button>
          <button onClick={handleSign} disabled={loading || !cgvChecked} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
            <CheckCircle size={16} />{loading ? 'Signature...' : 'Signer électroniquement'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Forms ────────────────────────────────────────────────────────────────
function AuthForms({ onLogin }: { onLogin: (user: ClientUser, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaOk) { setError('Veuillez répondre au captcha'); return; }
    setLoading(true); setError('');
    const url = mode === 'login' ? '/api/client/login' : '/api/client/register';
    const body = mode === 'login' ? { email, password } : { name, email, phone, password };
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      localStorage.setItem('client_token', data.token);
      onLogin(data.client, data.token);
    } catch (err: any) {
      setError(err.message); setCaptchaReset((n) => n + 1);
    } finally { setLoading(false); }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      {/* Toggle login / register */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-5">
        {(['login', 'register'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setError(''); setCaptchaReset((n) => n + 1); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
            {m === 'login' ? '🔑 Se connecter' : '✨ Créer un compte'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Jean Dupont" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="06 XX XX XX XX" />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="votre@email.com" required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe *{mode === 'register' && <span className="font-normal text-slate-400 ml-1">(6 caractères min.)</span>}</label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10" placeholder="••••••••" required minLength={6} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Captcha onVerified={setCaptchaOk} reset={captchaReset} />
        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">❌ {error}</p>}
        <button type="submit" disabled={loading || !captchaOk}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>

      <div className="mt-5 p-4 bg-blue-50 rounded-xl">
        <p className="text-blue-800 text-sm font-semibold mb-1">💡 À savoir</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          {mode === 'login'
            ? 'Utilisez l\'email de votre commande. Vos devis, factures et commandes sont dans votre espace.'
            : 'Créez un compte avec l\'email de vos commandes pour retrouver tout votre historique.'}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientSpacePage() {
  const [client, setClient] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'documents'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [signQuote, setSignQuote] = useState<Quote | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Vérifier token au chargement
  useEffect(() => {
    const token = localStorage.getItem('client_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now() && payload.type === 'client') {
          setClient({ id: payload.id, name: payload.name, email: payload.email });
        } else {
          localStorage.removeItem('client_token');
        }
      } catch { localStorage.removeItem('client_token'); }
    }
    setLoading(false);
  }, []);

  // Charger les données client
  useEffect(() => {
    if (!client || dataLoaded) return;
    async function load() {
      const [ordersRes, quotesRes] = await Promise.all([
        clientFetch('/api/client/orders'),
        clientFetch('/api/client/quotes'),
      ]);
      if (ordersRes.status === 401) { handleLogout(); return; }
      const [ordersData, quotesData] = await Promise.all([ordersRes.json(), quotesRes.json()]);
      setOrders(ordersData);
      setQuotes(quotesData);
      setDataLoaded(true);
    }
    load();
  }, [client, dataLoaded]);

  function handleLogin(user: ClientUser, _token: string) {
    setClient(user);
    setDataLoaded(false);
  }

  function handleLogout() {
    localStorage.removeItem('client_token');
    setClient(null);
    setOrders([]); setQuotes([]); setDataLoaded(false);
  }

  function handleSigned() {
    setSignQuote(null);
    setDataLoaded(false); // Recharge les documents
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50"><Navbar />
        <div className="pt-32 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      {signQuote && <SignModal quote={signQuote} onSigned={handleSigned} onClose={() => setSignQuote(null)} />}

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-medium mb-5 transition-colors">
            <ArrowLeft size={15} /> Retour à l'accueil
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🧹</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Mon espace client</h1>
                {client && <p className="text-slate-500 text-sm">Bonjour, <span className="font-medium text-slate-700">{client.name}</span></p>}
              </div>
            </div>
            {client && (
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-medium transition-colors">
                <LogOut size={15} /> Déconnexion
              </button>
            )}
          </div>
        </div>

        {/* Non connecté */}
        {!client && <AuthForms onLogin={handleLogin} />}

        {/* Connecté */}
        {client && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
              <button onClick={() => setTab('orders')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Package size={15} /> Mes commandes
                {orders.length > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'orders' ? 'bg-white/25' : 'bg-slate-100'}`}>{orders.length}</span>}
              </button>
              <button onClick={() => setTab('documents')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'documents' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                <FileText size={15} /> Mes documents
                {quotes.filter((q) => q.status === 'sent').length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500 text-white">{quotes.filter((q) => q.status === 'sent').length}</span>
                )}
              </button>
            </div>

            {/* Orders tab */}
            {tab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="font-bold text-slate-800 mb-2">Aucune commande</h3>
                    <p className="text-slate-500 text-sm mb-6">Vous n'avez pas encore passé de commande avec cette adresse email.</p>
                    <Link to="/commander" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                      Commander une prestation <ChevronRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const service = SERVICES.find((s) => s.id === order.service);
                      const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                      const steps = ['pending', 'confirmed', 'in_progress', 'completed'];
                      const stepLabels = ['Reçue', 'Confirmée', 'En cours', 'Terminée'];
                      const currentIdx = steps.indexOf(order.status);
                      return (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                          <div className={`h-1.5 w-full ${order.status === 'completed' ? 'bg-emerald-400' : order.status === 'in_progress' ? 'bg-blue-500' : order.status === 'confirmed' ? 'bg-sky-400' : order.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'}`} />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">{service?.icon ?? '🧹'}</div>
                                <div>
                                  <h3 className="font-bold text-slate-800 text-sm">{service?.label ?? order.service}</h3>
                                  <p className="text-slate-400 text-xs mt-0.5">Commande #{order.id}</p>
                                </div>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${status?.color ?? 'bg-slate-100 text-slate-600'}`}>
                                {status?.label ?? order.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2"><Calendar size={13} className="text-blue-500 shrink-0" /><span>{formatDateFR(order.date)}</span></div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2"><Clock size={13} className="text-blue-500 shrink-0" /><span>{order.time_slot}</span></div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 sm:col-span-2"><MapPin size={13} className="text-blue-500 shrink-0" /><span className="truncate">{order.address}</span></div>
                            </div>
                            {order.status !== 'cancelled' && (
                              <div className="flex items-center gap-1">
                                {steps.map((_, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div className={`w-full h-1.5 rounded-full ${i <= currentIdx ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                    <span className={`text-[10px] font-medium ${i <= currentIdx ? 'text-blue-600' : 'text-slate-400'}`}>{stepLabels[i]}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {order.status === 'cancelled' && <p className="text-xs text-red-500 font-medium mt-2 text-center">Prestation annulée</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Documents tab */}
            {tab === 'documents' && (
              <div>
                {quotes.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <h3 className="font-bold text-slate-800 mb-2">Aucun document</h3>
                    <p className="text-slate-500 text-sm">Vos devis et factures apparaîtront ici dès que LumiNett vous en enverra.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => {
                      const statusCfg = QUOTE_STATUS_CONFIG[quote.status] ?? QUOTE_STATUS_CONFIG.sent;
                      const isPending = quote.status === 'sent' || quote.status === 'viewed';
                      return (
                        <div key={quote.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                          {isPending && <div className="h-1 w-full bg-amber-400" />}
                          {quote.status === 'signed' && <div className="h-1 w-full bg-emerald-400" />}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-lg">{quote.type === 'facture' ? '🧾' : '📋'}</span>
                                  <span className="font-bold text-slate-800">{quote.reference}</span>
                                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                                </div>
                                <p className="text-slate-400 text-xs">{quote.type === 'facture' ? 'Facture' : 'Devis'} · {quote.createdAt}</p>
                              </div>
                              <p className="font-bold text-blue-600 text-lg shrink-0">{Number(quote.total).toFixed(2)} €</p>
                            </div>

                            {/* Items preview */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1">
                              {quote.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs text-slate-600">
                                  <span>{item.description} × {item.quantity}</span>
                                  <span className="font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200">
                                <span>Total TTC</span><span>{Number(quote.total).toFixed(2)} €</span>
                              </div>
                            </div>

                            {quote.signedAt && (
                              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2 text-xs font-medium mb-4">
                                <CheckCircle size={13} /> Signé électroniquement le {quote.signedAt}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button onClick={() => printQuote(quote)}
                                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 py-2.5 rounded-xl transition-all">
                                <FileText size={14} /> Télécharger PDF
                              </button>
                              {isPending && quote.type === 'devis' && (
                                <button onClick={() => setSignQuote(quote)}
                                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-all">
                                  <CheckCircle size={14} /> Signer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Footer CTA */}
            <div className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:0610854918" className="inline-flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
                  📞 06 10 85 49 18
                </a>
                <Link to="/commander" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                  <Package size={15} /> Nouvelle commande
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
