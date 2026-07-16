import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// 사이드 내비게이션이 뜨는 기준(md)과 맞춰, 이 크기 이상이면 fullWidth 탭 대신
// 왼쪽 정렬된 컴팩트 탭을 쓰기 위한 훅
export function useIsDesktop() {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.up('md'))
}
