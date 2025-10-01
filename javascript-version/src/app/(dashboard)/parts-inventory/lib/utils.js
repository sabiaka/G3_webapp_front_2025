// Utility helpers for Parts Inventory legacy app

// Sanitize for display
export function s(v, fallback = '') {
  if (v === null || v === undefined) return fallback;
  if (v === 'null' || v === 'undefined') return fallback;
  
return String(v);
}

// Extract numeric rack id from element/id like "rack-1"
export function getRackNumericId(rackLike) {
  if (!rackLike) return null;
  const id = parseInt(String(rackLike.id ?? rackLike).replace(/[^0-9]/g, ''), 10);

  
return Number.isFinite(id) ? id : null;
}

// Last rack selection storage helpers, keyed by apiBase
export function createLastRackStorage(apiBase) {
  const key = `pi:lastRackId:${apiBase || 'same-origin'}`;

  const setLastRackId = id => {
    try {
      if (id) localStorage.setItem(key, id);
      else localStorage.removeItem(key);
    } catch {}
  };

  const getLastRackId = () => {
    try { return localStorage.getItem(key); } catch { return null; }
  };

  
return { setLastRackId, getLastRackId };
}

// Transform backend API data shape to internal app data shape
export function transformApiDataToAppData(apiData) {
  return apiData.map(rack => {
    const slotsObject = {};
    let maxRow = rack.rows || 0;
    let maxCol = rack.cols || 0;

    if (rack.slots) {
      rack.slots.forEach(slot => {
        if (slot.part) {
          slotsObject[slot.slot_id] = {
            partName: slot.part.part_name,
            partModelNumber: slot.part.part_model_number,
            quantity: slot.part.quantity,
            color: slot.part.color_code
          };
        }

        if (!rack.rows || !rack.cols) {
          const [rowChar, colNumStr] = slot.slot_id.split('-');
          const rowNum = rowChar.charCodeAt(0) - 64;
          const colNum = parseInt(colNumStr);

          if (rowNum > maxRow) maxRow = rowNum;
          if (colNum > maxCol) maxCol = colNum;
        }
      });
    }

    return {
      id: `rack-${rack.rack_id}`,
      name: rack.rack_name,
      rows: maxRow,
      cols: maxCol,
      slots: slotsObject
    };
  });
}
