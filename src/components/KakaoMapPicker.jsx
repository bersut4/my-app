import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useMapType } from '../contexts/FontSizeContext'

export default function KakaoMapPicker({ value, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()

  useEffect(() => {
    if (!ready || !containerRef.current) return

    const { kakao } = window
    const defaultCenter = new kakao.maps.LatLng(36.5, 127.8)
    const center = value ? new kakao.maps.LatLng(value.lat, value.lng) : defaultCenter

    const map = new kakao.maps.Map(containerRef.current, {
      center,
      level: 9,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    mapRef.current = map

    if (value) {
      markerRef.current = new kakao.maps.Marker({ position: center, map })
    }

    kakao.maps.event.addListener(map, 'click', (e) => {
      const latlng = e.latLng
      const lat = latlng.getLat()
      const lng = latlng.getLng()

      if (markerRef.current) markerRef.current.setMap(null)
      markerRef.current = new kakao.maps.Marker({ position: latlng, map })

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.coord2Address(lng, lat, (result, status) => {
        let name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        if (status === kakao.maps.services.Status.OK && result[0]) {
          name = result[0].address?.address_name || name
        }
        onChange({ lat, lng, name })
      })
    })

    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
          map.setCenter(loc)
          map.setLevel(7)
        },
        () => {},
        { timeout: 3000 }
      )
    }
  }, [ready, mapType])

  if (error) {
    return (
      <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!ready) {
    return (
      <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    )
  }

  return (
    <Box>
      <Box
        ref={containerRef}
        sx={{ width: '100%', height: 320, borderRadius: 1, overflow: 'hidden' }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        지도를 클릭하면 위치가 선택됩니다
      </Typography>
    </Box>
  )
}
