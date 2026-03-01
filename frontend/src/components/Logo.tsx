interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Logo Cleaning 16 — Carré arrondi bleu dégradé avec C stylisé.
 */
export default function Logo({ size = 36, className = '' }: LogoProps) {
  const id = `c16Grad_${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cleaning 16 logo"
    >
      {/* Fond carré arrondi dégradé bleu */}
      <rect width="40" height="40" rx="11" fill={`url(#${id})`} />

      {/* Lettre C stylisée (blanche) — arc semi-circulaire ouvert à droite */}
      <path
        d="M27 13 A10 10 0 1 0 27 28"
        stroke="white"
        strokeWidth="3.8"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
