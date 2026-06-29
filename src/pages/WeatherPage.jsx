import { useState } from 'react'
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
import WavesIcon from '@mui/icons-material/Waves'
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import VideocamIcon from '@mui/icons-material/Videocam'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import HlsVideoPlayer from '../components/HlsVideoPlayer'

const KHOA_TOKEN = 'm4NiLawsC202gM5ixA7MPTYtO19KmV'
const khoa = (key) => `https://www.khoa.go.kr/SEAFOG/${KHOA_TOKEN}/hls/khoa/${key}/s.m3u8`

const CCTV_CAMERAS = [
  { name: '인천', region: '인천', src: khoa('Incheon') },
  { name: '부산', region: '부산', src: khoa('Busan') },
  { name: '부산 해무', region: '부산', src: khoa('SeaFog_Busan') },
  { name: '평택 당진', region: '충남', src: khoa('SeaFog_PTDJ') },
]

const WINDY_OVERLAYS = [
  { value: 'waves', label: '파도' },
  { value: 'wind', label: '바람' },
  { value: 'rain', label: '강수' },
  { value: 'temp', label: '기온' },
]

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

function CctvTab() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const cam = CCTV_CAMERAS[selectedIdx]

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <FormControl fullWidth size="small">
          <InputLabel>카메라 선택</InputLabel>
          <Select value={selectedIdx} label="카메라 선택" onChange={e => setSelectedIdx(e.target.value)}>
            {CCTV_CAMERAS.map((c, i) => (
              <MenuItem key={c.name} value={i}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <HlsVideoPlayer key={cam.src} src={cam.src} title={cam.name} />

      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideocamIcon sx={{ fontSize: 14, color: 'primary.light' }} />
        <Typography variant="caption" color="text.secondary">{cam.name} · {cam.region}</Typography>
        <Chip label="국립해양조사원" size="small" sx={{ fontSize: '0.6rem', height: 18, ml: 'auto' }} />
      </Box>
    </Box>
  )
}

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
