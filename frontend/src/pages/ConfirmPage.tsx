import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Home, Phone, Mail, Calendar, Clock, MapPin } from 'lucide-react';
import { SERVICES, type Order } from '../types';

export default function ConfirmPage() {
  const { state } = useLocation() as { state: { order: Order } | null };

  if (!state?.order) return <Navigate to="/" replace />;

  const { order } = state;
  const service = SERVICES.find((s) => s.id === order.service);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Icône succès animée */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse-ring opacity-30" />
          <div className="relative w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce-once">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">Demande envoyée !</h1>
        <p className="text-slate-500 mb-8">
          Votre demande <strong className="text-blue-600">#{order.id}</strong> a bien été reçue.
          Nous vous contacterons rapidement pour confirmer le rendez-vous.
        </p>

        {/* Récap */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-left mb-6 animate-slide-up">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            📋 Récapitulatif de votre demande
          </h2>
          <div className="space-y-3">
            <Row icon="🧹" label="Service" value={`${service?.icon ?? ''} ${service?.label ?? order.service}`} />
            <Row icon={<Calendar size={16} />} label="Date" value={formatDateFR(order.date)} />
            <Row icon={<Clock size={16} />} label="Créneau" value={order.time_slot} />
            <Row icon={<MapPin size={16} />} label="Adresse" value={order.address} />
            <Row icon={<Phone size={16} />} label="Téléphone" value={order.client_phone} />
            <Row icon={<Mail size={16} />} label="Email" value={order.client_email} />
          </div>
        </div>

        {/* Info email */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 mb-8">
          <span className="font-semibold">📧 Un email de confirmation</span> a été envoyé à{' '}
          <strong>{order.client_email}</strong>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home size={16} /> Retour à l'accueil
          </Link>
          <Link to="/commander" className="btn-outline flex items-center justify-center gap-2">
            Nouvelle commande
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-7 h-7 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm mt-0.5">
        {icon}
      </span>
      <div className="min-w-0">
        <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</span>
        <p className="text-slate-700 font-medium text-sm mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function formatDateFR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
