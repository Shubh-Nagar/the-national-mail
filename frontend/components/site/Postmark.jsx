/**
 * Circular postmark cancellation showing the edition date.
 * Sits over the corner of the lead story's stamp frame.
 */
export default function Postmark({ date = new Date(), className = '' }) {
  const d = new Date(date);
  const day = new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' }).format(d);
  const month = new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }).format(d);
  const year = new Intl.DateTimeFormat('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' }).format(d);

  return (
    <svg viewBox="0 0 220 120" className={className} role="img" aria-label={`Edition of ${day} ${month} ${year}`}>
      <defs>
        <path id="pm-top" d="M 22 60 a 38 38 0 0 1 76 0" />
        <path id="pm-bottom" d="M 18 60 a 42 42 0 0 0 84 0" />
      </defs>
      <g fill="none" stroke="#1B2A4A" strokeOpacity="0.82">
        <circle cx="60" cy="60" r="50" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="31" strokeWidth="1.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M 116 ${36 + i * 12} q 13 -7 26 0 t 26 0 t 26 0 t 22 0`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g fill="#1B2A4A" fillOpacity="0.85" fontFamily="Mukta, sans-serif" fontWeight="700">
        <text fontSize="11.5" letterSpacing="2.2">
          <textPath href="#pm-top" startOffset="50%" textAnchor="middle">NATIONAL MAIL</textPath>
        </text>
        <text fontSize="10" letterSpacing="2">
          <textPath href="#pm-bottom" startOffset="50%" textAnchor="middle">TODAY&apos;S EDITION</textPath>
        </text>
        <text x="60" y="57" fontSize="17" textAnchor="middle" fontFamily="Newsreader Variable, serif">{day} {month}</text>
        <text x="60" y="72" fontSize="11" textAnchor="middle">{year}</text>
      </g>
    </svg>
  );
}
