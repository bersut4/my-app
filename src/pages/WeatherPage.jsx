import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CircularProgress from '@mui/material/CircularProgress'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Snackbar from '@mui/material/Snackbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import WavesIcon from '@mui/icons-material/Waves'
import VideocamIcon from '@mui/icons-material/Videocam'
import SearchIcon from '@mui/icons-material/Search'
import ShareIcon from '@mui/icons-material/Share'
import CloseIcon from '@mui/icons-material/Close'
import RoomIcon from '@mui/icons-material/Room'
import RouteIcon from '@mui/icons-material/Route'
import UndoIcon from '@mui/icons-material/Undo'
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import LayersIcon from '@mui/icons-material/Layers'
import PhishingIcon from '@mui/icons-material/Phishing'
import PhoneIcon from '@mui/icons-material/Phone'
import PaidIcon from '@mui/icons-material/Paid'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import SetMealIcon from '@mui/icons-material/SetMeal'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import HlsVideoPlayer from '../components/HlsVideoPlayer'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { useFullscreen } from '../hooks/useFullscreen'
import { useMapType } from '../contexts/FontSizeContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { fetchDepthPointsInBounds, depthColor, depthTextColor, DEPTH_LEGEND } from '../lib/khoaDepth'
import { fetchFishingGrounds } from '../lib/fishingGrounds'
import { fetchFishingIndex, summarizeFishingIndex, FISHING_INDEX_COLOR } from '../lib/fishingIndex'
import { fetchFisheryLicenses, filterLicensesInBounds, licenseStatus, daysUntilExpiry, FISHERY_CATEGORY_COLOR } from '../lib/fisheryLicenses'
import { WEATHER_SECTIONS } from '../lib/sideNavSections'

// CCTV 스트림 URL엔 KHOA 인증 토큰이 박혀 있어서, 클라이언트 JS 번들에 토큰을 그대로
// 넣지 않고 Edge Function(cctv-stream-url)에서 카메라 key를 받아 URL을 조립해 돌려준다.
async function fetchCctvStreamUrl(key) {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${baseUrl}/functions/v1/cctv-stream-url?key=${encodeURIComponent(key)}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.url ?? null
}

const CCTV_CAMERAS = [
  { key: 'Incheon',        name: '인천항 조위관측',     region: '서해', lat: 37.4539, lng: 126.6163 },
  { key: 'SeaFog_Incheon', name: '인천항 해무관측',     region: '서해', lat: 37.4549, lng: 126.6050 },
  { key: 'SeaFog_Daesan',  name: '대산항 해무관측',     region: '서해', lat: 37.0196, lng: 126.3567 },
  { key: 'SeaFog_PTDJ',    name: '평택당진항 해무관측', region: '서해', lat: 36.9927, lng: 126.8219 },
  { key: 'Gunsan',         name: '군산항 조위관측',     region: '서해', lat: 35.9756, lng: 126.7106 },
  { key: 'SeaFog_Gunsan',  name: '군산항 해무관측',     region: '서해', lat: 35.9760, lng: 126.7100 },
  { key: 'Jindo',          name: '진도항 조위관측',     region: '남해', lat: 34.4048, lng: 126.2574 },
  { key: 'SeaFog_Mokpo',   name: '목포항 해무관측',     region: '남해', lat: 34.7799, lng: 126.3769 },
  { key: 'Yeosu',          name: '여수항 조위관측',     region: '남해', lat: 34.7604, lng: 127.6622 },
  { key: 'SeaFog_Yeosu',   name: '여수항 해무관측',     region: '남해', lat: 34.7500, lng: 127.6700 },
  { key: 'Busan',          name: '부산항 조위관측',     region: '동해', lat: 35.1028, lng: 129.0403 },
  { key: 'SeaFog_Busan',   name: '부산항 해무관측',     region: '동해', lat: 35.0940, lng: 129.0500 },
  { key: 'SeaFog_Ulsan',   name: '울산항 해무관측',     region: '동해', lat: 35.5013, lng: 129.3867 },
  { key: 'SeaFog_Pohang',  name: '포항항 해무관측',     region: '동해', lat: 36.0183, lng: 129.3658 },
  { key: 'Mukho',          name: '묵호항 조위관측',     region: '동해', lat: 37.5505, lng: 129.1220 },
  { key: 'Moseulpo',       name: '모슬포항 조위관측',   region: '제주', lat: 33.2150, lng: 126.2516 },
]

const REGION_COLORS = { 서해: '#0096C7', 남해: '#0077B6', 동해: '#023E8A', 제주: '#48CAE4' }

// 지도 영역을 전체화면으로 보기 위한 버튼(Fullscreen API). fullscreenRef가 가리키는
// 요소 자체가 전체화면으로 전환되므로, 지도와 그 위 오버레이 컨트롤을 함께 감싼 Box를 넘긴다.
function FullscreenToggleButton({ fullscreenRef, sx }) {
  const { isFullscreen, toggle } = useFullscreen(fullscreenRef)
  return (
    <IconButton
      onClick={toggle}
      size="small"
      title={isFullscreen ? '전체화면 종료' : '전체화면으로 보기'}
      sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }, ...sx }}
    >
      {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
    </IconButton>
  )
}

