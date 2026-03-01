import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Star, Shield, Phone, Mail, MapPin, ArrowRight, ChevronRight, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import { SERVICES } from '../types';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-sky-500 pt-16 min-h-[92vh] flex items-center">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Service disponible 6j/7 — Devis sous 48h
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Un espace propre,
              <br />
              <span className="text-sky-200">en toute simplicité.</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
              Réservez votre prestation de nettoyage en quelques clics. Professionnels qualifiés, produits inclus, résultats garantis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/commander" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-7 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base">
                Commander une prestation
                <ArrowRight size={18} />
              </Link>
              <a href="tel:0610854918"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-4 rounded-xl transition-all backdrop-blur-sm border border-white/20">
                <Phone size={18} /> Nous appeler
              </a>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mt-10">
              {[
                { icon: '⭐', text: '+200 clients satisfaits' },
                { icon: '✅', text: 'Résultat garanti' },
                { icon: '🔒', text: 'Personnel assuré' },
                { icon: '⚡', text: 'Réponse sous 48h' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/15">
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 0 960 0 720 40C480 80 240 80 0 40L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── Services ────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Nos prestations</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">Ce que nous faisons</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Des solutions adaptées à chaque besoin, pour les particuliers et les professionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div key={service.id}
                className="card p-6 hover:shadow-xl hover:-translate-y-1.5 group cursor-pointer border-2 border-transparent hover:border-blue-100 transition-all duration-300"
                onClick={() => window.location.href = `/commander?service=${service.id}`}>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-blue-100 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{service.label}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-5">
                  {service.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />{d}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-blue-600 font-bold text-sm">{service.price}</span>
                  <span className="flex items-center gap-1 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Réserver <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/commander" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
              Commander maintenant <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ───────────────────────────────────────────── */}
      <section id="comment" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple & rapide</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">Comment ça marche ?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">En moins de 2 minutes, votre prestation est planifiée.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🖥️', title: 'Choisissez votre service', desc: 'Sélectionnez la prestation parmi nos 5 services disponibles et indiquez votre surface.' },
              { step: '02', icon: '📅', title: 'Planifiez le rendez-vous', desc: 'Choisissez la date et le créneau horaire. Nous nous adaptons à votre planning.' },
              { step: '03', icon: '✨', title: 'Profitez d\'un espace propre', desc: 'Notre équipe intervient à l\'heure convenue. Confirmation par email immédiate.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-4xl mx-auto">
                    {icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pourquoi nous ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Nos engagements</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-8">Pourquoi choisir LumiNett ?</h2>
              <div className="space-y-6">
                {[
                  { icon: <Shield size={20} />, title: 'Personnel certifié & assuré', desc: 'Toute notre équipe est formée et assurée pour intervenir chez vous en toute sécurité.' },
                  { icon: <Clock size={20} />, title: 'Ponctualité garantie', desc: 'Nous respectons les horaires convenus. Votre temps est précieux.' },
                  { icon: <Star size={20} />, title: 'Produits professionnels inclus', desc: 'Produits pro écologiques, efficaces et sans danger pour votre famille.' },
                  { icon: <CheckCircle size={20} />, title: 'Satisfaction ou reprise gratuite', desc: 'Résultat non conforme ? Nous revenons refaire la prestation sans frais.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4 group">
                    <div className="shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">{title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '200+', label: 'Clients satisfaits', icon: '😊', color: 'bg-blue-50' },
                { value: '5★', label: 'Note moyenne', icon: '⭐', color: 'bg-amber-50' },
                { value: '6j/7', label: 'Disponibilité', icon: '🗓️', color: 'bg-emerald-50' },
                { value: '< 24h', label: 'Délai de réponse', icon: '⚡', color: 'bg-purple-50' },
              ].map(({ value, label, icon, color }) => (
                <div key={label} className={`${color} rounded-2xl p-6 text-center hover:shadow-md transition-shadow`}>
                  <div className="text-4xl mb-3">{icon}</div>
                  <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
                  <div className="text-slate-500 text-sm font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Témoignages ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Témoignages</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sophie M.', role: 'Particulier', text: 'Équipe très professionnelle, ponctuelle et efficace. Mon appartement n\'a jamais été aussi propre. Je recommande vivement !' },
              { name: 'Jean-Pierre D.', role: 'Gérant d\'entreprise', text: 'LumiNett entretient nos bureaux chaque semaine. Travail impeccable, discret et toujours dans les délais. Très satisfait.' },
              { name: 'Marie L.', role: 'Particulier', text: 'Nettoyage après travaux réalisé en une journée. Résultat parfait, rien à redire. Service top et prix honnête.' },
            ].map(({ name, role, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 text-amber-400 text-lg mb-4">★★★★★</div>
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare size={16} className="text-blue-200 shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{text}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-r from-blue-700 to-sky-600 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Prêt à passer commande ?</h2>
          <p className="text-blue-100 text-lg mb-10">Réservez en moins de 2 minutes. Confirmation par email immédiate.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/commander" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
              Commander une prestation <ArrowRight size={20} />
            </Link>
            <a href="tel:0610854918" className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-xl transition-all border border-white/20">
              <Phone size={18} /> Nous appeler
            </a>
          </div>
        </div>
      </section>

      {/* ─── Contact ─────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Contact</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">Nous contacter</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Une question ? Nous vous répondons rapidement.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: <Phone size={24} />, title: 'Téléphone', value: '06 10 85 49 18', href: 'tel:0610854918', color: 'bg-blue-100 text-blue-600' },
              { icon: <Mail size={24} />, title: 'Email', value: 'contact@pronett.fr', href: 'mailto:contact@pronett.fr', color: 'bg-emerald-100 text-emerald-600' },
              { icon: <MapPin size={24} />, title: 'Zone d\'intervention', value: 'Votre ville & alentours', href: '#', color: 'bg-purple-100 text-purple-600' },
            ].map(({ icon, title, value, href, color }) => (
              <a key={title} href={href}
                className="card p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                <span>🧹</span> LumiNett
              </div>
              <p className="text-sm leading-relaxed">
                Service professionnel de nettoyage pour particuliers et entreprises. Qualité, réactivité et discrétion garanties.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-amber-400 text-sm">★★★★★</span>
                <span className="text-sm">200+ clients satisfaits</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Nos services</h4>
              <ul className="space-y-2.5 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.id}>
                    <Link to={`/commander?service=${s.id}`} className="hover:text-white transition-colors flex items-center gap-2">
                      <span>{s.icon}</span>{s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:0610854918" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={14} /> 06 10 85 49 18
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@pronett.fr" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail size={14} /> contact@pronett.fr
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} /> Votre ville & alentours
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/commander" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Commander <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <p>© {new Date().getFullYear()} LumiNett. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <Link to="/cgv" className="text-slate-500 hover:text-white transition-colors">
                CGV
              </Link>
              <Link to="/mon-espace" className="text-slate-500 hover:text-white transition-colors">
                Mon espace client
              </Link>
              <Link to="/admin" className="text-slate-700 hover:text-slate-500 transition-colors text-xs">
                Espace Pro
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
