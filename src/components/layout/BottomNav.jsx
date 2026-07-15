import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import { NAV_ITEMS } from './navItems'

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const current = NAV_ITEMS.find(item => pathname.startsWith(item.value))?.value ?? '/weather'

  return (
    <BottomNavigation
      value={current}
      onChange={(_, v) => navigate(v)}
      sx={{ display: { xs: 'flex', md: 'none' } }}
    >
      {NAV_ITEMS.map(({ label, value, icon }) => (
        <BottomNavigationAction key={value} label={label} value={value} icon={icon} />
      ))}
    </BottomNavigation>
  )
}
