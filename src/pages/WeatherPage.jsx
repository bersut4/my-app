import { useState, useEffect } from 'react'
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
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import WavesIcon from '@mui/icons-material/Waves'
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import AirIcon from '@mui/icons-material/Air'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import AppLayout from '../components/layout/AppLayout'

const BEACHES = [
  { name: '부산 해운대', region: '부산', lat: 35.1588, lng: 129.1603, streamUrl: null },
  { name: '부산 송정', region: '부산', lat: 35.1794, lng: 129.2072, streamUrl: null },
  { name: '제주 함덕', region: '제주', lat: 33.5444, lng: 126.6699, streamUrl: null },
  { name: '강릉 경포', region: '강원', lat: 37.8006, lng: 128.9011, streamUrl: null },
  { name: '여수 돌산', region: '전남', lat: 34.7204, lng: 127.7244, streamUrl: null },
  { name: '인천 을왕리', region: '인천', lat: 37.4490, lng: 126.3730, streamUrl: null },
  { name: '거제 학동', region: '경남', lat: 34.8038, lng: 128.6215, streamUrl: null },
  { name: '태안 만리포', region: '충남', lat: 36.7768, lng: 126.2909, streamUrl: null },
  { name: '포항 호미곶', region: '경북', lat: 36.0779, lng: 129.5647, streamUrl: null },
]

const WINDY_OVERLAYS = [
  { value: 'waves', label: '파도' },
  { value: 'wind', label: '바람' },
  { value: 'rain', label: '강수' },
  { value: 'temp', label: '기온' },
]

const waveHeightLabel = (h) => {
  if (h == null) return { label: '-', color: 'text.secondary' }
  if (h < 0.3) return { label: '잔잔', color: '#52B788' }
  if (h < 0.6) return { label: '약한 물결', color: '#74B816' }
  if (h < 1.0) return { label: '보통 물결', color: '#F4A261' }
  if (h < 2.0) return { label: '높은 파도', color: '#E76F51' }
  return { label: '매우 높은 파도', color: '#E63946' }
}

function BeachWeatherWidget({ beach }) {
  const [wave, setWave] = useState(null)
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!beach) return
    setWave(null)
    setWeather(null)

    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${beach.lat}&longitude=${beach.lng}&current=wave_height,wave_period,wave_direction&timezone=Asia%2FSeoul&models=ecmwf_wam`)
      .then(r => r.json())
      .then(d => setWave(d.current))
      .catch(() => {})

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lng}&current=temperature_2m,wind_speed_10m,weathercode&timezone=Asia%2FSeoul`)
      .then(r => r.json())
      .then(d => setWeather(d.current))
      .catch(() => {})
  }, [beach])

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const { label: waveLabel, color: waveColor } = waveHeightLabel(wave?.wave_height)

  return (
    <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">{dateStr}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon sx={{ fontSize: 16, color: 'primary.light' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {weather ? `${weather.temperature_2m}°C` : '-'}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">/</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WavesIcon sx={{ fontSize: 16, color: waveColor }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: waveColor }}>
              {wave ? `${wave.wave_height?.toFixed(1)}m` : '-'}
            </Typography>
          </Box>
        </Box>
        {weather && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <AirIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {weather.wind_speed_10m} km/h
            </Typography>
          </Box>
        )}
      </Box>
      <Chip label={waveLabel} size="small" sx={{ bgcolor: waveColor, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
    </Box>
  )
}

function WeeklyWaveCard({ beach }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!beach) return
    setLoading(true)
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${beach.lat}&longitude=${beach.lng}&daily=wave_height_max,wave_period_max&timezone=Asia%2FSeoul&forecast_days=7&models=ecmwf_wam`)
      .then(r => r.json())
      .then(d => { setData(d.daily); setLoading(false) })
      .catch(() => setLoading(false))
  }, [beach])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
  if (!data) return null

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>주간 파도 예보</Typography>
      {data.time.map((date, i) => {
        const h = data.wave_height_max[i]
        const { label, color } = waveHeightLabel(h)
        const d = new Date(date)
        const dayStr = d.toLocaleDateString('ko-KR', { weekday: 'short', month: 'numeric', day: 'numeric' })
        return (
          <Box key={date} sx={{ display: 'flex', alignItems: 'center', py: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>{dayStr}</Typography>
            <Box sx={{ flex: 1, mx: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, height: 6, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min((h ?? 0) / 3 * 100, 100)}%`, height: '100%', bgcolor: color, borderRadius: 1 }} />
            </Box>
            <Typography variant="body2" sx={{ color, fontWeight: 600, width: 40, textAlign: 'right' }}>
              {h ? `${h.toFixed(1)}m` : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, width: 60 }}>{label}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}

