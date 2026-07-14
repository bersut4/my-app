import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useMapType } from '../contexts/FontSizeContext'

function renderInto(container, { lat, lng, points, mapType, level }) {
  const { kakao } = window
  const isRoute = Array.isArray(points) && points.length > 0
  const center = isRoute
    ? new kakao.maps.LatLng(points[0].lat, points[0].lng)
    : new kakao.maps.LatLng(lat, lng)

  const map = new kakao.maps.Map(container, {
    center,
    level,
    mapTypeId: kakao.maps.MapTypeId[mapType],
  })

  if (isRoute) {
    const path = points.map(p => new kakao.maps.LatLng(p.lat, p.lng))
    new kakao.maps.Polyline({
      path, strokeWeight: 4, strokeColor: '#00B4D8', strokeOpacity: 0.9, strokeStyle: 'solid', map,
    })
    const bounds = new kakao.maps.LatLngBounds()
    path.forEach(pos => {
      bounds.extend(pos)
      new kakao.maps.Marker({ position: pos, map })
    })
    if (path.length > 1) map.setBounds(bounds)
  } else {
    new kakao.maps.Marker({ position: center, map })
  }

  return map
}

export default function KakaoMapView({ lat, lng, points, disableFullscreen = false }) {
  const containerRef = useRef(null)
  const fullContainerRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!ready || !containerRef.current) return
    renderInto(containerRef.current, { lat, lng, points, mapType, level: 5 })
  }, [ready, lat, lng, points, mapType])

  // 전체화면 지도는 다이얼로그 확대 애니메이션이 끝난 뒤(최종 크기가 확정된 시점) 생성해야
  // 카카오맵이 컨테이너 크기를 0으로 잘못 읽어 회색으로 렌더링되는 문제가 없다
  const initFullMap = () => {
    if (!ready || !fullContainerRef.current) return
    const map = renderInto(fullContainerRef.current, { lat, lng, points, mapType, level: 4 })
    map.relayout()
  }

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
    <>
      <Box
        sx={{ position: 'relative', mt: 1, cursor: disableFullscreen ? 'default' : 'pointer' }}
        onClick={(e) => { if (disableFullscreen) return; e.stopPropagation(); setFullscreen(true) }}
      >
        <Box ref={containerRef} sx={{ width: '100%', height: 220, borderRadius: 1, overflow: 'hidden' }} />
        {!disableFullscreen && (
          <Box
            sx={{
              position: 'absolute', right: 8, bottom: 8, bgcolor: 'rgba(0,0,0,0.55)',
              borderRadius: 1, p: 0.5, display: 'flex', pointerEvents: 'none',
            }}
          >
            <FullscreenIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
        )}
      </Box>

      {!disableFullscreen && (
        <Dialog
          open={fullscreen}
          onClose={() => setFullscreen(false)}
          fullScreen
          slotProps={{ transition: { onEntered: initFullMap } }}
        >
          <IconButton
            onClick={() => setFullscreen(false)}
            sx={{
              position: 'absolute', right: 12, top: 12, zIndex: 10000,
              bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box ref={fullContainerRef} sx={{ width: '100%', height: '100%' }} />
        </Dialog>
      )}
    </>
  )
}
