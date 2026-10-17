import { createHash, createHmac } from 'crypto';

/**
 * Crea un hash SHA-256 anonimo della config utente.
 * Stesso utente = stesso hash. Non è reversibile.
 */
function hashConfig(configStr: string): string {
  return createHash('sha256').update(configStr).digest('hex').slice(0, 16);
}

/**
 * Identità stabile dell'installazione: un codice casuale creato dalla pagina di configurazione
 * (cifrato con la chiave segreta). Senza codice (installazioni più vecchie) si ricade sull'hash
 * dell'intera config, come prima.
 */
export function identityHash(configStr: string, cid?: string): string {
  if (cid && /^[A-Za-z0-9-]{16,64}$/.test(cid)) {
    const secret = process.env.ADDON_SECRET;
    const h = secret ? createHmac('sha256', secret) : createHash('sha256');
    return h.update(`cid:${cid}`).digest('hex').slice(0, 16);
  }
  return hashConfig(configStr);
}

/**
 * Invia un evento di tracking alla Dashboard.
 * Fire-and-forget: non blocca la risposta all'utente in caso di errore.
 */
export async function trackEvent(
  addon: 'cagelog' | 'multiboxd',
  event: 'catalog_request' | 'manifest_request' | 'meta_request' | 'stream_request',
  configStr?: string,
  cid?: string
): Promise<void> {
  const dashboardUrl = process.env.DASHBOARD_URL;
  const addonSecret  = process.env.ADDON_SECRET;

  if (!dashboardUrl) return;

  try {
    await fetch(`${dashboardUrl}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(addonSecret ? { 'x-addon-secret': addonSecret } : {}),
      },
      body: JSON.stringify({
        addon,
        event,
        configHash: configStr ? identityHash(configStr, cid) : undefined,
      }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Silenzioso: la dashboard potrebbe essere offline
  }
}
