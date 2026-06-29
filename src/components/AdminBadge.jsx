import Chip from '@mui/material/Chip'
import ShieldIcon from '@mui/icons-material/Shield'

export default function AdminBadge({ sx = {} }) {
  return (
    <Chip
      icon={<ShieldIcon sx={{ fontSize: '12px !important' }} />}
      label="관리자"
      size="small"
      sx={{
        height: 20,
        fontSize: '0.65rem',
        fontWeight: 700,
        bgcolor: 'rgba(255, 180, 0, 0.15)',
        color: '#FFB400',
        border: '1px solid rgba(255, 180, 0, 0.4)',
        '& .MuiChip-icon': { color: '#FFB400' },
        ...sx,
      }}
    />
  )
}
