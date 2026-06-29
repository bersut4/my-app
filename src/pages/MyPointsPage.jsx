import { useState, useEffect } from 'react'
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
import AddIcon from '@mui/icons-material/Add'
import RoomIcon from '@mui/icons-material/Room'
import RouteIcon from '@mui/icons-material/Route'
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function PointCard({ point, onDelete }) {
  const date = new Date(point.created_at).toLocaleDateString('ko-KR')
  const isRoute = point.location_type === 'route'
  const coords = isRoute
    ? `경로 ${point.location_data.length}개 지점`
    : `위도 ${point.location_data.lat?.toFixed(4)}, 경도 ${point.location_data.lng?.toFixed(4)}`

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isRoute ? <RouteIcon sx={{ color: 'primary.light' }} /> : <RoomIcon sx={{ color: 'primary.light' }} />}
            <Typography variant="body1" sx={{ fontWeight: 600 }}>{point.name}</Typography>
          </Box>
          <Chip label={point.source === 'from_post' ? '게시글 저장' : '직접 추가'} size="small" variant="outlined" color={point.source === 'from_post' ? 'secondary' : 'primary'} />
        </Box>
        {point.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>{point.description}</Typography>}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.3 }}>{coords} · {date}</Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(point.id)}>삭제</Button>
      </CardActions>
    </Card>
  )
}

function AddPointDialog({ open, onClose, onAdd, userId }) {
  const [form, setForm] = useState({ name: '', description: '', location_type: 'pin', lat: '', lng: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.name.trim()) { setError('포인트 이름을 입력해주세요.'); return }
    if (!form.lat || !form.lng) { setError('위도와 경도를 입력해주세요.'); return }
    setLoading(true)
    const locationData = form.location_type === 'pin'
      ? { lat: parseFloat(form.lat), lng: parseFloat(form.lng) }
      : [{ lat: parseFloat(form.lat), lng: parseFloat(form.lng) }]

    const { data, error: err } = await supabase.from('sh_points').insert({
      user_id: userId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      location_type: form.location_type,
      location_data: locationData,
    }).select().single()

    setLoading(false)
    if (err) { setError('저장에 실패했어요.'); return }
    onAdd(data)
    setForm({ name: '', description: '', location_type: 'pin', lat: '', lng: '' })
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>포인트 추가</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="포인트 이름 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} fullWidth />
        <TextField label="메모 (선택)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
        <FormControl fullWidth>
          <InputLabel>기록 방식</InputLabel>
          <Select value={form.location_type} label="기록 방식" onChange={e => setForm(f => ({ ...f, location_type: e.target.value }))}>
            <MenuItem value="pin">핀 (단일 지점)</MenuItem>
            <MenuItem value="route">경로 (시작 지점 입력)</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField label="위도" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} fullWidth placeholder="예: 35.1588" type="number" />
          <TextField label="경도" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} fullWidth placeholder="예: 129.1603" type="number" />
        </Box>
        <Alert severity="info" icon={false} sx={{ fontSize: '0.8rem' }}>지도에서 직접 핀 찍기 기능은 2차 개발에서 추가될 예정이에요.</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>{loading ? '저장 중...' : '저장'}</Button>
      </DialogActions>
    </Dialog>
  )
}

