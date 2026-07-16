// 국립해양조사원 바다낚시지수 API는 KHOA 인증키가 필요해 Edge Function(fishing-index-proxy)을
// 거쳐 호출한다(depth-proxy/tide-proxy와 동일한 패턴).
export async function fetchFishingIndex() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${baseUrl}/functions/v1/fishing-index-proxy?numOfRows=300`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey } })
  if (!res.ok) throw new Error('낚시지수 정보를 불러오지 못했어요.')
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.items ?? []
}

// 지수는 위치 + 시간대(오전/오후) + 어종마다 따로 내려오므로, 지도에는 위치 하나당 마커 하나로
// 묶어서 보여준다. '기타어종' 지수를 그 위치의 대표 지수로 삼는다(개별 어종 지수는 다이얼로그에서 확인).
export function summarizeFishingIndex(items, targetDate = new Date().toISOString().slice(0, 10)) {
  const todays = items.filter((it) => it.date === targetDate)
  const byLocation = new Map()

  for (const it of todays) {
    if (!byLocation.has(it.name)) {
      byLocation.set(it.name, { name: it.name, lat: it.lat, lng: it.lng, slots: {} })
    }
    const loc = byLocation.get(it.name)
    if (!loc.slots[it.noon]) {
      loc.slots[it.noon] = {
        tide: it.tide,
        waveMin: it.waveMin, waveMax: it.waveMax,
        waterTempMin: it.waterTempMin, waterTempMax: it.waterTempMax,
        windMin: it.windMin, windMax: it.windMax,
        fishes: [],
      }
    }
    loc.slots[it.noon].fishes.push({ fish: it.fish, index: it.index })
  }

  return [...byLocation.values()].map((loc) => {
    const firstSlot = Object.values(loc.slots)[0]
    const rep = firstSlot?.fishes.find((f) => f.fish === '기타어종') ?? firstSlot?.fishes[0]
    return { ...loc, date: targetDate, representativeIndex: rep?.index ?? null }
  })
}

export const FISHING_INDEX_COLOR = {
  매우좋음: '#0EA36C',
  좋음: '#22C55E',
  보통: '#F59E0B',
  나쁨: '#F97316',
  매우나쁨: '#DC2626',
}
