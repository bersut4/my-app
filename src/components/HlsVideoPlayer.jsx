import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { useState } from 'react'

export default function HlsVideoPlayer({ src, title }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | playing | error

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setStatus('loading')

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      const hls = new Hls({ lowLatencyMode: true })
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing')
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setStatus('error')
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 네이티브 HLS 지원
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing')
        video.play().catch(() => {})
      })
      video.addEventListener('error', () => setStatus('error'))
    } else {
      setStatus('error')
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src])

  return (
    <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#000' }}>
      <Box
        component="video"
        ref={videoRef}
        muted
        playsInline
        controls
        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
      />
      {status === 'loading' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CircularProgress size={32} />
          <Typography variant="caption" color="grey.400">스트림 연결 중...</Typography>
        </Box>
      )}
      {status === 'error' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography variant="body2" color="grey.500">영상을 불러올 수 없어요</Typography>
          <Typography variant="caption" color="grey.600">{title}</Typography>
        </Box>
      )}
    </Box>
  )
}
