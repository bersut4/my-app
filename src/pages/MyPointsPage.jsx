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
import AddIcon from '@mui/icons-material/Add'
import RoomIcon from '@mui/icons-material/Room'
import RouteIcon from '@mui/icons-material/Route'
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '@mui/material/Avatar'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AppLayout from '../components/layout/AppLayout'
import KakaoMapView from '../components/KakaoMapView'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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

function PointCard({ point, onDelete, onClick }) {
  const date = new Date(point.created_at).toLocaleDateString('ko-KR')
  const isRoute = point.location_type === 'route'
  const coords = isRoute
    ? `경로 ${point.location_data.length}개 지점`
    : `위도 ${point.location_data.lat?.toFixed(4)}, 경도 ${point.location_data.lng?.toFixed(4)}`

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
        <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.3 }}>{coords} · {date}</Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={e => { e.stopPropagation(); onDelete(point.id) }}>삭제</Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', pr: 1 }}>눌러서 상세보기</Typography>
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
                : `${p.location_data.lat?.toFixed(4)}, ${p.location_data.lng?.toFixed(4)}`
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
  const [selectedPoint, setSelectedPoint] = useState(null)
  const isAdmin = profile?.is_admin

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
          {!isAdmin && (
            <>
              <LockIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">나만 볼 수 있어요</Typography>
            </>
          )}
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant={isAdmin ? 'scrollable' : 'fullWidth'} scrollButtons="auto" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="내 포인트" />
          <Tab label="저장한 포인트" />
          <Tab label="다이빙 로그" icon={<ScubaDivingIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          {isAdmin && <Tab label="전체 포인트" icon={<AdminPanelSettingsIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ color: '#FFB400', '&.Mui-selected': { color: '#FFB400' } }} />}
        </Tabs>
      </AppBar>

      {isAdmin && tab === 3 ? (
        <AdminPointsTab />
      ) : tab < 2 ? (
        <Box sx={{ p: 2, pb: 10 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
          ) : currentPoints.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <RoomIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">{tab === 0 ? '추가한 포인트가 없어요.' : '게시글에서 저장한 포인트가 없어요.'}</Typography>
            </Box>
          ) : (
            currentPoints.map(p => <PointCard key={p.id} point={p} onDelete={deletePoint} onClick={() => setSelectedPoint(p)} />)
          )}
          {tab === 0 && (
            <Fab color="primary" sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setAddOpen(true)}>
              <AddIcon />
            </Fab>
          )}
          <AddPointDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={p => setPoints(prev => [p, ...prev])} userId={user.id} />
          <PointDetailDialog
            point={selectedPoint}
            open={!!selectedPoint}
            onClose={() => setSelectedPoint(null)}
            onDelete={deletePoint}
          />
        </Box>
      ) : (
        <DivingLogTab userId={user.id} />
      )}
    </AppLayout>
  )
}
