import { createContext, useContext, useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { createAppTheme } from '../theme'
import { supabase } from '../lib/supabase'

const FontSizeContext = createContext(null)

export const FONT_SIZE_LABELS = {
  very_small: '매우 작게',
  small: '작게',
  medium: '중간 (기본)',
  large: '크게',
  very_large: '매우 크게',
}

export function FontSizeProvider({ children, userId, initialFontSize = 'medium' }) {
  const [fontSize, setFontSize] = useState(initialFontSize)

  const theme = useMemo(() => createAppTheme(fontSize), [fontSize])

  const changeFontSize = async (size) => {
    setFontSize(size)
    if (userId) {
      await supabase.from('profiles').update({ font_size: size }).eq('id', userId)
    }
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
