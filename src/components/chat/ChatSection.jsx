import { useState, useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import SendIcon from '@mui/icons-material/Send'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import CloseIcon from '@mui/icons-material/Close'
import FlagIcon from '@mui/icons-material/Flag'
import BlockIcon from '@mui/icons-material/Block'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { supabase } from '../../lib/supabase'

const REPORT_REASONS = [
  { value: 'spam',          label: '도배 / 스팸' },
  { value: 'profanity',     label: '욕설 / 비하 발언' },
  { value: 'obscene',       label: '외설적 발언 / 성적 콘텐츠' },
  { value: 'harassment',    label: '괴롭힘 / 위협' },
  { value: 'impersonation', label: '사칭' },
  { value: 'other',         label: '기타' },
]

// ── 신고 다이얼로그 ──────────────────────────────────────────
function ReportDialog({ open, onClose, message, reporterId }) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleClose = () => { setSelected(''); setDone(false); onClose() }

  const submit = async () => {
    if (!selected) return
    setLoading(true)
    await supabase.from('sh_chat_reports').upsert({
      reporter_id: reporterId,
      message_id: message.id,
      reason: selected,
    }, { onConflict: 'reporter_id,message_id' })
    setLoading(false)
    setDone(true)
    setTimeout(handleClose, 1200)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FlagIcon sx={{ color: 'error.main' }} /> 신고하기
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {done ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography>신고가 접수됐어요.</Typography>
          </Box>
        ) : (
          <>
            {message && (
              <Box sx={{ mb: 1.5, p: 1.2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {message.profiles?.display_name ?? '익명'}: {message.content || '[미디어]'}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>신고 사유를 선택해주세요.</Typography>
            <List disablePadding>
              {REPORT_REASONS.map(r => (
                <ListItem key={r.value} disablePadding>
                  <ListItemButton
                    selected={selected === r.value}
                    onClick={() => setSelected(r.value)}
                    sx={{ borderRadius: 1, mb: 0.3 }}
                  >
                    <ListItemText primary={r.label} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      {!done && (
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button variant="contained" color="error" onClick={submit} disabled={!selected || loading}>
            {loading ? '신고 중...' : '신고'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

// ── 관리자 신고 목록 ─────────────────────────────────────────
function AdminReportsPanel() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sh_chat_reports')
      .select(`
        *,
        reporter:profiles!sh_chat_reports_reporter_id_fkey(display_name),
        message:sh_chat_messages(content, media_url, media_type, user_id,
          author:profiles(display_name))
      `)
      .order('created_at', { ascending: false })
      .limit(100)
    setReports(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const markReviewed = async (id) => {
    await supabase.from('sh_chat_reports').update({ reviewed: true }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, reviewed: true } : r))
  }

  const reasonLabel = (v) => REPORT_REASONS.find(r => r.value === v)?.label ?? v

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        총 {reports.length}건 (미검토 {reports.filter(r => !r.reviewed).length}건)
      </Typography>
      {reports.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>신고 내역이 없어요.</Typography>
      )}
      {reports.map(r => (
        <Box key={r.id} sx={{
          mb: 1, p: 1.5, borderRadius: 1,
          bgcolor: r.reviewed ? 'background.default' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${r.reviewed ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Chip
              label={reasonLabel(r.reason)}
              size="small"
              color={r.reviewed ? 'default' : 'error'}
              sx={{ fontSize: '0.68rem', height: 20 }}
            />
            {!r.reviewed && (
              <Button size="small" variant="outlined" color="success" sx={{ fontSize: '0.65rem', py: 0, px: 0.8, minWidth: 0 }}
                onClick={() => markReviewed(r.id)}>
                검토 완료
              </Button>
            )}
            {r.reviewed && <Chip label="검토됨" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />}
          </Box>
          <Typography variant="caption" color="text.secondary">
            신고자: {r.reporter?.display_name ?? '?'} →
            작성자: {r.message?.author?.display_name ?? '?'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.3, color: 'text.secondary', fontStyle: 'italic', fontSize: '0.8rem' }}>
            "{r.message?.content || '[미디어]'}"
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.3 }}>
            {new Date(r.created_at).toLocaleString('ko-KR')}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

// ── 메시지 미디어 표시 ───────────────────────────────────────
function MediaPreview({ url, type }) {
  if (!url) return null
  if (type === 'video') {
    return (
      <Box
        component="video"
        src={url}
        controls
        sx={{ maxWidth: '100%', maxHeight: 240, borderRadius: 1, display: 'block', mt: 0.5 }}
      />
    )
  }
  return (
    <Box
      component="img"
      src={url}
      sx={{ maxWidth: '100%', maxHeight: 240, borderRadius: 1, display: 'block', mt: 0.5, cursor: 'pointer' }}
      onClick={() => window.open(url, '_blank')}
    />
  )
}

// ── 메인 채팅 컴포넌트 ───────────────────────────────────────
export default function ChatSection({ user, profile }) {
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [mediaFile, setMediaFile]   = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [mediaType, setMediaType]   = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [blockedIds, setBlockedIds] = useState([])
  const [menuMsg, setMenuMsg]       = useState(null)   // 신고/차단 메뉴 열린 메시지
  const [reportTarget, setReportTarget] = useState(null)
  const [adminOpen, setAdminOpen]   = useState(false)
  const bottomRef = useRef(null)
  const fileRef   = useRef(null)
  const isAdmin   = profile?.is_admin

  // 초기 데이터 로드
  useEffect(() => {
    if (!user) return

    // 채팅 메시지
    supabase.from('sh_chat_messages')
      .select('*, profiles(display_name, avatar_url)')
      .order('created_at')
      .limit(100)
      .then(({ data }) => setMessages(data ?? []))

    // 차단 목록
    supabase.from('sh_chat_blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id)
      .then(({ data }) => setBlockedIds((data ?? []).map(b => b.blocked_id)))

    // 실시간 구독
    const channel = supabase.channel('sh_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sh_chat_messages' }, async (payload) => {
        const { data } = await supabase
          .from('sh_chat_messages')
          .select('*, profiles(display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(m => [...m, data])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 파일 선택
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video') ? 'video' : 'image'
    setMediaFile(file)
    setMediaType(type)
    setMediaPreview(URL.createObjectURL(file))
    if (fileRef.current) fileRef.current.value = ''
  }

  const clearMedia = () => { setMediaFile(null); setMediaPreview(null); setMediaType(null) }

  // 메시지 전송
  const send = async () => {
    if ((!input.trim() && !mediaFile) || !user) return
    setUploading(true)

    let uploadedUrl = null
    let uploadedType = null

    if (mediaFile) {
      const ext = mediaFile.name.split('.').pop()
      const path = `chat/${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('sh-media').upload(path, mediaFile)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('sh-media').getPublicUrl(path)
        uploadedUrl = urlData.publicUrl
        uploadedType = mediaType
      }
    }

    await supabase.from('sh_chat_messages').insert({
      user_id:    user.id,
      content:    input.trim() || null,
      media_url:  uploadedUrl,
      media_type: uploadedType,
    })

    setInput('')
    clearMedia()
    setUploading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  // 차단
  const blockUser = async (targetId) => {
    setMenuMsg(null)
    if (blockedIds.includes(targetId)) return
    await supabase.from('sh_chat_blocks').insert({ blocker_id: user.id, blocked_id: targetId })
    setBlockedIds(prev => [...prev, targetId])
  }

  // 차단 해제
  const unblockUser = async (targetId) => {
    await supabase.from('sh_chat_blocks').delete()
      .eq('blocker_id', user.id).eq('blocked_id', targetId)
    setBlockedIds(prev => prev.filter(id => id !== targetId))
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
        <Alert severity="info">채팅을 이용하려면 로그인이 필요해요.</Alert>
      </Box>
    )
  }

  const visibleMessages = messages.filter(m => !blockedIds.includes(m.user_id))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)' }}>

      {/* ── 관리자 신고 패널 ── */}
      {isAdmin && (
        <Box sx={{ borderBottom: '1px solid rgba(255,180,0,0.25)' }}>
          <ListItemButton onClick={() => setAdminOpen(o => !o)} sx={{ py: 0.8, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <AdminPanelSettingsIcon sx={{ fontSize: 18, color: '#FFB400' }} />
            </ListItemIcon>
            <ListItemText
              primary="신고 목록 보기"
              primaryTypographyProps={{ variant: 'caption', sx: { color: '#FFB400', fontWeight: 600 } }}
            />
            {adminOpen ? <ExpandLessIcon sx={{ fontSize: 16, color: '#FFB400' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#FFB400' }} />}
          </ListItemButton>
          <Collapse in={adminOpen} timeout="auto">
            <Box sx={{ maxHeight: 320, overflowY: 'auto', bgcolor: 'background.default' }}>
              <AdminReportsPanel />
            </Box>
          </Collapse>
        </Box>
      )}

      {/* ── 차단한 유저 뱃지 (차단 목록이 있을 때만) ── */}
      {blockedIds.length > 0 && (
        <Box sx={{ px: 2, py: 0.8, display: 'flex', gap: 0.5, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="caption" color="text.disabled" sx={{ alignSelf: 'center' }}>차단 중:</Typography>
          {messages
            .filter(m => blockedIds.includes(m.user_id))
            .reduce((acc, m) => acc.find(x => x.user_id === m.user_id) ? acc : [...acc, m], [])
            .map(m => (
              <Chip
                key={m.user_id}
                label={m.profiles?.display_name ?? '알 수 없음'}
                size="small"
                onDelete={() => unblockUser(m.user_id)}
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            ))}
        </Box>
      )}

      {/* ── 메시지 목록 ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {visibleMessages.map((msg) => {
          const isMe = msg.user_id === user.id
          const time = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          const showMenu = menuMsg?.id === msg.id

          return (
            <Box key={msg.id} sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 1, alignItems: 'flex-start' }}>
              {/* 아바타 (상대방) */}
              {!isMe && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.dark', fontSize: '0.7rem', mt: 2 }}>
                  {msg.profiles?.display_name?.[0] ?? '?'}
                </Avatar>
              )}

              <Box sx={{ maxWidth: '72%' }}>
                {!isMe && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {msg.profiles?.display_name ?? '익명'}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 0.5 }}>
                  {/* 말풍선 */}
                  <Box sx={{
                    bgcolor: isMe ? 'primary.dark' : 'background.paper',
                    px: 1.5, py: 1,
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    border: '1px solid rgba(0,180,216,0.2)',
                  }}>
                    {msg.content && <Typography variant="body2">{msg.content}</Typography>}
                    <MediaPreview url={msg.media_url} type={msg.media_type} />
                  </Box>

                  {/* 시각 + 신고/차단 메뉴 (상대방 메시지만) */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 0.2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                      {time}
                    </Typography>
                    {!isMe && (
                      <Box sx={{ position: 'relative' }}>
                        <IconButton
                          size="small"
                          onClick={() => setMenuMsg(showMenu ? null : msg)}
                          sx={{ p: 0.2, opacity: 0.5, '&:hover': { opacity: 1 } }}
                        >
                          <MoreVertIcon sx={{ fontSize: 14 }} />
                        </IconButton>

                        {/* 드롭다운 메뉴 */}
                        {showMenu && (
                          <Box sx={{
                            position: 'absolute',
                            left: 20, top: 0, zIndex: 100,
                            bgcolor: 'background.paper',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 1,
                            boxShadow: 4,
                            minWidth: 120,
                            overflow: 'hidden',
                          }}>
                            <ListItemButton
                              onClick={() => { setReportTarget(msg); setMenuMsg(null) }}
                              sx={{ py: 0.8, px: 1.5 }}
                            >
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <FlagIcon sx={{ fontSize: 16, color: 'error.main' }} />
                              </ListItemIcon>
                              <ListItemText primary="신고" primaryTypographyProps={{ variant: 'caption' }} />
                            </ListItemButton>
                            <Divider />
                            <ListItemButton
                              onClick={() => blockUser(msg.user_id)}
                              sx={{ py: 0.8, px: 1.5 }}
                            >
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <BlockIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={blockedIds.includes(msg.user_id) ? '차단됨' : '차단'}
                                primaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItemButton>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )
        })}
        <div ref={bottomRef} />
      </Box>

      {/* ── 미디어 미리보기 ── */}
      {mediaPreview && (
        <Box sx={{ px: 1.5, pt: 1, position: 'relative', display: 'inline-flex' }}>
          {mediaType === 'video'
            ? <Box component="video" src={mediaPreview} sx={{ height: 80, borderRadius: 1 }} />
            : <Box component="img" src={mediaPreview} sx={{ height: 80, borderRadius: 1, objectFit: 'cover' }} />
          }
          <IconButton size="small" onClick={clearMedia}
            sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(0,0,0,0.6)', p: 0.2 }}>
            <CloseIcon sx={{ fontSize: 14, color: '#fff' }} />
          </IconButton>
        </Box>
      )}

      {/* ── 입력창 ── */}
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(0,180,216,0.2)', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        {/* 파일 첨부 */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <IconButton size="small" onClick={() => fileRef.current?.click()} sx={{ color: 'primary.light', mb: 0.3 }}>
          <PhotoCameraIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <TextField
          size="small"
          fullWidth
          placeholder="메시지를 입력하세요..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={send}
          disabled={(!input.trim() && !mediaFile) || uploading}
          sx={{ mb: 0.3 }}
        >
          {uploading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
      </Box>

      {/* 드롭다운 닫기 오버레이 */}
      {menuMsg && (
        <Box
          sx={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setMenuMsg(null)}
        />
      )}

      {/* ── 신고 다이얼로그 ── */}
      <ReportDialog
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        message={reportTarget}
        reporterId={user?.id}
      />
    </Box>
  )
}
