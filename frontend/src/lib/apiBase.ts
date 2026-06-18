/**
 * Normalise l'URL de l'API pour éviter les erreurs en production (ex: valeur sans "https://").
 * - Si VITE_API_URL est vide: on reste en relatif (utile avec le proxy Vite en local).
 * - Si VITE_API_URL n'a pas de schéma: on suppose https.
 */
export function getApiOrigin(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  return `https://${raw}`.replace(/\/+$/, '');
}

export const API_V1_BASE = `${getApiOrigin()}/api/v1`;

