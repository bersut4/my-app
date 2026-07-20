import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import NightlightIcon from '@mui/icons-material/Nightlight'
import { useColorMode } from '../contexts/FontSizeContext'

// 데스크탑에서는 다크모드 토글이 SideNav로 옮겨갔으므로, 페이지 상단바에 쓰이는
// 기본값은 데스크탑에서 숨긴다. SideNav처럼 항상 보여야 하는 곳은 sx로 덮어쓴다.
const DEFAULT_SX = { display: { xs: 'inline-flex', md: 'none' } }

export default function ThemeToggleButton({ sx = DEFAULT_SX }) {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Tooltip title={colorMode === 'dark' ? '라이트 모드' : '다크 모드'}>
      <IconButton onClick={toggleColorMode} color="inherit" size="small" sx={sx}>
        {colorMode === 'dark'
          ? <WbSunnyIcon sx={{ fontSize: 20 }} />
          : <NightlightIcon sx={{ fontSize: 20 }} />
        }
      </IconButton>
    </Tooltip>
  )
}
