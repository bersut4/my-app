import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Rating from '@mui/material/Rating'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PostWritePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', rating: 0 })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력해주세요.'
    if (!form.content.trim()) errs.content = '내용을 입력해주세요.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)

    const { data, error } = await supabase.from('sh_posts').insert({
      user_id: user.id,
      title: form.title.trim(),
      content: form.content.trim(),
      rating: form.rating || null,
    }).select().single()

    setLoading(false)
    if (error) { setErrors({ general: '게시글 작성에 실패했어요.' }); return }
    navigate(`/posts/${data.id}`)
  }

  if (!user) return (
    <AppLayout>
      <Alert severity="warning" sx={{ m: 2 }}>로그인 후 이용할 수 있어요.</Alert>
    </AppLayout>
  )

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/posts')}><ArrowBackIcon /></IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>게시글 작성</Typography>
          <Button variant="contained" size="small" onClick={submit} disabled={loading}>
            {loading ? '등록 중...' : '등록'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="form" onSubmit={submit} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {errors.general && <Alert severity="error">{errors.general}</Alert>}

        <TextField
          label="제목 *"
          name="title"
          value={form.title}
          onChange={handle}
          error={!!errors.title}
          helperText={errors.title}
          fullWidth
        />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16 }} /> 포인트 별점 (선택)
          </Typography>
          <Rating
            value={form.rating}
            onChange={(_, v) => setForm(f => ({ ...f, rating: v }))}
            size="large"
          />
        </Box>

        <TextField
          label="내용 *"
          name="content"
          value={form.content}
          onChange={handle}
          error={!!errors.content}
          helperText={errors.content}
          fullWidth
          multiline
          minRows={8}
          placeholder="해루질/낚시 후기를 자유롭게 적어주세요!"
        />

        <Alert severity="info" icon={false} sx={{ fontSize: '0.8rem' }}>
          사진/동영상 첨부 및 지도 핀 기능은 2차 개발에서 추가될 예정이에요.
        </Alert>
      </Box>
    </AppLayout>
  )
}
