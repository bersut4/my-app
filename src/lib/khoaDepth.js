import { supabase } from './supabase'

// supabase.functions.invoke는 GET 쿼리스트링을 직접 지원하지 않아 fetch로 직접 호출한다
export async function fetchDepthPoints({ south, north, west, east }, numOfRows = 300) {
  const { data: { session } } = await supabase.auth.getSession()
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const token = session?.access_token ?? anonKey
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/depth-proxy?ymin=${south}&ymax=${north}&xmin=${west}&xmax=${east}&numOfRows=${numOfRows}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  })
  if (!res.ok) throw new Error('수심 정보를 불러오지 못했어요.')
  const json = await res.json()
  return json.points ?? []
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
