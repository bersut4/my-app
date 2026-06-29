import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Rating from '@mui/material/Rating'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import CloseIcon from '@mui/icons-material/Close'
import AppLayout from '../components/layout/AppLayout'
import KakaoMapPicker from '../components/KakaoMapPicker'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PostEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({ title: '', content: '', rating: 0 })
  const [location, setLocation] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [notAllowed, setNotAllowed] = useState(false)

  const [mapOpen, setMapOpen] = useState(false)
  const [pendingLocation, setPendingLocation] = useState(null)
  const [locationName, setLocationName] = useState('')

  useEffect(() => {
    supabase.from('sh_posts').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) { setNotAllowed(true); setFetching(false); return }

        if (!user || (data.user_id !== user.id && !profile?.is_admin)) {
          setNotAllowed(true); setFetching(false); return
        }

        setForm({ title: data.title, content: data.content, rating: data.rating ?? 0 })
        if (data.location_lat && data.location_lng) {
          setLocation({ lat: data.location_lat, lng: data.location_lng, name: data.location_name ?? '' })
        }
        setFetching(false)
      })
  }, [id, user, profile])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const openMap = () => {
    setPendingLocation(location)
    setLocationName(location?.name ?? '')
    setMapOpen(true)
  }

  const confirmLocation = () => {
    if (pendingLocation) {
      setLocation({ ...pendingLocation, name: locationName || pendingLocation.name })
    }
    setMapOpen(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = '제목을 입력해주세요.'
    if (!form.content.trim()) errs.content = '내용을 입력해주세요.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)

    const { error } = await supabase.from('sh_posts').update({
      title: form.title.trim(),
      content: form.content.trim(),
      rating: form.rating || null,
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
      location_name: location?.name?.trim() || null,
    }).eq('id', id)

    if (error) { setErrors({ general: '수정에 실패했어요.' }); setLoading(false); return }
    setLoading(false)
    navigate(`/posts/${id}`)
  }

  if (fetching) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  )

  if (notAllowed) return (
    <AppLayout>
      <Alert severity="error" sx={{ m: 2 }}>수정 권한이 없어요.</Alert>
    </AppLayout>
  )

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(`/posts/${id}`)} disabled={loading}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>게시글 수정</Typography>
          <Button variant="contained" size="small" onClick={submit} disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : '저장'}
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
        />

        {/* 위치 첨부 */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            위치 첨부 (선택)
          </Typography>
          {location ? (
            <Chip
              icon={<LocationOnIcon />}
              label={location.name || '위치 선택됨'}
              onDelete={() => setLocation(null)}
              onClick={openMap}
              color="primary"
              variant="outlined"
              sx={{ maxWidth: '100%' }}
            />
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<LocationOnIcon />}
              onClick={openMap}
            >
              위치 추가
            </Button>
          )}
        </Box>
      </Box>

      {/* 위치 선택 다이얼로그 */}
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          위치 선택
          <IconButton onClick={() => setMapOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <KakaoMapPicker
            value={pendingLocation}
            onChange={(loc) => {
              setPendingLocation(loc)
              setLocationName(loc.name)
            }}
          />
          {pendingLocation && (
            <TextField
              label="장소명"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1.5 }}
              helperText="자동으로 입력됩니다. 직접 수정할 수 있어요."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMapOpen(false)}>취소</Button>
          <Button variant="contained" onClick={confirmLocation} disabled={!pendingLocation}>
            선택 완료
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}
