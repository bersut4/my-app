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
import WavesIcon from '@mui/icons-material/Waves'
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import WaterIcon from '@mui/icons-material/Water'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import HlsVideoPlayer from '../components/HlsVideoPlayer'
import { useKakaoLoader } from '../hooks/useKakaoLoader'
import { useMapType } from '../contexts/FontSizeContext'

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
const TIDE_LOCATIONS = [
  { name: '인천', lunitidalHour: 1.5,  maxRange: 860, meanLevel: 440 },
  { name: '군산', lunitidalHour: 2.5,  maxRange: 640, meanLevel: 330 },
  { name: '목포', lunitidalHour: 3.5,  maxRange: 380, meanLevel: 200 },
  { name: '여수', lunitidalHour: 6.0,  maxRange: 170, meanLevel: 90  },
  { name: '부산', lunitidalHour: 0.5,  maxRange: 115, meanLevel: 65  },
  { name: '울산', lunitidalHour: 1.0,  maxRange: 90,  meanLevel: 50  },
  { name: '포항', lunitidalHour: 1.5,  maxRange: 50,  meanLevel: 30  },
  { name: '속초', lunitidalHour: 2.0,  maxRange: 40,  meanLevel: 25  },
  { name: '제주', lunitidalHour: 5.0,  maxRange: 150, meanLevel: 80  },
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

// 조석 이벤트 계산 (M2 조화상수 기반 근사)
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
  const [locIdx, setLocIdx] = useState(4)

  const displayDate = useMemo(() => {
    const d = new Date(baseDate); d.setDate(d.getDate() + offset); return d
  }, [baseDate, offset])

  const num        = useMemo(() => getMulddaeNum(displayDate), [displayDate])
  const lunarDay   = useMemo(() => getLunarDay(displayDate),   [displayDate])
  const info       = MULDDAE_INFO[num]
  const tideEvents = useMemo(() => calcTideEvents(displayDate, TIDE_LOCATIONS[locIdx]), [displayDate, locIdx])
  const sunTimes   = useMemo(() => getSunTimes(displayDate),   [displayDate])

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
      <TideTimeline events={tideEvents} sunTimes={sunTimes} isToday={offset === 0} />

      <Typography variant="caption" color="text.disabled" sx={{ px: 2, display: 'block', mt: 0.5, pb: 2 }}>
        ※ 음력 기반 예상 조석입니다. 정확한 정보는 국립해양조사원을 확인하세요.
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
