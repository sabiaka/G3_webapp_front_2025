/*
 * Machine API client for legacy signage pages
 * - Fetches /api/machines/{id} (id defaults to 1)
 * - Exposes a global `window.MachineAPI` UMD-style for easy use in plain HTML
 * - Includes 5s timeout and basic error handling
 *
 * Usage in HTML:
 *   <script src="/machine-signage/machine-api.js"></script>
 *   <script>
 *     MachineAPI.getMachine().then(console.log).catch(console.error)
 *   </script>
 */
(function (global) {
    'use strict';

    var DEFAULT_ID = 1;
    var DEFAULT_TIMEOUT_MS = 5000; // 5 seconds

    /**
     * Build API URL. Per repo rules, clients still request `/api/...` even with basePath.
     * @param {number|string} id
     * @returns {string}
     */
    function buildUrl(id) {
        return '/api/machines/' + String(id);
    }

    /**
     * Fetch JSON with timeout and helpful errors
     * @param {string} url
     * @param {number} timeoutMs
     * @returns {Promise<any>}
     */
    function fetchJson(url, timeoutMs) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeoutMs);

        return fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } })
            .then(function (res) {
                clearTimeout(timer);
                if (!res.ok) {
                    var err = new Error('API error: ' + res.status + ' ' + res.statusText);
                    err.status = res.status;
                    throw err;
                }
                return res.json();
            })
            .catch(function (err) {
                // Normalize AbortError to a clearer message
                if (err && (err.name === 'AbortError' || err.code === 'ABORT_ERR')) {
                    var e = new Error('API timeout after ' + timeoutMs + 'ms');
                    e.code = 'TIMEOUT';
                    throw e;
                }
                throw err;
            });
    }

    /**
     * Get machine data
     * レスポンス例:
     * {
     *   "machine_id": 1,
     *   "machine_name": "半自動表層バネどめ機",
     *   "started_at": "2025-10-01T10:04:56Z",
     *   "today_uptime_seconds": 48650,
     *   "today_uptime_hms": "13:30:50",
     *   "today_production_count": 19,
     *   "last_inspection_date": "2025-10-24",
     *   "next_inspection_date": "2026-01-22",
     *   "inspection_interval_days": 90
     * }
     * @param {number} [id=1]
     * @param {{ timeoutMs?: number }} [opts]
     * @returns {Promise<object>}
     */
    function getMachine(id, opts) {
        if (id == null) id = DEFAULT_ID;
        opts = opts || {};
        var timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;
        var url = buildUrl(id);
        return fetchJson(url, timeoutMs);
    }

    // Minimal utility: safe accessor for h:m:s formatting if needed later
    function secondsToHMS(seconds) {
        seconds = Math.max(0, Math.floor(Number(seconds) || 0));
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        return pad(h) + ':' + pad(m) + ':' + pad(s);
    }

    // UMD-style export
    var api = { getMachine: getMachine, _secondsToHMS: secondsToHMS };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        global.MachineAPI = api;
    }
})(typeof window !== 'undefined' ? window : this);