function DivingLogTab({ userId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ dive_date: '', max_depth: '', dive_time: '', water_temp: '', visibility: '', catch_description: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase.from('sh_diving_logs').select('*').eq('user_id', userId).order('dive_date', { ascending: false })
      .then(({ data }) => { setLogs(data ?? []); setLoading(false) })
  }, [userId])

  const save = async () => {
    if (!form.dive_date) return
    setSaving(true)
    const { data } = await supabase.from('sh_diving_logs').insert({
      user_id: userId,
      dive_date: form.dive_date,
      max_depth: form.max_depth ? parseFloat(form.max_depth) : null,
      dive_time: form.dive_time ? parseInt(form.dive_time) : null,
      water_temp: form.water_temp ? parseFloat(form.water_temp) : null,
      visibility: form.visibility ? parseInt(form.visibility) : null,
      catch_description: form.catch_description || null,
      notes: form.notes || null,
    }).select().single()
    setSaving(false)
    if (data) { setLogs(l => [data, ...l]); setDialogOpen(false); setForm({ dive_date: '', max_depth: '', dive_time: '', water_temp: '', visibility: '', catch_description: '', notes: '' }) }
  }

  const deleteLog = async (lid) => {
    await supabase.from('sh_diving_logs').delete().eq('id', lid)
    setLogs(l => l.filter(x => x.id !== lid))
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <ScubaDivingIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">다이빙 로그가 없어요.</Typography>
        </Box>
      ) : logs.map(log => (
        <Card key={log.id} sx={{ mb: 1.5 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{log.dive_date}</Typography>
              <Button size="small" color="error" onClick={() => deleteLog(log.id)} sx={{ minHeight: 28 }}><DeleteIcon sx={{ fontSize: 16 }} /></Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {log.max_depth && <Chip label={`최대 수심 ${log.max_depth}m`} size="small" variant="outlined" />}
              {log.dive_time && <Chip label={`${log.dive_time}분`} size="small" variant="outlined" />}
              {log.water_temp && <Chip label={`수온 ${log.water_temp}°C`} size="small" variant="outlined" />}
              {log.visibility && <Chip label={`시야 ${log.visibility}m`} size="small" variant="outlined" />}
            </Box>
            {log.catch_description && <Typography variant="body2" sx={{ mt: 1 }}>🐟 {log.catch_description}</Typography>}
            {log.notes && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{log.notes}</Typography>}
          </CardContent>
        </Card>
      ))}

      <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setDialogOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>다이빙 로그 추가</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="날짜 *" type="date" value={form.dive_date} onChange={e => setForm(f => ({ ...f, dive_date: e.target.value }))} fullWidth InputLabelProps={{ shrink: true }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="최대 수심 (m)" type="number" value={form.max_depth} onChange={e => setForm(f => ({ ...f, max_depth: e.target.value }))} fullWidth />
            <TextField label="다이빙 시간 (분)" type="number" value={form.dive_time} onChange={e => setForm(f => ({ ...f, dive_time: e.target.value }))} fullWidth />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="수온 (°C)" type="number" value={form.water_temp} onChange={e => setForm(f => ({ ...f, water_temp: e.target.value }))} fullWidth />
            <TextField label="시야 (m)" type="number" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))} fullWidth />
          </Box>
          <TextField label="조과 기록" value={form.catch_description} onChange={e => setForm(f => ({ ...f, catch_description: e.target.value }))} fullWidth multiline rows={2} placeholder="예: 해삼 3마리, 소라 5개" />
          <TextField label="메모" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.dive_date}>{saving ? '저장 중...' : '저장'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function MyPointsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [points, setPoints] = useState([])
  const [fromPostPoints, setFromPostPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('sh_points').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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

  if (!user) return (
    <AppLayout>
      <Box sx={{ p: 3, textAlign: 'center', mt: 6 }}>
        <LockIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
        <Typography color="text.secondary">로그인 후 이용할 수 있어요.</Typography>
      </Box>
    </AppLayout>
  )

  const currentPoints = tab === 0 ? points : fromPostPoints

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <RoomIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>내 포인트</Typography>
          <LockIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">나만 볼 수 있어요</Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="내 포인트" />
          <Tab label="저장한 포인트" />
          <Tab label="다이빙 로그" icon={<ScubaDivingIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {tab < 2 ? (
        <Box sx={{ p: 2, pb: 10 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
          ) : currentPoints.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <RoomIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">{tab === 0 ? '추가한 포인트가 없어요.' : '게시글에서 저장한 포인트가 없어요.'}</Typography>
            </Box>
          ) : (
            currentPoints.map(p => <PointCard key={p.id} point={p} onDelete={deletePoint} />)
          )}
          {tab === 0 && (
            <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setAddOpen(true)}>
              <AddIcon />
            </Fab>
          )}
          <AddPointDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={p => setPoints(prev => [p, ...prev])} userId={user.id} />
        </Box>
      ) : (
        <DivingLogTab userId={user.id} />
      )}
    </AppLayout>
  )
}
