import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/#services', label: 'Services' },
    { to: '/#comment', label: 'Comment ça marche' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
            <span className="text-2xl">🧹</span>
            <span>ProNett</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.to}
                href={l.to}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              Admin
            </Link>
            <Link
              to="/commander"
              className="btn-primary text-sm py-2 px-5"
            >
              Commander
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 px-4 flex flex-col gap-2">
                <Link
                  to="/commander"
                  onClick={() => setOpen(false)}
                  className="btn-primary text-center"
                >
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
