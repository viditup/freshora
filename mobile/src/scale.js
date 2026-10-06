// PART 17: proportional sizing so Home looks like the design on EVERY phone.
// The design screenshot was measured at 1048 units wide (x4 zoom of the 262 px reference image).
// u(n) = n design-units converted to dp for the current screen width.   f(n, min) = same, but never smaller than `min` (readable text).
// Example: the design's "Shop Now" pill is 262 units wide  ->  u(262) = 25% of the screen on any phone.
// To make Home overall a bit bigger or smaller, change only DESIGN_ZOOM (1 = exactly like the design).
import { useWindowDimensions } from 'react-native';

export const REF_W = 1048;
export const DESIGN_ZOOM = 1;

export const makeScale = (width) => {
  const k = (width / REF_W) * DESIGN_ZOOM;
  const u = (n) => Math.round(n * k * 10) / 10;
  const f = (n, min = 10) => Math.max(min, Math.round(n * k * 10) / 10);
  return { width, u, f };
};

export function useDesign() {
  const { width } = useWindowDimensions();
  return makeScale(width);
}
