import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import LogoutIcon from '@mui/icons-material/Logout'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFontSize, FONT_SIZE_LABELS } from '../contexts/FontSizeContext'

function EditProfileDialog({ open, onClose, profile, onSave }) {
  const [nickname, setNickname] = useState(profile?.display_name ?? '')
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const checkNickname = async () => {
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    if (nickname === profile?.display_name) { setChecked(true); setError(''); return }
    setChecking(true)
    const { data } = await supabase.from('profiles').select('id').eq('display_name', nickname.trim()).maybeSingle()
    setChecking(false)
    if (data) { setError('이미 사용 중인 닉네임이에요.'); setChecked(false) }
    else { setChecked(true); setError('') }
  }

  const save = async () => {
    if (!checked && nickname !== profile?.display_name) { setError('닉네임 중복 확인을 해주세요.'); return }
    setSaving(true)
    const { error: err } = await supabase.from('profiles').update({ display_name: nickname.trim() }).eq('id', profile.id)
    setSaving(false)
    if (err) { setError('저장에 실패했어요.'); return }
    onSave(nickname.trim())
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>프로필 수정</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {checked && <Alert severity="success">사용 가능한 닉네임이에요.</Alert>}
        <TextField
          label="닉네임"
          value={nickname}
          onChange={e => { setNickname(e.target.value); setChecked(false) }}
          fullWidth
          InputProps={{
            endAdornment: <Button size="small" onClick={checkNickname} disabled={checking} sx={{ whiteSpace: 'nowrap' }}>중복확인</Button>
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
      </DialogActions>
    </Dialog>
  )
}

function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!form.current || !form.next) { setError('모든 항목을 입력해주세요.'); return }
    if (form.next.length < 6) { setError('새 비밀번호는 6자 이상이어야 해요.'); return }
    if (form.next !== form.confirm) { setError('새 비밀번호가 일치하지 않아요.'); return }
    setLoading(true)
    // 기존 비밀번호 확인 (재로그인 방식)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: form.current })
    if (signInError) { setLoading(false); setError('현재 비밀번호가 올바르지 않아요.'); return }
    const { error: updateError } = await supabase.auth.updateUser({ password: form.next })
    setLoading(false)
    if (updateError) { setError('비밀번호 변경에 실패했어요.'); return }
    setSuccess(true)
    setTimeout(() => { setSuccess(false); onClose() }, 1500)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>비밀번호 변경</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">비밀번호가 변경됐어요!</Alert>}
        <TextField label="현재 비밀번호" type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} fullWidth />
        <TextField label="새 비밀번호 (6자 이상)" type="password" value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))} fullWidth />
        <TextField label="새 비밀번호 확인" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={save} disabled={loading}>{loading ? '변경 중...' : '변경'}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { fontSize, changeFontSize } = useFontSize()
  const [editOpen, setEditOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleWithdraw = async () => {
    if (!window.confirm('정말 탈퇴하시겠어요? 모든 데이터가 삭제돼요.')) return
    setWithdrawing(true)
    await supabase.auth.admin?.deleteUser(user.id).catch(() => {})
    await signOut()
    navigate('/login')
  }

  if (!user) return (
    <AppLayout>
      <Box sx={{ p: 3, textAlign: 'center', mt: 6 }}>
        <PersonIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary" sx={{ mb: 2 }}>로그인이 필요해요.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>로그인하러 가기</Button>
      </Box>
    </AppLayout>
  )

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <PersonIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3">마이페이지</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
        {/* 프로필 카드 */}
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.dark', fontSize: '1.5rem' }}>
              {profile?.display_name?.[0] ?? user.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3">{profile?.display_name ?? '닉네임 없음'}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* 설정 목록 */}
        <Card>
          <List disablePadding>
            <ListItem button onClick={() => setEditOpen(true)}>
              <ListItemIcon><PersonIcon sx={{ color: 'primary.light' }} /></ListItemIcon>
              <ListItemText primary="프로필 수정" secondary="닉네임 변경" />
              <ChevronRightIcon color="action" />
            </ListItem>
            <Divider />
            <ListItem button onClick={() => setPwOpen(true)}>
              <ListItemIcon><LockIcon sx={{ color: 'primary.light' }} /></ListItemIcon>
              <ListItemText primary="비밀번호 변경" />
              <ChevronRightIcon color="action" />
            </ListItem>
          </List>
        </Card>

        {/* 폰트 크기 설정 */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TextFieldsIcon sx={{ color: 'primary.light' }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>글자 크기</Typography>
            </Box>
            <ToggleButtonGroup value={fontSize} exclusive onChange={(_, v) => v && changeFontSize(v)} fullWidth size="small">
              {Object.entries(FONT_SIZE_LABELS).map(([key, label]) => (
                <ToggleButton key={key} value={key} sx={{ flexDirection: 'column', py: 1, fontSize: '0.65rem' }}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              미리보기: 이 글씨 크기로 표시돼요.
            </Typography>
          </CardContent>
        </Card>

        {/* 로그아웃 / 탈퇴 */}
        <Card>
          <List disablePadding>
            <ListItem button onClick={handleSignOut}>
              <ListItemIcon><LogoutIcon sx={{ color: 'warning.main' }} /></ListItemIcon>
              <ListItemText primary="로그아웃" primaryTypographyProps={{ color: 'warning.main' }} />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleWithdraw} disabled={withdrawing}>
              <ListItemIcon><DeleteForeverIcon sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText primary="회원 탈퇴" secondary="탈퇴 시 모든 데이터가 삭제돼요." primaryTypographyProps={{ color: 'error.main' }} />
            </ListItem>
          </List>
        </Card>
      </Box>

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} profile={profile} onSave={() => refreshProfile()} />
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </AppLayout>
  )
}
