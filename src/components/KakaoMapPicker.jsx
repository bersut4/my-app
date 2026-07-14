import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import SearchIcon from '@mui/icons-material/Search'
import UndoIcon from '@mui/icons-material/Undo'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useMapType } from '../contexts/FontSizeContext'

const initialModeOf = (value) => (value?.mode === 'route' ? 'route' : 'pin')

export default function KakaoMapPicker({ value, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const routeMarkersRef = useRef([])
  const routePolylineRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()

  const [mode, setMode] = useState(() => initialModeOf(value))
  const modeRef = useRef(mode)
  const [routePoints, setRoutePoints] = useState(value?.mode === 'route' ? value.points : [])

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => { modeRef.current = mode }, [mode])

  const clearRouteOverlays = () => {
    routeMarkersRef.current.forEach(m => m.setMap(null))
    routeMarkersRef.current = []
    if (routePolylineRef.current) { routePolylineRef.current.setMap(null); routePolylineRef.current = null }
  }

  const redrawRoute = (points) => {
    const { kakao } = window
    clearRouteOverlays()
    if (!points.length) return
    const path = points.map(p => new kakao.maps.LatLng(p.lat, p.lng))
    routeMarkersRef.current = path.map(pos => new kakao.maps.Marker({ position: pos, map: mapRef.current }))
    if (path.length > 1) {
      routePolylineRef.current = new kakao.maps.Polyline({
        path, strokeWeight: 4, strokeColor: '#00B4D8', strokeOpacity: 0.9, strokeStyle: 'solid', map: mapRef.current,
      })
    }
  }

  const placePin = (lat, lng, name) => {
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = new kakao.maps.Marker({ position, map: mapRef.current })
    mapRef.current.setCenter(position)
    onChange({ mode: 'pin', lat, lng, name })
  }

  const addRoutePoint = (lat, lng) => {
    setRoutePoints(prev => {
      const next = [...prev, { lat, lng }]
      redrawRoute(next)
      onChange({ mode: 'route', points: next })
      return next
    })
  }

  const undoRoutePoint = () => {
    setRoutePoints(prev => {
      const next = prev.slice(0, -1)
      redrawRoute(next)
      onChange(next.length ? { mode: 'route', points: next } : null)
      return next
    })
  }

  const clearRoute = () => {
    setRoutePoints([])
    clearRouteOverlays()
    onChange(null)
  }

  const switchMode = (_e, newMode) => {
    if (!newMode || newMode === mode) return
    setMode(newMode)
    if (newMode === 'pin') {
      clearRouteOverlays()
      setRoutePoints([])
    } else if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
    }
    onChange(null)
  }

  useEffect(() => {
    if (!ready || !containerRef.current) return

    const { kakao } = window
    const defaultCenter = new kakao.maps.LatLng(36.5, 127.8)
    const initialPoint = value?.mode === 'route' ? value.points[0] : value
    const center = initialPoint ? new kakao.maps.LatLng(initialPoint.lat, initialPoint.lng) : defaultCenter

    const map = new kakao.maps.Map(containerRef.current, {
      center,
      level: 9,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    mapRef.current = map

    if (value?.mode === 'pin') {
      markerRef.current = new kakao.maps.Marker({ position: center, map })
    } else if (value?.mode === 'route' && value.points.length) {
      redrawRoute(value.points)
      if (value.points.length > 1) {
        const bounds = new kakao.maps.LatLngBounds()
        value.points.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)))
        map.setBounds(bounds)
      }
    }

    kakao.maps.event.addListener(map, 'click', (e) => {
      const lat = e.latLng.getLat()
      const lng = e.latLng.getLng()

      if (modeRef.current === 'route') {
        addRoutePoint(lat, lng)
        return
      }

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.coord2Address(lng, lat, (result, status) => {
        let name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        if (status === kakao.maps.services.Status.OK && result[0]) {
          name = result[0].address?.address_name || name
        }
        placePin(lat, lng, name)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mapType])

  const handleSearch = () => {
    if (!query.trim() || !window.kakao) return
    setSearching(true)
    const places = new window.kakao.maps.services.Places()
    places.keywordSearch(query.trim(), (data, status) => {
      setSearching(false)
      setResults(status === window.kakao.maps.services.Status.OK ? data.slice(0, 5) : [])
    })
  }

  const selectResult = (place) => {
    const lat = parseFloat(place.y)
    const lng = parseFloat(place.x)
    if (mode === 'route') {
      addRoutePoint(lat, lng)
      mapRef.current.panTo(new window.kakao.maps.LatLng(lat, lng))
    } else {
      placePin(lat, lng, place.place_name)
      mapRef.current.setLevel(4)
    }
    setResults([])
    setQuery(place.place_name)
  }

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
      <ToggleButtonGroup value={mode} exclusive onChange={switchMode} size="small" fullWidth sx={{ mb: 1 }}>
        <ToggleButton value="pin">핀</ToggleButton>
        <ToggleButton value="route">경로</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Paper sx={{ display: 'flex', alignItems: 'center', pl: 1.5, pr: 0.5 }}>
            <TextField
              variant="standard"
              placeholder="장소 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
              fullWidth
              size="small"
              slotProps={{ input: { disableUnderline: true } }}
            />
            <IconButton size="small" onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? <CircularProgress size={16} /> : <SearchIcon fontSize="small" />}
            </IconButton>
          </Paper>

          {results.length > 0 && (
            <Paper sx={{ maxHeight: 220, overflowY: 'auto' }}>
              <List disablePadding>
                {results.map(place => (
                  <ListItemButton key={place.id} onClick={() => selectResult(place)}>
                    <ListItemText
                      primary={place.place_name}
                      secondary={place.road_address_name || place.address_name}
                      slotProps={{ secondary: { noWrap: true } }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        <Box
          ref={containerRef}
          sx={{ width: '100%', height: 320, borderRadius: 1, overflow: 'hidden' }}
        />

        {mode === 'route' && routePoints.length > 0 && (
          <Paper sx={{ position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 10, p: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ flex: 1 }}>경로 지점 {routePoints.length}개</Typography>
            <Button size="small" startIcon={<UndoIcon />} onClick={undoRoutePoint}>실행취소</Button>
            <Button size="small" color="error" onClick={clearRoute}>초기화</Button>
          </Paper>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {mode === 'route'
          ? '검색하거나 지도를 클릭할 때마다 경로에 지점이 추가돼요'
          : '검색하거나 지도를 클릭하면 위치가 선택됩니다'}
      </Typography>
    </Box>
  )
}
