import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';

interface CaptchaProps {
  onVerified: (ok: boolean) => void;
  reset?: number; // incrémenter pour forcer un reset
}

export default function Captcha({ onVerified, reset = 0 }: CaptchaProps) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verified, setVerified] = useState(false);

  const refresh = useCallback(() => {
    setA(Math.floor(Math.random() * 10) + 1);
    setB(Math.floor(Math.random() * 10) + 1);
    setAnswer('');
    setVerified(false);
    onVerified(false);
  }, [onVerified]);

  useEffect(() => { refresh(); }, [refresh, reset]);

  function handleChange(val: string) {
    setAnswer(val);
    const ok = val !== '' && parseInt(val) === a + b;
    setVerified(ok);
    onVerified(ok);
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        Vérification anti-robot
      </label>
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 font-mono font-bold text-slate-700 text-sm select-none tracking-widest min-w-[90px] text-center">
          {a > 0 ? `${a} + ${b}` : '…'}
        </div>
        <span className="text-slate-400 font-bold">=</span>
        <input
          type="number"
          value={answer}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="?"
          className={`w-20 px-3 py-2.5 rounded-xl border text-sm text-center font-bold outline-none transition-all ${
            answer && verified
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
              : answer && !verified
              ? 'border-red-300 bg-red-50 text-red-600'
              : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        {verified ? (
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
        ) : (
          <button type="button" onClick={refresh} className="text-slate-400 hover:text-slate-600 transition-colors" title="Nouveau calcul">
            <RefreshCw size={15} />
          </button>
        )}
      </div>
      {answer && !verified && (
        <p className="text-red-500 text-xs mt-1">Réponse incorrecte</p>
      )}
    </div>
  );
}
