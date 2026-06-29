import { useState, useEffect } from 'react'

const KEY = import.meta.env.VITE_KAKAO_MAP_KEY
const SCRIPT_ID = 'kakao-map-sdk'

export function useKakaoLoader() {
  const [ready, setReady] = useState(() => !!window.kakao?.maps?.Map)

  useEffect(() => {
    if (window.kakao?.maps?.Map) { setReady(true); return }

    if (document.getElementById(SCRIPT_ID)) {
      const timer = setInterval(() => {
        if (window.kakao?.maps?.Map) { setReady(true); clearInterval(timer) }
      }, 100)
      return () => clearInterval(timer)
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&libraries=services&autoload=false`
    script.onload = () => window.kakao.maps.load(() => setReady(true))
    document.head.appendChild(script)
  }, [])

  return ready
}
