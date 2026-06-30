import { useState, useEffect, useRef } from 'react'
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
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import WavesIcon from '@mui/icons-material/Waves'
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import HlsVideoPlayer from '../components/HlsVideoPlayer'
import { useKakaoLoader } from '../hooks/useKakaoLoader'

const KHOA_TOKEN = 'm4NiLawsC202gM5ixA7MPTYtO19KmV'
const khoa = (key) => `https://www.khoa.go.kr/SEAFOG/${KHOA_TOKEN}/hls/khoa/${key}/s.m3u8`
const kbs = (id) => `https://www.badatime.com/cctv/${id}`

const CCTV_CAMERAS = [
  // ── 서해 ──────────────────────────────────────────────────────
  { key: 'Incheon',        name: '인천항 조위관측',       region: '서해', lat: 37.4539, lng: 126.6163, type: 'hls' },
  { key: 'SeaFog_Incheon', name: '인천항 해무관측',       region: '서해', lat: 37.4549, lng: 126.6050, type: 'hls' },
  { key: 'bd100',          name: '인천 연안부두',          region: '서해', lat: 37.4680, lng: 126.6290, type: 'kbs', badatimeId: 100 },
  { key: 'bd101',          name: '연평도',                 region: '서해', lat: 37.6700, lng: 125.6900, type: 'kbs', badatimeId: 101 },
  { key: 'SeaFog_PTDJ',    name: '평택당진항 해무관측',   region: '서해', lat: 36.9927, lng: 126.8219, type: 'hls' },
  { key: 'SeaFog_Daesan',  name: '대산항 해무관측',       region: '서해', lat: 37.0196, lng: 126.3567, type: 'hls' },
  { key: 'bd102',          name: '신진항 (태안)',           region: '서해', lat: 36.7000, lng: 126.1500, type: 'kbs', badatimeId: 102 },
  { key: 'bd103',          name: '격렬비열도',             region: '서해', lat: 36.6300, lng: 125.5800, type: 'kbs', badatimeId: 103 },
  { key: 'Gunsan',         name: '군산항 조위관측',       region: '서해', lat: 35.9756, lng: 126.7106, type: 'hls' },
  { key: 'SeaFog_Gunsan',  name: '군산항 해무관측',       region: '서해', lat: 35.9760, lng: 126.7100, type: 'hls' },
  { key: 'bd104',          name: '비응항 (군산)',           region: '서해', lat: 35.9900, lng: 126.6800, type: 'kbs', badatimeId: 104 },
  // ── 남해 ──────────────────────────────────────────────────────
  { key: 'SeaFog_Mokpo',   name: '목포항 해무관측',       region: '남해', lat: 34.7799, lng: 126.3769, type: 'hls' },
  { key: 'bd106',          name: '목포북항',               region: '남해', lat: 34.8000, lng: 126.3900, type: 'kbs', badatimeId: 106 },
  { key: 'bd107',          name: '가거도',                 region: '남해', lat: 34.0800, lng: 125.1200, type: 'kbs', badatimeId: 107 },
  { key: 'Jindo',          name: '진도항 조위관측',       region: '남해', lat: 34.4048, lng: 126.2574, type: 'hls' },
  { key: 'bd108',          name: '완도항',                 region: '남해', lat: 34.3400, lng: 126.7600, type: 'kbs', badatimeId: 108 },
  { key: 'bd109',          name: '거문도',                 region: '남해', lat: 34.0000, lng: 127.3100, type: 'kbs', badatimeId: 109 },
  { key: 'Yeosu',          name: '여수항 조위관측',       region: '남해', lat: 34.7604, lng: 127.6622, type: 'hls' },
  { key: 'SeaFog_Yeosu',   name: '여수항 해무관측',       region: '남해', lat: 34.7500, lng: 127.6700, type: 'hls' },
  { key: 'bd97',           name: '오동도 (여수)',           region: '남해', lat: 34.7407, lng: 127.7358, type: 'kbs', badatimeId: 97 },
  { key: 'bd98',           name: '마산 여객선터미널',      region: '남해', lat: 35.1990, lng: 128.5820, type: 'kbs', badatimeId: 98 },
  // ── 동해 ──────────────────────────────────────────────────────
  { key: 'Busan',          name: '부산항 조위관측',       region: '동해', lat: 35.1028, lng: 129.0403, type: 'hls' },
  { key: 'SeaFog_Busan',   name: '부산항 해무관측',       region: '동해', lat: 35.0940, lng: 129.0500, type: 'hls' },
  { key: 'bd110',          name: '수영만 (해운대)',         region: '동해', lat: 35.1660, lng: 129.1410, type: 'kbs', badatimeId: 110 },
  { key: 'SeaFog_Ulsan',   name: '울산항 해무관측',       region: '동해', lat: 35.5013, lng: 129.3867, type: 'hls' },
  { key: 'SeaFog_Pohang',  name: '포항항 해무관측',       region: '동해', lat: 36.0183, lng: 129.3658, type: 'hls' },
  { key: 'bd111',          name: '두호동 해안로 (포항)',   region: '동해', lat: 36.0280, lng: 129.3720, type: 'kbs', badatimeId: 111 },
  { key: 'Mukho',          name: '묵호항 조위관측',       region: '동해', lat: 37.5505, lng: 129.1220, type: 'hls' },
  { key: 'bd112',          name: '주문진 해변 (강릉)',     region: '동해', lat: 37.8970, lng: 128.8230, type: 'kbs', badatimeId: 112 },
  { key: 'bd113',          name: '속초 등대',              region: '동해', lat: 38.2210, lng: 128.5890, type: 'kbs', badatimeId: 113 },
  { key: 'bd114',          name: '저동항 (울릉도)',         region: '동해', lat: 37.4900, lng: 130.9200, type: 'kbs', badatimeId: 114 },
  { key: 'bd115',          name: '독도',                   region: '동해', lat: 37.2400, lng: 131.8640, type: 'kbs', badatimeId: 115 },
  // ── 제주 ──────────────────────────────────────────────────────
  { key: 'Moseulpo',       name: '모슬포항 조위관측',     region: '제주', lat: 33.2150, lng: 126.2516, type: 'hls' },
  { key: 'bd116',          name: '마라도',                 region: '제주', lat: 33.1100, lng: 126.2700, type: 'kbs', badatimeId: 116 },
].map(cam => ({
  ...cam,
  src: cam.type === 'hls' ? khoa(cam.key) : null,
  iframeUrl: cam.type === 'kbs' ? kbs(cam.badatimeId) : null,
}))

