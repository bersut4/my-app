// supabase.functions.invoke는 GET 쿼리스트링을 직접 지원하지 않아 fetch로 직접 호출한다.
// (세션 조회는 이 공개 엔드포인트에 불필요하고 대기가 걸릴 수 있어 anon 키만 사용한다)
export async function fetchDepthPoints({ south, north, west, east }, numOfRows = 300) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!anonKey || !baseUrl) throw new Error('Supabase 설정이 없어요.')

  const url = `${baseUrl}/functions/v1/depth-proxy?ymin=${south}&ymax=${north}&xmin=${west}&xmax=${east}&numOfRows=${numOfRows}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
  })
  if (!res.ok) throw new Error(`수심 정보를 불러오지 못했어요. (HTTP ${res.status})`)
  const json = await res.json()
  return json.points ?? []
}

// 수심 API는 요청 영역을 고르게 샘플링하지 않고 남서쪽 경계부터 순서대로 내려주기 때문에,
// 영역을 격자로 나눠 칸마다 나눠 받아야 지도 전체에 고르게 점이 표시된다.
// 단, 화면을 너무 확대해 보이는 범위가 작을 때 무조건 잘게 쪼개면 각 칸이 150m 데이터 격자보다
// 작아져 오히려 대부분의 칸이 비어버리므로, 실제 보이는 범위(km)에 맞춰 칸 개수를 조절한다
export async function fetchDepthPointsTiled({ south, north, west, east }) {
  const latSpanKm = (north - south) * 111
  const lngSpanKm = (east - west) * 111 * Math.cos((south * Math.PI) / 180)
  const spanKm = Math.max(latSpanKm, lngSpanKm)

  const targetCellKm = 2
  const gridSize = Math.max(1, Math.min(4, Math.round(spanKm / targetCellKm)))
  const rowsPerCell = Math.max(20, Math.round(400 / (gridSize * gridSize)))

  const latStep = (north - south) / gridSize
  const lngStep = (east - west) / gridSize
  const cells = []
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      cells.push({
        south: south + i * latStep,
        north: south + (i + 1) * latStep,
        west: west + j * lngStep,
        east: west + (j + 1) * lngStep,
      })
    }
  }
  const results = await Promise.allSettled(cells.map(cell => fetchDepthPoints(cell, rowsPerCell)))
  const allFailed = results.every(r => r.status === 'rejected')
  if (allFailed) {
    throw results[0].reason instanceof Error ? results[0].reason : new Error('수심 정보를 불러오지 못했어요.')
  }
  return results.flatMap(r => (r.status === 'fulfilled' ? r.value : []))
}

export function depthColor(depth) {
  if (depth < 10) return '#CAF0F8'
  if (depth < 20) return '#90E0EF'
  if (depth < 50) return '#48CAE4'
  if (depth < 100) return '#00B4D8'
  if (depth < 200) return '#0096C7'
  if (depth < 500) return '#0077B6'
  return '#023E8A'
}

export const DEPTH_LEGEND = [
  { label: '~10m', color: '#CAF0F8' },
  { label: '~20m', color: '#90E0EF' },
  { label: '~50m', color: '#48CAE4' },
  { label: '~100m', color: '#00B4D8' },
  { label: '~200m', color: '#0096C7' },
  { label: '~500m', color: '#0077B6' },
  { label: '500m+', color: '#023E8A' },
]
