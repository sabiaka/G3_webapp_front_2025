// 共通ユーティリティ（正規化・日付関連）

// APIの新しい仕様に合わせてデータを正規化
export function normalizeInstruction(apiItem) {
    const id = apiItem.id
    const line = apiItem.line || apiItem.line_name || 'その他'

    const productName = apiItem.product_name || apiItem.title || ''
    const size = apiItem.size || apiItem.spec || ''
    const title = [productName, size].filter(Boolean).join(' ').trim() || productName || apiItem.title || ''

    const productNameField = productName
    const sizeField = size
    const springType = apiItem.spring_type || apiItem.springType || null
    const includedItems = apiItem.included_items || apiItem.includedItems || null

    const completed = typeof apiItem.is_completed === 'boolean' ? apiItem.is_completed : (apiItem.completed === true)

    const color = apiItem.color || ''
    const shippingMethod = apiItem.shipping_method || apiItem.shippingMethod || apiItem.shippingMethodName || ''
    const destination = apiItem.destination || ''
    const remarks = apiItem.remarks || ''
    const note = apiItem.included_items || apiItem.note || ''
    const quantity = typeof apiItem.quantity === 'number' ? apiItem.quantity : (apiItem.qty ? Number(apiItem.qty) : (apiItem.quantity || 0))
    const createdAt = apiItem.created_at || apiItem.createdAt || null

    return { id, line, title, completed, color, shippingMethod, destination, remarks, note, quantity, createdAt, productName: productNameField, size: sizeField, springType, includedItems }
}

// ローカルタイムゾーンの YYYY-MM-DD を返す
export function formatLocalYmd(dateObj = new Date()) {
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// datetime-local 文字列("YYYY-MM-DDTHH:mm")や Date/ISO を、ローカルオフセット付きの ISO 文字列に変換
// 例: 2025-10-17T10:30 -> 2025-10-17T10:30:00+09:00
export function toOffsetIso(input) {
    if (!input) return null
    let d
    if (typeof input === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            const [y, m, day] = input.split('-').map(Number)
            d = new Date(y, (m || 1) - 1, day || 1, 0, 0, 0)
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
            d = new Date(input)
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input)) {
            d = new Date(input)
        } else {
            d = new Date(input)
        }
    } else {
        d = new Date(input)
    }
    if (isNaN(d.getTime())) return null
    const pad = n => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const HH = pad(d.getHours())
    const MM = pad(d.getMinutes())
    const SS = pad(d.getSeconds())
    const tzMin = -d.getTimezoneOffset()
    const sign = tzMin >= 0 ? '+' : '-'
    const abs = Math.abs(tzMin)
    const tzh = pad(Math.floor(abs / 60))
    const tzm = pad(abs % 60)
    return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}${sign}${tzh}:${tzm}`
}

// ISO文字列やDate等からローカルタイムゾーンのYYYY-MM-DDに変換
export function toLocalYmd(input) {
    if (!input) return ''
    let d
    if (typeof input === 'string') {
        // すでに YYYY-MM-DD ならそのまま返す
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
        d = new Date(input)
    } else {
        d = new Date(input)
    }
    if (isNaN(d.getTime())) return ''
    return formatLocalYmd(d)
}