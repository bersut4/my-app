import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useKakaoLoader } from '../hooks/useKakaoLoader'

// 읽기 전용 지도 (마커 표시)
export default function KakaoMapView({ lat, lng }) {
  const containerRef = useRef(null)
  const ready = useKakaoLoader()

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(containerRef.current, { center: position, level: 5 })
    new kakao.maps.Marker({ position, map })
  }, [ready, lat, lng])

  if (!ready) {
    return (
      <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: 220, borderRadius: 1, overflow: 'hidden', mt: 1 }}
    />
  )
}