function CctvMap({ cameras, selectedKey, onSelect }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerDataRef = useRef([])
  const { ready } = useKakaoLoader()
  const { mapType } = useMapType()

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(36.0, 127.8)
    mapRef.current = new kakao.maps.Map(containerRef.current, {
      center,
      level: 9,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })

    markerDataRef.current = cameras.map((cam) => {
      const position = new kakao.maps.LatLng(cam.lat, cam.lng)
      const marker = new kakao.maps.Marker({ position, map: mapRef.current })
      const iw = new kakao.maps.InfoWindow({
        content: `<div style="padding:4px 8px;font-size:11px;white-space:nowrap;color:#000">${cam.name}</div>`,
      })
      kakao.maps.event.addListener(marker, 'click', () => {
        markerDataRef.current.forEach(d => d.iw.close())
        iw.open(mapRef.current, marker)
        onSelect(cam)
      })
      return { cam, marker, iw }
    })

    // 초기 선택 카메라 인포윈도우 열기
    const init = markerDataRef.current.find(d => d.cam.key === selectedKey)
    if (init) init.iw.open(mapRef.current, init.marker)
  }, [ready, mapType])

  // 외부에서 선택 변경 시 지도 동기화
  useEffect(() => {
    if (!ready || !mapRef.current || !markerDataRef.current.length) return
    const data = markerDataRef.current.find(d => d.cam.key === selectedKey)
    if (!data) return
    markerDataRef.current.forEach(d => d.iw.close())
    data.iw.open(mapRef.current, data.marker)
    mapRef.current.panTo(new window.kakao.maps.LatLng(data.cam.lat, data.cam.lng))
  }, [selectedKey, ready])

  if (!ready) {
    return (
      <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return <Box ref={containerRef} sx={{ width: '100%', height: 260 }} />
}

function buildKakaoMapShareUrl({ lat, lng, name }) {
  const safeName = (name || '공유한 위치').replace(/,/g, ' ').trim() || '공유한 위치'
  return `https://map.kakao.com/link/map/${encodeURIComponent(safeName)},${lat},${lng}`
}

function LiveMapTab() {
  const containerRef = useRef(null)
  const fullscreenRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const routeMarkersRef = useRef([])
  const routePolylineRef = useRef(null)
  const modeRef = useRef('pin')
  const skipRelayoutRef = useRef(true)
  const { ready } = useKakaoLoader()
  const { mapType } = useMapType()
  const { user } = useAuth()
  const { isFullscreen } = useFullscreen(fullscreenRef)
  const isDesktop = useIsDesktop()
  // 데스크탑에서는 상단바(로고+탭)가 없어져서 209px를 뺄 필요가 없다.
  const contentHeight = isFullscreen || isDesktop ? '100vh' : 'calc(100vh - 209px)'

  const [mode, setMode] = useState('pin')
  const [pin, setPin] = useState(null)
  const [routePoints, setRoutePoints] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

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
    mapRef.current.panTo(position)
    setPin({ lat, lng, name })
  }

  const addRoutePoint = (lat, lng) => {
    setRoutePoints(prev => {
      const next = [...prev, { lat, lng }]
      redrawRoute(next)
      return next
    })
  }

  const undoRoutePoint = () => {
    setRoutePoints(prev => {
      const next = prev.slice(0, -1)
      redrawRoute(next)
      return next
    })
  }

  const clearRoute = () => {
    setRoutePoints([])
    clearRouteOverlays()
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
      setPin(null)
    }
  }

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(36.5, 127.8)
    const map = new kakao.maps.Map(containerRef.current, {
      center,
      level: 9,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    mapRef.current = map

    kakao.maps.event.addListener(map, 'click', (e) => {
      const lat = e.latLng.getLat()
      const lng = e.latLng.getLng()

      if (modeRef.current === 'route') {
        addRoutePoint(lat, lng)
        return
      }

      const geocoder = new kakao.maps.services.Geocoder()
      geocoder.coord2Address(lng, lat, (result, status) => {
        const name = status === kakao.maps.services.Status.OK && result[0]
          ? (result[0].address?.address_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        placePin(lat, lng, name)
      })
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setCenter(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude))
          map.setLevel(6)
        },
        () => {},
        { timeout: 3000 }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mapType])

  const handleSearch = () => {
    if (!query.trim() || !window.kakao || !ready) return
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

  const clearPin = () => {
    if (markerRef.current) markerRef.current.setMap(null)
    markerRef.current = null
    setPin(null)
  }

  const handleShare = async () => {
    if (!pin) return
    const url = buildKakaoMapShareUrl(pin)
    if (navigator.share) {
      try { await navigator.share({ title: pin.name, url }) } catch { /* 사용자 취소 등은 무시 */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setToast('공유 링크가 복사됐어요')
    } catch {
      setToast('링크 복사에 실패했어요')
    }
  }

  const saveRouteAsPoint = async () => {
    if (!user || routePoints.length < 2 || saving) return
    setSaving(true)
    const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    const { error } = await supabase.from('sh_points').insert({
      user_id: user.id,
      name: `${today} 경로`,
      location_type: 'route',
      location_data: routePoints,
    })
    setSaving(false)
    if (error) { setToast('저장에 실패했어요.'); return }
    setToast('내 포인트에 저장됐어요')
    clearRoute()
  }

  // 카카오맵은 컨테이너 크기가 바뀌어도 스스로 다시 그리지 않아서(전체화면 진입/종료 시
  // 검은 여백이 남음), relayout으로 캔버스 크기를 맞추고 중심을 다시 설정해준다. 최초
  // 마운트 시점엔 이 효과가 불필요할 뿐 아니라, 위성 타일이 아직 로딩 중일 때 relayout이
  // 끼어들면 일부 타일 요청이 씹혀 지도 일부가 빈 채로 남는 문제가 있어 건너뛴다.
  useEffect(() => {
    if (skipRelayoutRef.current) { skipRelayoutRef.current = false; return }
    if (!mapRef.current) return
    const id = requestAnimationFrame(() => {
      mapRef.current.relayout()
      mapRef.current.setCenter(mapRef.current.getCenter())
    })
    return () => cancelAnimationFrame(id)
  }, [isFullscreen])

  if (!ready) {
    return (
      <Box sx={{ height: contentHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box ref={fullscreenRef} sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ToggleButtonGroup value={mode} exclusive onChange={switchMode} size="small" fullWidth sx={{ bgcolor: 'background.paper' }}>
          <ToggleButton value="pin">핀</ToggleButton>
          <ToggleButton value="route">경로</ToggleButton>
        </ToggleButtonGroup>

        <Paper sx={{ display: 'flex', alignItems: 'center', pl: 1.5, pr: 0.5 }}>
          <TextField
            variant="standard"
            placeholder="장소를 검색해보세요 (예: 강릉 경포해변)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            fullWidth
            slotProps={{ input: { disableUnderline: true } }}
          />
          <IconButton onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? <CircularProgress size={18} /> : <SearchIcon />}
          </IconButton>
        </Paper>

        {results.length > 0 && (
          <Paper sx={{ maxHeight: 260, overflowY: 'auto' }}>
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

      <Box ref={containerRef} sx={{ width: '100%', height: contentHeight }} />

      {mode === 'pin' && pin && (
        <Paper sx={{ position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 10, p: 1.2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon sx={{ color: 'primary.light', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{pin.name}</Typography>
            <Typography variant="caption" color="text.secondary">{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</Typography>
          </Box>
          <Button size="small" startIcon={<ShareIcon />} onClick={handleShare} sx={{ flexShrink: 0 }}>공유</Button>
          <IconButton size="small" onClick={clearPin}><CloseIcon fontSize="small" /></IconButton>
        </Paper>
      )}

      {mode === 'route' && routePoints.length > 0 && (
        <Paper sx={{ position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 10, p: 1.2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <RouteIcon sx={{ color: 'primary.light', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 90 }}>경로 {routePoints.length}개 지점</Typography>
          <Button size="small" startIcon={<UndoIcon />} onClick={undoRoutePoint}>실행취소</Button>
          <Button size="small" color="error" onClick={clearRoute}>초기화</Button>
          {user ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<BookmarkAddIcon />}
              onClick={saveRouteAsPoint}
              disabled={routePoints.length < 2 || saving}
              sx={{ flexShrink: 0 }}
            >
              {saving ? '저장 중...' : '내 포인트에 저장'}
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">로그인하면 내 포인트에 저장할 수 있어요</Typography>
          )}
        </Paper>
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {mode === 'pin' && !pin && (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 9, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', px: 1, py: 0.3, borderRadius: 1 }}>
          지도를 터치하면 핀이 찍혀요
        </Typography>
      )}
      {mode === 'route' && routePoints.length === 0 && (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 9, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', px: 1, py: 0.3, borderRadius: 1 }}>
          지도를 터치할 때마다 경로에 지점이 추가돼요
        </Typography>
      )}

      {/* 전체화면 버튼은 모든 탭에서 지도 우측 하단으로 위치를 통일한다 */}
      <FullscreenToggleButton fullscreenRef={fullscreenRef} sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 15 }} />
    </Box>
  )
}

function CctvTab() {
  const [selectedCamera, setSelectedCamera] = useState(CCTV_CAMERAS[0])
  const [streamUrl, setStreamUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStreamUrl(null)
    fetchCctvStreamUrl(selectedCamera.key).then(url => { if (!cancelled) setStreamUrl(url) })
    return () => { cancelled = true }
  }, [selectedCamera.key])

  return (
    <Box sx={{ pb: 10 }}>
      <CctvMap
        cameras={CCTV_CAMERAS}
        selectedKey={selectedCamera.key}
        onSelect={setSelectedCamera}
      />

      {/* 선택된 카메라 정보 */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideocamIcon sx={{ fontSize: 16, color: 'primary.light' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{selectedCamera.name}</Typography>
        <Chip
          label={selectedCamera.region}
          size="small"
          sx={{ bgcolor: REGION_COLORS[selectedCamera.region], color: '#fff', fontSize: '0.65rem', height: 20 }}
        />
        <Chip label="국립해양조사원" size="small" sx={{ fontSize: '0.6rem', height: 20 }} />
      </Box>

      <HlsVideoPlayer key={selectedCamera.key} src={streamUrl} title={selectedCamera.name} />

      {/* 지역별 빠른 선택 */}
      {['서해', '남해', '동해', '제주'].map(region => {
        const regionCams = CCTV_CAMERAS.filter(c => c.region === region)
        return (
          <Box key={region} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 600 }}>
              {region}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, px: 2, mt: 0.5, flexWrap: 'wrap' }}>
              {regionCams.map(cam => (
                <Chip
                  key={cam.key}
                  label={cam.name}
                  size="small"
                  onClick={() => setSelectedCamera(cam)}
                  variant={selectedCamera.key === cam.key ? 'filled' : 'outlined'}
                  color={selectedCamera.key === cam.key ? 'primary' : 'default'}
                  sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

const DEPTH_MAX_SPAN_KM = 15

// 낚시터 유형별 유료/공용 문구는 원본 데이터 그대로(항목 없으면 표시하지 않음)
function FishingGroundDialog({ ground, open, onClose }) {
  if (!ground) return null
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhishingIcon sx={{ color: 'primary.light' }} />
          {ground.name}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {ground.road_address || ground.jibun_address}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {ground.species && <Chip label={`🐟 ${ground.species}`} size="small" variant="outlined" />}
          {ground.facility_type && <Chip label={ground.facility_type} size="small" variant="outlined" />}
          {ground.max_capacity && <Chip label={`최대 ${ground.max_capacity}명`} size="small" variant="outlined" />}
        </Box>

        {(ground.lat && ground.lng) && <KakaoMapViewLite lat={ground.lat} lng={ground.lng} />}

        {ground.fee_info && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
            <PaidIcon sx={{ fontSize: 16, color: 'primary.light', mt: 0.2 }} />
            <Typography variant="body2">{ground.fee_info}</Typography>
          </Box>
        )}

        {ground.safety_facilities && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6 }}>
            <HealthAndSafetyIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary">{ground.safety_facilities}</Typography>
          </Box>
        )}

        {ground.amenity_facilities && (
          <Typography variant="body2" color="text.secondary">편의시설: {ground.amenity_facilities}</Typography>
        )}

        {ground.nearby_attractions && (
          <Typography variant="body2" color="text.secondary">주변: {ground.nearby_attractions}</Typography>
        )}

        {(ground.phone || ground.manager_org) && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <PhoneIcon sx={{ fontSize: 16, color: 'primary.light' }} />
              <Typography variant="body2">
                {ground.phone || ground.manager_phone || '전화번호 정보 없음'}
                {ground.manager_org && <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.8 }}>({ground.manager_org})</Typography>}
              </Typography>
            </Box>
          </>
        )}

        <Typography variant="caption" color="text.secondary">
          공공데이터포털 전국낚시터정보표준데이터{ground.data_ref_date ? ` · 기준일 ${ground.data_ref_date}` : ''}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

function FishingIndexDialog({ location, open, onClose }) {
  if (!location) return null
  const slots = Object.entries(location.slots)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QueryStatsIcon sx={{ color: 'primary.light' }} />
          {location.name}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, pt: 1 }}>
        <Typography variant="caption" color="text.secondary">{location.date} 국립해양조사원 바다낚시지수</Typography>

        {slots.map(([noon, slot]) => (
          <Box key={noon}>
            <Divider sx={{ my: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{noon}</Typography>
            </Divider>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.8 }}>
              <Chip label={`물때 ${slot.tide}`} size="small" variant="outlined" />
              <Chip label={`파고 ${slot.waveMin}~${slot.waveMax}m`} size="small" variant="outlined" />
              <Chip label={`수온 ${slot.waterTempMin}~${slot.waterTempMax}℃`} size="small" variant="outlined" />
              <Chip label={`풍속 ${slot.windMin}~${slot.windMax}m/s`} size="small" variant="outlined" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              {slot.fishes.map(({ fish, index }) => (
                <Box key={fish} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{fish}</Typography>
                  <Chip
                    label={index}
                    size="small"
                    sx={{ bgcolor: FISHING_INDEX_COLOR[index] ?? 'grey.700', color: '#fff', fontWeight: 600 }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

function FisheryLicenseDialog({ farm, open, onClose }) {
  if (!farm) return null
  const status = licenseStatus(farm)
  const dday = daysUntilExpiry(farm)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SetMealIcon sx={{ color: 'primary.light' }} />
          {farm.n || '어장정보'}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
        <Typography variant="body2" color="text.secondary">{farm.a}</Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={farm.c} size="small" sx={{ bgcolor: FISHERY_CATEGORY_COLOR[farm.c] ?? 'grey.700', color: '#fff' }} />
          {farm.k && <Chip label={farm.k} size="small" variant="outlined" />}
          {farm.m && <Chip label={farm.m} size="small" variant="outlined" />}
          {farm.ar != null && <Chip label={`면적 ${farm.ar}ha`} size="small" variant="outlined" />}
        </Box>

        {farm.f && <Typography variant="body2">🦪 양식물: {farm.f}</Typography>}

        {(farm.y && farm.x) && <KakaoMapViewLite lat={farm.y} lng={farm.x} />}

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary">면허 기간</Typography>
        </Divider>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <Chip
            icon={status === 'valid' ? <EventAvailableIcon sx={{ fontSize: 16 }} /> : <EventBusyIcon sx={{ fontSize: 16 }} />}
            label={status === 'valid' ? '유효' : status === 'expired' ? '만료' : '정보없음'}
            size="small"
            color={status === 'valid' ? 'success' : status === 'expired' ? 'error' : 'default'}
          />
          <Typography variant="body2">
            {farm.s ?? '?'} ~ {farm.e ?? '?'}
          </Typography>
          {status === 'valid' && dday != null && (
            <Typography variant="caption" color="text.secondary">(만료까지 {dday}일)</Typography>
          )}
          {status === 'expired' && dday != null && (
            <Typography variant="caption" color="error.main">({-dday}일 전 만료)</Typography>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          공공데이터포털 해양수산부 국립해양조사원_어장정보
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small">닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

// 다이얼로그 안에서 위치만 간단히 보여주는 축소판 지도(핀 하나, 조작 불필요)
function KakaoMapViewLite({ lat, lng }) {
  const ref = useRef(null)
  const { ready } = useKakaoLoader()
  const { mapType } = useMapType()

  useEffect(() => {
    if (!ready || !ref.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(lat, lng)
    const map = new kakao.maps.Map(ref.current, { center, level: 4, mapTypeId: kakao.maps.MapTypeId[mapType] })
    new kakao.maps.Marker({ position: center, map })
  }, [ready, mapType, lat, lng])

  if (!ready) return null
  return <Box ref={ref} sx={{ width: '100%', height: 180, borderRadius: 1, overflow: 'hidden' }} />
}

function OceanInfoTab() {
  const containerRef = useRef(null)
  const fullscreenRef = useRef(null)
  const mapRef = useRef(null)
  const overlaysRef = useRef([])
  const groundOverlaysRef = useRef([])
  const skipRelayoutRef = useRef(true)
  const { ready } = useKakaoLoader()
  const { mapType } = useMapType()
  const { isFullscreen } = useFullscreen(fullscreenRef)
  const isDesktop = useIsDesktop()
  // 데스크탑에서는 상단바(로고+탭)가 없어져서 209px를 뺄 필요가 없다.
  const contentHeight = isFullscreen || isDesktop ? '100vh' : 'calc(100vh - 209px)'

  const [loading, setLoading] = useState(false)
  const [tooZoomedOut, setTooZoomedOut] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showGrounds, setShowGrounds] = useState(true)
  const [fishingGrounds, setFishingGrounds] = useState([])
  const [selectedGround, setSelectedGround] = useState(null)

  const [showFishingIndex, setShowFishingIndex] = useState(false)
  const [fishingIndexLocations, setFishingIndexLocations] = useState([])
  const [selectedIndexLocation, setSelectedIndexLocation] = useState(null)
  const indexOverlaysRef = useRef([])

  const [showFarms, setShowFarms] = useState(false)
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [farmsTooZoomedOut, setFarmsTooZoomedOut] = useState(false)
  const farmOverlaysRef = useRef([])
  const farmsAllRef = useRef([])
  const showFarmsRef = useRef(false)
  useEffect(() => { showFarmsRef.current = showFarms }, [showFarms])

  const clearOverlays = () => {
    overlaysRef.current.forEach(o => o.setMap(null))
    overlaysRef.current = []
  }

  const clearGroundOverlays = () => {
    groundOverlaysRef.current.forEach(o => o.setMap(null))
    groundOverlaysRef.current = []
  }

  const clearIndexOverlays = () => {
    indexOverlaysRef.current.forEach(o => o.setMap(null))
    indexOverlaysRef.current = []
  }

  const clearFarmOverlays = () => {
    farmOverlaysRef.current.forEach(o => o.setMap(null))
    farmOverlaysRef.current = []
  }

  // 전국 어장정보가 14,858건이라 한 번에 다 그리지 못하고, 화면 범위 안에 있는 것만(최대 400건)
  // 지도가 충분히 확대됐을 때만 그린다(수심 정보와 같은 방식).
  const FARM_MAX_SPAN_KM = 60
  const FARM_MAX_COUNT = 400

  const loadFarms = () => {
    const map = mapRef.current
    if (!map) return
    if (!showFarmsRef.current) { setFarmsTooZoomedOut(false); clearFarmOverlays(); return }

    const bounds = map.getBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const latSpanKm = (ne.getLat() - sw.getLat()) * 111
    const lngSpanKm = (ne.getLng() - sw.getLng()) * 111 * Math.cos((sw.getLat() * Math.PI) / 180)
    if (latSpanKm > FARM_MAX_SPAN_KM || lngSpanKm > FARM_MAX_SPAN_KM) {
      setFarmsTooZoomedOut(true)
      clearFarmOverlays()
      return
    }
    setFarmsTooZoomedOut(false)

    const inBounds = filterLicensesInBounds(farmsAllRef.current, bounds).slice(0, FARM_MAX_COUNT)
    clearFarmOverlays()
    const { kakao } = window
    farmOverlaysRef.current = inBounds.map((farm) => {
      const status = licenseStatus(farm)
      const color = status === 'valid' ? '#22C55E' : status === 'expired' ? '#DC2626' : '#9CA3AF'
      const el = document.createElement('div')
      el.title = `${farm.n ?? ''} · ${farm.c} · ${status === 'valid' ? '면허 유효' : status === 'expired' ? '면허 만료' : '기간 정보없음'}`
      el.style.cssText = `width:11px;height:11px;border-radius:3px;background:${color};border:1px solid rgba(255,255,255,0.85);box-shadow:0 1px 2px rgba(0,0,0,0.5);cursor:pointer;`
      el.addEventListener('click', () => setSelectedFarm(farm))
      return new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(farm.y, farm.x),
        content: el,
        map,
        yAnchor: 0.5,
        zIndex: 3,
      })
    })
  }

  const loadDepths = async () => {
    const map = mapRef.current
    if (!map) return

    setLoading(true)
    setErrorMsg('')
    try {
      const bounds = map.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()

      // "레벨" 숫자는 화면 폭에 따라 실제로 보이는 범위가 달라지므로(PC는 화면이 넓어 같은 레벨이라도
      // 훨씬 넓은 지역이 보임), 화면 폭이 아니라 실제 위경도 범위(km)로 확대 정도를 판단한다
      const latSpanKm = (ne.getLat() - sw.getLat()) * 111
      const lngSpanKm = (ne.getLng() - sw.getLng()) * 111 * Math.cos((sw.getLat() * Math.PI) / 180)
      if (latSpanKm > DEPTH_MAX_SPAN_KM || lngSpanKm > DEPTH_MAX_SPAN_KM) {
        setTooZoomedOut(true)
        clearOverlays()
        return
      }
      setTooZoomedOut(false)

      const points = await fetchDepthPointsInBounds({
        south: sw.getLat(), north: ne.getLat(), west: sw.getLng(), east: ne.getLng(),
      })
      clearOverlays()
      const { kakao } = window

      // 지점 간격이 데이터 격자(150m) 단위라 화면을 확대하지 않으면 숫자 라벨이 서로 겹치므로,
      // 화면 픽셀 기준 최소 간격을 두고 이미 채택된 라벨과 너무 가까운 지점은 건너뛴다
      const containerEl = containerRef.current
      const degPerPxX = (ne.getLng() - sw.getLng()) / containerEl.clientWidth
      const degPerPxY = (ne.getLat() - sw.getLat()) / containerEl.clientHeight
      const MIN_LABEL_GAP_PX = 34
      const shownPoints = []
      for (const p of points) {
        const tooClose = shownPoints.some((q) => {
          const dx = (p.lng - q.lng) / degPerPxX
          const dy = (p.lat - q.lat) / degPerPxY
          return Math.hypot(dx, dy) < MIN_LABEL_GAP_PX
        })
        if (!tooClose) shownPoints.push(p)
      }

      overlaysRef.current = shownPoints.map((p) => {
        const el = document.createElement('div')
        el.title = `수심 약 ${p.depth.toFixed(1)}m`
        el.textContent = p.depth < 10 ? p.depth.toFixed(1) : String(Math.round(p.depth))
        const textColor = depthTextColor(p.depth)
        const borderColor = textColor === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(3,4,94,0.35)'
        el.style.cssText = `padding:2px 5px;border-radius:4px;background:${depthColor(p.depth)};color:${textColor};font-size:11px;font-weight:700;line-height:1.2;white-space:nowrap;border:1px solid ${borderColor};box-shadow:0 1px 3px rgba(0,0,0,0.5);`
        return new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(p.lat, p.lng),
          content: el,
          map,
          xAnchor: 0.5,
          yAnchor: 0.5,
        })
      })
      if (points.length === 0) setErrorMsg('이 위치에는 수심 데이터가 없어요.')
    } catch (err) {
      console.error('[해양정보] 수심 조회 실패:', err)
      setErrorMsg(`수심 정보를 불러오지 못했어요. (${err?.message ?? err})`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(35.15, 129.15)
    const map = new kakao.maps.Map(containerRef.current, {
      center,
      level: 3,
      mapTypeId: kakao.maps.MapTypeId[mapType],
    })
    mapRef.current = map
    // 확대/축소 컨트롤을 왼쪽 중간에 둬서 우측 상단을 범례/토글 칩 자리로 비워둔다
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.LEFT)

    kakao.maps.event.addListener(map, 'idle', loadDepths)
    kakao.maps.event.addListener(map, 'idle', loadFarms)
    loadDepths()
    loadFarms()

    return () => { clearOverlays(); clearFarmOverlays() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, mapType])

  useEffect(() => {
    fetchFishingGrounds().then(setFishingGrounds).catch((err) => {
      console.error('[해양정보] 어장정보 조회 실패:', err)
    })
  }, [])

  useEffect(() => {
    fetchFishingIndex()
      .then((items) => setFishingIndexLocations(summarizeFishingIndex(items)))
      .catch((err) => console.error('[해양정보] 낚시지수 조회 실패:', err))
  }, [])

  useEffect(() => {
    fetchFisheryLicenses()
      .then((records) => { farmsAllRef.current = records; loadFarms() })
      .catch((err) => console.error('[해양정보] 어장정보(면허) 조회 실패:', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadFarms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showFarms])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    clearIndexOverlays()
    if (!showFishingIndex) return
    const { kakao } = window

    indexOverlaysRef.current = fishingIndexLocations.map((loc) => {
      const el = document.createElement('div')
      const color = FISHING_INDEX_COLOR[loc.representativeIndex] ?? '#888'
      el.title = `${loc.name} · ${loc.representativeIndex ?? '정보없음'}`
      el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 1px 3px rgba(0,0,0,0.6);cursor:pointer;`
      el.addEventListener('click', () => setSelectedIndexLocation(loc))
      return new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(loc.lat, loc.lng),
        content: el,
        map,
        yAnchor: 0.5,
        zIndex: 4,
      })
    })

    return () => clearIndexOverlays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fishingIndexLocations, showFishingIndex])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    clearGroundOverlays()
    if (!showGrounds) return
    const { kakao } = window

    groundOverlaysRef.current = fishingGrounds.map((ground) => {
      const el = document.createElement('div')
      el.textContent = '🎣'
      el.title = ground.name
      el.style.cssText = 'font-size:20px;line-height:1;cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.6));'
      el.addEventListener('click', () => setSelectedGround(ground))
      return new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(ground.lat, ground.lng),
        content: el,
        map,
        yAnchor: 0.9,
        zIndex: 5,
      })
    })

    return () => clearGroundOverlays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fishingGrounds, showGrounds])

  // 카카오맵은 컨테이너 크기가 바뀌어도 스스로 다시 그리지 않아서(전체화면 진입/종료 시
  // 검은 여백이 남음), relayout으로 캔버스 크기를 맞추고 중심을 다시 설정해준다. 최초
  // 마운트 시점엔 이 효과가 불필요할 뿐 아니라, 위성 타일이 아직 로딩 중일 때 relayout이
  // 끼어들면 일부 타일 요청이 씹혀 지도 일부가 빈 채로 남는 문제가 있어 건너뛴다.
  useEffect(() => {
    if (skipRelayoutRef.current) { skipRelayoutRef.current = false; return }
    if (!mapRef.current) return
    const id = requestAnimationFrame(() => {
      mapRef.current.relayout()
      mapRef.current.setCenter(mapRef.current.getCenter())
    })
    return () => cancelAnimationFrame(id)
  }, [isFullscreen])

  if (!ready) {
    return (
      <Box sx={{ height: contentHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return (
    <Box ref={fullscreenRef} sx={{ position: 'relative' }}>
      <Box ref={containerRef} sx={{ width: '100%', height: contentHeight }} />

      {/* 범례(수심/어장 면허)와 우측 컨트롤(전체화면/토글 칩)을 한 세로 컨테이너 안에 순서대로
          쌓아서, 좁은 화면에서 내용이 늘어나도 서로 겹치지 않고 아래로 밀려나게 한다 */}
      <Box sx={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <LayersIcon sx={{ fontSize: 16, color: 'primary.light' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>수심</Typography>
          {loading && <CircularProgress size={12} sx={{ color: 'primary.light', mr: 0.5 }} />}
          {DEPTH_LEGEND.map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: color, border: '1px solid rgba(0,0,0,0.2)' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
            </Box>
          ))}
        </Paper>

        {showFarms && (
          <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
            <SetMealIcon sx={{ fontSize: 16, color: 'primary.light' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>어장 면허</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: '#22C55E' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>유효</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: '#DC2626' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>만료</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: '#9CA3AF' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>기간정보없음</Typography>
            </Box>
          </Paper>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.6 }}>
          <Chip
            icon={<PhishingIcon sx={{ fontSize: 16 }} />}
            label={`어장정보 ${showGrounds ? 'ON' : 'OFF'}`}
            size="small"
            color={showGrounds ? 'primary' : 'default'}
            variant={showGrounds ? 'filled' : 'outlined'}
            onClick={() => setShowGrounds(v => !v)}
            sx={{ bgcolor: showGrounds ? undefined : 'rgba(0,0,0,0.55)', color: showGrounds ? undefined : '#fff' }}
          />
          <Chip
            icon={<QueryStatsIcon sx={{ fontSize: 16 }} />}
            label={`낚시지수 ${showFishingIndex ? 'ON' : 'OFF'}`}
            size="small"
            color={showFishingIndex ? 'primary' : 'default'}
            variant={showFishingIndex ? 'filled' : 'outlined'}
            onClick={() => setShowFishingIndex(v => !v)}
            sx={{ bgcolor: showFishingIndex ? undefined : 'rgba(0,0,0,0.55)', color: showFishingIndex ? undefined : '#fff' }}
          />
          <Chip
            icon={<SetMealIcon sx={{ fontSize: 16 }} />}
            label={`양식장/어장 ${showFarms ? 'ON' : 'OFF'}`}
            size="small"
            color={showFarms ? 'primary' : 'default'}
            variant={showFarms ? 'filled' : 'outlined'}
            onClick={() => setShowFarms(v => !v)}
            sx={{ bgcolor: showFarms ? undefined : 'rgba(0,0,0,0.55)', color: showFarms ? undefined : '#fff' }}
          />
        </Box>
      </Box>

      {tooZoomedOut && !loading && (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 9, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', px: 1, py: 0.4, borderRadius: 1 }}>
          지도를 더 확대하면 수심 정보가 표시돼요
        </Typography>
      )}

      {/* 전체화면 버튼은 모든 탭에서 지도 우측 하단으로 위치를 통일한다.
          위에 뜨는 안내 메세지는 이 버튼과 겹치지 않게 같은 컨테이너 안에서 위로 쌓인다. */}
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        {showFarms && farmsTooZoomedOut && (
          <Typography variant="caption" sx={{ bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', px: 1, py: 0.4, borderRadius: 1 }}>
            🦪 지도를 더 확대하면 양식장/어장정보가 표시돼요
          </Typography>
        )}
        <FullscreenToggleButton fullscreenRef={fullscreenRef} />
      </Box>

      {errorMsg && (
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 9, bgcolor: 'rgba(211,47,47,0.85)', color: '#fff', px: 1, py: 0.4, borderRadius: 1 }}>
          {errorMsg}
        </Typography>
      )}

      <FishingGroundDialog ground={selectedGround} open={!!selectedGround} onClose={() => setSelectedGround(null)} />
      <FishingIndexDialog location={selectedIndexLocation} open={!!selectedIndexLocation} onClose={() => setSelectedIndexLocation(null)} />
      <FisheryLicenseDialog farm={selectedFarm} open={!!selectedFarm} onClose={() => setSelectedFarm(null)} />
    </Box>
  )
}

// ── 물때 계산 ─────────────────────────────────────────────────
const LUNAR_MONTH = 29.53058868

function getMulddaeNum(date = new Date()) {
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const lunarMs = LUNAR_MONTH * 86400000
  const elapsed = ((date.getTime() - refMs) % lunarMs + lunarMs) % lunarMs
  const dayInCycle = elapsed / 86400000
  const half = LUNAR_MONTH / 2
  const inHalf = dayInCycle < half ? dayInCycle : dayInCycle - half
  const adjusted = (inHalf - 1.5 + half) % half
  return Math.min(15, Math.max(1, Math.floor((adjusted / half) * 14) + 1))
}

function getLunarDay(date = new Date()) {
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const lunarMs = LUNAR_MONTH * 86400000
  const elapsed = ((date.getTime() - refMs) % lunarMs + lunarMs) % lunarMs
  return Math.floor(elapsed / 86400000) + 1
}

const MULDDAE_INFO = {
  1:  { name: '한사리',   level: 5, color: '#023E8A' },
  2:  { name: '두물',     level: 5, color: '#0353A4' },
  3:  { name: '세물',     level: 4, color: '#0077B6' },
  4:  { name: '네물',     level: 3, color: '#0096C7' },
  5:  { name: '다섯물',   level: 3, color: '#00B4D8' },
  6:  { name: '여섯물',   level: 2, color: '#48CAE4' },
  7:  { name: '일곱물',   level: 2, color: '#90E0EF' },
  8:  { name: '조금',     level: 1, color: '#ADE8F4' },
  9:  { name: '무시',     level: 1, color: '#90E0EF' },
  10: { name: '열물',     level: 2, color: '#48CAE4' },
  11: { name: '열한물',   level: 2, color: '#00B4D8' },
  12: { name: '열두물',   level: 3, color: '#0096C7' },
  13: { name: '열세물',   level: 4, color: '#0077B6' },
  14: { name: '열네물',   level: 5, color: '#0353A4' },
  15: { name: '보름사리', level: 5, color: '#023E8A' },
}

const BAR_HEIGHTS = { 5: 44, 4: 34, 3: 26, 2: 18, 1: 12 }

const TIDE_MSGS = {
  strong: '⚠️ 사리 기간: 조류가 강합니다. 해루질·다이빙 시 주의하세요.',
  weak:   '✅ 조금·무시 기간: 조수 움직임이 적어 수중 활동에 유리합니다.',
  mid:    '💧 조수가 변화하는 시기입니다.',
}

// ── 지역별 조석 상수 (음력 기반 근사치) ──────────────────────
// lunitidalHour: 삭(새달) 직후 1물 때 해당 지역 첫 만조 시각(h)
// maxRange: 사리 최대 조차(cm), meanLevel: 기준 평균 해수면(cm)
// lot/lat이 있는 지역은 KHOA TideBED 실시간 예측 API로 실제 조위를 받아온다.
// 이 API는 관측소 근처 좌표만 지원해서(먼 지점은 오류), 좌표를 못 찾은 지역(영덕·속초)은
// 기존 음력 근사 계산으로 대체한다.
const TIDE_LOCATIONS = [
  { name: '인천', lunitidalHour: 1.5,  maxRange: 860, meanLevel: 440, lot: 126.5919, lat: 37.4763 },
  { name: '태안', lunitidalHour: 2.2,  maxRange: 600, meanLevel: 310, lot: 126.1602, lat: 36.7448 },
  { name: '대천', lunitidalHour: 2.4,  maxRange: 580, meanLevel: 300, lot: 126.4967, lat: 36.3266 },
  { name: '변산', lunitidalHour: 2.6,  maxRange: 600, meanLevel: 310, lot: 126.45,   lat: 35.60   },
  { name: '군산', lunitidalHour: 2.5,  maxRange: 640, meanLevel: 330, lot: 126.50,   lat: 36.00   },
  { name: '목포', lunitidalHour: 3.5,  maxRange: 380, meanLevel: 200, lot: 126.36,   lat: 34.75   },
  { name: '진도', lunitidalHour: 4.5,  maxRange: 280, meanLevel: 150, lot: 126.10,   lat: 34.47   },
  { name: '여수', lunitidalHour: 6.0,  maxRange: 170, meanLevel: 90,  lot: 127.7623, lat: 34.7376 },
  { name: '거제', lunitidalHour: 0.8,  maxRange: 130, meanLevel: 70,  lot: 128.70,   lat: 34.75   },
  { name: '마산', lunitidalHour: 0.7,  maxRange: 140, meanLevel: 75,  lot: 128.53,   lat: 35.10   },
  { name: '부산', lunitidalHour: 0.5,  maxRange: 115, meanLevel: 65,  lot: 129.0403, lat: 35.1028 },
  { name: '울산', lunitidalHour: 1.0,  maxRange: 90,  meanLevel: 50,  lot: 129.40,   lat: 35.50   },
  { name: '포항', lunitidalHour: 1.5,  maxRange: 50,  meanLevel: 30,  lot: 129.44,   lat: 36.00   },
  { name: '영덕', lunitidalHour: 1.7,  maxRange: 45,  meanLevel: 28  },
  { name: '속초', lunitidalHour: 2.0,  maxRange: 40,  meanLevel: 25  },
  { name: '제주', lunitidalHour: 5.0,  maxRange: 150, meanLevel: 80,  lot: 126.2516, lat: 33.2150 },
]

const LEVEL_LABELS = [
  { label: '사리' },
  { label: '조금' },
  { label: '사리' },
]

// 일출·일몰 근사 계산 (한국 기준 37°N, 127°E)
function getSunTimes(date) {
  const doy = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  const decl = 23.45 * Math.sin((2 * Math.PI * (284 + doy)) / 365) * (Math.PI / 180)
  const lat = 37 * Math.PI / 180
  const cosHa = -Math.tan(lat) * Math.tan(decl)
  if (cosHa < -1 || cosHa > 1) return null
  const haHours = (Math.acos(cosHa) * 12) / Math.PI
  const solarNoon = 12 + (9 * 15 - 127) / 15  // ≈ 12.53 KST
  return { sunrise: solarNoon - haHours, sunset: solarNoon + haHours }
}

// KHOA 실시간 조위 API에서 받은 분 단위 조위 포인트에서 만조/간조(극값)를 찾아낸다.
// 단순히 앞뒤 포인트만 비교하면 조차가 작은 지역(포항 등)에서 잔물결 같은 미세 잡음까지
// 만조/간조로 잘못 인식된다. 직전 극값 대비 일정 폭(minSwingCm) 이상 방향이 꺾일 때만
// 진짜 만조/간조로 인정하는 지그재그 방식으로 걸러낸다.
function extractTideEventsFromPoints(points, minSwingCm = 8) {
  if (points.length < 2) return []

  const raw = []
  let direction = 0 // 0: 미확정, 1: 상승 중, -1: 하강 중
  let pivot = points[0]

  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    if (direction >= 0 && p.height >= pivot.height) {
      pivot = p
      direction = 1
    } else if (direction === 1 && pivot.height - p.height >= minSwingCm) {
      raw.push({ ...pivot, type: 'high' })
      pivot = p
      direction = -1
    } else if (direction <= 0 && p.height <= pivot.height) {
      pivot = p
      direction = -1
    } else if (direction === -1 && p.height - pivot.height >= minSwingCm) {
      raw.push({ ...pivot, type: 'low' })
      pivot = p
      direction = 1
    }
  }
  // 마지막 극값은 하루가 끝나 데이터가 잘렸을 뿐 진짜 반전이 확인된 게 아니라서 포함하지 않는다
  // (조차가 작은 지역에서 확정 안 된 반쪽짜리 이벤트가 만조/간조로 잘못 표시되는 걸 방지)

  // 동해안처럼 하루에 한 번만 오르내리는 지역은 그 유일한 저점/고점이 하루 경계에 걸려
  // 반전이 확정되지 않는 경우가 많다. 만조/간조 중 한쪽이 아예 없으면, 그날 실제 최고/최저
  // 지점을 그대로 보여준다.
  const hasHigh = raw.some(ev => ev.type === 'high')
  const hasLow = raw.some(ev => ev.type === 'low')
  if (!hasHigh) raw.push({ ...points.reduce((a, b) => (b.height > a.height ? b : a)), type: 'high' })
  if (!hasLow) raw.push({ ...points.reduce((a, b) => (b.height < a.height ? b : a)), type: 'low' })
  raw.sort((a, b) => a.time.localeCompare(b.time))

  return raw.map((ev, i) => {
    const d = new Date(ev.time.replace(' ', 'T'))
    const hour = d.getHours() + d.getMinutes() / 60
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const height = Math.round(ev.height)
    const prevHeight = i > 0 ? Math.round(raw[i - 1].height) : height
    return { hour, type: ev.type, height, timeStr, change: height - prevHeight }
  })
}

// 실제 관측 기반 조위 조회 (좌표가 있는 지역만 가능)
async function fetchRealTideEvents(date, loc) {
  const reqDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${baseUrl}/functions/v1/tide-proxy?lot=${loc.lot}&lat=${loc.lat}&reqDate=${reqDate}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey } })
  if (!res.ok) throw new Error('조위 정보를 불러오지 못했어요.')
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return extractTideEventsFromPoints(json.points ?? [])
}

// 조석 이벤트 계산 (M2 조화상수 기반 근사, 실시간 API 미지원 지역용 폴백)
function calcTideEvents(date, loc) {
  const mulNum = getMulddaeNum(date)
  const lunarDay = getLunarDay(date)
  const level = MULDDAE_INFO[mulNum].level
  const ampFactor = { 5: 0.95, 4: 0.78, 3: 0.58, 2: 0.38, 1: 0.20 }[level]

  const amplitude = (loc.maxRange / 2) * ampFactor
  const mean = loc.meanLevel
  const T = 12.417  // M2 반주기(h)
  const firstHigh = ((loc.lunitidalHour + (lunarDay - 1) * 0.841) % 24 + 24) % 24

  const raw = []
  for (let n = -1; n <= 2; n++) {
    const hh = firstHigh + n * T
    const hl = firstHigh + T / 2 + n * T
    if (hh >= 0 && hh < 24) raw.push({ hour: hh, type: 'high', height: Math.round(mean + amplitude) })
    if (hl >= 0 && hl < 24) raw.push({ hour: hl, type: 'low',  height: Math.round(mean - amplitude) })
  }
  raw.sort((a, b) => a.hour - b.hour)

  raw.forEach((ev, i) => {
    const h = Math.floor(ev.hour)
    const m = Math.round((ev.hour - h) * 60)
    ev.timeStr = `${String(h).padStart(2, '0')}:${String(m >= 60 ? 59 : m).padStart(2, '0')}`
    const prev = i > 0 ? raw[i - 1].height
      : (ev.type === 'high' ? Math.round(mean - amplitude) : Math.round(mean + amplitude))
    ev.change = ev.height - prev
  })
  return raw
}

const fmtSun = (h) => {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm >= 60 ? 59 : mm).padStart(2, '0')}`
}

// ── 수직 조석 타임라인 ──────────────────────────────────────
function TideTimeline({ events, sunTimes, isToday }) {
  const now = new Date()
  const nowH = now.getHours() + now.getMinutes() / 60
  const CHART_H = 520
  const hp = (h) => (h / 24) * CHART_H

  return (
    <Box sx={{ position: 'relative', height: CHART_H, mx: 2, my: 1 }}>

      {/* 배경 격자선 */}
      {[0, 6, 12, 18, 24].map(h => (
        <Box key={h} sx={{
          position: 'absolute', top: hp(h),
          left: 0, right: 0, height: 1,
          bgcolor: 'rgba(255,255,255,0.07)',
          zIndex: 0,
        }} />
      ))}

      {/* 중앙 세로축 */}
      <Box sx={{
        position: 'absolute', top: 0, bottom: 0,
        left: '58%', width: 2,
        bgcolor: 'rgba(255,255,255,0.18)',
        zIndex: 1,
      }} />

      {/* 시각 라벨 */}
      {[0, 6, 12, 18, 24].map(h => (
        <Typography key={h} sx={{
          position: 'absolute',
          top: hp(h) - 9,
          left: 'calc(58% + 8px)',
          fontSize: '0.68rem',
          color: 'text.disabled',
          fontWeight: 700,
          zIndex: 2,
        }}>{h}</Typography>
      ))}

      {/* 일출·일몰 */}
      {sunTimes && [
        { hour: sunTimes.sunrise, label: `일출 ${fmtSun(sunTimes.sunrise)}` },
        { hour: sunTimes.sunset,  label: `일몰 ${fmtSun(sunTimes.sunset)}`  },
      ].map(({ hour, label }) => (
        <Box key={label} sx={{ position: 'absolute', top: hp(hour), left: '58%', right: 0, zIndex: 2 }}>
          <Box sx={{ position: 'absolute', left: 0, right: 0, height: 1, bgcolor: 'rgba(245,158,11,0.35)' }} />
          <Typography sx={{
            position: 'absolute', left: 6,
            top: label.startsWith('일출') ? -14 : 2,
            fontSize: '0.6rem', color: '#F59E0B', fontWeight: 600,
          }}>{label}</Typography>
        </Box>
      ))}

      {/* 조석 이벤트 박스 */}
      {events.map((ev, i) => {
        const isHigh = ev.type === 'high'
        const top = hp(ev.hour)
        return (
          <Box key={i} sx={{ position: 'absolute', top, left: 0, right: '42%', zIndex: 3 }}>
            {/* 연결선 (박스 → 축) */}
            <Box sx={{
              position: 'absolute',
              top: 0, right: 0, width: '15%', height: 1,
              bgcolor: isHigh ? 'rgba(248,113,113,0.5)' : 'rgba(96,165,250,0.5)',
            }} />
            {/* 축 위 점 */}
            <Box sx={{
              position: 'absolute',
              top: -4, right: '-4px',
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: isHigh ? '#F87171' : '#60A5FA',
              zIndex: 4,
            }} />
            {/* 이벤트 박스 */}
            <Box sx={{
              position: 'absolute',
              top: -24,
              left: 0, right: '18%',
              bgcolor: isHigh ? 'rgba(127,29,29,0.9)' : 'rgba(30,58,138,0.9)',
              borderLeft: `3px solid ${isHigh ? '#F87171' : '#60A5FA'}`,
              borderRadius: '0 6px 6px 0',
              px: 1.2, py: 0.5,
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.3 }}>
                {isHigh ? '만조' : '간조'} {ev.timeStr}
              </Typography>
              <Typography sx={{
                color: isHigh ? '#FCA5A5' : '#93C5FD',
                fontSize: '0.68rem', lineHeight: 1.2,
              }}>
                ({ev.height}cm)&nbsp;
                {ev.change >= 0 ? '▲' : '▼'}&nbsp;{Math.abs(ev.change)}
              </Typography>
            </Box>
          </Box>
        )
      })}

      {/* 현재 시각 표시 (오늘만) */}
      {isToday && nowH >= 0 && nowH < 24 && (
        <Box sx={{ position: 'absolute', top: hp(nowH), left: 0, right: 0, zIndex: 5 }}>
          <Box sx={{ position: 'absolute', left: '58%', right: 0, height: 2, bgcolor: '#00B4D8' }} />
          <Box sx={{
            position: 'absolute',
            left: 'calc(58% + 4px)', top: -11,
            bgcolor: '#00B4D8', borderRadius: 0.5,
            px: 0.8, py: 0.15,
          }}>
            <Typography sx={{ color: '#fff', fontSize: '0.62rem', fontWeight: 700 }}>
              {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function MulddaeTab() {
  const baseDate = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [offset, setOffset] = useState(0)
  const [locIdx, setLocIdx] = useState(10) // 부산

  const displayDate = useMemo(() => {
    const d = new Date(baseDate); d.setDate(d.getDate() + offset); return d
  }, [baseDate, offset])

  const num        = useMemo(() => getMulddaeNum(displayDate), [displayDate])
  const lunarDay   = useMemo(() => getLunarDay(displayDate),   [displayDate])
  const info       = MULDDAE_INFO[num]
  const sunTimes   = useMemo(() => getSunTimes(displayDate),   [displayDate])

  const loc = TIDE_LOCATIONS[locIdx]
  const [tideEvents, setTideEvents] = useState(() => calcTideEvents(displayDate, loc))
  const [isRealData, setIsRealData] = useState(false)
  const [tideLoading, setTideLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!loc.lot) {
      setTideEvents(calcTideEvents(displayDate, loc))
      setIsRealData(false)
      return
    }
    setTideLoading(true)
    fetchRealTideEvents(displayDate, loc)
      .then(events => {
        if (cancelled) return
        if (events.length === 0) throw new Error('empty')
        setTideEvents(events)
        setIsRealData(true)
      })
      .catch(() => {
        if (cancelled) return
        setTideEvents(calcTideEvents(displayDate, loc))
        setIsRealData(false)
      })
      .finally(() => { if (!cancelled) setTideLoading(false) })
    return () => { cancelled = true }
  }, [displayDate, loc])

  const dateStr = displayDate.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
  const msg = info.level >= 4 ? TIDE_MSGS.strong : info.level <= 2 ? TIDE_MSGS.weak : TIDE_MSGS.mid

  return (
    <Box sx={{ pb: 10 }}>

      {/* ── 헤더 ── */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

        {/* 날짜 + 물때 뱃지 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1.5, pb: 0.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{dateStr}</Typography>
            <Typography variant="caption" color="text.secondary">음력 {lunarDay}일</Typography>
          </Box>
          <Box sx={{
            textAlign: 'center',
            bgcolor: `${info.color}22`,
            border: `2px solid ${info.color}`,
            borderRadius: 2,
            px: 2, py: 0.5, minWidth: 72,
          }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: info.color, lineHeight: 1 }}>
              {num}물
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: info.color, fontWeight: 600 }}>{info.name}</Typography>
          </Box>
        </Box>

        {/* 15단계 막대 */}
        <Box sx={{ px: 2, pb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2.5px', height: 40 }}>
            {Array.from({ length: 15 }, (_, i) => {
              const n = i + 1
              const m = MULDDAE_INFO[n]
              const isActive = n === num
              return (
                <Box key={n} sx={{ flex: 1, position: 'relative' }}>
                  <Box sx={{
                    height: BAR_HEIGHTS[m.level],
                    bgcolor: m.color,
                    opacity: isActive ? 1 : 0.28,
                    borderRadius: '3px 3px 0 0',
                    boxShadow: isActive ? `0 0 8px ${m.color}` : 'none',
                  }} />
                  {isActive && (
                    <Box sx={{
                      position: 'absolute', bottom: -4, left: '50%',
                      transform: 'translateX(-50%)',
                      width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff',
                    }} />
                  )}
                </Box>
              )
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
            {LEVEL_LABELS.map(({ label }) => (
              <Typography key={label} sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{label}</Typography>
            ))}
          </Box>
        </Box>

        {/* 안전 메시지 */}
        <Box sx={{ mx: 2, mb: 1, px: 1.5, py: 0.8, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">{msg}</Typography>
        </Box>

        {/* 날짜 이동 */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)', px: 1, py: 0.3,
        }}>
          <IconButton size="small" onClick={() => setOffset(o => o - 1)}>
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {offset !== 0 && (
              <Button size="small" variant="text" onClick={() => setOffset(0)}
                sx={{ fontSize: '0.72rem', py: 0.2, minWidth: 0, color: 'primary.light' }}>
                오늘로
              </Button>
            )}
            <Typography variant="body2" sx={{ fontWeight: 600, color: offset === 0 ? 'primary.light' : 'text.primary' }}>
              {offset === 0 ? '오늘' : offset === -1 ? '전날' : offset === 1 ? '다음날' : `${offset > 0 ? '+' : ''}${offset}일`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOffset(o => o + 1)}>
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── 지역 선택 ── */}
      <Box sx={{ px: 2, pt: 1.2, pb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.8 }}>
          지역 선택
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
          {TIDE_LOCATIONS.map((loc, i) => (
            <Chip
              key={loc.name}
              label={loc.name}
              size="small"
              onClick={() => setLocIdx(i)}
              variant={locIdx === i ? 'filled' : 'outlined'}
              color={locIdx === i ? 'primary' : 'default'}
              sx={{ fontSize: '0.73rem', cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* ── 조석 타임라인 ── */}
      <Box sx={{ position: 'relative' }}>
        <TideTimeline events={tideEvents} sunTimes={sunTimes} isToday={offset === 0} />
        {tideLoading && (
          <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 1, p: 0.6 }}>
            <CircularProgress size={14} sx={{ color: '#fff' }} />
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ px: 2, display: 'block', mt: 0.5, pb: 2 }}>
        {isRealData
          ? '※ 국립해양조사원 실시간 예측 조위 기준입니다.'
          : '※ 이 지역은 실시간 데이터가 없어 음력 기반 예상 조석으로 표시돼요.'}
      </Typography>
    </Box>
  )
}

const WINDY_OVERLAYS = [
  { value: 'waves', label: '파도' },
  { value: 'wind', label: '바람' },
  { value: 'rain', label: '강수' },
  { value: 'temp', label: '기온' },
]

const WINDY_LOCATIONS = [
  { name: '부산 해운대', lat: 35.1588, lng: 129.1603 },
  { name: '제주 함덕',   lat: 33.5444, lng: 126.6699 },
  { name: '강릉 경포',   lat: 37.8006, lng: 128.9011 },
  { name: '여수 돌산',   lat: 34.7204, lng: 127.7244 },
  { name: '인천 을왕리', lat: 37.4490, lng: 126.3730 },
  { name: '거제 학동',   lat: 34.8038, lng: 128.6215 },
  { name: '태안 만리포', lat: 36.7768, lng: 126.2909 },
  { name: '포항 호미곶', lat: 36.0779, lng: 129.5647 },
]

function WindyTab() {
  const fullscreenRef = useRef(null)
  const { isFullscreen } = useFullscreen(fullscreenRef)
  const isDesktop = useIsDesktop()
  const [windyIdx, setWindyIdx] = useState(0)
  const [overlay, setOverlay] = useState('waves')
  const location = WINDY_LOCATIONS[windyIdx]

  const src = `https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lng}&detailLat=${location.lat}&detailLon=${location.lng}&zoom=7&level=surface&overlay=${overlay}&product=ecmwf&message=true&marker=true&calendar=now&type=map&location=coordinates&metricWind=default&metricTemp=default`

  // 데스크탑에서는 상단바(로고+탭)가 없어져서 남는 여백만큼 지도를 늘려야 하는데,
  // 픽셀 값을 다시 추정하는 대신 위 컨트롤(지역 선택/오버레이) 높이는 그대로 두고
  // 지도 영역만 flex:1로 나머지 공간을 자동으로 채우게 한다.
  return (
    <Box sx={isDesktop ? { display: 'flex', flexDirection: 'column', height: '100vh' } : undefined}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel>해안 지역 선택</InputLabel>
          <Select value={windyIdx} label="해안 지역 선택" onChange={e => setWindyIdx(e.target.value)}>
            {WINDY_LOCATIONS.map((loc, i) => (
              <MenuItem key={loc.name} value={i}>{loc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ px: 2, pb: 1 }}>
        <ToggleButtonGroup
          value={overlay}
          exclusive
          onChange={(_, v) => { if (v) setOverlay(v) }}
          size="small"
          fullWidth
        >
          {WINDY_OVERLAYS.map(o => (
            <ToggleButton key={o.value} value={o.value} sx={{ fontSize: '0.75rem', py: 0.5 }}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box ref={fullscreenRef} sx={{ position: 'relative', ...(isDesktop && !isFullscreen ? { flex: 1, minHeight: 0 } : {}) }}>
        <Box
          key={src}
          component="iframe"
          src={src}
          sx={{ width: '100%', height: isFullscreen ? '100vh' : isDesktop ? '100%' : 'calc(100vh - 240px)', border: 'none', display: 'block' }}
          allowFullScreen
          title="Windy 실시간 기상 지도"
        />
        {/* Windy 자체 UI가 상단(줌/전체화면 아이콘)과 하단(재생 타임라인)을 차지해서,
            겹치지 않는 우측 중간 높이에 배치한다 */}
        <FullscreenToggleButton fullscreenRef={fullscreenRef} sx={{ position: 'absolute', bottom: 90, right: 8, zIndex: 10 }} />
      </Box>
    </Box>
  )
}

export default function WeatherPage() {
  const { pathname } = useLocation()
  const isDesktop = useIsDesktop()
  // 데스크탑은 SideNav 아코디언이 URL로 하위 탭을 고르므로 경로에서 그대로 읽어오면 되지만,
  // 모바일은 원래처럼(라우팅 없이) 즉시 로컬 상태로만 탭을 바꾼다. 탭 전환마다 URL이 바뀌면
  // 라우트가 리렌더되면서 모바일 UI가 미묘하게 달라 보이는 문제가 있었다.
  const [mobileTab, setMobileTab] = useState(() => Math.max(0, WEATHER_SECTIONS.findIndex(s => s.path === pathname)))
  const routeTab = Math.max(0, WEATHER_SECTIONS.findIndex(s => s.path === pathname))
  const tab = isDesktop ? routeTab : mobileTab

  return (
    <AppLayout>
      {/* 데스크탑에서는 SideNav의 날씨 아코디언으로 하위 탭을 고르고, 다크모드 토글도
          SideNav로 옮겨서 이 상단바 자체가 필요 없다. 모바일에서만 보여준다. */}
      {!isDesktop && (
        <AppBar position="sticky">
          <Toolbar>
            <Box
              onClick={() => setMobileTab(0)}
              sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
            >
              <WavesIcon sx={{ mr: 1, color: 'primary.light' }} />
              <Typography variant="h3">Sea Hunt</Typography>
            </Box>
            <ThemeToggleButton />
          </Toolbar>
          {/* 5개 탭이 fullWidth로 좁게 나뉘는데, 아이콘+글자를 한 줄로 두면 "해양정보" 같은
              4글자 라벨이 한 글자씩 세로로 줄바꿈돼 버려서, 아이콘을 글자 위로 옮기고
              글자 크기를 줄여 한 줄로 표시되게 한다. */}
          <Tabs
            value={tab}
            onChange={(_, v) => setMobileTab(v)}
            variant="fullWidth"
            TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}
            sx={{
              '& .MuiTab-root': {
                minWidth: 0,
                px: 0.5,
                fontSize: '0.68rem',
                whiteSpace: 'nowrap',
              },
            }}
          >
            {WEATHER_SECTIONS.map(({ path, label, icon: Icon }) => (
              <Tab key={path} label={label} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="top" />
            ))}
          </Tabs>
        </AppBar>
      )}

      {tab === 0 && <WindyTab />}
      {tab === 1 && <LiveMapTab />}
      {tab === 2 && <CctvTab />}
      {tab === 3 && <OceanInfoTab />}
      {tab === 4 && <MulddaeTab />}
    </AppLayout>
  )
}
