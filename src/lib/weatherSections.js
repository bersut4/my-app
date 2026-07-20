import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import MapIcon from '@mui/icons-material/Map'
import VideocamIcon from '@mui/icons-material/Videocam'
import LayersIcon from '@mui/icons-material/Layers'
import WaterIcon from '@mui/icons-material/Water'

// 날씨 페이지 하위 탭 순서 = URL 세그먼트 매핑. SideNav 아코디언(데스크탑)과
// 페이지 내 Tabs(모바일)가 둘 다 이 순서를 기준으로 /weather/:section을 주고받는다.
export const WEATHER_SECTIONS = [
  { key: 'forecast', label: '예보', icon: SatelliteAltIcon },
  { key: 'map', label: '지도', icon: MapIcon },
  { key: 'cctv', label: 'CCTV', icon: VideocamIcon },
  { key: 'ocean', label: '해양정보', icon: LayersIcon },
  { key: 'tide', label: '물때', icon: WaterIcon },
]
