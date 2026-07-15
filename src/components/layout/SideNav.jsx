import { useNavigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import WavesIcon from '@mui/icons-material/Waves'
import { NAV_ITEMS } from './navItems'

// 태블릿 가로/PC처럼 넓은 화면에서는 하단 탭바 대신 이 좌측 내비게이션을 쓴다.
export default function SideNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find(item => pathname.startsWith(item.value))?.value ?? '/weather'

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        width: 240,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2.5 }}>
        <WavesIcon sx={{ color: 'primary.light' }} />
        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700 }}>Sea Hunt</Typography>
      </Box>
      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map(({ label, value, icon }) => (
          <ListItemButton
            key={value}
            selected={current === value}
            onClick={() => navigate(value)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': { bgcolor: 'rgba(0,180,216,0.15)' },
              '&.Mui-selected:hover': { bgcolor: 'rgba(0,180,216,0.2)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: current === value ? 'primary.main' : 'text.secondary' }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{ primary: { sx: { fontWeight: current === value ? 700 : 400, color: current === value ? 'primary.main' : 'text.primary' } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
