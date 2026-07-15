import { createTheme } from '@mui/material/styles'

export const FONT_SIZE_SCALE = {
  very_small: 0.75,
  small: 0.875,
  medium: 1,
  large: 1.125,
  very_large: 1.25,
}

export const createAppTheme = (fontSize = 'medium', mode = 'dark') => {
  const s = FONT_SIZE_SCALE[fontSize] ?? 1
  const isDark = mode === 'dark'

  const palette = isDark ? {
    mode: 'dark',
    primary: { main: '#00B4D8', light: '#48CAE4', dark: '#0077B6' },
    secondary: { main: '#0096C7', light: '#ADE8F4', dark: '#023E8A' },
    background: { default: '#03045E', paper: '#0A1628' },
    text: { primary: '#E0F7FA', secondary: '#90E0EF' },
    success: { main: '#52B788' },
    warning: { main: '#F4A261' },
    error: { main: '#E63946' },
    divider: 'rgba(0,180,216,0.2)',
  } : {
    mode: 'light',
    primary: { main: '#0096C7', light: '#90E0EF', dark: '#0077B6' },
    secondary: { main: '#0077B6', light: '#ADE8F4', dark: '#023E8A' },
    background: { default: '#EFF9FE', paper: '#FFFFFF' },
    text: { primary: 'rgba(0,0,0,0.87)', secondary: 'rgba(0,0,0,0.6)' },
    success: { main: '#2D9A64' },
    warning: { main: '#E07B3B' },
    error: { main: '#D32F2F' },
    divider: 'rgba(0,150,199,0.2)',
  }

  const appBarBg = isDark ? '#0A1628' : '#0077B6'
  const appBarBorder = isDark ? '1px solid rgba(0,180,216,0.2)' : '1px solid rgba(0,100,180,0.3)'
  const cardBg = isDark ? '#0A1628' : '#FFFFFF'
  const cardBorder = isDark ? '1px solid rgba(0,180,216,0.15)' : '1px solid rgba(0,150,199,0.2)'
  const bottomNavBg = isDark ? '#0A1628' : '#FFFFFF'
  const bottomNavBorder = isDark ? '1px solid rgba(0,180,216,0.2)' : '1px solid rgba(0,150,199,0.25)'
  const tabColor = isDark ? '#90E0EF' : 'rgba(255,255,255,0.75)'
  const tabSelectedColor = isDark ? '#00B4D8' : '#FFFFFF'
  const bottomNavColor = isDark ? '#90E0EF' : '#0096C7'
  const fieldBorderColor = isDark ? 'rgba(0,180,216,0.3)' : 'rgba(0,150,199,0.4)'

  return createTheme({
    palette,
    typography: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      fontSize: 16 * s,
      h1: { fontSize: `${2.125 * s}rem`, fontWeight: 500 },
      h2: { fontSize: `${1.5 * s}rem`, fontWeight: 500 },
      h3: { fontSize: `${1.25 * s}rem`, fontWeight: 500 },
      body1: { fontSize: `${1 * s}rem` },
      body2: { fontSize: `${0.875 * s}rem` },
      caption: { fontSize: `${0.75 * s}rem` },
    },
    shape: { borderRadius: 12 },
    spacing: 8,
    components: {
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: bottomNavBg,
            borderTop: bottomNavBorder,
            height: 64,
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: bottomNavColor,
            minWidth: 60,
            '&.Mui-selected': { color: '#0096C7' },
            '& .MuiBottomNavigationAction-label': { fontSize: `${0.7 * s}rem` },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: appBarBg,
            borderBottom: appBarBorder,
            boxShadow: 'none',
            color: '#FFFFFF',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundColor: cardBg, border: cardBorder },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: tabColor,
            '&.Mui-selected': { color: tabSelectedColor },
            fontSize: `${0.875 * s}rem`,
            minWidth: 80,
            textTransform: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, textTransform: 'none', fontWeight: 600, minHeight: 48 },
          sizeLarge: { minHeight: 56 },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: fieldBorderColor },
              '&:hover fieldset': { borderColor: '#00B4D8' },
              '&.Mui-focused fieldset': { borderColor: '#00B4D8' },
            },
          },
        },
      },
      MuiListItem: {
        styleOverrides: { root: { minHeight: 56 } },
      },
    },
  })
}

export default createAppTheme()
