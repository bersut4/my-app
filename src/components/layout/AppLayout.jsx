import Box from '@mui/material/Box'
import BottomNav from './BottomNav'
import SideNav from './SideNav'

export default function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <SideNav />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          pb: { xs: '64px', md: 0 },
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
      <BottomNav />
    </Box>
  )
}
