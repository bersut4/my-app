import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useMapType } from '../contexts/FontSizeContext'

export default function KakaoMapPicker({ value, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const { ready, error } = useKakaoLoader()
  const { mapType } = useMapType()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)

  const placeMarkerAt = (lat, lng, name) => {
    const { kakao } = window
    const position = new kakao.maps.LatLng(lat, lng)
    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = new kakao.maps.Marker({ position, map: mapRef.current })
    mapRef.current.setCenter(position)
    onChange({ lat, lng, name })
  }

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
      const lat = e.latLng.getLat()
      const lng = e.latLng.getLng()

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.coord2Address(lng, lat, (result, status) => {
        let name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        if (status === kakao.maps.services.Status.OK && result[0]) {
          name = result[0].address?.address_name || name
        }
        placeMarkerAt(lat, lng, name)
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
    placeMarkerAt(parseFloat(place.y), parseFloat(place.x), place.place_name)
    mapRef.current.setLevel(4)
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
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        검색하거나 지도를 클릭하면 위치가 선택됩니다
      </Typography>
    </Box>
  )
}
