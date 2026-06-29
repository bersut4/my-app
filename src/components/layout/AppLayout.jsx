import Box from '@mui/material/Box'
import BottomNav from './BottomNav'

export default function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="main" sx={{ flex: 1, pb: '64px', overflowY: 'auto' }}>
        {children}
      </Box>
      <BottomNav />
    </Box>
  )
}
