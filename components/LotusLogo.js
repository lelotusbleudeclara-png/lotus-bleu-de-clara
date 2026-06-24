export default function LotusLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lotusOuter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B9DF0" />
          <stop offset="100%" stopColor="#15439A" />
        </linearGradient>
        <linearGradient id="lotusInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EAF6FF" />
          <stop offset="100%" stopColor="#2D6FE0" />
        </linearGradient>
      </defs>

      <path d="M50 70 C50 70 20 62 22 32 C38 34 50 50 50 70 Z" fill="url(#lotusOuter)" />
      <path d="M50 70 C50 70 80 62 78 32 C62 34 50 50 50 70 Z" fill="url(#lotusOuter)" />
      <path d="M50 72 C50 72 32 50 40 20 C52 28 54 54 50 72 Z" fill="url(#lotusOuter)" />
      <path d="M50 72 C50 72 68 50 60 20 C48 28 46 54 50 72 Z" fill="url(#lotusOuter)" />

      <path d="M50 70 C50 70 34 56 38 34 C48 38 52 54 50 70 Z" fill="url(#lotusInner)" />
      <path d="M50 70 C50 70 66 56 62 34 C52 38 48 54 50 70 Z" fill="url(#lotusInner)" />
      <path d="M50 70 C50 70 44 50 50 28 C56 50 50 70 50 70 Z" fill="url(#lotusInner)" />

      <circle cx="46" cy="42" r="1.6" fill="#FFFFFF" />
      <circle cx="54" cy="38" r="1.2" fill="#FFFFFF" />
      <circle cx="50" cy="48" r="1" fill="#FFFFFF" />
    </svg>
  );
}
