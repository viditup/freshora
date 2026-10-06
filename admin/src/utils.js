// Mongo datetimes arrive WITHOUT a timezone suffix but are UTC: parse them as UTC (same logic as the mobile app).
export const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};
export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const shortId = (id) => '#' + String(id).slice(-8).toUpperCase();
