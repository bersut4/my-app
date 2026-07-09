import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import RoomIcon from '@mui/icons-material/Room'
import RouteIcon from '@mui/icons-material/Route'
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '@mui/material/Avatar'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import AppLayout from '../components/layout/AppLayout'
import KakaoMapPicker from '../components/KakaoMapPicker'
import KakaoMapView from '../components/KakaoMapView'
import ThemeToggleButton from '../components/ThemeToggleButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const formatKoreanTime = (timeStr) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${ampm} ${h12}:${String(m).padStart(2, '0')}`
}

const calcDuration = (start, end) => {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let totalMins = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMins <= 0) return null
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  const display = h > 0 ? `${h}시간 ${m > 0 ? `${m}분` : ''}`.trim() : `${m}분`
  return { totalMins, display }
}

function PointDetailDialog({ point, open, onClose, onDelete }) {
  if (!point) return null
  const isRoute = point.location_type === 'route'
  const date = new Date(point.created_at).toLocaleString('ko-KR')
  const lat = isRoute ? point.location_data[0]?.lat : point.location_data.lat
  const lng = isRoute ? point.location_data[0]?.lng : point.location_data.lng

  const handleDelete = () => {
    onDelete(point.id)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{ '& .MuiBackdrop-root': { bgcolor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRoute ? <RouteIcon sx={{ color: 'primary.light' }} /> : <RoomIcon sx={{ color: 'primary.light' }} />}
          포인트 상세
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="포인트 이름"
          value={point.name}
          disabled
          fullWidth
        />

        <TextField
          label="메모"
          value={point.description ?? ''}
          disabled
          fullWidth
          multiline
          rows={2}
        />

        <FormControl fullWidth disabled>
          <InputLabel>기록 방식</InputLabel>
          <Select value={point.location_type} label="기록 방식">
            <MenuItem value="pin">핀 (단일 지점)</MenuItem>
            <MenuItem value="route">경로 (시작 지점 입력)</MenuItem>
          </Select>
        </FormControl>

        {!isRoute ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="위도" value={point.location_data.lat ?? ''} disabled fullWidth />
            <TextField label="경도" value={point.location_data.lng ?? ''} disabled fullWidth />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {point.location_data.map((coord, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="primary.light" sx={{ minWidth: 24, fontWeight: 700 }}>#{idx + 1}</Typography>
                <TextField label="위도" value={coord.lat ?? ''} disabled fullWidth size="small" />
                <TextField label="경도" value={coord.lng ?? ''} disabled fullWidth size="small" />
              </Box>
            ))}
          </Box>
        )}

        {lat && lng && (
          <KakaoMapView lat={lat} lng={lng} />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={point.source === 'from_post' ? '게시글 저장' : '직접 추가'}
            size="small"
            variant="outlined"
            color={point.source === 'from_post' ? 'secondary' : 'primary'}
          />
          <Typography variant="caption" color="text.secondary">{date} 저장됨</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>삭제</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="outlined" size="small">닫기</Button>
      </DialogActions>
    </Dialog>
  )
}

function PointCard({ point, onDelete, onEdit, onClick }) {
  const date = new Date(point.created_at).toLocaleDateString('ko-KR')
  const isRoute = point.location_type === 'route'
  const coords = isRoute
    ? `경로 ${point.location_data.length}개 지점`
    : point.location_data.address || `위도 ${point.location_data.lat?.toFixed(4)}, 경도 ${point.location_data.lng?.toFixed(4)}`
  const log = point.sh_diving_logs?.[0]
  const duration = log ? calcDuration(log.dive_start_time, log.dive_end_time) : null

  return (
    <Card
      sx={{ mb: 1.5, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { bgcolor: 'rgba(0,180,216,0.05)', borderColor: 'rgba(0,180,216,0.3)' } }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isRoute ? <RouteIcon sx={{ color: 'primary.light' }} /> : <RoomIcon sx={{ color: 'primary.light' }} />}
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{point.name}</Typography>
          </Box>
          <Chip label={point.source === 'from_post' ? '게시글 저장' : '직접 추가'} size="small" variant="outlined" color={point.source === 'from_post' ? 'secondary' : 'primary'} />
        </Box>
        {point.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>{point.description}</Typography>}
        {point.hazards && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 0.4, ml: 4 }}>⚠️ {point.hazards}</Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.3 }}>📍 {coords} · {date}</Typography>
        {!isRoute && point.location_data?.lat && point.location_data?.lng && (
          <Box sx={{ mt: 1 }}>
            <KakaoMapView lat={point.location_data.lat} lng={point.location_data.lng} />
          </Box>
        )}

        {log && (
          <Box sx={{ mt: 1.5, ml: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
              <ScubaDivingIcon sx={{ fontSize: 15, color: 'primary.light' }} />
              <Typography variant="caption" color="primary.light" sx={{ fontWeight: 600 }}>{log.dive_date} 다이빙 로그</Typography>
            </Box>

            {log.dive_start_time && log.dive_end_time && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                ⏱ {formatKoreanTime(log.dive_start_time)} ~ {formatKoreanTime(log.dive_end_time)}
                {duration && <Typography component="span" variant="caption" color="primary.light" sx={{ ml: 0.8 }}>({duration.display})</Typography>}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {log.max_depth && <Chip label={`수심 ${log.max_depth}m`} size="small" variant="outlined" />}
              {!log.dive_start_time && log.dive_time && <Chip label={`${log.dive_time}분`} size="small" variant="outlined" />}
              {log.water_temp && <Chip label={`수온 ${log.water_temp}°C`} size="small" variant="outlined" />}
              {log.visibility && <Chip label={`시야 ${log.visibility}m`} size="small" variant="outlined" />}
            </Box>
            {log.buddy && <Typography variant="body2" sx={{ mt: 0.5 }}>🤿 버디: {log.buddy}</Typography>}
            {log.catch_description && <Typography variant="body2" sx={{ mt: 0.5 }}>🐟 {log.catch_description}</Typography>}
            {log.catch_image_url && (
              <Box component="img" src={log.catch_image_url} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1, mt: 0.8 }} />
            )}
            {log.notes && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{log.notes}</Typography>}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        {point.source === 'personal' && (
          <Button size="small" startIcon={<EditIcon />} onClick={e => { e.stopPropagation(); onEdit(point) }}>수정</Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={e => { e.stopPropagation(); onDelete(point.id) }}>삭제</Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', pr: 1 }}>눌러서 상세보기</Typography>
      </CardActions>
    </Card>
  )
}

const EMPTY_FORM = {
  name: '', description: '', hazards: '',
  dive_date: '', max_depth: '', dive_start_time: '', dive_end_time: '',
  water_temp: '', visibility: '', catch_description: '', buddy: '', notes: '',
}

function AddPointDialog({ open, onClose, onAdd, userId }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [catchImageFile, setCatchImageFile] = useState(null)
  const [catchImagePreview, setCatchImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const duration = calcDuration(form.dive_start_time, form.dive_end_time)

  const handleClose = () => {
    setForm(EMPTY_FORM)
    setSelectedLocation(null)
    setCatchImageFile(null)
    setCatchImagePreview(null)
    setError('')
    onClose()
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCatchImageFile(file)
    setCatchImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setCatchImageFile(null)
    setCatchImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async () => {
    if (!form.name.trim()) { setError('포인트 이름을 입력해주세요.'); return }
    if (!selectedLocation) { setError('지도에서 위치를 선택해주세요.'); return }
    setLoading(true)

    const { data: point, error: err } = await supabase.from('sh_points').insert({
      user_id: userId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      hazards: form.hazards.trim() || null,
      location_type: 'pin',
      location_data: { lat: selectedLocation.lat, lng: selectedLocation.lng, address: selectedLocation.name },
    }).select().single()

    if (err) { setError('저장에 실패했어요.'); setLoading(false); return }

    let divingLog = null
    if (form.dive_date) {
      let catchImageUrl = null
      if (catchImageFile) {
        const ext = catchImageFile.name.split('.').pop()
        const path = `diving-logs/${userId}/${point.id}_${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('sh-media').upload(path, catchImageFile)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('sh-media').getPublicUrl(path)
          catchImageUrl = urlData.publicUrl
        }
      }

      const dur = calcDuration(form.dive_start_time, form.dive_end_time)
      const { data: log } = await supabase.from('sh_diving_logs').insert({
        user_id: userId,
        point_id: point.id,
        dive_date: form.dive_date,
        max_depth: form.max_depth ? parseFloat(form.max_depth) : null,
        dive_start_time: form.dive_start_time || null,
        dive_end_time: form.dive_end_time || null,
        dive_time: dur?.totalMins || null,
        water_temp: form.water_temp ? parseFloat(form.water_temp) : null,
        visibility: form.visibility ? parseInt(form.visibility) : null,
        catch_description: form.catch_description || null,
        buddy: form.buddy.trim() || null,
        catch_image_url: catchImageUrl,
        notes: form.notes || null,
      }).select().single()
      divingLog = log
    }

    setLoading(false)
    onAdd({ ...point, sh_diving_logs: divingLog ? [divingLog] : [] })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>포인트 추가</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="포인트 이름 *" value={form.name} onChange={set('name')} fullWidth />
        <TextField label="메모 (선택)" value={form.description} onChange={set('description')} fullWidth multiline rows={2} />
        <TextField
          label="위험요소 (선택)"
          value={form.hazards}
          onChange={set('hazards')}
          fullWidth
          multiline
          rows={2}
          placeholder="예: 그물 있음, 조류 강함, 수중 장애물"
          slotProps={{ input: { sx: { color: 'warning.main' } } }}
        />

        <KakaoMapPicker
          value={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
          onChange={setSelectedLocation}
        />
        {selectedLocation && (
          <Typography variant="caption" color="primary.light" sx={{ mt: -1 }}>
            📍 {selectedLocation.name}
          </Typography>
        )}

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary">다이빙 로그 (선택)</Typography>
        </Divider>

        <TextField label="날짜" type="date" value={form.dive_date} onChange={set('dive_date')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>다이빙 시간</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="시작"
              type="time"
              value={form.dive_start_time}
              onChange={set('dive_start_time')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Typography color="text.secondary" sx={{ flexShrink: 0 }}>~</Typography>
            <TextField
              label="종료"
              type="time"
              value={form.dive_end_time}
              onChange={set('dive_end_time')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
          {duration && (
            <Typography variant="caption" color="primary.light" sx={{ mt: 0.5, display: 'block' }}>
              ⏱ {formatKoreanTime(form.dive_start_time)} ~ {formatKoreanTime(form.dive_end_time)} · {duration.display}
            </Typography>
          )}
        </Box>

        <TextField label="최대 수심 (m)" type="number" value={form.max_depth} onChange={set('max_depth')} fullWidth />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="수온 (°C)" type="number" value={form.water_temp} onChange={set('water_temp')} fullWidth />
          <TextField label="시야 (m)" type="number" value={form.visibility} onChange={set('visibility')} fullWidth />
        </Box>
        <TextField label="버디 (함께 다이빙 한 사람)" value={form.buddy} onChange={set('buddy')} fullWidth placeholder="예: 김철수, 이영희" />
        <TextField label="조과 기록" value={form.catch_description} onChange={set('catch_description')} fullWidth multiline rows={2} placeholder="예: 해삼 3마리, 소라 5개" />

        <Box>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageSelect} />
          {catchImagePreview ? (
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src={catchImagePreview} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1 }} />
              <IconButton size="small" onClick={removeImage} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)' }}>
                <CloseIcon sx={{ fontSize: 16, color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <Button variant="outlined" size="small" startIcon={<PhotoCameraIcon />} onClick={() => fileInputRef.current?.click()}>
              조과 사진 추가
            </Button>
          )}
        </Box>

        <TextField label="메모" value={form.notes} onChange={set('notes')} fullWidth multiline rows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>{loading ? '저장 중...' : '저장'}</Button>
      </DialogActions>
    </Dialog>
  )
}

function EditPointDialog({ open, onClose, onSave, point, userId }) {
  const log = point?.sh_diving_logs?.[0]

  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [catchImageFile, setCatchImageFile] = useState(null)
  const [catchImagePreview, setCatchImagePreview] = useState(null)
  const [keepExistingImage, setKeepExistingImage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!point) return
    const l = point.sh_diving_logs?.[0]
    setForm({
      name: point.name ?? '',
      description: point.description ?? '',
      hazards: point.hazards ?? '',
      dive_date: l?.dive_date ?? '',
      max_depth: l?.max_depth?.toString() ?? '',
      dive_start_time: l?.dive_start_time ?? '',
      dive_end_time: l?.dive_end_time ?? '',
      water_temp: l?.water_temp?.toString() ?? '',
      visibility: l?.visibility?.toString() ?? '',
      catch_description: l?.catch_description ?? '',
      buddy: l?.buddy ?? '',
      notes: l?.notes ?? '',
    })
    setSelectedLocation(
      point.location_data?.lat
        ? { lat: point.location_data.lat, lng: point.location_data.lng, name: point.location_data.address ?? '' }
        : null
    )
    setCatchImageFile(null)
    setCatchImagePreview(l?.catch_image_url ?? null)
    setKeepExistingImage(true)
    setError('')
  }, [point])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const duration = calcDuration(form.dive_start_time, form.dive_end_time)

  const handleClose = () => { setError(''); onClose() }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCatchImageFile(file)
    setCatchImagePreview(URL.createObjectURL(file))
    setKeepExistingImage(false)
  }

  const removeImage = () => {
    setCatchImageFile(null)
    setCatchImagePreview(null)
    setKeepExistingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const submit = async () => {
    if (!form.name.trim()) { setError('포인트 이름을 입력해주세요.'); return }
    setLoading(true)

    const { error: pointErr } = await supabase.from('sh_points').update({
      name: form.name.trim(),
      description: form.description.trim() || null,
      hazards: form.hazards.trim() || null,
      location_data: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng, address: selectedLocation.name }
        : point.location_data,
    }).eq('id', point.id)

    if (pointErr) { setError('저장에 실패했어요.'); setLoading(false); return }

    const existingLog = point.sh_diving_logs?.[0]
    let catchImageUrl = keepExistingImage ? (existingLog?.catch_image_url ?? null) : null

    if (catchImageFile) {
      const ext = catchImageFile.name.split('.').pop()
      const path = `diving-logs/${userId}/${point.id}_${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('sh-media').upload(path, catchImageFile)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('sh-media').getPublicUrl(path)
        catchImageUrl = urlData.publicUrl
      }
    }

    const dur = calcDuration(form.dive_start_time, form.dive_end_time)
    const logData = {
      dive_date: form.dive_date || null,
      max_depth: form.max_depth ? parseFloat(form.max_depth) : null,
      dive_start_time: form.dive_start_time || null,
      dive_end_time: form.dive_end_time || null,
      dive_time: dur?.totalMins ?? null,
      water_temp: form.water_temp ? parseFloat(form.water_temp) : null,
      visibility: form.visibility ? parseInt(form.visibility) : null,
      catch_description: form.catch_description || null,
      buddy: form.buddy.trim() || null,
      catch_image_url: catchImageUrl,
      notes: form.notes || null,
    }

    if (existingLog) {
      await supabase.from('sh_diving_logs').update(logData).eq('id', existingLog.id)
    } else if (form.dive_date) {
      await supabase.from('sh_diving_logs').insert({ ...logData, user_id: userId, point_id: point.id })
    }

    const { data: updated } = await supabase.from('sh_points').select('*, sh_diving_logs(*)').eq('id', point.id).single()
    setLoading(false)
    onSave(updated)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>포인트 수정</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="포인트 이름 *" value={form.name} onChange={set('name')} fullWidth />
        <TextField label="메모 (선택)" value={form.description} onChange={set('description')} fullWidth multiline rows={2} />
        <TextField
          label="위험요소 (선택)"
          value={form.hazards}
          onChange={set('hazards')}
          fullWidth
          multiline
          rows={2}
          placeholder="예: 그물 있음, 조류 강함, 수중 장애물"
          slotProps={{ input: { sx: { color: 'warning.main' } } }}
        />

        <KakaoMapPicker
          value={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
          onChange={setSelectedLocation}
        />
        {selectedLocation && (
          <Typography variant="caption" color="primary.light" sx={{ mt: -1 }}>
            📍 {selectedLocation.name}
          </Typography>
        )}

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary">다이빙 로그</Typography>
        </Divider>

        <TextField label="날짜" type="date" value={form.dive_date} onChange={set('dive_date')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>다이빙 시간</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField label="시작" type="time" value={form.dive_start_time} onChange={set('dive_start_time')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <Typography color="text.secondary" sx={{ flexShrink: 0 }}>~</Typography>
            <TextField label="종료" type="time" value={form.dive_end_time} onChange={set('dive_end_time')} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
          {duration && (
            <Typography variant="caption" color="primary.light" sx={{ mt: 0.5, display: 'block' }}>
              ⏱ {formatKoreanTime(form.dive_start_time)} ~ {formatKoreanTime(form.dive_end_time)} · {duration.display}
            </Typography>
          )}
        </Box>

        <TextField label="최대 수심 (m)" type="number" value={form.max_depth} onChange={set('max_depth')} fullWidth />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="수온 (°C)" type="number" value={form.water_temp} onChange={set('water_temp')} fullWidth />
          <TextField label="시야 (m)" type="number" value={form.visibility} onChange={set('visibility')} fullWidth />
        </Box>
        <TextField label="버디 (함께 다이빙 한 사람)" value={form.buddy} onChange={set('buddy')} fullWidth placeholder="예: 김철수, 이영희" />
        <TextField label="조과 기록" value={form.catch_description} onChange={set('catch_description')} fullWidth multiline rows={2} placeholder="예: 해삼 3마리, 소라 5개" />

        <Box>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageSelect} />
          {catchImagePreview ? (
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src={catchImagePreview} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 1 }} />
              <IconButton size="small" onClick={removeImage} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)' }}>
                <CloseIcon sx={{ fontSize: 16, color: 'white' }} />
              </IconButton>
            </Box>
          ) : (
            <Button variant="outlined" size="small" startIcon={<PhotoCameraIcon />} onClick={() => fileInputRef.current?.click()}>
              조과 사진 추가
            </Button>
          )}
        </Box>

        <TextField label="메모" value={form.notes} onChange={set('notes')} fullWidth multiline rows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>{loading ? '저장 중...' : '저장'}</Button>
      </DialogActions>
    </Dialog>
  )
}

function AdminPointsTab() {
  const [allPoints, setAllPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('sh_points')
      .select('*, profiles(display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAllPoints(data ?? []); setLoading(false) })
  }, [])

  const filtered = search.trim()
    ? allPoints.filter(p =>
        p.profiles?.display_name?.includes(search) ||
        p.name?.includes(search)
      )
    : allPoints

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  const userGroups = filtered.reduce((acc, p) => {
    const uid = p.user_id
    if (!acc[uid]) acc[uid] = { profile: p.profiles, points: [] }
    acc[uid].points.push(p)
    return acc
  }, {})

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <TextField
        size="small"
        fullWidth
        placeholder="닉네임 또는 포인트명 검색..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        전체 유저 {Object.keys(userGroups).length}명 · 포인트 {filtered.length}개
      </Typography>

      {Object.entries(userGroups).map(([uid, { profile, points }]) => (
        <Card key={uid} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.8rem' }}>
                {profile?.display_name?.[0] ?? '?'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{profile?.display_name ?? '탈퇴한 유저'}</Typography>
                <Typography variant="caption" color="text.secondary">포인트 {points.length}개</Typography>
              </Box>
            </Box>
            {points.map(p => {
              const isRoute = p.location_type === 'route'
              const coords = isRoute
                ? `경로 ${p.location_data.length}개 지점`
                : p.location_data.address || `${p.location_data.lat?.toFixed(4)}, ${p.location_data.lng?.toFixed(4)}`
              const date = new Date(p.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              return (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.6, pl: 1, borderLeft: '2px solid rgba(0,180,216,0.3)' }}>
                  {isRoute ? <RouteIcon sx={{ fontSize: 16, color: 'primary.light' }} /> : <RoomIcon sx={{ fontSize: 16, color: 'primary.light' }} />}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{coords} · {date}</Typography>
                  </Box>
                  <Chip label={p.source === 'from_post' ? '게시글' : '직접'} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                </Box>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <RoomIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">포인트가 없어요.</Typography>
        </Box>
      )}
    </Box>
  )
}

export default function MyPointsPage() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState(0)
  const [points, setPoints] = useState([])
  const [fromPostPoints, setFromPostPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editPoint, setEditPoint] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const isAdmin = profile?.is_admin

  useEffect(() => {
    if (!user) return
    supabase.from('sh_points').select('*, sh_diving_logs(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        setPoints((data ?? []).filter(p => p.source === 'personal'))
        setFromPostPoints((data ?? []).filter(p => p.source === 'from_post'))
        setLoading(false)
      })
  }, [user])

  const deletePoint = async (pid) => {
    await supabase.from('sh_points').delete().eq('id', pid)
    setPoints(p => p.filter(x => x.id !== pid))
    setFromPostPoints(p => p.filter(x => x.id !== pid))
  }

  const handlePointSaved = (updated) => {
    setPoints(prev => prev.map(p => p.id === updated.id ? updated : p))
    setFromPostPoints(prev => prev.map(p => p.id === updated.id ? updated : p))
  }

  if (!user) return (
    <AppLayout>
      <Box sx={{ p: 3, textAlign: 'center', mt: 6 }}>
        <LockIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary">로그인 후 이용할 수 있어요.</Typography>
      </Box>
    </AppLayout>
  )

  const currentPoints = tab === 0 ? points : fromPostPoints
  const adminTabIndex = 2

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <RoomIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>내 포인트</Typography>
          {!isAdmin && (
            <>
              <LockIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', mr: 0.5 }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mr: 0.5 }}>나만 볼 수 있어요</Typography>
            </>
          )}
          <ThemeToggleButton />
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant={isAdmin ? 'scrollable' : 'fullWidth'} scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="내 포인트" />
          <Tab label="저장한 포인트" />
          {isAdmin && <Tab label="전체 포인트" icon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ color: '#FFB400', '&.Mui-selected': { color: '#FFB400' } }} />}
        </Tabs>
      </AppBar>

      {isAdmin && tab === adminTabIndex ? (
        <AdminPointsTab />
      ) : (
        <Box sx={{ p: 2, pb: 10 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
          ) : currentPoints.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <RoomIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">{tab === 0 ? '추가한 포인트가 없어요.' : '게시글에서 저장한 포인트가 없어요.'}</Typography>
            </Box>
          ) : (
            currentPoints.map(p => <PointCard key={p.id} point={p} onDelete={deletePoint} onEdit={setEditPoint} onClick={() => setSelectedPoint(p)} />)
          )}
          {tab === 0 && (
            <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setAddOpen(true)}>
              <AddIcon />
            </Fab>
          )}
          <AddPointDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={p => setPoints(prev => [p, ...prev])} userId={user.id} />
          <EditPointDialog open={!!editPoint} onClose={() => setEditPoint(null)} onSave={handlePointSaved} point={editPoint} userId={user.id} />
          <PointDetailDialog
            point={selectedPoint}
            open={!!selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onDelete={deletePoint}
          />
        </Box>
      )}
    </AppLayout>
  )
}
