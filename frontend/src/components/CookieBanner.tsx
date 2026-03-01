import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('cookie_notice_dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('cookie_notice_dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="text-xl shrink-0">🍪</span>
        <p className="text-sm text-slate-300 flex-1">
          Ce site utilise uniquement des cookies <strong className="text-white">strictement nécessaires</strong> à son fonctionnement (authentification).
          Aucun cookie publicitaire ni de suivi n'est utilisé.{' '}
          <Link to="/politique-confidentialite" className="text-blue-400 hover:text-blue-300 underline" onClick={dismiss}>
            En savoir plus
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          J'ai compris
        </button>
      </div>
    </div>
  );
}
