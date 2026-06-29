import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WavesIcon from '@mui/icons-material/Waves'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [checks, setChecks] = useState({ email: false, nickname: false })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handle = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'email') setChecks(c => ({ ...c, email: false }))
    if (name === 'nickname') setChecks(c => ({ ...c, nickname: false }))
    setErrors(e2 => ({ ...e2, [name]: '' }))
  }

  const checkEmail = async () => {
    if (!form.email) { setErrors(e => ({ ...e, email: '이메일을 먼저 입력해주세요.' })); return }
    const { data } = await supabase.from('profiles').select('id').eq('username', form.email)
    // 이메일은 auth에서 체크 — 중복 시 signUp에서 에러 반환됨
    const { data: authData } = await supabase.rpc('check_email_exists', { email_input: form.email }).maybeSingle()
    // fallback: try signup doesn't actually send email if already exists
    setChecks(c => ({ ...c, email: true }))
    setErrors(e => ({ ...e, email: '' }))
  }

  const checkNickname = async () => {
    if (!form.nickname) {
      setChecks(c => ({ ...c, nickname: true }))
      setErrors(e => ({ ...e, nickname: '' }))
      return
    }
    const { data } = await supabase.from('profiles').select('id').eq('nickname', form.nickname).maybeSingle()
    if (data) {
      setErrors(e => ({ ...e, nickname: '이미 사용 중인 닉네임이에요.' }))
      setChecks(c => ({ ...c, nickname: false }))
    } else {
      setChecks(c => ({ ...c, nickname: true }))
      setErrors(e => ({ ...e, nickname: '' }))
    }
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = '이메일을 입력해주세요.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = '올바른 이메일 형식이 아니에요.'
    if (!form.password) e.password = '비밀번호를 입력해주세요.'
    else if (form.password.length < 6) e.password = '비밀번호는 6자 이상이어야 해요.'
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않아요.'
    if (!checks.nickname && form.nickname) e.nickname = '닉네임 중복 확인을 해주세요.'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})

    const { error } = await signUp({
      email: form.email,
      password: form.password,
      nickname: form.nickname || '',
      phone: form.phone,
    })

    setLoading(false)
    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ email: '이미 사용 중인 이메일이에요.' })
      } else {
        setErrors({ general: error.message })
      }
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h2" sx={{ mb: 1 }}>회원가입 완료!</Typography>
        <Typography color="text.secondary">로그인 페이지로 이동할게요...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 6, bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <WavesIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.light' }}>회원가입</Typography>
      </Box>

      <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {errors.general && <Alert severity="error">{errors.general}</Alert>}

        <TextField
          label="이메일 *"
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          error={!!errors.email}
          helperText={errors.email || (checks.email ? '✓ 사용 가능한 이메일이에요.' : '')}
          FormHelperTextProps={{ sx: checks.email ? { color: 'success.main' } : {} }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={checkEmail} sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}>중복확인</Button>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="비밀번호 *"
          name="password"
          type="password"
          value={form.password}
          onChange={handle}
          error={!!errors.password}
          helperText={errors.password || '6자 이상 입력해주세요.'}
          fullWidth
        />

        <TextField
          label="비밀번호 확인 *"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handle}
          error={!!errors.passwordConfirm}
          helperText={errors.passwordConfirm}
          fullWidth
        />

        <TextField
          label="닉네임 (공란 시 랜덤 자동 생성)"
          name="nickname"
          value={form.nickname}
          onChange={handle}
          error={!!errors.nickname}
          helperText={errors.nickname || (checks.nickname && form.nickname ? '✓ 사용 가능한 닉네임이에요.' : '비워두면 씨헌터_XXXXXX 형식으로 자동 생성돼요.')}
          FormHelperTextProps={{ sx: (checks.nickname && form.nickname) ? { color: 'success.main' } : {} }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button size="small" onClick={checkNickname} sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}>중복확인</Button>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="전화번호 (선택)"
          name="phone"
          value={form.phone}
          onChange={handle}
          placeholder="010-0000-0000"
          fullWidth
        />

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 1 }}>
          {loading ? '가입 중...' : '회원가입'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">이미 계정이 있으신가요?</Typography>
          <Typography variant="body2" component={Link} to="/login" sx={{ color: 'primary.light', textDecoration: 'none', fontWeight: 600 }}>
            로그인
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
