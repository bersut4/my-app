import { useState, useEffect } from 'react'
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
import { WEATHER_SECTIONS, POSTS_SECTIONS, MYPOINTS_SECTIONS, MYPOINTS_ADMIN_SECTION } from '../../lib/sideNavSections'
import ThemeToggleButton from '../ThemeToggleButton'
import { useAuth } from '../../contexts/AuthContext'

const itemSx = {
  borderRadius: 2,
  mb: 0.5,
  '&.Mui-selected': { bgcolor: 'rgba(0,180,216,0.15)' },
  '&.Mui-selected:hover': { bgcolor: 'rgba(0,180,216,0.2)' },
}

// 아코디언 헤더(부모 항목) 클릭은 오직 펼치기/접기만 하고, 실제 이동은 하위 항목을
// 클릭해야 이루어진다. 그래야 MUI Accordion의 기본 펼치기 동작(화살표 포함, 헤더
// 어디를 눌러도 반응)을 그대로 쓸 수 있어서 "화살표를 눌러도 반응 없음" 문제가 없다.
function ExpandableNavItem({ icon, label, active, sections }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState(active)

  useEffect(() => {
    if (active) setExpanded(true)
  }, [active])

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, next) => setExpanded(next)}
      disableGutters
      elevation={0}
      square
      sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }} />}
        sx={{
          minHeight: 0,
          borderRadius: 2,
          mb: 0.5,
          '& .MuiAccordionSummary-content': { my: 0.8 },
          '&.Mui-expanded': active ? { bgcolor: 'rgba(0,180,216,0.15)' } : undefined,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
          {icon}
        </ListItemIcon>
        <Typography sx={{ fontWeight: active ? 700 : 400, color: active ? 'primary.main' : 'text.primary' }}>
          {label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <List disablePadding sx={{ pl: 2 }}>
          {sections.map(({ path, label: subLabel, icon: SubIcon }) => {
            const isActive = pathname === path
            return (
              <ListItemButton
                key={path}
                selected={isActive}
                onClick={() => navigate(path)}
                sx={{ borderRadius: 2, mb: 0.3, py: 0.6, '&.Mui-selected': { bgcolor: 'rgba(0,180,216,0.15)' } }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <SubIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={subLabel}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: isActive ? 700 : 400, color: isActive ? 'primary.main' : 'text.primary' } } }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  )
}

// 태블릿 가로/PC처럼 넓은 화면에서는 하단 탭바 대신 이 좌측 내비게이션을 쓴다.
// 하위 탭이 있는 상위 항목(날씨/게시물/내 포인트)은 아코디언으로, 없는 항목(마이페이지)은
// 그냥 버튼으로 렌더링한다. 다크모드 토글도 날씨 페이지 상단바 대신 여기 로고 옆에 있다.
export default function SideNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const isAdmin = profile?.is_admin

  const accordionSections = {
    '/weather': WEATHER_SECTIONS,
    '/posts': POSTS_SECTIONS,
    '/mypoints': isAdmin ? [...MYPOINTS_SECTIONS, MYPOINTS_ADMIN_SECTION] : MYPOINTS_SECTIONS,
  }

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
          const active = pathname.startsWith(value)
          const sections = accordionSections[value]

          if (sections) {
            return <ExpandableNavItem key={value} icon={icon} label={label} active={active} sections={sections} />
          }

          return (
            <ListItemButton key={value} selected={active} onClick={() => navigate(value)} sx={itemSx}>
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'text.secondary' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { sx: { fontWeight: active ? 700 : 400, color: active ? 'primary.main' : 'text.primary' } } }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
