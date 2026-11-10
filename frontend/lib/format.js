const TZ = 'Asia/Kolkata';

export function formatDate(value, opts = {}) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ, ...opts }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TZ,
  }).format(new Date(value));
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 7 * 86400) {
    const d = Math.floor(diff / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  return formatDate(value, { month: 'short' });
}

export function compactNumber(n) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