function CctvTab() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [cctvTab, setCctvTab] = useState(0)
  const beach = BEACHES[selectedIdx]

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>해변 선택</InputLabel>
          <Select value={selectedIdx} label="해변 선택" onChange={e => setSelectedIdx(e.target.value)}>
            {BEACHES.map((b, i) => (
              <MenuItem key={b.name} value={i}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 영상 영역 */}
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%', bgcolor: '#0a0a0a' }}>
        {beach.streamUrl ? (
          <Box
            component="iframe"
            src={beach.streamUrl}
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            title={`${beach.name} CCTV`}
          />
        ) : (
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <VideocamOffIcon sx={{ fontSize: 52, color: 'grey.700' }} />
            <Typography variant="body2" color="grey.600">실시간 영상 준비 중</Typography>
            <Typography variant="caption" color="grey.700" sx={{ textAlign: 'center', px: 3 }}>
              공식 CCTV 연동 예정
            </Typography>
          </Box>
        )}
      </Box>

      {/* 해변 정보 */}
      <Box sx={{ px: 2, py: 0.8, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.3)' }}>
        <VideocamIcon sx={{ fontSize: 14, color: 'primary.light' }} />
        <Typography variant="caption" color="text.secondary">
          {beach.name} · {beach.region}
        </Typography>
      </Box>

      {/* 날씨/파도 요약 */}
      <BeachWeatherWidget beach={beach} />

      {/* 탭: 주간 파도정보 */}
      <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', mt: 0.5 }}>
        <Tabs
          value={cctvTab}
          onChange={(_, v) => setCctvTab(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}
        >
          <Tab label="주간 파도정보" sx={{ fontSize: '0.8rem' }} />
        </Tabs>
      </Box>

      {cctvTab === 0 && <WeeklyWaveCard beach={beach} />}
    </Box>
  )
}

function WindyTab({ location }) {
  const [overlay, setOverlay] = useState('waves')

  const src = `https://embed.windy.com/embed2.html?lat=${location.lat}&lon=${location.lng}&detailLat=${location.lat}&detailLon=${location.lng}&zoom=7&level=surface&overlay=${overlay}&product=ecmwf&message=true&marker=true&calendar=now&type=map&location=coordinates&metricWind=default&metricTemp=default`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
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
        sx={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
        allowFullScreen
        title="Windy 실시간 기상 지도"
      />
    </Box>
  )
}

const WINDY_LOCATIONS = [
  { name: '부산 해운대', lat: 35.1588, lng: 129.1603 },
  { name: '제주 함덕', lat: 33.5444, lng: 126.6699 },
  { name: '강릉 경포', lat: 37.8006, lng: 128.9011 },
  { name: '여수 돌산', lat: 34.7204, lng: 127.7244 },
  { name: '인천 을왕리', lat: 37.4490, lng: 126.3730 },
  { name: '거제 학동', lat: 34.8038, lng: 128.6215 },
  { name: '태안 만리포', lat: 36.7768, lng: 126.2909 },
  { name: '포항 호미곶', lat: 36.0779, lng: 129.5647 },
]

export default function WeatherPage() {
  const [tab, setTab] = useState(0)
  const [windyIdx, setWindyIdx] = useState(0)
  const windyLocation = WINDY_LOCATIONS[windyIdx]

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <WavesIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>Sea Hunt</Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="실시간 지도" icon={<SatelliteAltIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="CCTV" icon={<VideocamIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {tab === 0 && (
        <>
          <Box sx={{ px: 2, pt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>해안 지역 선택</InputLabel>
              <Select value={windyIdx} label="해안 지역 선택" onChange={e => setWindyIdx(e.target.value)}>
                {WINDY_LOCATIONS.map((loc, i) => (
                  <MenuItem key={loc.name} value={i}>{loc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <WindyTab location={windyLocation} />
        </>
      )}
      {tab === 1 && <CctvTab />}
    </AppLayout>
  )
}
