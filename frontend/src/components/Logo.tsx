interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo LumiNett — Carré arrondi bleu dégradé avec L et étoile de lumière.
 * Lumi = lumière (sparkle), Nett = propre (L).
 */
export default function Logo({ size = 36, className = '' }: LogoProps) {
  const id = `lnGrad_${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LumiNett logo"
    >
      {/* Fond carré arrondi dégradé bleu */}
      <rect width="40" height="40" rx="11" fill={`url(#${id})`} />

      {/* Lettre L stylisée (blanche) */}
      <path
        d="M12 11 L12 30 L28 30"
        stroke="white"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Étoile / sparkle (Lumi = lumière) — coin haut droit */}
      <g transform="translate(24.5, 9.5)">
        {/* Rayons longs */}
        <line x1="4" y1="0" x2="4" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="4" x2="8" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Rayons diagonaux courts */}
        <line x1="1.2" y1="1.2" x2="2.9" y2="2.9" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="6.8" y1="1.2" x2="5.1" y2="2.9" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="1.2" y1="6.8" x2="2.9" y2="5.1" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="6.8" y1="6.8" x2="5.1" y2="5.1" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        {/* Point central */}
        <circle cx="4" cy="4" r="1.5" fill="white" />
      </g>

      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
