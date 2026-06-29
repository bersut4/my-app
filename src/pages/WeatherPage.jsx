import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Grid from '@mui/material/Grid'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import WavesIcon from '@mui/icons-material/Waves'
import VideocamIcon from '@mui/icons-material/Videocam'
import AirIcon from '@mui/icons-material/Air'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import WaterIcon from '@mui/icons-material/Water'
import AppLayout from '../components/layout/AppLayout'

const COAST_LOCATIONS = [
  { name: '부산 해운대', lat: 35.1588, lng: 129.1603 },
  { name: '제주 함덕', lat: 33.5444, lng: 126.6699 },
  { name: '강릉 경포', lat: 37.8006, lng: 128.9011 },
  { name: '여수 돌산', lat: 34.7204, lng: 127.7244 },
  { name: '인천 을왕리', lat: 37.4490, lng: 126.3730 },
  { name: '거제 학동', lat: 34.8038, lng: 128.6215 },
  { name: '태안 만리포', lat: 36.7768, lng: 126.2909 },
  { name: '포항 호미곶', lat: 36.0779, lng: 129.5647 },
]

const WMO_CODES = {
  0: '맑음', 1: '대체로 맑음', 2: '부분 흐림', 3: '흐림',
  45: '안개', 48: '짙은 안개',
  51: '이슬비(약)', 53: '이슬비', 55: '이슬비(강)',
  61: '비(약)', 63: '비', 65: '비(강)',
  71: '눈(약)', 73: '눈', 75: '눈(강)',
  80: '소나기(약)', 81: '소나기', 82: '소나기(강)',
  95: '뇌우', 99: '뇌우+우박',
}

const waveHeightLabel = (h) => {
  if (h < 0.3) return { label: '잔잔', color: '#52B788' }
  if (h < 0.6) return { label: '약한 물결', color: '#74B816' }
  if (h < 1.0) return { label: '보통 물결', color: '#F4A261' }
  if (h < 2.0) return { label: '높은 파도', color: '#E76F51' }
  return { label: '매우 높은 파도', color: '#E63946' }
}

function WeatherTab({ location }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) return
    setLoading(true)
    setError(null)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weathercode,precipitation&hourly=temperature_2m,precipitation_probability&timezone=Asia%2FSeoul&forecast_days=1`
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('날씨 정보를 불러오지 못했어요.'); setLoading(false) })
  }, [location])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>
  if (!data) return null

  const c = data.current
  const wmo = WMO_CODES[c.weathercode] ?? '알 수 없음'

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.light' }}>{c.temperature_2m}°C</Typography>
          <Typography color="text.secondary">{wmo}</Typography>
          <Typography variant="body2" color="text.secondary">체감 {c.apparent_temperature}°C · 습도 {c.relative_humidity_2m}%</Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AirIcon sx={{ color: 'primary.light', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary">바람</Typography>
              </Box>
              <Typography variant="h3">{c.wind_speed_10m} km/h</Typography>
              <Typography variant="caption" color="text.secondary">방향 {c.wind_direction_10m}°</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WaterIcon sx={{ color: 'primary.light', fontSize: 20 }} />
                <Typography variant="caption" color="text.secondary">강수량</Typography>
              </Box>
              <Typography variant="h3">{c.precipitation} mm</Typography>
              <Typography variant="caption" color="text.secondary">현재 강수</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

function WaveTab({ location }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) return
    setLoading(true)
    setError(null)
    // ECMWF WAM 모델 사용 (Open-Meteo Marine API)
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${location.lat}&longitude=${location.lng}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_period&hourly=wave_height,wave_period&timezone=Asia%2FSeoul&forecast_days=1&models=ecmwf_wam`
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('파도 정보를 불러오지 못했어요.'); setLoading(false) })
  }, [location])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>
  if (!data?.current) return null

  const c = data.current
  const { label, color } = waveHeightLabel(c.wave_height)

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
        데이터: ECMWF WAM 모델
      </Typography>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, color }}>{c.wave_height?.toFixed(1) ?? '-'} m</Typography>
          <Typography sx={{ color, fontWeight: 600 }}>{label}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            파주기 {c.wave_period?.toFixed(1) ?? '-'}초 · 파향 {c.wave_direction ?? '-'}°
          </Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">풍랑</Typography>
              <Typography variant="h3" sx={{ mt: 0.5 }}>{c.wind_wave_height?.toFixed(1) ?? '-'} m</Typography>
              <Typography variant="caption" color="text.secondary">주기 {c.wind_wave_period?.toFixed(1) ?? '-'}초</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">너울</Typography>
              <Typography variant="h3" sx={{ mt: 0.5 }}>{c.swell_wave_height?.toFixed(1) ?? '-'} m</Typography>
              <Typography variant="caption" color="text.secondary">주기 {c.swell_wave_period?.toFixed(1) ?? '-'}초</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {data.hourly && (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>시간별 파고 예보</Typography>
            <Box sx={{ overflowX: 'auto', display: 'flex', gap: 1.5 }}>
              {data.hourly.time.slice(0, 12).map((t, i) => {
                const h = data.hourly.wave_height[i]
                const { color: c2 } = waveHeightLabel(h ?? 0)
                return (
                  <Box key={t} sx={{ textAlign: 'center', minWidth: 44 }}>
                    <Typography variant="caption" color="text.secondary">{t.slice(11, 16)}</Typography>
                    <Typography variant="body2" sx={{ color: c2, fontWeight: 600 }}>{h?.toFixed(1) ?? '-'}m</Typography>
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

function CctvTab() {
  return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
      <VideocamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h3" color="text.secondary" sx={{ mb: 1 }}>해변 CCTV</Typography>
      <Typography color="text.secondary" variant="body2">
        국가 해양 CCTV 연동은 3차 개발에서 추가될 예정이에요.
      </Typography>
    </Box>
  )
}

export default function WeatherPage() {
  const [tab, setTab] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const location = COAST_LOCATIONS[selectedIdx]

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <WavesIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>Sea Hunt</Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="날씨" icon={<WbSunnyIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="파도" icon={<WavesIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="CCTV" icon={<VideocamIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      <Box sx={{ px: 2, pt: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>해안 지역 선택</InputLabel>
          <Select value={selectedIdx} label="해안 지역 선택" onChange={e => setSelectedIdx(e.target.value)}>
            {COAST_LOCATIONS.map((loc, i) => (
              <MenuItem key={loc.name} value={i}>{loc.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {tab === 0 && <WeatherTab location={location} />}
      {tab === 1 && <WaveTab location={location} />}
      {tab === 2 && <CctvTab />}
    </AppLayout>
  )
}
