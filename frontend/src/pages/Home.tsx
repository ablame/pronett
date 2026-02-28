import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Star, Shield, Phone, Mail, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { SERVICES } from '../types';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 pt-16">
        {/* Shapes décoratives */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Service disponible 6j/7
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Un espace propre,
              <br />
              <span className="text-sky-200">en toute simplicité.</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed">
              Réservez votre prestation de nettoyage en quelques clics. Professionnels qualifiés, produits inclus, résultats garantis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/commander" className="btn-primary flex items-center justify-center gap-2 text-base">
                Commander une prestation
                <ArrowRight size={18} />
              </Link>
              <a
                href="#services"
                className="bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-center backdrop-blur-sm border border-white/20"
              >
                Voir nos services
              </a>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mt-10">
              {[
                { icon: '⭐', text: '+200 clients satisfaits' },
                { icon: '✅', text: 'Devis sous 24h' },
                { icon: '🔒', text: 'Personnel assuré' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/15">
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 0 960 0 720 30C480 60 240 60 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── Services ────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Nos prestations</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Ce que nous faisons
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Des solutions adaptées à chaque besoin, pour les particuliers et les professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="card p-6 hover:shadow-lg hover:-translate-y-1 group cursor-pointer"
                onClick={() => window.location.href = `/commander?service=${service.id}`}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{service.label}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-1.5 mb-5">
                  {service.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-blue-600 font-bold text-sm">{service.price}</span>
                  <span className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Réserver <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/commander" className="btn-primary inline-flex items-center gap-2">
              Commander maintenant <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ───────────────────────────────────────────── */}
      <section id="comment" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Simple & rapide</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🖥️',
                title: 'Choisissez votre service',
                desc: 'Sélectionnez la prestation qui correspond à votre besoin parmi nos 5 services disponibles.',
              },
              {
                step: '02',
                icon: '📅',
                title: 'Planifiez votre rendez-vous',
                desc: 'Choisissez la date et le créneau horaire qui vous convient. Nous nous adaptons à votre agenda.',
              },
              {
                step: '03',
                icon: '✨',
                title: 'Profitez d\'un espace propre',
                desc: 'Notre équipe intervient à l\'heure convenue. Vous recevez une confirmation par email.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl text-3xl mb-5">
                  {icon}
                </div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center -translate-y-1 translate-x-1">
                  {step}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pourquoi nous ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Nos engagements</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6">
                Pourquoi choisir ProNett ?
              </h2>
              <div className="space-y-5">
                {[
                  { icon: <Shield size={20} />, title: 'Personnel certifié & assuré', desc: 'Toute notre équipe est formée et assurée pour intervenir dans vos locaux.' },
                  { icon: <Clock size={20} />, title: 'Ponctualité garantie', desc: 'Nous respectons les horaires convenus. Votre temps est précieux.' },
                  { icon: <Star size={20} />, title: 'Produits pro inclus', desc: 'Nous utilisons des produits professionnels écologiques et efficaces.' },
                  { icon: <CheckCircle size={20} />, title: 'Satisfaction ou reprise', desc: 'Résultat non conforme ? Nous revenons sans frais supplémentaires.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
                      <p className="text-slate-500 text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '200+', label: 'Clients satisfaits', icon: '😊' },
                { value: '5★', label: 'Note moyenne', icon: '⭐' },
                { value: '6j/7', label: 'Disponibilité', icon: '🗓️' },
                { value: '< 24h', label: 'Délai de réponse', icon: '⚡' },
              ].map(({ value, label, icon }) => (
                <div key={label} className="card p-6 text-center hover:shadow-md">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
                  <div className="text-slate-500 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-sky-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à passer commande ?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Réservez votre prestation en moins de 2 minutes. Confirmation par email immédiate.
          </p>
          <Link to="/commander" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200">
            Commander une prestation
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
                <span>🧹</span> ProNett
              </div>
              <p className="text-sm leading-relaxed">
                Service professionnel de nettoyage pour particuliers et entreprises. Qualité, réactivité et discrétion.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.id}>
                    <Link to={`/commander?service=${s.id}`} className="hover:text-white transition-colors">
                      {s.icon} {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone size={14} /> 06 00 00 00 00
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} /> contact@pronett.fr
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} /> Votre ville
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm">
            <p>© {new Date().getFullYear()} ProNett. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
