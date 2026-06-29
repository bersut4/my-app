import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import WavesIcon from '@mui/icons-material/Waves'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email) e.email = '이메일을 입력해주세요.'
    if (!form.password) e.password = '비밀번호를 입력해주세요.'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    setErrors({})
    const { error } = await signIn(form)
    setLoading(false)
    if (error) {
      setErrors({ general: '이메일 또는 비밀번호가 올바르지 않아요.' })
    } else {
      navigate('/weather')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <WavesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 700, color: 'primary.light' }}>
          Sea Hunt
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        해루질/낚시 커뮤니티에 오신 걸 환영해요!
      </Typography>

      <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {errors.general && <Alert severity="error">{errors.general}</Alert>}

        <TextField
          label="이메일"
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          autoComplete="email"
        />
        <TextField
          label="비밀번호"
          name="password"
          type="password"
          value={form.password}
          onChange={handle}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          autoComplete="current-password"
        />

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 1 }}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">계정이 없으신가요?</Typography>
          <Typography variant="body2" component={Link} to="/signup" sx={{ color: 'primary.light', textDecoration: 'none', fontWeight: 600 }}>
            회원가입
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
