import React from 'react';

interface Props {
  sku?: string;
  className?: string;
}

export const ShoeVector: React.FC<Props> = ({ sku = '', className = 'w-full h-auto' }) => {
  const filterDef = (
    <defs>
      <linearGradient id="sv-leather" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="35%" stopColor="#1e293b" />
        <stop offset="70%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="sv-highlight" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
      </linearGradient>
      <linearGradient id="sv-sole" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#27272a" />
        <stop offset="50%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#09090b" />
      </linearGradient>
      <linearGradient id="sv-canvas" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id="sv-gum" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2d2b4" />
        <stop offset="50%" stopColor="#cbb387" />
        <stop offset="100%" stopColor="#b49764" />
      </linearGradient>
      <linearGradient id="sv-buckle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="45%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
    </defs>
  );

  const cleanSku = sku.toUpperCase();

  // 1. PT White
  if (cleanSku.includes('PT05') || cleanSku.includes('WHITE')) {
    return (
      <svg viewBox="0 0 500 320" className={className} xmlns="http://www.w3.org/2000/svg">
        {filterDef}
        <ellipse cx="250" cy="285" rx="195" ry="18" fill="#0f172a" opacity="0.12" filter="blur(6px)" />
        <path d="M 75 238 C 75 260, 90 274, 140 274 L 415 274 C 440 274, 455 260, 455 242 C 455 234, 445 228, 425 228 L 75 228 Z" fill="url(#sv-gum)" />
        <path d="M 75 228 L 448 228 L 445 238 L 75 238 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="75" y1="233" x2="446" y2="233" stroke="#1d4ed8" strokeWidth="2" />
        <path d="M 380 208 C 420 215, 450 224, 448 240 C 440 242, 400 242, 375 235 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 80 228 C 75 175, 90 135, 145 135 C 175 135, 195 155, 230 155 C 280 155, 345 180, 410 210 C 425 218, 420 224, 405 228 Z" fill="url(#sv-canvas)" stroke="#cbd5e1" strokeWidth="1.5" />
        <path d="M 115 138 C 135 128, 165 128, 185 148 C 165 152, 135 152, 115 138 Z" fill="#1e3a8a" />
        <text x="135" y="145" fill="#ffffff" fontSize="6" fontWeight="bold">SHOES NET PT</text>
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <circle cx={200 + i * 14} cy={158 + i * 8} r="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx={208 + i * 14} cy={168 + i * 8} r="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1={200 + i * 14} y1={158 + i * 8} x2={208 + i * 14} y2={168 + i * 8} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          </g>
        ))}
        <path d="M 170 185 L 290 208 L 285 214 L 165 191 Z" fill="#1d4ed8" opacity="0.9" />
        <rect x="70" y="240" width="32" height="12" rx="2" fill="#1d4ed8" />
        <text x="86" y="248" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle">SHOES NET</text>
      </svg>
    );
  }

  // 2. Mary Jane Buckle
  if (cleanSku.includes('MJ02') || cleanSku.includes('MJV08') || cleanSku.includes('GIRL')) {
    return (
      <svg viewBox="0 0 500 320" className={className} xmlns="http://www.w3.org/2000/svg">
        {filterDef}
        <ellipse cx="250" cy="285" rx="195" ry="18" fill="#0f172a" opacity="0.14" filter="blur(6px)" />
        <path d="M 85 230 C 85 250, 95 268, 140 268 L 175 268 C 180 268, 185 255, 185 246 L 270 248 C 320 248, 415 248, 435 238 C 445 234, 445 226, 430 224 L 85 224 Z" fill="url(#sv-sole)" />
        <path d="M 90 220 C 85 175, 95 140, 145 138 C 170 138, 180 160, 200 178 C 220 196, 270 198, 310 195 C 360 192, 400 200, 430 216 C 440 222, 435 224, 420 224 Z" fill="url(#sv-leather)" />
        <path d="M 125 145 C 160 145, 175 165, 205 185 C 245 195, 330 198, 410 214 C 390 205, 320 198, 250 190 C 200 185, 150 165, 125 145 Z" fill="url(#sv-highlight)" />
        <path d="M 140 145 C 170 148, 195 170, 220 185 C 240 192, 280 192, 305 190 C 270 180, 210 165, 175 150 Z" fill="#991b1b" />
        <text x="210" y="178" fill="#fef08a" fontSize="6" fontWeight="bold">SHOES NET</text>
        <path d="M 190 160 L 265 190 L 260 205 L 185 175 Z" fill="#09090b" stroke="#3b82f6" strokeWidth="0.5" />
        <g transform="translate(235, 180) rotate(22)">
          <rect x="0" y="0" width="16" height="22" rx="3" fill="url(#sv-buckle)" stroke="#78350f" strokeWidth="1" />
          <rect x="3" y="4" width="10" height="14" rx="1.5" fill="#18181b" />
          <line x1="1" y1="11" x2="14" y2="11" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  // 3. Junior Dual Velcro
  if (cleanSku.includes('VC03') || cleanSku.includes('VELCRO')) {
    return (
      <svg viewBox="0 0 500 320" className={className} xmlns="http://www.w3.org/2000/svg">
        {filterDef}
        <ellipse cx="250" cy="285" rx="195" ry="18" fill="#0f172a" opacity="0.14" filter="blur(6px)" />
        <path d="M 80 230 C 80 255, 90 270, 145 270 L 415 270 C 435 270, 450 255, 450 238 C 450 225, 440 220, 420 220 L 80 220 Z" fill="url(#sv-sole)" />
        <path d="M 405 220 C 445 218, 455 228, 450 245 C 440 248, 420 248, 400 245 Z" fill="#27272a" stroke="#52525b" strokeWidth="1" />
        <path d="M 85 220 C 80 170, 95 130, 155 130 C 185 130, 205 150, 230 152 C 280 155, 360 175, 425 210 C 440 216, 435 222, 420 222 Z" fill="url(#sv-leather)" />
        <g>
          <rect x="180" y="146" width="90" height="22" rx="4" fill="#18181b" stroke="#475569" strokeWidth="1.2" transform="rotate(8 180 146)" />
          <rect x="250" y="146" width="20" height="22" rx="3" fill="#27272a" stroke="#d4af37" strokeWidth="0.8" transform="rotate(8 180 146)" />
          <text x="195" y="161" fill="#cbd5e1" fontSize="7" fontWeight="bold" transform="rotate(8 180 146)">SHOES NET</text>
        </g>
        <g>
          <rect x="210" y="174" width="90" height="22" rx="4" fill="#18181b" stroke="#475569" strokeWidth="1.2" transform="rotate(8 210 174)" />
          <rect x="280" y="174" width="20" height="22" rx="3" fill="#27272a" stroke="#d4af37" strokeWidth="0.8" transform="rotate(8 210 174)" />
        </g>
      </svg>
    );
  }

  // Default: Classic Oxford / Derby Lace-up
  return (
    <svg viewBox="0 0 500 320" className={className} xmlns="http://www.w3.org/2000/svg">
      {filterDef}
      <ellipse cx="250" cy="285" rx="200" ry="20" fill="#0f172a" opacity="0.14" filter="blur(6px)" />
      <path d="M 80 230 C 80 255, 95 272, 145 272 L 180 272 C 185 272, 190 260, 190 248 L 260 250 C 310 250, 420 250, 445 240 C 455 236, 455 228, 440 226 L 80 226 Z" fill="url(#sv-sole)" />
      <path d="M 78 226 L 448 226 L 445 221 L 80 221 Z" fill="#3f3f46" stroke="#b45309" strokeWidth="1" strokeDasharray="3,2" />
      <path d="M 85 222 C 80 180, 85 140, 140 135 C 165 135, 185 160, 220 155 C 265 148, 320 170, 395 190 C 435 200, 455 212, 445 222 Z" fill="url(#sv-leather)" />
      <path d="M 120 145 C 170 140, 240 158, 380 192 C 430 205, 440 216, 425 218 C 360 200, 270 175, 205 165 C 150 160, 125 155, 120 145 Z" fill="url(#sv-highlight)" />
      <path d="M 115 138 C 135 125, 175 125, 195 150 C 180 155, 140 155, 115 138 Z" fill="#18181b" stroke="#52525b" strokeWidth="2" />
      <text x="145" y="144" fill="#fbbf24" fontSize="7" fontWeight="bold">SHOES NET</text>
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <circle cx={205 + i * 11} cy={155 + i * 8} r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <circle cx={213 + i * 11} cy={165 + i * 8} r="3" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
          <line x1={205 + i * 11} y1={155 + i * 8} x2={213 + i * 11} y2={165 + i * 8} stroke="#020617" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ))}
      <rect x="80" y="195" width="34" height="10" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
      <text x="97" y="202" fill="#94a3b8" fontSize="4.5" fontWeight="bold" textAnchor="middle">SHOES NET</text>
    </svg>
  );
};
