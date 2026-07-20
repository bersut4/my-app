import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt'
import MapIcon from '@mui/icons-material/Map'
import VideocamIcon from '@mui/icons-material/Videocam'
import LayersIcon from '@mui/icons-material/Layers'
import WaterIcon from '@mui/icons-material/Water'
import ArticleIcon from '@mui/icons-material/Article'
import ChatIcon from '@mui/icons-material/Chat'
import RoomIcon from '@mui/icons-material/Room'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

// 상위 탭(날씨/게시물/내 포인트)의 하위 탭 목록. SideNav 아코디언과 각 페이지의
// 자체 Tabs UI가 둘 다 이 목록의 path를 기준으로 라우팅한다(URL이 곧 선택 상태).
export const WEATHER_SECTIONS = [
  { path: '/weather', label: '예보', icon: SatelliteAltIcon },
  { path: '/weather/map', label: '지도', icon: MapIcon },
  { path: '/weather/cctv', label: 'CCTV', icon: VideocamIcon },
  { path: '/weather/ocean', label: '해양정보', icon: LayersIcon },
  { path: '/weather/tide', label: '물때', icon: WaterIcon },
]

export const POSTS_SECTIONS = [
  { path: '/posts', label: '게시판', icon: ArticleIcon },
  { path: '/posts/chat', label: '실시간 채팅', icon: ChatIcon },
]

export const MYPOINTS_SECTIONS = [
  { path: '/mypoints', label: '내 포인트', icon: RoomIcon },
  { path: '/mypoints/saved', label: '저장한 포인트', icon: BookmarkIcon },
]

// 관리자에게만 보이는 별도 섹션이라 위 목록과 분리해뒀다.
export const MYPOINTS_ADMIN_SECTION = { path: '/mypoints/admin', label: '전체 포인트', icon: AdminPanelSettingsIcon }
