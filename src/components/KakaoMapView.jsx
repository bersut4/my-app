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

function useSyncedMap(containerRef, active, lat, lng, mapType, level) {
  useEffect(() => {
    if (!active || !containerRef.current) return
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(containerRef.current, {
      center: position,
      level,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    new kakao.maps.Marker({ position, map })
  }, [active, lat, lng, mapType, level])
}

export default function KakaoMapView({ lat, lng, disableFullscreen = false }) {
  const containerRef = useRef(null)
  const fullContainerRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()
  const [fullscreen, setFullscreen] = useState(false)

  useSyncedMap(containerRef, ready, lat, lng, mapType, 5)
  useSyncedMap(fullContainerRef, ready && fullscreen, lat, lng, mapType, 4)

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
        <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
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
