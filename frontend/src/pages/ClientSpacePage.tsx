import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Package, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { STATUS_CONFIG, SERVICES, type Order } from '../types';

function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ClientSpacePage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/by-email?email=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error();
      const data: Order[] = await res.json();
      setOrders(data);
      setSearched(true);
    } catch {
      setError('Impossible de récupérer vos commandes. Réessayez dans quelques instants.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={15} /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🧹</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mon espace client</h1>
              <p className="text-slate-500 text-sm">Suivez l'état de vos prestations</p>
            </div>
          </div>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <p className="text-slate-600 text-sm mb-4">
            Entrez l'adresse email utilisée lors de votre commande pour retrouver vos prestations.
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm whitespace-nowrap shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Recherche…
                </span>
              ) : 'Rechercher'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && orders !== null && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-bold text-slate-800 mb-2">Aucune commande trouvée</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Aucune prestation n'est associée à <strong>{email}</strong>.<br />
                  Vérifiez l'adresse email utilisée lors de la commande.
                </p>
                <Link to="/commander" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
                  Commander une prestation <ChevronRight size={15} />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-slate-500 text-sm mb-4 font-medium">
                  {orders.length} prestation{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''} pour <span className="text-slate-800">{email}</span>
                </p>
                <div className="space-y-4">
                  {orders.map((order) => {
                    const service = SERVICES.find((s) => s.id === order.service);
                    const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Status bar */}
                        <div className={`h-1.5 w-full ${
                          order.status === 'completed' ? 'bg-emerald-400' :
                          order.status === 'in_progress' ? 'bg-blue-500' :
                          order.status === 'confirmed' ? 'bg-sky-400' :
                          order.status === 'cancelled' ? 'bg-red-400' :
                          'bg-amber-400'
                        }`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                                {service?.icon ?? '🧹'}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm">{service?.label ?? order.service}</h3>
                                <p className="text-slate-400 text-xs mt-0.5">Commande #{order.id}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status?.bg ?? 'bg-slate-100'} ${status?.text ?? 'text-slate-600'}`}>
                              {status?.icon} {status?.label ?? order.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                              <Calendar size={13} className="text-blue-500 shrink-0" />
                              <span>{formatDateFR(order.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                              <Clock size={13} className="text-blue-500 shrink-0" />
                              <span>{order.time_slot}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 sm:col-span-2">
                              <MapPin size={13} className="text-blue-500 shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </div>
                          </div>

                          {/* Progress steps */}
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              {(['pending', 'confirmed', 'in_progress', 'completed'] as const).map((step, i) => {
                                const steps = ['pending', 'confirmed', 'in_progress', 'completed'];
                                const currentIdx = steps.indexOf(order.status);
                                const isDone = i <= currentIdx && order.status !== 'cancelled';
                                const labels = ['Reçue', 'Confirmée', 'En cours', 'Terminée'];
                                return (
                                  <div key={step} className="flex-1 flex flex-col items-center gap-1">
                                    <div className={`w-full h-1.5 rounded-full ${isDone ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                    <span className={`text-[10px] font-medium ${isDone ? 'text-blue-600' : 'text-slate-400'}`}>
                                      {labels[i]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            {order.status === 'cancelled' && (
                              <p className="text-xs text-red-500 font-medium mt-2 text-center">Prestation annulée</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Besoin d'aide ou d'une nouvelle prestation ?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a href="tel:0610854918" className="inline-flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 font-medium px-5 py-2.5 rounded-xl transition-all text-sm">
                      📞 06 10 85 49 18
                    </a>
                    <Link to="/commander" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                      <Package size={15} /> Nouvelle commande
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* First visit hint */}
        {!searched && (
          <div className="bg-blue-50 rounded-2xl p-5 flex gap-4 items-start">
            <div className="text-2xl mt-0.5">💡</div>
            <div>
              <p className="text-blue-800 font-semibold text-sm mb-1">Première visite ?</p>
              <p className="text-blue-700 text-sm">
                Après votre commande, vous recevrez un email de confirmation. Revenez ici avec cette adresse email pour suivre l'avancement de votre prestation en temps réel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
