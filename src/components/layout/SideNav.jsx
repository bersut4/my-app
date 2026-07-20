import { useNavigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import WavesIcon from '@mui/icons-material/Waves'
import { NAV_ITEMS } from './navItems'
import { WEATHER_SECTIONS } from '../../lib/weatherSections'
import ThemeToggleButton from '../ThemeToggleButton'

const itemSx = {
  borderRadius: 2,
  mb: 0.5,
  '&.Mui-selected': { bgcolor: 'rgba(0,180,216,0.15)' },
  '&.Mui-selected:hover': { bgcolor: 'rgba(0,180,216,0.2)' },
}

// 태블릿 가로/PC처럼 넓은 화면에서는 하단 탭바 대신 이 좌측 내비게이션을 쓴다.
// 날씨 탭은 하위 탭(예보/지도/CCTV/해양정보/물때)을 아코디언으로 여기서 바로 고를 수 있고,
// 날씨 페이지 상단에 있던 다크모드 토글도 여기 로고 옆으로 옮겨왔다.
export default function SideNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find(item => pathname.startsWith(item.value))?.value ?? '/weather'
  const isWeatherOpen = pathname.startsWith('/weather')
  const currentSection = pathname.startsWith('/weather/') ? pathname.split('/')[2] : 'forecast'

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2.5 }}>
        <Box
          onClick={() => navigate('/weather')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
        >
          <WavesIcon sx={{ color: 'primary.light' }} />
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 700 }}>Sea Hunt</Typography>
        </Box>
        <ThemeToggleButton sx={{}} />
      </Box>
      <List sx={{ px: 1.5 }}>
        {NAV_ITEMS.map(({ label, value, icon }) => {
          if (value !== '/weather') {
            return (
              <ListItemButton
                key={value}
                selected={current === value}
                onClick={() => navigate(value)}
                sx={itemSx}
              >
                <ListItemIcon sx={{ minWidth: 40, color: current === value ? 'primary.main' : 'text.secondary' }}>
                  {icon}
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { sx: { fontWeight: current === value ? 700 : 400, color: current === value ? 'primary.main' : 'text.primary' } } }}
                />
              </ListItemButton>
            )
          }

          return (
            <Accordion
              key={value}
              expanded={isWeatherOpen}
              disableGutters
              elevation={0}
              square
              sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: isWeatherOpen ? 'primary.main' : 'text.secondary' }} />}
                onClick={() => navigate('/weather')}
                sx={{
                  minHeight: 0,
                  borderRadius: 2,
                  mb: 0.5,
                  '& .MuiAccordionSummary-content': { my: 0.8 },
                  '&.Mui-expanded': { bgcolor: 'rgba(0,180,216,0.15)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isWeatherOpen ? 'primary.main' : 'text.secondary' }}>
                  {icon}
                </ListItemIcon>
                <Typography sx={{ fontWeight: isWeatherOpen ? 700 : 400, color: isWeatherOpen ? 'primary.main' : 'text.primary' }}>
                  {label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding sx={{ pl: 2 }}>
                  {WEATHER_SECTIONS.map(({ key, label: sectionLabel, icon: SectionIcon }) => {
                    const active = currentSection === key
                    return (
                      <ListItemButton
                        key={key}
                        selected={active}
                        onClick={() => navigate(`/weather/${key}`)}
                        sx={{ borderRadius: 2, mb: 0.3, py: 0.6, '&.Mui-selected': { bgcolor: 'rgba(0,180,216,0.15)' } }}
                      >
                        <ListItemIcon sx={{ minWidth: 32, color: active ? 'primary.main' : 'text.secondary' }}>
                          <SectionIcon sx={{ fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={sectionLabel}
                          slotProps={{ primary: { variant: 'body2', sx: { fontWeight: active ? 700 : 400, color: active ? 'primary.main' : 'text.primary' } } }}
                        />
                      </ListItemButton>
                    )
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </List>
    </Box>
  )
}
