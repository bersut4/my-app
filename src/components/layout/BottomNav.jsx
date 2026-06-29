import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import ArticleIcon from '@mui/icons-material/Article'
import RoomIcon from '@mui/icons-material/Room'
import PersonIcon from '@mui/icons-material/Person'

const NAV_ITEMS = [
  { label: '날씨', value: '/weather', icon: <WbSunnyIcon /> },
  { label: '게시물', value: '/posts', icon: <ArticleIcon /> },
  { label: '내 포인트', value: '/mypoints', icon: <RoomIcon /> },
  { label: '마이페이지', value: '/mypage', icon: <PersonIcon /> },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = NAV_ITEMS.find(item => pathname.startsWith(item.value))?.value ?? '/weather'

  return (
    <BottomNavigation value={current} onChange={(_, v) => navigate(v)}>
      {NAV_ITEMS.map(({ label, value, icon }) => (
        <BottomNavigationAction key={value} label={label} value={value} icon={icon} />
      ))}
    </BottomNavigation>
  )
}
