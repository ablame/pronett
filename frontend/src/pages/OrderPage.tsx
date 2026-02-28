import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Calendar, Clock, User, Home, Info } from 'lucide-react';
import { SERVICES, TIME_SLOTS, type Service } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { label: 'Service', icon: '🧹' },
    { label: 'Date & heure', icon: '📅' },
    { label: 'Vos infos', icon: '👤' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <CheckCircle size={18} /> : s.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function OrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedService, setSelectedService] = useState<Service | null>(
    preselected ? SERVICES.find((s) => s.id === preselected) || null : null
  );
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    address: '',
    surface_area: '',
    notes: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // ── Step 1: Choisir service ──────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Choisissez votre prestation</h2>
      <p className="text-slate-500 mb-6">Sélectionnez le type de nettoyage dont vous avez besoin.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-md ${
              selectedService?.id === service.id
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                : 'border-slate-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">{service.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800">{service.label}</h3>
                  {selectedService?.id === service.id && (
                    <CheckCircle size={18} className="text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-2">{service.description}</p>
                <span className="text-blue-600 font-semibold text-sm">{service.price}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Step 2: Date & créneau ───────────────────────────────────────────────

  const renderStep2 = () => (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Date & créneau horaire</h2>
      <p className="text-slate-500 mb-6">Choisissez quand vous souhaitez que nous intervenions.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <Calendar size={15} className="inline mr-1.5 text-blue-500" />
            Date souhaitée
          </label>
          <input
            type="date"
            value={date}
            min={getTomorrowDate()}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
          {date && (
            <p className="mt-1.5 text-sm text-blue-600 font-medium">
              📅 {formatDateFR(date)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            <Clock size={15} className="inline mr-1.5 text-blue-500" />
            Créneau horaire
          </label>
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setTimeSlot(slot)}
                className={`py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  timeSlot === slot
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                🕐 {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step 3: Infos client ─────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Vos coordonnées</h2>
      <p className="text-slate-500 mb-6">Renseignez vos informations pour finaliser la demande.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              <User size={13} className="inline mr-1 text-blue-500" />
              Nom complet *
            </label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              📞 Téléphone *
            </label>
            <input
              type="tel"
              placeholder="06 00 00 00 00"
              value={form.client_phone}
              onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            📧 Email *
          </label>
          <input
            type="email"
            placeholder="jean.dupont@email.fr"
            value={form.client_email}
            onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Home size={13} className="inline mr-1 text-blue-500" />
            Adresse d'intervention *
          </label>
          <input
            type="text"
            placeholder="12 rue de la Paix, 75001 Paris"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            📐 Surface approximative (optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: 80 m², 3 pièces..."
            value={form.surface_area}
            onChange={(e) => setForm({ ...form, surface_area: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            <Info size={13} className="inline mr-1 text-blue-500" />
            Informations complémentaires (optionnel)
          </label>
          <textarea
            rows={3}
            placeholder="Accès, code immeuble, instructions particulières..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field resize-none"
          />
        </div>

        {/* Récap */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mt-2">
          <p className="text-sm font-semibold text-blue-700 mb-2">Récapitulatif</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
            <span className="text-slate-400">Service</span>
            <span className="font-medium">{selectedService?.label}</span>
            <span className="text-slate-400">Date</span>
            <span className="font-medium">{formatDateFR(date)}</span>
            <span className="text-slate-400">Créneau</span>
            <span className="font-medium">{timeSlot}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Navigation ───────────────────────────────────────────────────────────

  const canGoNext = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!date && !!timeSlot;
    if (step === 3) {
      return !!(form.client_name && form.client_email && form.client_phone && form.address);
    }
    return false;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService!.id,
          date,
          time_slot: timeSlot,
          ...form,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      const order = await res.json();
      navigate('/confirmation', { state: { order } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-16">
      {/* Header */}
      <div className="bg-blue-700 pt-8 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Réserver une prestation</h1>
          <p className="text-blue-200 text-sm mt-1">Formulaire en 3 étapes — moins de 2 minutes</p>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
          <StepIndicator current={step} />

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              ❌ {error}
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate('/'))}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              {step === 1 ? 'Annuler' : 'Retour'}
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="btn-primary flex items-center gap-2"
              >
                Continuer <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Envoi en cours...</>
                ) : (
                  <><CheckCircle size={16} /> Envoyer ma demande</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
