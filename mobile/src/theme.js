export const C = {
  green: '#1B7F3B', dark: '#14532D', bg: '#F7FAF3', card: '#FFFFFF', text: '#1D3A27',
  muted: '#6B7C70', border: '#DFE8D8', light: '#E6F2E6', red: '#C0392B', amber: '#F59E0B',
  headerBg: '#EDF6E7', pink: '#FDECEF', gold: '#F5B301',
  // PART 2A (approximate, sampled from design PDF - verify with eyedropper)
  dark2: '#0B3D2A',   // very dark green: hero headline, dark "Shop Now"/"Buy Now" pills
  lime: '#7DBE3C',    // accent word ("doorstep")
  blush: '#FCE4E4',   // pink promo ("10 Minutes")
  cream: '#FFF6DD',   // cream/yellow promo ("Go Organic")
  tint: '#E4F5E3',    // "Add to Cart" light pill
  tile: '#F1F7EB',    // category tile background
  headerTop: '#DDF1D6', // top colour of header gradient (fades to white)
};
export const R = 14;
// ---- Global design tokens (PART 2): reuse these instead of hard-coding values in screens ----
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };            // spacing scale
export const RAD = { sm: 8, md: R, lg: 18, pill: 999 };               // border radius scale
export const FS = { xs: 11, sm: 12, md: 14, lg: 16, xl: 20, xxl: 24 }; // font sizes
// PART 2A: font family names (loaded in App.js with useFonts). On Android a custom font needs
// one family per weight - fontWeight alone does NOT pick the bold file.
export const FONT = {
  heading: 'PlusJakartaSans_700Bold',
  headingBold: 'PlusJakartaSans_800ExtraBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  script: 'Caveat_700Bold',
};
export const T = {                                                    // typography presets
  h1: { fontSize: FS.xxl, fontFamily: FONT.headingBold, color: C.text },
  h2: { fontSize: FS.xl, fontFamily: FONT.headingBold, color: C.text },
  h3: { fontSize: FS.lg, fontFamily: FONT.heading, color: C.text },
  body: { fontSize: FS.md, fontFamily: FONT.body, color: C.text },
  caption: { fontSize: FS.sm, fontFamily: FONT.body, color: C.muted },
  script: { fontSize: 22, fontFamily: FONT.script, color: C.green },
};
export const TAB_H = 58; // bottom tab bar height, excluding the safe-area inset
export const rs = (n) => '₹' + (Number.isInteger(+n) ? +n : (+n).toFixed(2));
export const shadow = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };
export const card = { backgroundColor: C.card, borderRadius: R, ...shadow };
// Backend sends UTC datetimes without a timezone suffix; treat them as UTC.
export const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
export const shortId = (id) => '#' + String(id).slice(-8).toUpperCase();
// PART 9: "Oct 2026" style label (UTC datetime without suffix, same rule as fmtDate).
export const toMonthYear = (s) => {
  if (!s) return '';
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z');
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};
