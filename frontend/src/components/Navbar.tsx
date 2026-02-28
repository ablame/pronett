import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparent = isHome && !scrolled && !open;

  const links = [
    { to: '/#services', label: 'Nos services' },
    { to: '/#comment', label: 'Comment ça marche' },
    { to: '/#contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      isTransparent ? 'bg-transparent' : 'bg-white shadow-md border-b border-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 font-bold text-xl transition-colors ${
            isTransparent ? 'text-white' : 'text-blue-700'
          }`}>
            <span className="text-2xl">🧹</span>
            <span>ProNett</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a key={l.to} href={l.to}
                className={`font-medium transition-colors text-sm ${
                  isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-blue-600'
                }`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:0600000000"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isTransparent ? 'text-white/90 hover:text-white' : 'text-slate-600 hover:text-blue-600'
              }`}>
              <Phone size={15} /> 06 00 00 00 00
            </a>
            <Link to="/commander"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Commander
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 bg-white shadow-lg animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a key={l.to} href={l.to} onClick={() => setOpen(false)}
                  className="px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="mt-3 px-4 flex flex-col gap-2 pt-3 border-t border-slate-100">
                <a href="tel:0600000000"
                  className="flex items-center justify-center gap-2 text-slate-600 py-2.5 font-medium border border-slate-200 rounded-xl">
                  <Phone size={16} /> 06 00 00 00 00
                </a>
                <Link to="/commander" onClick={() => setOpen(false)} className="btn-primary text-center">
                  Commander une prestation
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
