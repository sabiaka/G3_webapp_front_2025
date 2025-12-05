// 共通のステータス・サマリー計算ユーティリティ

const clampPercent = value => {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return 0
  if (num < 0) return 0
  if (num > 100) return 100
  return Math.round(num)
}

const toFiniteNumber = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (value == null) return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export const mapStatusApiToUi = status => {
  const normalized = (status || '').toString().trim().toUpperCase()
  if (!normalized) return '-'
  if (normalized === 'PASS' || normalized === 'OK') return 'OK'
  if (normalized === 'FAIL' || normalized === 'NG') return 'NG'
  if (normalized === 'MISSING') return 'MISSING'
  return normalized
}

export const computeShotSummary = shots => {
  const list = Array.isArray(shots) ? shots : []
  if (list.length === 0) return null

  let total = 0
  let okCount = 0

  list.forEach(item => {
    total += 1
    const status = mapStatusApiToUi(item?.status)
    if (status === 'OK') okCount += 1
  })

  const ngCount = Math.max(total - okCount, 0)
  const okRate = total ? Math.round((okCount / total) * 100) : 0
  const ngRate = total ? Math.max(0, Math.min(100, 100 - okRate)) : 0

  return {
    total,
    okCount,
    ngCount,
    okRate,
    ngRate,
  }
}

export const normalizeShotSummary = (rawSummary, fallbackShots) => {
  if (!rawSummary || typeof rawSummary !== 'object') {
    return computeShotSummary(fallbackShots)
  }

  const totalRaw = toFiniteNumber(rawSummary.total ?? rawSummary.total_count ?? rawSummary.totalCount)
  const okRaw = toFiniteNumber(rawSummary.ok_count ?? rawSummary.pass_count ?? rawSummary.okCount ?? rawSummary.passCount)
  const ngRaw = toFiniteNumber(rawSummary.ng_count ?? rawSummary.fail_count ?? rawSummary.ngCount ?? rawSummary.failCount)

  let total = totalRaw
  let okCount = okRaw
  let ngCount = ngRaw

  if (!Number.isFinite(total)) {
    if (Number.isFinite(okCount) && Number.isFinite(ngCount)) {
      total = okCount + ngCount
    } else if (Number.isFinite(okCount)) {
      total = okCount + Math.max(toFiniteNumber(rawSummary.missing_count) ?? 0, 0)
    } else if (Number.isFinite(ngCount)) {
      total = ngCount + Math.max(toFiniteNumber(rawSummary.missing_count) ?? 0, 0)
    } else if (Array.isArray(fallbackShots)) {
      total = fallbackShots.length
    } else {
      total = 0
    }
  }

  if (!Number.isFinite(okCount)) {
    if (Number.isFinite(ngCount) && Number.isFinite(total)) {
      okCount = Math.max(total - ngCount, 0)
    } else if (Array.isArray(fallbackShots)) {
      const computed = computeShotSummary(fallbackShots)
      okCount = computed?.okCount ?? 0
      if (!Number.isFinite(ngCount)) ngCount = computed?.ngCount ?? 0
      if (!Number.isFinite(total)) total = computed?.total ?? 0
    } else {
      okCount = 0
    }
  }

  if (!Number.isFinite(ngCount)) {
    if (Number.isFinite(total) && Number.isFinite(okCount)) {
      ngCount = Math.max(total - okCount, 0)
    } else {
      ngCount = 0
    }
  }

  let okRate = toFiniteNumber(rawSummary.ok_rate ?? rawSummary.pass_rate ?? rawSummary.okRate ?? rawSummary.passRate)
  if (!Number.isFinite(okRate) && Number.isFinite(total) && total > 0 && Number.isFinite(okCount)) {
    okRate = (okCount / total) * 100
  }

  let ngRate = toFiniteNumber(rawSummary.ng_rate ?? rawSummary.fail_rate ?? rawSummary.ngRate ?? rawSummary.failRate)
  if (!Number.isFinite(ngRate)) {
    if (Number.isFinite(okRate)) {
      ngRate = 100 - okRate
    } else if (Number.isFinite(total) && total > 0 && Number.isFinite(ngCount)) {
      ngRate = (ngCount / total) * 100
    }
  }

  return {
    total: Number.isFinite(total) ? Math.max(Math.round(total), 0) : 0,
    okCount: Number.isFinite(okCount) ? Math.max(Math.round(okCount), 0) : 0,
    ngCount: Number.isFinite(ngCount) ? Math.max(Math.round(ngCount), 0) : 0,
    okRate: clampPercent(okRate),
    ngRate: clampPercent(ngRate),
  }
}
