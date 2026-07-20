import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WavesIcon from '@mui/icons-material/Waves'

// 모바일에서는 사이드 내비(SideNav)가 안 보여서 Sea Hunt 로고가 화면에서 사라지는 문제가 있었다.
// 그래서 상위 탭 페이지의 헤더는 모바일에선 항상 로고(클릭 시 /weather 이동)를,
// 데스크탑에선 기존처럼 페이지별 아이콘+제목을 보여주도록 반응형으로 분기한다.
export default function PageHeaderTitle({ icon, title }) {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
      <Box
        onClick={() => navigate('/weather')}
        sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
      >
        <WavesIcon sx={{ mr: 1, color: 'primary.light' }} />
        <Typography variant="h3">Sea Hunt</Typography>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
        {icon}
        <Typography variant="h3" sx={{ ml: 1 }}>{title}</Typography>
      </Box>
    </Box>
  )
}
