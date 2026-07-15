import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import WavesIcon from '@mui/icons-material/Waves'
import { useAuth } from '../contexts/AuthContext'

function GoogleIcon() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20 }}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.73-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </Box>
  )
}

function KakaoIcon() {
  return (
    <Box component="svg" viewBox="0 0 24 24" sx={{ width: 20, height: 20 }}>
      <path fill="#000" fillOpacity="0.85" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.86 5.19 4.66 6.58-.2.75-.75 2.78-.86 3.21-.14.53.2.52.42.38.17-.11 2.7-1.83 3.8-2.58.63.09 1.29.14 1.98.14 5.52 0 10-3.48 10-7.73S17.52 3 12 3Z" />
    </Box>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithKakao } = useAuth()
  const [socialError, setSocialError] = useState('')

  const handleSocial = async (fn) => {
    setSocialError('')
    const { error } = await fn()
    if (error) setSocialError('소셜 로그인을 시작하지 못했어요.')
  }
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

      <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        {socialError && <Alert severity="error">{socialError}</Alert>}

        <Button
          onClick={() => handleSocial(signInWithKakao)}
          size="large"
          fullWidth
          startIcon={<KakaoIcon />}
          sx={{ bgcolor: '#FEE500', color: 'rgba(0,0,0,0.85)', '&:hover': { bgcolor: '#FDD800' } }}
        >
          카카오로 시작하기
        </Button>
        <Button
          onClick={() => handleSocial(signInWithGoogle)}
          size="large"
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{ bgcolor: '#fff', color: 'rgba(0,0,0,0.87)', borderColor: 'rgba(0,0,0,0.23)', '&:hover': { bgcolor: '#f5f5f5', borderColor: 'rgba(0,0,0,0.23)' } }}
        >
          Google로 계속하기
        </Button>
      </Box>

      <Divider sx={{ width: '100%', maxWidth: 400, my: 2.5 }}>
        <Typography variant="caption" color="text.secondary">또는 이메일로 로그인</Typography>
      </Divider>

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
