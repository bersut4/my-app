// 국립해양조사원 어장정보(TL_DIST_FSHFRM, data.go.kr 15130109)를 정적 JSON으로 변환해
// public/fishery-licenses.json에 번들. 전국 14,858건이라 서버 조회 대신 한 번만 받아 클라이언트에서
// 화면 범위로 걸러 보여준다.
let cache = null

export async function fetchFisheryLicenses() {
  if (cache) return cache
  const base = import.meta.env.BASE_URL
  const res = await fetch(`${base}fishery-licenses.json`)
  if (!res.ok) throw new Error('어장정보를 불러오지 못했어요.')
  cache = await res.json()
  return cache
}

export function filterLicensesInBounds(records, bounds) {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return records.filter(r => r.y >= sw.getLat() && r.y <= ne.getLat() && r.x >= sw.getLng() && r.x <= ne.getLng())
}

export function licenseStatus(record, today = new Date().toISOString().slice(0, 10)) {
  if (!record.e) return 'unknown'
  return record.e >= today ? 'valid' : 'expired'
}

export function daysUntilExpiry(record, today = new Date()) {
  if (!record.e) return null
  const end = new Date(record.e)
  return Math.round((end - today) / 86400000)
}

export const FISHERY_CATEGORY_COLOR = {
  양식어업: '#22C55E',
  '양식어업(한정)': '#22C55E',
  마을어업: '#3B82F6',
  '마을어업(한정)': '#3B82F6',
  정치망어업: '#A855F7',
}
