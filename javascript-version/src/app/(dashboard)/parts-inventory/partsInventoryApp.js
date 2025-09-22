// 既存の HTML 内 <script> のロジックをそのまま関数化
// 注意: DOMContentLoaded ラッパーは外し、この関数呼び出し時に初期化します

export function initPartsInventoryApp() {
    // 二重初期化ガード（React Strict Mode の二重実行対策）
    if (typeof window !== 'undefined') {
        if (window.__piAppInitialized) {
            console.debug('PartsInventoryApp already initialized. Skipping duplicate init.');
            return;
        }
        window.__piAppInitialized = true;
    }
    // =============================
    // 画面ロジック概要
    // - レイアウトをサイドバーからタブ形式に変更
    // - ダミーAPIデータをアプリ内部形式へ変換
    // - 上部: ラック選択タブ / 下部: ラックメッシュ + 詳細パネル
    // - 操作: 部品使用・格納・移動、棚QR表示、棚QR一括生成
    // - モーダルは openModal/closeModal で共通管理
    // =============================

    // APIから返ってくるであろうサンプルデータ (フェールバック用)
    const mockApiData = [
        {
            rack_id: 1,
            rack_name: 'スプリング・小物資材ラック',
            slots: [
                { slot_id: 'A-1', part: { part_name: 'ポケットコイル (シングル)', part_model_number: 'PC-S-H20', quantity: 25, color_code: '4A90E2' } },
                { slot_id: 'A-2', part: { part_name: 'ポケットコイル (シングル)', part_model_number: 'PC-S-H20', quantity: 25, color_code: '4A90E2' } },
                { slot_id: 'A-3', part: null },
                { slot_id: 'A-4', part: { part_name: 'ボンネルコイル (セミダブル)', part_model_number: 'BC-SD-H18', quantity: 20, color_code: '50E3C2' } },
                { slot_id: 'B-1', part: { part_name: 'コーナーガード', part_model_number: 'CG-STD', quantity: 500, color_code: '9B9B9B' } },
                { slot_id: 'B-2', part: { part_name: '製品ラベルセット', part_model_number: 'LBL-PREMIUM', quantity: 1000, color_code: 'F5A623' } },
                { slot_id: 'B-3', part: null },
                { slot_id: 'B-4', part: { part_name: '強化縫製糸 (白)', part_model_number: 'THD-W-HV', quantity: 50, color_code: 'E9E9E9' } },
                { slot_id: 'C-1', part: null },
                { slot_id: 'C-2', part: { part_name: 'ボンネルコイル (セミダブル)', part_model_number: 'BC-SD-H18', quantity: 20, color_code: '50E3C2' } },
                { slot_id: 'C-3', part: null },
                { slot_id: 'C-4', part: { part_name: 'ジッパー (200cm)', part_model_number: 'ZIP-200', quantity: 150, color_code: 'D0021B' } }
            ]
        },
        {
            rack_id: 2,
            rack_name: 'ウレタンフォーム保管棚',
            slots: [
                { slot_id: 'A-1', part: { part_name: '低反発ウレタン 20mm (S)', part_model_number: 'MF-T20-S', quantity: 40, color_code: '4A90E2' } },
                { slot_id: 'A-2', part: { part_name: '低反発ウレタン 20mm (S)', part_model_number: 'MF-T20-S', quantity: 40, color_code: '4A90E2' } },
                { slot_id: 'A-3', part: { part_name: '高反発ウレタン 30mm (S)', part_model_number: 'HR-T30-S', quantity: 40, color_code: '7ED321' } },
                { slot_id: 'A-4', part: { part_name: '高反発ウレタン 30mm (S)', part_model_number: 'HR-T30-S', quantity: 40, color_code: '7ED321' } },
                { slot_id: 'A-5', part: null },
                { slot_id: 'A-6', part: null },
                { slot_id: 'B-1', part: { part_name: '低反発ウレタン 20mm (SD)', part_model_number: 'MF-T20-SD', quantity: 30, color_code: '4A90E2' } },
                { slot_id: 'B-2', part: { part_name: '低反発ウレタン 20mm (SD)', part_model_number: 'MF-T20-SD', quantity: 30, color_code: '4A90E2' } },
                { slot_id: 'B-3', part: { part_name: '高反発ウレタン 30mm (SD)', part_model_number: 'HR-T30-SD', quantity: 30, color_code: '7ED321' } },
                { slot_id: 'B-4', part: { part_name: '高反発ウレタン 30mm (SD)', part_model_number: 'HR-T30-SD', quantity: 30, color_code: '7ED321' } },
                { slot_id: 'B-5', part: null },
                { slot_id: 'B-6', part: null },
                { slot_id: 'C-1', part: { part_name: 'ラテックスフォーム 40mm (D)', part_model_number: 'LTX-T40-D', quantity: 20, color_code: 'F8E71C' } },
                { slot_id: 'C-2', part: null },
                { slot_id: 'C-3', part: null },
                { slot_id: 'C-4', part: null },
                { slot_id: 'C-5', part: null },
                { slot_id: 'C-6', part: null }
            ]
        },
        {
            rack_id: 3,
            rack_name: '生地・充填材ラック',
            slots: [
                { slot_id: 'A-1', part: { part_name: 'ニット生地 (クール)', part_model_number: 'FAB-KN-COOL', quantity: 15, color_code: 'BD10E0' } },
                { slot_id: 'A-2', part: { part_name: 'ニット生地 (オーガニック)', part_model_number: 'FAB-KN-OGN', quantity: 15, color_code: 'BD10E0' } },
                { slot_id: 'A-3', part: null },
                { slot_id: 'B-1', part: { part_name: 'フェルトパッド (ハード)', part_model_number: 'FLT-HD-S', quantity: 200, color_code: '9B9B9B' } },
                { slot_id: 'B-2', part: { part_name: 'フェルトパッド (ハード)', part_model_number: 'FLT-HD-S', quantity: 200, color_code: '9B9B9B' } },
                { slot_id: 'B-3', part: { part_name: 'フェルトパッド (ソフト)', part_model_number: 'FLT-SF-S', quantity: 200, color_code: '4A4A4A' } }
            ]
        }
    ];

    // 表示用サニタイズ
    function s(v, fallback = '') {
        if (v === null || v === undefined) return fallback;
        if (v === 'null' || v === 'undefined') return fallback;
        return String(v);
    }

    // APIエンドポイントのベースURL
    // 優先度: URLクエリ ?apiBase= → window.API_BASE → 同一オリジン(空文字)
    const apiBase = new URLSearchParams(location.search).get('apiBase') || window.API_BASE || '';

    // ラック内部ID("rack-1")から数値IDを取り出すヘルパー
    function getRackNumericId(rack) {
        if (!rack) return null;
        const id = parseInt(String(rack.id).replace(/[^0-9]/g, ''), 10);
        return Number.isFinite(id) ? id : null;
    }

    // APIのslotレスポンスをアプリ内部形式に変換
    function mapApiSlotToAppPart(slot) {
        if (!slot) return null;
        return {
            partName: slot.part_name,
            partModelNumber: slot.part_model_number || '',
            quantity: slot.quantity,
            color: (slot.color_code || '').toString().replace(/^#/, '')
        };
    }

    // 汎用fetch(JSON)ヘルパー
    async function fetchJson(url, options = {}) {
        const res = await fetch(url, options);
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${res.statusText} - ${txt}`);
        }
        // Handle 204 No Content or non-JSON responses gracefully
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (res.status === 204) return null;
        if (!contentType.includes('application/json')) {
            const txt = await res.text().catch(() => '');
            if (!txt) return null;
            try { return JSON.parse(txt); } catch { return null; }
        }
        // Normal JSON
        return res.json().catch(() => null);
    }

    // ラック一覧 + 各ラック詳細(スロット)を取得
    async function loadRacksFromApi() {
        const list = await fetchJson(`${apiBase}/api/racks`);
        const racksWithDetails = await Promise.all(
            list.map(async rack => {
                try {
                    const detail = await fetchJson(`${apiBase}/api/racks/${rack.rack_id}`);
                    const slotsObj = detail.slots || {};
                    const slotsArr = Object.entries(slotsObj).map(([slotId, part]) => ({
                        slot_id: slotId,
                        part: part
                            ? {
                                part_name: part.part_name,
                                part_model_number: part.part_model_number,
                                quantity: part.quantity,
                                color_code: part.color_code
                            }
                            : null
                    }));
                    return {
                        rack_id: detail.rack_id,
                        rack_name: detail.rack_name,
                        rows: detail.rows,
                        cols: detail.cols,
                        slots: slotsArr
                    };
                } catch (e) {
                    console.error('ラック詳細取得に失敗:', rack.rack_id, e);
                    return {
                        rack_id: rack.rack_id,
                        rack_name: rack.rack_name,
                        rows: rack.rows,
                        cols: rack.cols,
                        slots: []
                    };
                }
            })
        );
        return racksWithDetails;
    }

    // APIデータをアプリ内部で使いやすい形式に変換
    function transformApiDataToAppData(apiData) {
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

    // ===== アプリ全体の状態 =====
    let racks = [];
    let currentRackId = null;
    let selectedSlotId = null;
    let isMoveMode = false;
    let moveOriginSlotId = null;
    // 移動 API の二重送信防止フラグ
    let isPostingMove = false;

    // ===== DOM参照の取得 =====
    const rackNameEl = document.getElementById('rack-name');
    const rackTabsEl = document.getElementById('rack-tabs');
    const detailsPanel = document.getElementById('details-panel');
    const searchInput = document.getElementById('search-parts');
    // MUI Dialog bridge is provided by React component ModalBridge
    const bulkQrBtn = document.getElementById('bulk-qr-btn');
    const fabMain = document.getElementById('fab-main');
    const fabIcon = document.getElementById('fab-icon');
    const fabMenuItems = document.querySelectorAll('.fab-item');

    // 初期描画
    function renderApp() {
        renderRackTabs();
        renderCurrentRack();
        updateDetails(null);
    }

    // ラックタブ
    function renderRackTabs() {
        rackTabsEl.innerHTML = '';
        racks.forEach(rack => {
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.rackId = rack.id;
            a.className = `rack-tab-item group whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${rack.id === currentRackId ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`;
            a.innerHTML = `
        <ion-icon name="server-outline" class="mr-2 text-lg"></ion-icon>
        <span class="truncate">${rack.name}</span>
        <button data-action="delete-rack" data-rack-id="${rack.id}" data-rack-name="${rack.name}" class="ml-3 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <ion-icon name="trash-outline" class="pointer-events-none"></ion-icon>
        </button>
      `;
            rackTabsEl.appendChild(a);
        });
    }

    // メッシュラック
    function renderCurrentRack() {
        const rackDisplayArea = document.getElementById('rack-display-area');
        rackDisplayArea.innerHTML = '';
        const currentRack = racks.find(r => r.id === currentRackId);

        if (!currentRack) {
            rackNameEl.textContent = 'ラックがありません';
            rackDisplayArea.innerHTML = '<p class="text-center text-gray-500 p-10">右下のボタンから新しいラックを作成してください。</p>';
            bulkQrBtn.classList.add('hidden');
            return;
        }

        bulkQrBtn.classList.remove('hidden');
        rackNameEl.textContent = currentRack.name;

        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'grid bg-white';
        layoutContainer.style.gridTemplateColumns = 'auto 1fr';
        layoutContainer.style.gridTemplateRows = 'auto 1fr';

        const corner = document.createElement('div');
        corner.className = 'w-12 h-8 sticky left-0 top-0 z-20 bg-white';
        layoutContainer.appendChild(corner);

        const colHeadersContainer = document.createElement('div');
        colHeadersContainer.className = 'grid sticky top-0 z-10 bg-white';
        colHeadersContainer.style.gridTemplateColumns = `repeat(${currentRack.cols}, 9rem)`;
        colHeadersContainer.style.gap = '1rem';
        colHeadersContainer.style.paddingLeft = '1rem';
        for (let c = 1; c <= currentRack.cols; c++) {
            const header = document.createElement('div');
            header.className = 'h-8 flex items-end justify-center font-bold text-gray-500 rounded-md transition-colors duration-200';
            header.textContent = c;
            if (selectedSlotId && selectedSlotId.split('-')[1] == c) {
                header.classList.add('header-highlight');
            }
            colHeadersContainer.appendChild(header);
        }
        layoutContainer.appendChild(colHeadersContainer);

        const rowHeadersContainer = document.createElement('div');
        rowHeadersContainer.className = 'grid sticky left-0 bg-white z-10';
        rowHeadersContainer.style.gridTemplateRows = `repeat(${currentRack.rows}, 9rem)`;
        rowHeadersContainer.style.gap = '1rem';
        rowHeadersContainer.style.paddingTop = '1rem';
        for (let r = 1; r <= currentRack.rows; r++) {
            const rowChar = String.fromCharCode(64 + r);
            const header = document.createElement('div');
            header.className = 'w-12 flex items-center justify-center font-bold text-gray-500 rounded-md transition-colors duration-200';
            header.textContent = rowChar;
            if (selectedSlotId && selectedSlotId.split('-')[0] === rowChar) {
                header.classList.add('header-highlight');
            }
            rowHeadersContainer.appendChild(header);
        }
        layoutContainer.appendChild(rowHeadersContainer);

        const rackContainer = document.createElement('div');
        rackContainer.id = 'mesh-rack';
        rackContainer.className = 'grid gap-4 bg-gray-200 p-4 rounded-xl shadow-inner';
        rackContainer.style.gridTemplateColumns = `repeat(${currentRack.cols}, 9rem)`;
        rackContainer.style.gridTemplateRows = `repeat(${currentRack.rows}, 9rem)`;

        for (let r = 1; r <= currentRack.rows; r++) {
            const rowChar = String.fromCharCode(64 + r);
            for (let c = 1; c <= currentRack.cols; c++) {
                const slotId = `${rowChar}-${c}`;
                const part = currentRack.slots[slotId];
                const slot = document.createElement('div');
                slot.id = `slot-${slotId}`;
                slot.dataset.slotId = slotId;
                slot.className = 'rack-slot aspect-square bg-gray-300/50 rounded-lg flex flex-col justify-between p-2 cursor-pointer transition-all duration-300 hover:bg-gray-300';
                let content = `<div class="text-sm font-bold text-gray-500">${slotId}</div>`;
                                if (part) {
                                        content += `
            <div class="text-center overflow-hidden min-w-0">
              <div class="w-full h-4 rounded-full mb-2" style="background-color: ${part.color ? '#' + part.color : '#e5e7eb'};"></div>
              <p class="font-bold text-gray-800 text-sm truncate">${s(part.partName)}</p>
              <p class="text-xs text-gray-500 truncate">${s(part.partModelNumber, '')}</p>
            </div>
            <div class="text-right text-lg font-bold">${part.quantity}</div>`;
                } else if (isMoveMode) {
                    slot.classList.add('move-mode-empty');
                }
                slot.innerHTML = content;
                rackContainer.appendChild(slot);
            }
        }
        layoutContainer.appendChild(rackContainer);
        rackDisplayArea.appendChild(layoutContainer);

        if (selectedSlotId) {
            const selectedEl = document.getElementById(`slot-${selectedSlotId}`);
            if (selectedEl) selectedEl.classList.add('selected-slot');
        }
        if (isMoveMode && moveOriginSlotId) {
            const originEl = document.getElementById(`slot-${moveOriginSlotId}`);
            if (originEl) originEl.classList.add('move-mode-origin');
        }
    }

    // 詳細パネル
    function updateDetails(slotId) {
        selectedSlotId = slotId;
        const currentRack = racks.find(r => r.id === currentRackId);
        let content = '';

        if (!currentRack) {
            detailsPanel.innerHTML = '<div class="text-center text-gray-500 py-10"><ion-icon name="grid-outline" class="text-5xl mx-auto"></ion-icon><p class="mt-2">ラックを選択してください</p></div>';
            renderCurrentRack();
            return;
        }

        const part = slotId ? currentRack.slots[slotId] : null;

        if (part) {
            content = `
        <div class="fade-in">
          <div class="flex items-center mb-4"><div class="w-4 h-4 rounded-full mr-3" style="background-color: ${part.color ? '#' + part.color : '#e5e7eb'};"></div><h3 class="text-xl font-bold">${s(part.partName)}</h3></div>
          <div class="space-y-2 text-sm">
            <p><strong class="w-24 inline-block text-gray-500">部品型番:</strong> ${s(part.partModelNumber, 'N/A')}</p>
            <p><strong class="w-24 inline-block text-gray-500">現在庫数:</strong> <span class="text-2xl font-bold">${part.quantity}</span></p>
            <p><strong class="w-24 inline-block text-gray-500">保管場所:</strong> <span class="text-lg font-bold">${currentRack.name} / ${slotId}</span></p>
          </div>
          <div class="mt-6 border-t pt-4 space-y-2">
            <button data-action="use" data-slot-id="${slotId}" class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">部品を使用</button>
            <button data-action="move" data-slot-id="${slotId}" class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">箱を移動</button>
            <div class="grid grid-cols-2 gap-2">
              <button data-action="edit" data-slot-id="${slotId}" class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center"><ion-icon name="pencil-outline" class="mr-2"></ion-icon>編集</button>
              <button data-action="delete" data-slot-id="${slotId}" class="w-full bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 flex items-center justify-center"><ion-icon name="trash-bin-outline" class="mr-2"></ion-icon>削除</button>
            </div>
            <hr class="my-2"/>
            <button data-action="show-shelf-qr" data-slot-id="${slotId}" class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center"><ion-icon name="grid-outline" class="mr-2"></ion-icon>棚QRコードを生成</button>
          </div>
        </div>`;
        } else if (slotId) {
            content = `
        <div class="fade-in text-center py-6">
          <p class="text-lg font-bold mb-2">場所: ${currentRack.name} / ${slotId}</p>
          <ion-icon name="archive-outline" class="text-5xl text-gray-400 mx-auto"></ion-icon>
          <p class="mt-2 text-gray-500">この場所は空です</p>
          <div class="mt-6 space-y-2">
            <button data-action="store" data-slot-id="${slotId}" class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">新しい箱を格納</button>
            <button data-action="show-shelf-qr" data-slot-id="${slotId}" class="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center justify-center"><ion-icon name="grid-outline" class="mr-2"></ion-icon>棚QRコードを生成</button>
          </div>
        </div>`;
        } else {
            content = `
        <div class="text-center text-gray-500 py-10">
          <ion-icon name="grid-outline" class="text-5xl mx-auto"></ion-icon>
          <p class="mt-2">ラックの場所を選択して詳細を表示</p>
        </div>`;
        }
        detailsPanel.innerHTML = content;
        renderCurrentRack();
    }

    // モーダル
    function openModalWithBridge({ title = '', html = '', actions = [], maxWidth = 'sm', onOpen = null } = {}) {
        if (typeof window.__pi_openModal === 'function') {
            window.__pi_openModal({ title, html, actions, maxWidth, onOpen });
        } else {
            console.warn('Modal bridge not ready; falling back to alert');
            alert('モーダルを開けません (Bridge未初期化)');
        }
    }
    function closeModal() {
        if (typeof window.__pi_closeModal === 'function') window.__pi_closeModal();
    }

    function showAddRackModal() {
                openModalWithBridge({
            title: '新しいラックを作成',
            html: `
      <div class="p-6">
        <form id="add-rack-form" class="space-y-4">
          <div>
            <label for="new-rack-name" class="text-sm font-medium text-gray-700">ラック名</label>
            <input id="new-rack-name" name="rackName" required class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" placeholder="例: A棟-3F-スチール棚">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="new-rack-rows" class="text-sm font-medium text-gray-700">縦 (行数)</label>
              <input id="new-rack-rows" name="rows" type="number" min="1" max="26" required class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" value="5">
            </div>
            <div>
              <label for="new-rack-cols" class="text-sm font-medium text-gray-700">横 (列数)</label>
              <input id="new-rack-cols" name="cols" type="number" min="1" max="50" required class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" value="5">
            </div>
          </div>
                </form>
            </div>
            <div class="p-4 bg-gray-100 flex justify-end space-x-2 rounded-b-xl">
                <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
                <button id="confirm-add-rack-btn" type="submit" form="add-rack-form" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">作成</button>
            </div>`,
            onOpen: () => {
                document.getElementById('add-rack-form').onsubmit = async e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const payload = {
                rack_name: formData.get('rackName'),
                rows: Number(formData.get('rows')),
                cols: Number(formData.get('cols'))
            };
            try {
                const created = await fetchJson(`${apiBase}/api/racks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const newRack = {
                    id: `rack-${created.rack_id}`,
                    name: created.rack_name || payload.rack_name,
                    rows: created.rows || payload.rows,
                    cols: created.cols || payload.cols,
                    slots: {}
                };
                racks.push(newRack);
                currentRackId = newRack.id;
                renderApp();
                closeModal();
            } catch (err) {
                console.error('ラック作成に失敗', err);
                alert('ラックの作成に失敗しました。サーバーの状態を確認してください。');
            }
                };
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

    function showDeleteRackModal(rackId, rackName) {
        const rackToDelete = racks.find(r => r.id === rackId);
        const hasParts = Object.values(rackToDelete.slots).some(slot => slot !== null);
        const warningMessage = hasParts
            ? '<p class="text-red-600 bg-red-100 p-3 rounded-lg text-sm mt-4"><ion-icon name="warning-outline" class="mr-2"></ion-icon>このラックには部品が保管されています。削除すると部品情報も失われます。</p>'
            : '';

                openModalWithBridge({
            title: 'ラックの削除',
            html: `
      <div class="p-6">
        <p class="mt-2 text-sm text-gray-600">本当に「<strong class="text-gray-900">${rackName}</strong>」を削除しますか？<br>この操作は取り消せません。</p>
        ${warningMessage}
      </div>
      <div class="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
        <button id="confirm-delete-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">削除</button>
            </div>`,
            onOpen: () => {
                document.getElementById('confirm-delete-btn').onclick = async () => {
            try {
                const rackNumericId = parseInt(String(rackId).replace(/[^0-9]/g, ''), 10);
                if (!Number.isFinite(rackNumericId)) throw new Error('無効なrack_id');
                await fetchJson(`${apiBase}/api/racks/${rackNumericId}`, { method: 'DELETE' });
                racks = racks.filter(r => r.id !== rackId);
                if (currentRackId === rackId) {
                    currentRackId = racks.length > 0 ? racks[0].id : null;
                }
                renderApp();
                closeModal();
            } catch (err) {
                console.error('ラック削除に失敗', err);
                alert('ラックの削除に失敗しました。サーバーの状態を確認してください。');
            }
                };
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

    function showUsePartModal(slotId) {
        const currentRack = racks.find(r => r.id === currentRackId);
        const part = currentRack.slots[slotId];
                openModalWithBridge({
            title: `「${s(part.partName)}」を使用`,
            html: `
      <div class="p-6">
        <div class="p-4 rounded-lg">
          <label for="use-quantity" class="block text-sm font-medium text-gray-700">使用する数量</label>
          <p class="text-xs text-gray-500 mb-2">(現在庫: ${part.quantity})</p>
          <input id="use-quantity" type="number" min="1" max="${part.quantity}" class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" placeholder="数量を入力">
          <p id="use-error" class="mt-2 text-sm text-red-600 hidden"></p>
        </div>
      </div>
      <div class="p-4 bg-gray-100 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
        <button id="confirm-use-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">確定</button>
            </div>`,
            onOpen: () => {
                const qtyInput = document.getElementById('use-quantity');
                const errEl = document.getElementById('use-error');
                const confirmBtn = document.getElementById('confirm-use-btn');

        function showErrorMsg(msg) {
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        }
        function hideErrorMsg() {
            errEl.textContent = '';
            errEl.classList.add('hidden');
        }
        function validateUseInput() {
            const v = parseInt(qtyInput.value);
            if (!Number.isFinite(v) || v < 1) {
                showErrorMsg('1以上の数量を入力してください。');
                confirmBtn.disabled = true;
                return false;
            }
            if (v > part.quantity) {
                showErrorMsg(`現在庫数(${part.quantity})を超えています。`);
                confirmBtn.disabled = true;
                return false;
            }
            hideErrorMsg();
            confirmBtn.disabled = false;
            return true;
        }

        qtyInput.addEventListener('input', validateUseInput);
        validateUseInput();

        document.getElementById('confirm-use-btn').onclick = async () => {
            if (!validateUseInput()) {
                qtyInput.focus();
                return;
            }
            const quantity = parseInt(qtyInput.value);
            const rackNumericId = getRackNumericId(currentRack);
            if (!Number.isFinite(rackNumericId)) {
                alert('ラックIDの解決に失敗しました');
                return;
            }
            try {
                const res = await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(slotId)}/use`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity_to_use: quantity })
                });
                const remain = res && res.remaining_quantity != null ? Number(res.remaining_quantity) : NaN;
                if (Number.isFinite(remain)) {
                    if (remain <= 0) {
                        currentRack.slots[slotId] = null;
                    } else {
                        part.quantity = remain;
                    }
                } else {
                    part.quantity -= quantity;
                    if (part.quantity <= 0) currentRack.slots[slotId] = null;
                }
                updateDetails(slotId);
                closeModal();
            } catch (err) {
                console.error('使用APIに失敗', err);
                alert('部品の使用に失敗しました。サーバーの状態を確認してください。');
            }
        };
        document.getElementById('cancel-btn').onclick = closeModal;
      }
    });
    }

    function showDeletePartModal(slotId) {
        const currentRack = racks.find(r => r.id === currentRackId);
        const part = currentRack.slots[slotId];
        openModalWithBridge({
            title: '箱の削除',
            html: `
      <div class="p-6">
        <p class="mt-2 text-sm text-gray-600">本当に「<strong class="text-gray-900">${s(part.partName)}</strong>」を棚から削除しますか？</p>
        <p class="text-red-600 bg-red-100 p-3 rounded-lg text-sm mt-4"><ion-icon name="warning-outline" class="mr-2"></ion-icon>この操作は取り消せません。</p>
      </div>
      <div class="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
        <button id="confirm-delete-part-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">削除</button>
      </div>`,
            onOpen: () => {
                document.getElementById('confirm-delete-part-btn').onclick = async () => {
                    const rackNumericId = getRackNumericId(currentRack);
                    if (!Number.isFinite(rackNumericId)) {
                        alert('ラックIDの解決に失敗しました');
                        return;
                    }
                    try {
                        await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(slotId)}`, { method: 'DELETE' });
                        currentRack.slots[slotId] = null;
                        updateDetails(slotId);
                        closeModal();
                    } catch (err) {
                        console.error('部品削除に失敗', err);
                        alert('部品の削除に失敗しました。サーバーの状態を確認してください。');
                    }
                };
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

        function showEditPartModal(slotId) {
                const currentRack = racks.find(r => r.id === currentRackId);
                const part = currentRack.slots[slotId];
                const colorPalette = ['4A90E2', '50E3C2', 'F5A623', 'D0021B', '9013FE', '7ED321', 'F8E71C', 'BD10E0', '4A4A4A', 'E9E9E9'];
                const colorPaletteHtml = colorPalette
                        .map(color => `<button type="button" data-color="${color}" class="color-swatch w-8 h-8 rounded-full border-2" style="background-color: #${color};"></button>`)
                        .join('');

                openModalWithBridge({
                        title: '箱の情報を編集',
                        html: `
            <style>
                .color-swatch.selected { outline: 2px solid #4f46e5; outline-offset: 2px; }
            </style>
            <div class="p-6">
                <form id="edit-part-form" class="space-y-4">
                    <div>
                        <label class="text-sm font-medium text-gray-700">部品名</label>
                        <input name="partName" required class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" value="${s(part.partName)}">
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">部品型番 (任意)</label>
                        <input name="partModelNumber" class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" value="${s(part.partModelNumber, '')}">
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">数量</label>
                        <input name="quantity" type="number" min="0" required class="w-full bg-gray-100 focus:bg-white border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3" value="${part.quantity}">
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">カラーラベル</label>
                        <div id="color-palette" class="flex flex-wrap gap-2 mt-2 p-2 bg-white rounded-md">${colorPaletteHtml}</div>
                        <input type="hidden" name="color" value="${s(part.color, '')}">
                    </div>
                </form>
            </div>
            <div class="p-4 bg-gray-100 flex justify-end space-x-2 rounded-b-xl">
                <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
                <button id="confirm-edit-part-btn" type="submit" form="edit-part-form" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">保存</button>
            </div>`,
                        onOpen: () => {
                                const colorPaletteEl = document.getElementById('color-palette');
                                const hiddenColorInput = document.querySelector('input[name="color"]');

                                const initialColor = (part.color || '').toString().toUpperCase();
                                const initialColorEl = initialColor ? colorPaletteEl.querySelector(`[data-color="${initialColor}"]`) : null;
                                if (initialColorEl) initialColorEl.classList.add('selected');

                                colorPaletteEl.addEventListener('click', e => {
                                        const swatch = e.target.closest('.color-swatch');
                                        if (!swatch) return;
                                        colorPaletteEl.querySelector('.selected')?.classList.remove('selected');
                                        swatch.classList.add('selected');
                                        hiddenColorInput.value = swatch.dataset.color;
                                });

                                document.getElementById('edit-part-form').onsubmit = async e => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        const newQuantity = parseInt(formData.get('quantity'));
                                        const rackNumericId = getRackNumericId(currentRack);
                                        if (!Number.isFinite(rackNumericId)) {
                                                alert('ラックIDの解決に失敗しました');
                                                return;
                                        }

                                        if (newQuantity === 0) {
                                                try {
                                                        await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(slotId)}`, { method: 'DELETE' });
                                                        currentRack.slots[slotId] = null;
                                                        updateDetails(slotId);
                                                        closeModal();
                                                } catch (err) {
                                                        console.error('部品削除(数量0)に失敗', err);
                                                        alert('削除に失敗しました。サーバーをご確認ください。');
                                                }
                                                return;
                                        }

                                        const body = {
                                                part_name: formData.get('partName'),
                                                part_model_number: (formData.get('partModelNumber') || '').toString().trim() || null,
                                                quantity: newQuantity,
                                                color_code: (formData.get('color') || '').toString().replace(/^#/, '') || null
                                        };

                                        try {
                                            const res = await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(slotId)}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(body)
                                                });
                                            const saved = (res && res.slot) ? res.slot : body;
                                                currentRack.slots[slotId] = mapApiSlotToAppPart(saved);
                                                updateDetails(slotId);
                                                closeModal();
                                        } catch (err) {
                                                console.error('部品更新に失敗', err);
                                                alert('更新に失敗しました。サーバーの状態を確認してください。');
                                        }
                                };
                                document.getElementById('cancel-btn').onclick = closeModal;
                        }
                });
        }

    function showStorePartModal(callback) {
                openModalWithBridge({
            title: '新しい部品の情報を入力',
            html: `
      <div class="p-6">
        <form id="store-form" class="space-y-4">
          <div><label class="text-sm font-medium text-gray-700">部品名</label><input name="partName" required class="w-full bg-gray-100 focus:bg白 border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"></div>
          <div><label class="text-sm font-medium text-gray-700">部品型番 (任意)</label><input name="partModelNumber" class="w-full bg-gray-100 focus:bg白 border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"></div>
          <div><label class="text-sm font-medium text-gray-700">数量</label><input name="quantity" type="number" min="1" required class="w-full bg-gray-100 focus:bg白 border-gray-300 rounded-md mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"></div>
        </form>
      </div>
      <div class="p-4 bg-gray-100 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
        <button id="confirm-store-btn" type="submit" form="store-form" class="px-4 py-2 bg-indigo-600 text白 rounded-md hover:bg-indigo-700">棚をスキャンして格納</button>
            </div>`,
            onOpen: () => {
                document.getElementById('store-form').onsubmit = e => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newPart = {
                partName: formData.get('partName'),
                partModelNumber: formData.get('partModelNumber'),
                quantity: parseInt(formData.get('quantity')),
                color: ['4A90E2', '50E3C2', 'F5A623', 'D0021B', '9013FE'][Math.floor(Math.random() * 5)]
            };
            callback(newPart);
                };
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

    function showQrScannerModal(title, instruction, onScan) {
                openModalWithBridge({
            title: title,
            html: `
      <div class="p-6 text-center">
        <div class="grid grid-cols-2 gap-4 items-center">
          <div class="text-center">
            <ion-icon name="grid-outline" class="text-6xl text-gray-400 mx-auto"></ion-icon>
            <p class="mt-2 font-semibold">${instruction}</p>
          </div>
          <div class="bg-black aspect-square rounded-lg flex items-center justify-center relative overflow-hidden">
            <p class="text-gray-500">カメラ入力</p>
            <div class="scanner-line absolute left-0 h-1 bg-red-500 w-full"></div>
          </div>
        </div>
      </div>
      <div class="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">キャンセル</button>
            </div>`,
            onOpen: () => {
                setTimeout(() => onScan(), 2000);
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

    function showShelfQrModal(slotId) {
        const currentRack = racks.find(r => r.id === currentRackId);
        if (!currentRack) return;
        const rackNumericId = parseInt(String(currentRack.id).replace(/[^0-9]/g, ''), 10);
        const payload = {
            type: 'rack_slot',
            rack_id: Number.isFinite(rackNumericId) ? rackNumericId : currentRack.id,
            slot_identifier: slotId
        };
        const qrData = encodeURIComponent(JSON.stringify(payload));
                openModalWithBridge({
            title: '棚QRコード',
            html: `
      <div class="p-6 text-center">
        <p class="text-sm text-gray-600 mb-4">このQRコードを印刷して棚の<br><strong>${slotId}</strong>の場所に貼り付けてください。</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}" alt="QR Code" class="mx-auto border-4">
        <p class="mt-2 font-semibold">${currentRack.name}</p>
        <p class="text-xs text-gray-500">場所: ${slotId}</p>
      </div>
      <div class="p-4 bg-gray-50 flex justify-end space-x-2 rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">閉じる</button>
        <button id="print-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">印刷</button>
            </div>`,
            onOpen: () => {
                document.getElementById('print-btn').onclick = () => console.log('印刷処理を実行 (ダミー)');
                document.getElementById('cancel-btn').onclick = closeModal;
            }
        });
    }

    function showBulkShelfQrModal(rack) {
        let qrGridHtml = '';
        for (let r = 1; r <= rack.rows; r++) {
            const rowChar = String.fromCharCode(64 + r);
            for (let c = 1; c <= rack.cols; c++) {
                const slotId = `${rowChar}-${c}`;
                const rackNumericId = parseInt(String(rack.id).replace(/[^0-9]/g, ''), 10);
                const payload = {
                    type: 'rack_slot',
                    rack_id: Number.isFinite(rackNumericId) ? rackNumericId : rack.id,
                    slot_identifier: slotId
                };
                const qrData = encodeURIComponent(JSON.stringify(payload));
                qrGridHtml += `
          <div class="qr-item border rounded-md p-2 flex flex-col items-center justify-center bg-white">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}" alt="QR Code" class="mx-auto">
            <p class="mt-2 font-bold text-center text-sm">${rack.name}</p>
            <p class="font-mono text-center text-lg">${slotId}</p>
          </div>`;
            }
        }
                const modalHtml = `
            <style>
                #printable-qrs { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
                @media print {
                    .modal-header, .modal-footer { display: none !important; }
                    #printable-qrs { grid-template-columns: repeat(${rack.cols}, 1fr); max-height: none !important; overflow: visible !important; }
                }
            </style>
      <div class="p-6 modal-header">
        <h3 class="text-lg font-bold mb-2">棚QRコード一括生成</h3>
        <p class="text-sm text-gray-600">「${rack.name}」のすべての棚QRコードです。印刷して貼り付けてください。</p>
      </div>
      <div id="printable-qrs" class="p-4 max-h-[60vh] overflow-y-auto bg-gray-100">${qrGridHtml}</div>
      <div class="p-4 bg-gray-50 flex justify-end space-x-2 modal-footer rounded-b-xl">
        <button id="cancel-btn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">閉じる</button>
        <button id="print-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">印刷</button>
            </div>`;
                openModalWithBridge({ title: '棚QRコード一括生成', html: modalHtml, maxWidth: 'lg', onOpen: () => {
                    document.getElementById('print-btn').onclick = () => window.print();
                    document.getElementById('cancel-btn').onclick = () => closeModal();
                }});
    }

    // FABメニューの開閉
    fabMain?.addEventListener('click', () => {
        const isExpanded = fabMain.getAttribute('aria-expanded') === 'true';
        fabMain.setAttribute('aria-expanded', (!isExpanded).toString());
        fabIcon?.classList.toggle('rotate-45');
        if (!isExpanded) {
            fabMenuItems.forEach((item, index) => {
                item.style.transitionDelay = `${index * 40}ms`;
                item.style.transform = 'scale(1)';
            });
        } else {
            fabMenuItems.forEach(item => {
                item.style.transform = 'scale(0)';
            });
        }
    });

    // FAB: ラック作成
    document.getElementById('add-rack-btn')?.addEventListener('click', showAddRackModal);

    // FAB: QR入庫
    document.getElementById('qr-stock-in-btn')?.addEventListener('click', () => {
        showStorePartModal(newPart => {
            showQrScannerModal('QR入庫', '棚QRコードを読み取ってください', async () => {
                const currentRack = racks.find(r => r.id === currentRackId);
                if (!currentRack) {
                    console.error('対象のラックが見つかりません。');
                    closeModal();
                    return;
                }

                let emptySlot = null;
                for (let r = 1; r <= currentRack.rows; r++) {
                    const rowChar = String.fromCharCode(64 + r);
                    for (let c = 1; c <= currentRack.cols; c++) {
                        const slotId = `${rowChar}-${c}`;
                        if (!currentRack.slots[slotId]) {
                            emptySlot = slotId;
                            break;
                        }
                    }
                    if (emptySlot) break;
                }

                if (!emptySlot) {
                    closeModal();
                    console.error('現在のラックに空きがありません。');
                    return;
                }

                const rackNumericId = getRackNumericId(currentRack);
                if (!Number.isFinite(rackNumericId)) {
                    alert('ラックIDの解決に失敗しました');
                    return;
                }
                const body = {
                    part_name: newPart.partName,
                    part_model_number: (newPart.partModelNumber || '').toString().trim() || null,
                    quantity: newPart.quantity,
                    color_code: (newPart.color || '').toString().replace(/^#/, '') || null
                };
                try {
                    const res = await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(emptySlot)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    const saved = (res && res.slot) ? res.slot : body;
                    currentRack.slots[emptySlot] = mapApiSlotToAppPart(saved);
                    updateDetails(emptySlot);
                    closeModal();
                } catch (err) {
                    console.error('部品の格納に失敗', err);
                    alert('格納に失敗しました。サーバーの状態を確認してください。');
                }
            });
        });
    });

    // FAB: QR出庫
    document.getElementById('qr-stock-out-btn')?.addEventListener('click', () => {
        showQrScannerModal('QR出庫', '出庫する棚QRコードを読み取ってください', async () => {
            const currentRack = racks.find(r => r.id === currentRackId);
            if (!currentRack) {
                console.error('対象のラックが見つかりません。');
                closeModal();
                return;
            }
            let targetSlot = null;
            outer: for (let r = 1; r <= currentRack.rows; r++) {
                const rowChar = String.fromCharCode(64 + r);
                for (let c = 1; c <= currentRack.cols; c++) {
                    const slotId = `${rowChar}-${c}`;
                    if (currentRack.slots[slotId]) {
                        targetSlot = slotId;
                        break outer;
                    }
                }
            }
            closeModal();
            if (!targetSlot) {
                alert('このラックに出庫可能な部品が見つかりません。');
                return;
            }
            updateDetails(targetSlot);
            showUsePartModal(targetSlot);
        });
    });

    // 一括QR生成
    bulkQrBtn?.addEventListener('click', () => {
        const currentRack = racks.find(r => r.id === currentRackId);
        if (currentRack) showBulkShelfQrModal(currentRack);
    });

    // ラックタブのクリック
    rackTabsEl?.addEventListener('click', e => {
        e.preventDefault();
        const tab = e.target.closest('.rack-tab-item');
        const deleteBtn = e.target.closest('[data-action="delete-rack"]');
        if (deleteBtn) {
            showDeleteRackModal(deleteBtn.dataset.rackId, deleteBtn.dataset.rackName);
        } else if (tab) {
            currentRackId = tab.dataset.rackId;
            selectedSlotId = null;
            isMoveMode = false;
            renderApp();
        }
    });

    // 詳細パネルの操作
    detailsPanel?.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const { action, slotId } = button.dataset;
        const currentRack = racks.find(r => r.id === currentRackId);
        if (!currentRack) return;
        switch (action) {
            case 'use':
                showUsePartModal(slotId);
                break;
            case 'store':
                showStorePartModal(async newPart => {
                    const rackNumericId = getRackNumericId(currentRack);
                    if (!Number.isFinite(rackNumericId)) {
                        alert('ラックIDの解決に失敗しました');
                        return;
                    }
                    const body = {
                        part_name: newPart.partName,
                        part_model_number: (newPart.partModelNumber || '').toString().trim() || null,
                        quantity: newPart.quantity,
                        color_code: (newPart.color || '').toString().replace(/^#/, '') || null
                    };
                    try {
                        const res = await fetchJson(`${apiBase}/api/racks/${rackNumericId}/slots/${encodeURIComponent(slotId)}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });
                        const saved = (res && res.slot) ? res.slot : body;
                        currentRack.slots[slotId] = mapApiSlotToAppPart(saved);
                        updateDetails(slotId);
                        closeModal();
                    } catch (err) {
                        console.error('部品の格納に失敗', err);
                        alert('格納に失敗しました。スロットが空か、サーバーの状態をご確認ください。');
                    }
                });
                break;
            case 'move':
                isMoveMode = true;
                moveOriginSlotId = slotId;
                detailsPanel.innerHTML = `<div class="fade-in text-center py-10"><ion-icon name="move-outline" class="text-5xl text-indigo-500 mx-auto"></ion-icon><p class="mt-2 font-bold">移動先の空き場所を選択してください</p><p class="text-sm text-gray-500">(移動元: ${slotId})</p><button id="cancel-move-btn" class="mt-4 text-sm text-red-600">移動をキャンセル</button></div>`;
                document.getElementById('cancel-move-btn').onclick = () => {
                    isMoveMode = false;
                    moveOriginSlotId = null;
                    updateDetails(slotId);
                };
                renderCurrentRack();
                break;
            case 'show-shelf-qr':
                showShelfQrModal(slotId);
                break;
            case 'edit':
                showEditPartModal(slotId);
                break;
            case 'delete':
                showDeletePartModal(slotId);
                break;
        }
    });

    // メッシュラックのクリック処理（移動/選択）
    document.body.addEventListener('click', e => {
        const rackDisplayArea = document.getElementById('rack-display-area');
        if (rackDisplayArea && rackDisplayArea.contains(e.target)) {
            const slotEl = e.target.closest('.rack-slot');
            if (!slotEl) return;
            const clickedSlotId = slotEl.dataset.slotId;
            const currentRack = racks.find(r => r.id === currentRackId);
            if (!currentRack) return;

            if (isMoveMode) {
                if (!currentRack.slots[clickedSlotId] && clickedSlotId !== moveOriginSlotId) {
                    const rackNumericId = getRackNumericId(currentRack);
                    if (!Number.isFinite(rackNumericId)) {
                        alert('ラックIDの解決に失敗しました');
                        return;
                    }
                    if (isPostingMove) {
                        // すでに送信中なら無視（ダブルクリック・二重リスナ対策）
                        return;
                    }
                    (async () => {
                        try {
                            isPostingMove = true;
                            await fetchJson(`${apiBase}/api/racks/move/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    from_rack_id: rackNumericId,
                                    from_slot_identifier: moveOriginSlotId,
                                    to_rack_id: rackNumericId,
                                    to_slot_identifier: clickedSlotId
                                })
                            });
                            // サーバーが204や空レスを返してもここまで来たら成功として扱い、ローカル状態を更新
                            currentRack.slots[clickedSlotId] = currentRack.slots[moveOriginSlotId];
                            currentRack.slots[moveOriginSlotId] = null;
                            isMoveMode = false;
                            moveOriginSlotId = null;
                            updateDetails(clickedSlotId);
                            console.debug('部品移動: UI更新完了');
                        } catch (err) {
                            console.error('移動に失敗', err);
                            alert('移動に失敗しました。スロットの状態やサーバーをご確認ください。');
                        } finally {
                            isPostingMove = false;
                        }
                    })();
                }
            } else {
                updateDetails(clickedSlotId);
            }
        }
    });

    // 部品検索
    searchInput?.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        document.querySelectorAll('.rack-slot').forEach(slot => {
            slot.classList.remove('highlight-slot');
            const currentRack = racks.find(r => r.id === currentRackId);
            if (!currentRack || searchTerm.length < 2) return;
            const part = currentRack.slots[slot.dataset.slotId];
            if (
                part &&
                (part.partName.toLowerCase().includes(searchTerm) || (part.partModelNumber && part.partModelNumber.toLowerCase().includes(searchTerm)))
            ) {
                slot.classList.add('highlight-slot');
            }
        });
    });

    // モーダルの黒背景クリックで閉じる
    // Backdrop click handled by MUI Dialog

    // 初期データロード
    (async function init() {
        const rackNameEl2 = document.getElementById('rack-name');
        if (rackNameEl2) rackNameEl2.textContent = '読み込み中...';
        try {
            const apiData = await loadRacksFromApi();
            racks = transformApiDataToAppData(apiData);
            currentRackId = racks.length > 0 ? racks[0].id : null;
        } catch (e) {
            console.error('APIからのデータ取得に失敗したため、モックデータを使用します。', e);
            racks = transformApiDataToAppData(mockApiData);
            currentRackId = racks.length > 0 ? racks[0].id : null;
        }
        renderApp();
    })();
}
