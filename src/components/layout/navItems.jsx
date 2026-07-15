import WbSunnyIcon from '@mui/icons-material/WbSunny'
import ArticleIcon from '@mui/icons-material/Article'
import RoomIcon from '@mui/icons-material/Room'
import PersonIcon from '@mui/icons-material/Person'

export const NAV_ITEMS = [
  { label: '날씨', value: '/weather', icon: <WbSunnyIcon /> },
  { label: '게시물', value: '/posts', icon: <ArticleIcon /> },
  { label: '내 포인트', value: '/mypoints', icon: <RoomIcon /> },
  { label: '마이페이지', value: '/mypage', icon: <PersonIcon /> },
]
