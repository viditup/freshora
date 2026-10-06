import AsyncStorage from '@react-native-async-storage/async-storage';
import { userKey } from './storage';

// PART 10: "Recently Viewed". Product ids only (newest first), kept on the device per user.
// The Home row is rendered from /products/by-ids so price and stock are always current.
const MAX = 10;
const key = (uid) => userKey(uid, 'recent_viewed');

export async function loadViewed(uid) {
  try {
    const v = JSON.parse((await AsyncStorage.getItem(key(uid))) || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}
export async function trackViewed(uid, id) {
  if (!uid || !id) return;
  const next = [id, ...(await loadViewed(uid)).filter((x) => x !== id)].slice(0, MAX);
  AsyncStorage.setItem(key(uid), JSON.stringify(next)).catch(() => {});
}
export const clearViewed = (uid) => AsyncStorage.removeItem(key(uid)).catch(() => {});
