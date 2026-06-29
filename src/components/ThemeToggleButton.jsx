import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import NightlightIcon from '@mui/icons-material/Nightlight'
import { useColorMode } from '../contexts/FontSizeContext'

export default function ThemeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Tooltip title={colorMode === 'dark' ? '라이트 모드' : '다크 모드'}>
      <IconButton onClick={toggleColorMode} color="inherit" size="small">
        {colorMode === 'dark'
          ? <WbSunnyIcon sx={{ fontSize: 20 }} />
          : <NightlightIcon sx={{ fontSize: 20 }} />
        }
      </IconButton>
    </Tooltip>
  )
}
