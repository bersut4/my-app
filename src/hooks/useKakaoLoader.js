import { useState, useEffect } from 'react'

const KEY = import.meta.env.VITE_KAKAO_MAP_KEY
const SCRIPT_ID = 'kakao-map-sdk'

export function useKakaoLoader() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (window.kakao?.maps?.Map) { setReady(true); return }

    if (!KEY) {
      setError('카카오 지도 API 키가 설정되지 않았습니다.')
      return
    }

    if (document.getElementById(SCRIPT_ID)) {
      const timer = setInterval(() => {
        if (window.kakao?.maps?.Map) { setReady(true); clearInterval(timer) }
      }, 100)
      // 10초 후 타임아웃
      const timeout = setTimeout(() => {
        clearInterval(timer)
        setError('카카오 지도를 불러오지 못했어요. 도메인 등록을 확인해주세요.')
      }, 10000)
      return () => { clearInterval(timer); clearTimeout(timeout) }
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&libraries=services&autoload=false`

    script.onload = () => {
      const timeout = setTimeout(() => {
        setError('카카오 지도를 불러오지 못했어요. 도메인 등록을 확인해주세요.')
      }, 8000)
      window.kakao.maps.load(() => {
        clearTimeout(timeout)
        setReady(true)
      })
    }

    script.onerror = () => {
      setError('카카오 지도 스크립트 로드에 실패했어요. API 키를 확인해주세요.')
    }

    document.head.appendChild(script)
  }, [])

  return { ready, error }
}
