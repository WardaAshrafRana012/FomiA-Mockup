export function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value == null) return fallback;
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (typeof value !== typeof fallback) return fallback;
    return value;
  } catch {
    return fallback;
  }
}
export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
