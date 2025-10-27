(function () {
    // ---------- Utilities ----------
    function $(id) {
        return document.getElementById(id);
    }
    function setText(id, text) {
        var el = $(id);
        if (el) el.textContent = text;
    }
    function setHTML(id, html) {
        var el = $(id);
        if (el) el.innerHTML = html;
    }
    function pad2(n) {
        n = Number(n) || 0;
        return (n < 10 ? '0' : '') + Math.floor(n);
    }
    function formatDateYMD(iso) {
        if (!iso) return '--/--/--';
        return String(iso).replace(/-/g, '/');
    }
    function formatNumber(n) {
        var num = Number(n) || 0;
        try {
            return num.toLocaleString('ja-JP');
        } catch (e) {
            return String(num);
        }
    }
    function formatHMFromSeconds(seconds) {
        var sec = Math.max(0, Math.floor(Number(seconds) || 0));
        var d = Math.floor(sec / 86400);
        var h = Math.floor((sec % 86400) / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;
        var parts = [];
        if (d) parts.push(d + '<span class="text-3xl">d</span>');
        parts.push(h + '<span class="text-3xl">h</span>');
        parts.push(m + '<span class="text-3xl">m</span>');
        parts.push('<span class="text-2xl">' + String(s).padStart(2, '0') + '</span><span class="text-2xl">s</span>');
        return parts.join(' ');
    }

    // ---------- Clock ----------
    function updateClock() {
        const n = new Date();
        const t = $('time');
        const e = $('date');
        const hh = String(n.getHours()).padStart(2, '0');
        const mm = String(n.getMinutes()).padStart(2, '0');
        const ss = String(n.getSeconds()).padStart(2, '0');
        const y = n.getFullYear();
        const mo = String(n.getMonth() + 1).padStart(2, '0');
        const d = String(n.getDate()).padStart(2, '0');
        const wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][n.getDay()];
        if (t) t.textContent = `${hh}:${mm}`;
        if (e) e.textContent = `${y}/${mo}/${d} (${wk})`;
        return `${hh}:${mm}:${ss}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // ---------- Machine left panel (API) ----------
    var uptimeTimer = null;
    function startUptimeSince(startIso) {
        var startMs = Date.parse(startIso);
        if (!isFinite(startMs)) return;
        function tick() {
            var diffSec = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
            var h = Math.floor(diffSec / 3600);
            var m = Math.floor((diffSec % 3600) / 60);
            var s = diffSec % 60;
            setText('uptime-since-start', '起動から: ' + pad2(h) + ':' + pad2(m) + ':' + pad2(s));
            setHTML('today-uptime', formatHMFromSeconds(diffSec));
        }
        try { if (uptimeTimer) clearInterval(uptimeTimer); } catch (e) { }
        tick();
        uptimeTimer = setInterval(tick, 1000);
    }

    if (window.MachineAPI && typeof window.MachineAPI.getMachine === 'function') {
        window.MachineAPI.getMachine(1, { timeoutMs: 5000 })
            .then(function (data) {
                if (data && typeof data === 'object') {
                    if (data.machine_name) setText('machine-name', data.machine_name);
                    if (data.today_production_count != null) setText('today-production-count', formatNumber(data.today_production_count));
                    if (data.last_inspection_date) setText('last-inspection-date', formatDateYMD(data.last_inspection_date));
                    if (data.next_inspection_date) setText('next-inspection-date', formatDateYMD(data.next_inspection_date));
                    if (data.started_at) startUptimeSince(data.started_at);
                }
            })
            .catch(function (err) {
                console.warn('Machine data fetch failed:', err && (err.message || err));
                try {
                    var list = $('error-log-list');
                    if (list) {
                        var now = new Date();
                        var ts = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
                        list.insertAdjacentHTML('afterbegin',
                            '<div class="flex justify-between items-center bg-yellow-900/50 p-3 rounded-md">' +
                            '<div><p class="font-semibold text-yellow-300">W-API: 機械情報の取得に失敗</p>' +
                            '<p class="text-sm text-yellow-400">' + (err && err.code === 'TIMEOUT' ? 'タイムアウトしました。' : 'ネットワーク/サーバーエラー。') + '</p></div>' +
                            '<span class="text-sm text-gray-400 whitespace-nowrap">' + ts + '</span></div>'
                        );
                    }
                } catch (e) { /* noop */ }
            });
    }

    // ---------- Alert & Error logs ----------
    const alertScreen = $('evangelion-alert');
    const alertErrorCode = $('alert-error-code');
    const alertErrorMessage = $('alert-error-message');
    const errorLogList = $('error-log-list');
    const machineStatus = $('machine-status');

    function showErrorAlert(title, message) {
        if (!alertScreen) return;
        if (alertErrorCode) alertErrorCode.textContent = title;
        if (alertErrorMessage) alertErrorMessage.textContent = message;
        alertScreen.classList.remove('hidden');
        setTimeout(function () { alertScreen.classList.add('hidden'); }, 5000);
    }

    function addErrorLog(code, message, type) {
        const now = updateClock();
        let bg, accent, titleCls;
        if (type === 'error') {
            bg = 'bg-red-900/50'; accent = 'text-red-400'; titleCls = 'text-red-300';
        } else if (type === 'warning') {
            bg = 'bg-yellow-900/50'; accent = 'text-yellow-400'; titleCls = 'text-yellow-300';
        } else {
            bg = 'bg-gray-900'; accent = 'text-gray-400'; titleCls = 'text-gray-300';
        }
        const row = '\n<div class="flex justify-between items-center ' + bg + ' p-3 rounded-md">\n' +
            '  <div>\n' +
            '    <p class="font-semibold ' + titleCls + '">' + code + '</p>\n' +
            (message ? ('    <p class="text-sm ' + accent + '">' + message + '</p>') : '') +
            '  </div>\n' +
            '  <span class="text-sm text-gray-400 whitespace-nowrap">' + now + '</span>\n' +
            '</div>';
        if (errorLogList) errorLogList.insertAdjacentHTML('afterbegin', row);
    }

    const sampleErrors = [
        { code: 'モータートルク異常', message: 'モーターの負荷が規定値を超えました。', type: 'error' },
        { code: 'フェンス内異物検知', message: '安全フェンス内で異物を検知しました。', type: 'error' },
        { code: '非常停止ボタン取り扱い', message: '非常停止ボタンが押されました。', type: 'warning' }
    ];

    const debugErrorBtn = $('debug-error-btn');
    const debugWarningBtn = $('debug-warning-btn');
    const debugNormalBtn = $('debug-normal-btn');

    if (debugErrorBtn) debugErrorBtn.addEventListener('click', function () {
        const e = sampleErrors.filter(function (x) { return x.type === 'error'; })[Math.floor(Math.random() * 2)];
        if (!e) return;
        if (machineStatus) {
            machineStatus.textContent = 'エラー';
            machineStatus.className = 'px-4 py-2 text-xl font-semibold rounded-full bg-red-500 text-red-900';
        }
        addErrorLog(e.code, e.message, e.type);
        showErrorAlert(e.code, e.message);
        setOverallInspectionStatus('FAIL');
        // ついでにランダムに1台だけFAILに
        setTileStatus(Math.ceil(Math.random() * 4), 'FAIL');
    });

    if (debugWarningBtn) debugWarningBtn.addEventListener('click', function () {
        const e = sampleErrors.find(function (x) { return x.type === 'warning'; });
        if (!e) return;
        if (machineStatus) {
            machineStatus.textContent = '警告';
            machineStatus.className = 'px-4 py-2 text-xl font-semibold rounded-full bg-yellow-500 text-yellow-900';
        }
        addErrorLog(e.code, e.message, e.type);
    });

    if (debugNormalBtn) debugNormalBtn.addEventListener('click', function () {
        if (machineStatus) {
            machineStatus.textContent = '正常';
            machineStatus.className = 'px-4 py-2 text-xl font-semibold rounded-full bg-green-500 text-green-900';
        }
        addErrorLog('I-003: 状態リセット', '手動で正常状態に復帰しました。', 'info');
        setOverallInspectionStatus('PASS');
        for (var i = 1; i <= 4; i++) setTileStatus(i, 'PASS');
    });

    // ---------- Inspection Status (overall + per tile) ----------
    function setOverallInspectionStatus(status) {
        var el = $('inspection-status');
        if (!el) return;
        var isPass = String(status).toUpperCase() === 'PASS';
        el.textContent = isPass ? 'PASS' : 'FAIL';
        el.classList.remove('text-green-400', 'text-red-400');
        el.classList.add(isPass ? 'text-green-400' : 'text-red-400');
    }

    function setTileStatus(index, status) {
        var badge = $('cam' + index + '-badge');
        if (!badge) return;
        var isPass = String(status).toUpperCase() === 'PASS';
        badge.className = 'absolute top-3 right-4 flex items-center gap-1 px-3 py-1 rounded-full ' +
            (isPass ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900') + ' text-sm font-bold';
        badge.innerHTML = '<ion-icon name="' + (isPass ? 'checkmark-circle' : 'close-circle') + '" class="text-xl"></ion-icon>' +
            (isPass ? ' PASS' : ' FAIL');
    }

    function updateInspectionInfo(rotId, timeStr) {
        if (rotId != null) setText('rot-id', String(rotId));
        if (timeStr != null) setText('inspection-time', String(timeStr));
    }

    // 初期表示: 検査時間を現在時刻に、全台PASS
    (function initInspectionDefaults() {
        var now = new Date();
        var hh = String(now.getHours()).padStart(2, '0');
        var mm = String(now.getMinutes()).padStart(2, '0');
        var ss = String(now.getSeconds()).padStart(2, '0');
        setText('inspection-time', hh + ':' + mm + ':' + ss);
        for (var i = 1; i <= 4; i++) setTileStatus(i, 'PASS');
        setOverallInspectionStatus('PASS');
    })();

    // expose small API for future integration
    window.Signage = {
        setOverallInspectionStatus: setOverallInspectionStatus,
        setTileStatus: setTileStatus,
        updateInspectionInfo: updateInspectionInfo,
    };
})();
