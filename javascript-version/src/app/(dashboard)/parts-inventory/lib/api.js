// API client for Parts Inventory

// Generic JSON fetch with cache-bypass for GET
export async function fetchJson(url, options = {}) {
  const opts = { ...options };
  const method = (opts.method || 'GET').toUpperCase();
  let finalUrl = url;
  if (method === 'GET') {
    finalUrl = url + (url.includes('?') ? '&' : '?') + `_=ts${Date.now()}`;
    opts.cache = 'no-store';
    opts.headers = { ...(opts.headers || {}), 'Cache-Control': 'no-cache' };
  }
  const res = await fetch(finalUrl, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
  }
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (res.status === 204) return null;
  if (!contentType.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    if (!txt) return null;
    try { return JSON.parse(txt); } catch { return null; }
  }
  return res.json().catch(() => null);
}

export function createApi(apiBase) {
  const base = apiBase || '';
  return {
    listRacks: () => fetchJson(`${base}/api/racks`),
    getRack: rackId => fetchJson(`${base}/api/racks/${rackId}`),
    createRack: payload => fetchJson(`${base}/api/racks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
    deleteRack: rackId => fetchJson(`${base}/api/racks/${rackId}`, { method: 'DELETE' }),

    upsertSlot: (rackId, slotId, body) => fetchJson(`${base}/api/racks/${rackId}/slots/${encodeURIComponent(slotId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    createSlot: (rackId, slotId, body) => fetchJson(`${base}/api/racks/${rackId}/slots/${encodeURIComponent(slotId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    deleteSlot: (rackId, slotId) => fetchJson(`${base}/api/racks/${rackId}/slots/${encodeURIComponent(slotId)}`, { method: 'DELETE' }),
    useSlot: (rackId, slotId, qty) => fetchJson(`${base}/api/racks/${rackId}/slots/${encodeURIComponent(slotId)}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity_to_use: qty })
    }),
    moveSlot: (fromRackId, fromSlotId, toRackId, toSlotId) => fetchJson(`${base}/api/racks/move/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_rack_id: fromRackId,
        from_slot_identifier: fromSlotId,
        to_rack_id: toRackId,
        to_slot_identifier: toSlotId
      })
    })
  };
}

export function mapApiSlotToAppPart(slot) {
  if (!slot) return null;
  return {
    partName: slot.part_name,
    partModelNumber: slot.part_model_number || '',
    quantity: slot.quantity,
    color: (slot.color_code || '').toString().replace(/^#/, '')
  };
}
