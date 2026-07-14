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

export default function KakaoMapView({ lat, lng, disableFullscreen = false }) {
  const containerRef = useRef(null)
  const fullContainerRef = useRef(null)
  const fullMapRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(containerRef.current, {
      center: position,
      level: 5,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    new kakao.maps.Marker({ position, map })
  }, [ready, lat, lng, mapType])

  // 전체화면 지도는 다이얼로그 확대 애니메이션이 끝난 뒤(최종 크기가 확정된 시점) 생성해야
  // 카카오맵이 컨테이너 크기를 0으로 잘못 읽어 회색으로 렌더링되는 문제가 없다
  const initFullMap = () => {
    if (!ready || !fullContainerRef.current) return
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(fullContainerRef.current, {
      center: position,
      level: 4,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    new kakao.maps.Marker({ position, map })
    fullMapRef.current = map
    map.relayout()
    map.setCenter(position)
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
        onClick={() => !disableFullscreen && setFullscreen(true)}
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
              position: 'absolute', right: 12, top: 12, zIndex: 1,
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
