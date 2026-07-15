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

// 수심 데이터는 균일한 격자가 아니라 배가 실제로 지나간 측량 항적선(track line) 단위로 존재한다.
// 예전엔 화면을 작은 격자로 쪼개 나눠 받았지만, 항적선 사이 간격이 격자 한 칸보다 넓은 경우가 많아
// 대부분의 칸이 빈 채로 돌아오고 항적선 모양도 끊어져 보였다. 대신 보이는 영역 전체를 한 번에 크게
// 조회해 API가 주는 순서(항적선을 따라 이어진 점들) 그대로 표시한다.
// numOfRows는 300을 넘기면 API가 조용히 빈 결과를 돌려주는 상한이 있어(실측 확인) 300으로 고정한다.
export async function fetchDepthPointsInBounds({ south, north, west, east }) {
  return fetchDepthPoints({ south, north, west, east }, 300)
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
