// lib/pg/pg-event.ts
'use client';

export type PgMeta  = { type: 'blockly-type'; id: string };
export type PgEvent = {
  event: string;
  message?: string;
  reasons?: unknown;
  state?: unknown;
};

declare global {
  interface Window {
    __PG_INIT_DATA__?: string | null;
    __PG_META__?: PgMeta;
  }
}

const DEFAULT_META: PgMeta = { type: 'blockly-type', id: '' };
const getTarget = () => (window.parent || window.top || window);

// Init meta una vez
(function initMetaOnce() {
  if (typeof window === 'undefined') return;
  if (window.__PG_META__) return;
  const id = new URLSearchParams(window.location.search).get('id') ?? '';
  window.__PG_META__ = { ...DEFAULT_META, id };
})();

export const setMeta = (meta: PgMeta) => { window.__PG_META__ = meta; };
const getMeta = (): PgMeta => window.__PG_META__ ?? DEFAULT_META;

export const sendPgEvent = ({ event, message, reasons, state }: PgEvent) => {
  const meta = getMeta();
  const safeState =
    state === undefined
      ? undefined
      : typeof state === 'string'
        ? state
        : JSON.stringify({ data: state });

  const packet = {
    type: meta.type,
    id:   meta.id,
    event,
    message,
    reasons,
    state: safeState,
  };

  // Debug: muestra exactamente lo que se va a emitir por postMessage.
  console.log('[sendPgEvent]', packet);

  try {
    getTarget().postMessage(packet, '*');
  } catch (e) {
    console.error('[sendPgEvent] postMessage failed', e, packet);
  }
};

export const waitInit = (timeout = 2000): Promise<string | null> => {
  if (window.__PG_INIT_DATA__ != null) return Promise.resolve(window.__PG_INIT_DATA__);

  return new Promise(resolve => {
    const to = setTimeout(() => {
      window.removeEventListener('message', handler as any);
      resolve(null);
    }, timeout);

    function handler(e: MessageEvent<any>) {
      const d = e.data;
      if (d?.type === 'init' && typeof d.data === 'string') {
        clearTimeout(to);
        window.removeEventListener('message', handler as any);
        window.__PG_INIT_DATA__ = d.data;
        resolve(d.data);
      }
    }

    window.addEventListener('message', handler as any);

    // si el padre necesita que lo pidan
    try { getTarget().postMessage({ type: 'request-init' }, '*'); } catch {}
  });
};