const REGION_COLORS = { 서해: '#0096C7', 남해: '#0077B6', 동해: '#023E8A', 제주: '#48CAE4' }

function CctvMap({ cameras, selectedKey, onSelect }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerDataRef = useRef([])
  const { ready } = useKakaoLoader()

  useEffect(() => {
    if (!ready || !containerRef.current) return
    const { kakao } = window
    const center = new kakao.maps.LatLng(36.0, 127.8)
    mapRef.current = new kakao.maps.Map(containerRef.current, { center, level: 9 })

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
  }, [ready])

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

function CctvTab() {
  const [selectedCamera, setSelectedCamera] = useState(CCTV_CAMERAS[0])

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
        <Chip
          label={selectedCamera.type === 'kbs' ? 'KBS' : '해양조사원'}
          size="small"
          sx={{ fontSize: '0.6rem', height: 20, bgcolor: selectedCamera.type === 'kbs' ? '#1a5276' : undefined }}
        />
      </Box>

      {selectedCamera.type === 'kbs' ? (
        <Box
          key={selectedCamera.iframeUrl}
          component="iframe"
          src={selectedCamera.iframeUrl}
          sx={{ width: '100%', height: 320, border: 'none', display: 'block' }}
          title={selectedCamera.name}
        />
      ) : (
        <HlsVideoPlayer key={selectedCamera.src} src={selectedCamera.src} title={selectedCamera.name} />
      )}

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
  const [windyIdx, setWindyIdx] = useState(0)
  const [overlay, setOverlay] = useState('waves')
  const location = WINDY_LOCATIONS[windyIdx]

  const src = `https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lng}&detailLat=${location.lat}&detailLon=${location.lng}&zoom=7&level=surface&overlay=${overlay}&product=ecmwf&message=true&marker=true&calendar=now&type=map&location=coordinates&metricWind=default&metricTemp=default`

  return (
    <Box>
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
      <Box
        key={src}
        component="iframe"
        src={src}
        sx={{ width: '100%', height: 'calc(100vh - 240px)', border: 'none', display: 'block' }}
        allowFullScreen
        title="Windy 실시간 기상 지도"
      />
    </Box>
  )
}

export default function WeatherPage() {
  const [tab, setTab] = useState(0)

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <WavesIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>Sea Hunt</Typography>
          <ThemeToggleButton />
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="실시간 지도" icon={<SatelliteAltIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="CCTV" icon={<VideocamIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {tab === 0 && <WindyTab />}
      {tab === 1 && <CctvTab />}
    </AppLayout>
  )
}
