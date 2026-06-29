import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useKakaoLoader } from '../hooks/useKakaoLoader'

export default function KakaoMapView({ lat, lng }) {
  const containerRef = useRef(null)
  const { ready, error } = useKakaoLoader()

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(containerRef.current, { center: position, level: 5 })
    new kakao.maps.Marker({ position, map })
  }, [ready, lat, lng])

  if (error) {
    return <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
  }

  if (!ready) {
    return (
      <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
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
