import Box from '@mui/material/Box'
import BottomNav from './BottomNav'

// PC처럼 넓은 화면에서 모바일 레이아웃이 늘어져 보이지 않도록, 앱 전체를 이 너비로
// 제한하고 가운데 정렬한다(휴대폰 화면 같은 "카드" 형태). BottomNav의 최대 너비도
// theme.js에서 이 값과 맞춰야 한다.
export const APP_MAX_WIDTH = 600

export default function AppLayout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#00031f' : '#CFE8F3'),
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: APP_MAX_WIDTH,
          mx: 'auto',
          bgcolor: 'background.default',
          position: 'relative',
          // position:fixed 자식(Fab, 카카오맵 컨트롤 등)이 브라우저 창 전체가 아니라
          // 이 가운데 정렬된 영역 기준으로 붙도록 새 containing block을 만든다
          transform: 'translateZ(0)',
          boxShadow: { xs: 'none', sm: '0 0 48px rgba(0,0,0,0.45)' },
        }}
      >
        <Box component="main" sx={{ flex: 1, minHeight: 0, pb: '64px', overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
      <BottomNav />
    </Box>
  )
}
