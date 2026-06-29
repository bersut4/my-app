import { createTheme } from '@mui/material/styles'

export const FONT_SIZE_SCALE = {
  very_small: 0.75,
  small: 0.875,
  medium: 1,
  large: 1.125,
  very_large: 1.25,
}

export const createAppTheme = (fontSize = 'medium') => {
  const s = FONT_SIZE_SCALE[fontSize] ?? 1

  return createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#00B4D8', light: '#48CAE4', dark: '#0077B6' },
      secondary: { main: '#0096C7', light: '#ADE8F4', dark: '#023E8A' },
      background: { default: '#03045E', paper: '#0A1628' },
      text: { primary: '#E0F7FA', secondary: '#90E0EF' },
      success: { main: '#52B788' },
      warning: { main: '#F4A261' },
      error: { main: '#E63946' },
      divider: 'rgba(0,180,216,0.2)',
    },
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
            backgroundColor: '#0A1628',
            borderTop: '1px solid rgba(0,180,216,0.2)',
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
            color: '#90E0EF',
            minWidth: 60,
            '&.Mui-selected': { color: '#00B4D8' },
            '& .MuiBottomNavigationAction-label': { fontSize: `${0.7 * s}rem` },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: '#0A1628', borderBottom: '1px solid rgba(0,180,216,0.2)', boxShadow: 'none' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundColor: '#0A1628', border: '1px solid rgba(0,180,216,0.15)' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: '#90E0EF',
            '&.Mui-selected': { color: '#00B4D8' },
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
              '& fieldset': { borderColor: 'rgba(0,180,216,0.3)' },
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
