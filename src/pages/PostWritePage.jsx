import { useState, useRef } from 'react'
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
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import StarIcon from '@mui/icons-material/Star'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AppLayout from '../components/layout/AppLayout'
import KakaoMapPicker from '../components/KakaoMapPicker'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function MediaPreview({ files, onRemove }) {
  if (!files.length) return null
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        첨부 파일 ({files.length}개)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {files.map((f, i) => (
          <Box key={i} sx={{ position: 'relative', width: 90, height: 90 }}>
            {f.file.type.startsWith('video/') ? (
              <Box sx={{
                width: 90, height: 90, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <VideoCallIcon sx={{ color: 'primary.light', fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', mt: 0.3, px: 0.5, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                  {f.file.name}
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={f.preview}
                alt={f.file.name}
                sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 1, display: 'block' }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => onRemove(i)}
              sx={{
                position: 'absolute', top: -8, right: -8,
                bgcolor: 'error.dark', width: 22, height: 22,
                '&:hover': { bgcolor: 'error.main' },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default function PostWritePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', content: '', rating: 0 })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [mediaFiles, setMediaFiles] = useState([])
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // 위치 관련 상태
  const [mapOpen, setMapOpen] = useState(false)
  const [pendingLocation, setPendingLocation] = useState(null) // 다이얼로그 내 임시 위치
  const [location, setLocation] = useState(null) // 확정된 위치 { lat, lng, name }
  const [locationName, setLocationName] = useState('')

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setMediaFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (idx) => {
    setMediaFiles(prev => {
      const updated = [...prev]
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview)
      updated.splice(idx, 1)
      return updated
    })
  }

  const uploadMedia = async (postId) => {
    const results = []
    for (const { file } of mediaFiles) {
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/${postId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('sh-media').upload(filePath, file)
      if (upErr) continue
      const { data: urlData } = supabase.storage.from('sh-media').getPublicUrl(filePath)
      results.push({
        post_id: postId,
        user_id: user.id,
        file_path: filePath,
        file_url: urlData.publicUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 'image',
      })
    }
    if (results.length > 0) {
      await supabase.from('sh_post_media').insert(results)
    }
  }

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

  const clearLocation = () => setLocation(null)

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
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
      location_name: location?.name?.trim() || null,
    }).select().single()

    if (error) { setErrors({ general: '게시글 작성에 실패했어요.' }); setLoading(false); return }

    if (mediaFiles.length > 0) {
      await uploadMedia(data.id)
    }

    setLoading(false)
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
          <IconButton edge="start" onClick={() => navigate('/posts')} disabled={loading}><ArrowBackIcon /></IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>게시글 작성</Typography>
          <Button variant="contained" size="small" onClick={submit} disabled={loading}>
            {loading ? <CircularProgress size={18} color="inherit" /> : '등록'}
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

        {/* 위치 첨부 */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            위치 첨부 (선택)
          </Typography>
          {location ? (
            <Chip
              icon={<LocationOnIcon />}
              label={location.name}
              onDelete={clearLocation}
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

        {/* 사진/동영상 첨부 */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            사진/동영상 첨부 (선택, 최대 50MB/파일)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => imageInputRef.current?.click()}
            >
              사진 추가
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VideoCallIcon />}
              onClick={() => videoInputRef.current?.click()}
            >
              동영상 추가
            </Button>
          </Box>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={e => { addFiles(e.target.files); e.target.value = '' }}
          />

          <MediaPreview files={mediaFiles} onRemove={removeFile} />
        </Box>
      </Box>

      {/* 위치 선택 다이얼로그 */}
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          위치 선택
          <IconButton
            onClick={() => setMapOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
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
          <Button
            variant="contained"
            onClick={confirmLocation}
            disabled={!pendingLocation}
          >
            선택 완료
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}
