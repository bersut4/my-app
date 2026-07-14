import { createContext, useContext, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from '../theme'
import { supabase } from '../lib/supabase'

const FontSizeContext = createContext(null)
const ColorModeContext = createContext(null)
const MapTypeContext = createContext(null)

export const FONT_SIZE_LABELS = {
  very_small: '매우 작게',
  small: '작게',
  medium: '중간 (기본)',
  large: '크게',
  very_large: '매우 크게',
}

export const MAP_TYPE_LABELS = {
  ROADMAP: '지도',
  HYBRID: '지도+스카이뷰',
  SKYVIEW: '스카이뷰',
}

export function FontSizeProvider({ children, userId, initialFontSize = 'medium' }) {
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [colorMode, setColorMode] = useState(
    () => localStorage.getItem('sh-color-mode') ?? 'dark'
  )
  const [mapType, setMapType] = useState(
    () => localStorage.getItem('sh-map-type') ?? 'ROADMAP'
  )

  const theme = useMemo(() => createAppTheme(fontSize, colorMode), [fontSize, colorMode])

  const changeFontSize = async (size) => {
    setFontSize(size)
    if (userId) {
      await supabase.from('profiles').update({ font_size: size }).eq('id', userId)
    }
  }

  const toggleColorMode = () => {
    setColorMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('sh-color-mode', next)
      return next
    })
  }

  const changeMapType = (type) => {
    setMapType(type)
    localStorage.setItem('sh-map-type', type)
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
        <MapTypeContext.Provider value={{ mapType, changeMapType }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </MapTypeContext.Provider>
      </ColorModeContext.Provider>
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
export const useColorMode = () => useContext(ColorModeContext)
export const useMapType = () => useContext(MapTypeContext)
