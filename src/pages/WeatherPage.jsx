import { useState, useEffect, useRef, useMemo } from 'react'
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
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import WavesIcon from '@mui/icons-material/Waves'
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import WaterIcon from '@mui/icons-material/Water'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import HlsVideoPlayer from '../components/HlsVideoPlayer'
import { useKakaoLoader } from '../hooks/useKakaoLoader'

const KHOA_TOKEN = 'm4NiLawsC202gM5ixA7MPTYtO19KmV'
const khoa = (key) => `https://www.khoa.go.kr/SEAFOG/${KHOA_TOKEN}/hls/khoa/${key}/s.m3u8`

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
].map(cam => ({ ...cam, src: khoa(cam.key) }))

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
        <Chip label="국립해양조사원" size="small" sx={{ fontSize: '0.6rem', height: 20 }} />
      </Box>

      <HlsVideoPlayer key={selectedCamera.src} src={selectedCamera.src} title={selectedCamera.name} />

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

// ── 물때 계산 ─────────────────────────────────────────────────
const LUNAR_MONTH = 29.53058868

function getMulddaeNum(date = new Date()) {
  const refMs = new Date('2000-01-06T18:14:00Z').getTime()
  const lunarMs = LUNAR_MONTH * 86400000
  const elapsed = ((date.getTime() - refMs) % lunarMs + lunarMs) % lunarMs
  const dayInCycle = elapsed / 86400000
  const half = LUNAR_MONTH / 2
  const inHalf = dayInCycle < half ? dayInCycle : dayInCycle - half
  // 사리는 삭/망 후 약 1.5일 뒤 → 해당 시점을 1물로 시작
  const adjusted = (inHalf - 1.5 + half) % half
  return Math.min(15, Math.max(1, Math.floor((adjusted / half) * 14) + 1))
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

const BADATIME_LOCATIONS = [
  { name: '인천',   url: 'https://www.badatime.com/36.html' },
  { name: '군산',   url: 'https://www.badatime.com/25.html' },
  { name: '목포',   url: 'https://www.badatime.com/21.html' },
  { name: '여수',   url: 'https://www.badatime.com/16.html' },
  { name: '부산',   url: 'https://www.badatime.com/1.html' },
  { name: '울산',   url: 'https://www.badatime.com/2.html' },
  { name: '포항',   url: 'https://www.badatime.com/3.html' },
  { name: '속초',   url: 'https://www.badatime.com/10.html' },
  { name: '제주',   url: 'https://www.badatime.com/18.html' },
]

function MulddaeTab() {
  const num = useMemo(() => getMulddaeNum(), [])
  const info = MULDDAE_INFO[num]
  const [locIdx, setLocIdx] = useState(4) // 부산 기본
  const today = new Date()
  const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })

  const msg = info.level >= 4 ? TIDE_MSGS.strong : info.level <= 2 ? TIDE_MSGS.weak : TIDE_MSGS.mid

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Card>
          <CardContent sx={{ pb: '12px !important' }}>
            <Typography variant="caption" color="text.secondary">{dateStr} 오늘의 물때</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              {/* 물때 숫자 */}
              <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                <Typography sx={{ fontSize: '2.8rem', fontWeight: 800, color: info.color, lineHeight: 1 }}>
                  {num}물
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.3 }}>{info.name}</Typography>
              </Box>

              {/* 15단계 막대 그래프 */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 48 }}>
                  {Array.from({ length: 15 }, (_, i) => {
                    const n = i + 1
                    const m = MULDDAE_INFO[n]
                    const isActive = n === num
                    return (
                      <Box
                        key={n}
                        sx={{
                          flex: 1,
                          height: BAR_HEIGHTS[m.level],
                          bgcolor: isActive ? m.color : m.color,
                          opacity: isActive ? 1 : 0.35,
                          borderRadius: '2px 2px 0 0',
                          border: isActive ? '1.5px solid #fff' : 'none',
                          transition: 'opacity 0.2s',
                        }}
                      />
                    )
                  })}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.4 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>사리</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>조금</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>사리</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 1.5, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">{msg}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 지역별 조석 예보 */}
      <Box sx={{ px: 2, pb: 1 }}>
        <FormControl fullWidth size="small">
          <InputLabel>지역 선택</InputLabel>
          <Select value={locIdx} label="지역 선택" onChange={e => setLocIdx(e.target.value)}>
            {BADATIME_LOCATIONS.map((loc, i) => (
              <MenuItem key={loc.name} value={i}>{loc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', mb: 0.5 }}>
        상세 조석 예보 (출처: 바다타임)
      </Typography>
      <Box
        key={BADATIME_LOCATIONS[locIdx].url}
        component="iframe"
        src={BADATIME_LOCATIONS[locIdx].url}
        sx={{ width: '100%', height: 'calc(100vh - 380px)', border: 'none', display: 'block' }}
        title="바다타임 물때표"
      />
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
          <Tab label="물때" icon={<WaterIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {tab === 0 && <WindyTab />}
      {tab === 1 && <CctvTab />}
      {tab === 2 && <MulddaeTab />}
    </AppLayout>
  )
}
