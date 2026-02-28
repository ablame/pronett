import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Bell, LogOut, RefreshCw, Trash2, Search, Filter,
  Phone, Mail, MapPin, Calendar, Clock, Maximize2, X
} from 'lucide-react';
import { SERVICES, STATUS_CONFIG, type Order, type Stats } from '../types';

// ── Audio notification ────────────────────────────────────────────────────────

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (_) {}
}

function showBrowserNotif(order: Order) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const service = SERVICES.find((s) => s.id === order.service);
  new Notification('🔔 Nouvelle commande ProNett', {
    body: `${service?.icon ?? ''} ${service?.label ?? order.service} — ${order.client_name}`,
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧹</text></svg>",
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

const STATUSES = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
  { key: 'cancelled', label: 'Annulées' },
] as const;

const NEXT_STATUS: Record<string, { label: string; value: string; color: string }[]> = {
  pending: [
    { label: '✅ Confirmer', value: 'confirmed', color: 'bg-blue-500 text-white' },
    { label: '❌ Annuler', value: 'cancelled', color: 'bg-red-100 text-red-600' },
  ],
  confirmed: [
    { label: '🔄 Démarrer', value: 'in_progress', color: 'bg-purple-500 text-white' },
    { label: '❌ Annuler', value: 'cancelled', color: 'bg-red-100 text-red-600' },
  ],
  in_progress: [
    { label: '✔️ Terminer', value: 'completed', color: 'bg-emerald-500 text-white' },
  ],
  completed: [],
  cancelled: [
    { label: '🔄 Rouvrir', value: 'pending', color: 'bg-amber-100 text-amber-700' },
  ],
};

// ── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Mot de passe incorrect');
      sessionStorage.setItem('admin_auth', '1');
      onLogin();
    } catch {
      setError('Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-sky-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧹</div>
          <h1 className="text-2xl font-bold text-slate-800">ProNett Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Tableau de bord</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">❌ {error}</p>
          )}
          <button type="submit" disabled={loading || !password} className="btn-primary w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">
          Mot de passe par défaut : <code className="bg-slate-100 px-1 rounded">Admin2024!</code>
        </p>
      </div>
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onStatusChange,
  onDelete,
  isNew,
}: {
  order: Order;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  isNew: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const service = SERVICES.find((s) => s.id === order.service);
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const actions = NEXT_STATUS[order.status] ?? [];

  return (
    <div
      className={`card p-5 transition-all duration-500 ${
        isNew ? 'ring-2 ring-blue-400 shadow-blue-100 shadow-lg animate-slide-up' : 'hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{service?.icon ?? '🧹'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">{order.client_name}</span>
              <span className="text-slate-400 text-xs">#{order.id}</span>
              {isNew && (
                <span className="badge bg-blue-500 text-white text-xs animate-pulse">NOUVEAU</span>
              )}
            </div>
            <p className="text-sm text-slate-500 truncate">{service?.label ?? order.service}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`badge ${statusCfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Infos clés */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar size={13} className="text-blue-400 shrink-0" />
          <span className="truncate">{formatDateFR(order.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock size={13} className="text-blue-400 shrink-0" />
          <span className="truncate">{order.time_slot}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
          <MapPin size={13} className="text-blue-400 shrink-0" />
          <span className="truncate">{order.address}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="flex flex-wrap gap-3 text-sm mb-4">
        <a href={`tel:${order.client_phone}`} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
          <Phone size={13} /> {order.client_phone}
        </a>
        <a href={`mailto:${order.client_email}`} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
          <Mail size={13} /> {order.client_email}
        </a>
      </div>

      {/* Expanded info */}
      {expanded && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1.5 mb-3 animate-fade-in">
          {order.surface_area && (
            <p className="text-slate-600"><span className="font-semibold">Surface :</span> {order.surface_area}</p>
          )}
          {order.notes && (
            <p className="text-slate-600"><span className="font-semibold">Notes :</span> {order.notes}</p>
          )}
          <p className="text-slate-400 text-xs">Reçu {timeAgo(order.created_at)}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.value}
              onClick={() => onStatusChange(order.id, action.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 ${action.color}`}
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="Détails"
          >
            {expanded ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, today: 0, completed: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifBadge, setNotifBadge] = useState(0);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    const [ordersRes, statsRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/stats'),
    ]);
    const [ordersData, statsData] = await Promise.all([ordersRes.json(), statsRes.json()]);
    setOrders(ordersData);
    setStats(statsData);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchData();

    // Demander permission notifications browser
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const s = io('/', { path: '/socket.io' });
    setSocket(s);

    s.on('new_order', (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      setStats((prev) => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1, today: prev.today + 1 }));
      setNewIds((prev) => new Set(prev).add(order.id));
      setNotifBadge((n) => n + 1);
      playBeep();
      showBrowserNotif(order);
      showToast(`🔔 Nouvelle commande #${order.id} — ${order.client_name}`);
      setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(order.id); return s; }), 5000);
    });

    s.on('order_updated', (updated: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      fetchData();
    });

    s.on('order_deleted', ({ id }: { id: number }) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      fetchData();
    });

    return () => { s.disconnect(); };
  }, [authed, fetchData, showToast]);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette commande ?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [o.client_name, o.client_email, o.client_phone, o.address, o.service].some((v) =>
      v?.toLowerCase().includes(q)
    );
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-blue-700 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-up max-w-sm">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧹</span>
            <div>
              <h1 className="font-bold text-lg leading-none">ProNett</h1>
              <p className="text-blue-200 text-xs">Tableau de bord</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchData(); setNotifBadge(0); }}
              className="relative p-2 hover:bg-white/15 rounded-xl transition-colors"
              title="Actualiser"
            >
              <Bell size={20} />
              {notifBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifBadge > 9 ? '9+' : notifBadge}
                </span>
              )}
            </button>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-white/15 rounded-xl transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm px-3 py-2 hover:bg-white/15 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Déconnexion
            </button>
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
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`text-3xl font-bold ${color}`}>{value}</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, adresse..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <Filter size={14} className="text-slate-400 mr-1" />
              {STATUSES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    filter === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                  {key !== 'all' && (
                    <span className="ml-1 opacity-70">
                      ({orders.filter((o) => o.status === key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold text-lg">Aucune commande</p>
            <p className="text-sm mt-1">Les nouvelles commandes apparaîtront ici en temps réel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isNew={newIds.has(order.id)}
              />
            ))}
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-center text-slate-400 text-sm mt-6">
            {filtered.length} commande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>
        )}
      </main>
    </div>
  );
}
