import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Rating from '@mui/material/Rating'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FlagIcon from '@mui/icons-material/Flag'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import AppLayout from '../components/layout/AppLayout'
import AdminBadge from '../components/AdminBadge'
import KakaoMapView from '../components/KakaoMapView'
import ThemeToggleButton from '../components/ThemeToggleButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const REPORT_REASONS = [
  { value: 'spam', label: '도배' },
  { value: 'profanity', label: '욕설' },
  { value: 'obscene', label: '외설' },
  { value: 'harassment', label: '괴롭힘' },
  { value: 'impersonation', label: '사칭' },
  { value: 'other', label: '기타' },
]

function MediaGallery({ postId }) {
  const [media, setMedia] = useState([])
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase.from('sh_post_media').select('*').eq('post_id', postId).order('created_at')
      .then(({ data }) => setMedia(data ?? []))
  }, [postId])

  if (!media.length) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {media.map(m => (
          <Box
            key={m.id}
            onClick={() => setLightbox(m)}
            sx={{ position: 'relative', width: 100, height: 100, cursor: 'pointer', borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {m.media_type === 'video' ? (
              <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlayCircleIcon sx={{ color: 'primary.light', fontSize: 36 }} />
              </Box>
            ) : (
              <Box component="img" src={m.file_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
          </Box>
        ))}
      </Box>

      <Dialog open={!!lightbox} onClose={() => setLightbox(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#000', m: 1 } }}>
        <Box sx={{ position: 'relative' }}>
          <IconButton onClick={() => setLightbox(null)} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.5)' }}>
            <CloseIcon />
          </IconButton>
          {lightbox?.media_type === 'video' ? (
            <Box component="video" src={lightbox.file_url} controls autoPlay sx={{ width: '100%', maxHeight: '80vh', display: 'block' }} />
          ) : (
            <Box component="img" src={lightbox?.file_url} alt="" sx={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
          )}
        </Box>
      </Dialog>
    </Box>
  )
}

function ReactionBar({ targetType, targetId }) {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ like: 0, dislike: 0 })
  const [myReaction, setMyReaction] = useState(null)

  useEffect(() => {
    supabase.from('sh_reactions').select('reaction_type, user_id').eq('target_type', targetType).eq('target_id', targetId)
      .then(({ data }) => {
        setCounts({
          like: data?.filter(r => r.reaction_type === 'like').length ?? 0,
          dislike: data?.filter(r => r.reaction_type === 'dislike').length ?? 0,
        })
        if (user) setMyReaction(data?.find(r => r.user_id === user.id)?.reaction_type ?? null)
      })
  }, [targetType, targetId, user])

  const react = async (type) => {
    if (!user) return
    if (myReaction === type) {
      await supabase.from('sh_reactions').delete().eq('user_id', user.id).eq('target_type', targetType).eq('target_id', targetId)
      setCounts(c => ({ ...c, [type]: c[type] - 1 }))
      setMyReaction(null)
    } else {
      if (myReaction) {
        await supabase.from('sh_reactions').update({ reaction_type: type }).eq('user_id', user.id).eq('target_type', targetType).eq('target_id', targetId)
        setCounts(c => ({ ...c, [myReaction]: c[myReaction] - 1, [type]: c[type] + 1 }))
      } else {
        await supabase.from('sh_reactions').insert({ user_id: user.id, target_type: targetType, target_id: targetId, reaction_type: type })
        setCounts(c => ({ ...c, [type]: c[type] + 1 }))
      }
      setMyReaction(type)
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button size="small" startIcon={<ThumbUpIcon />} onClick={() => react('like')} variant={myReaction === 'like' ? 'contained' : 'outlined'} sx={{ minHeight: 36 }}>
        {counts.like}
      </Button>
      <Button size="small" startIcon={<ThumbDownIcon />} onClick={() => react('dislike')} variant={myReaction === 'dislike' ? 'contained' : 'outlined'} color="error" sx={{ minHeight: 36 }}>
        {counts.dislike}
      </Button>
    </Box>
  )
}

function CommentItem({ comment, postId, onDelete }) {
  const { user, profile } = useAuth()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState([])
  const isAdmin = comment.profiles?.is_admin

  useEffect(() => {
    supabase.from('sh_comments')
      .select('*, profiles(display_name, avatar_url, is_admin)')
      .eq('parent_id', comment.id)
      .order('created_at')
      .then(({ data }) => setReplies(data ?? []))
  }, [comment.id])

  const submitReply = async () => {
    if (!replyText.trim() || !user) return
    const { data } = await supabase.from('sh_comments')
      .insert({ post_id: postId, parent_id: comment.id, user_id: user.id, content: replyText.trim() })
      .select('*, profiles(display_name, avatar_url, is_admin)')
      .single()
    if (data) { setReplies(r => [...r, data]); setReplyText(''); setReplyOpen(false) }
  }

  const canDelete = user && (user.id === comment.user_id || profile?.is_admin)
  const date = new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? 'rgba(255,180,0,0.2)' : 'primary.dark', fontSize: '0.8rem', border: isAdmin ? '1px solid rgba(255,180,0,0.5)' : 'none' }}>
          {comment.profiles?.display_name?.[0] ?? '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{comment.profiles?.display_name ?? '익명'}</Typography>
              {isAdmin && <AdminBadge />}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">{date}</Typography>
              {canDelete && <IconButton size="small" onClick={() => onDelete(comment.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 0.3 }}>{comment.content}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
            <ReactionBar targetType="comment" targetId={comment.id} />
            {user && <Button size="small" sx={{ fontSize: '0.7rem', minHeight: 28 }} onClick={() => setReplyOpen(o => !o)}>답글</Button>}
          </Box>
        </Box>
      </Box>

      {replies.map(r => (
        <Box key={r.id} sx={{ ml: 5, borderLeft: '2px solid rgba(0,180,216,0.2)', pl: 1.5 }}>
          <CommentItem comment={r} postId={postId} onDelete={onDelete} />
        </Box>
      ))}

      {replyOpen && (
        <Box sx={{ ml: 5, display: 'flex', gap: 1, mb: 1 }}>
          <TextField size="small" fullWidth placeholder="답글 입력..." value={replyText} onChange={e => setReplyText(e.target.value)} multiline maxRows={3} />
          <Button size="small" variant="contained" onClick={submitReply} sx={{ minWidth: 52 }}>등록</Button>
        </Box>
      )}
    </Box>
  )
}

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [savedPointId, setSavedPointId] = useState(null)
  const [savingPoint, setSavingPoint] = useState(false)

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [blockedByMe, setBlockedByMe] = useState(false)
  const [blockRecordId, setBlockRecordId] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDone, setReportDone] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('sh_posts').select('*, profiles(display_name, avatar_url, is_admin)').eq('id', id).single(),
      supabase.from('sh_comments').select('*, profiles(display_name, avatar_url, is_admin)').eq('post_id', id).is('parent_id', null).order('created_at'),
    ]).then(([{ data: p }, { data: c }]) => {
      setPost(p)
      setComments(c ?? [])
      setLoading(false)
      if (p) supabase.from('sh_posts').update({ view_count: (p.view_count ?? 0) + 1 }).eq('id', id)
    })
  }, [id])

  useEffect(() => {
    if (!user || !post) return
    supabase.from('sh_chat_blocks')
      .select('id')
      .eq('blocker_id', user.id)
      .eq('blocked_id', post.user_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setBlockedByMe(true); setBlockRecordId(data.id) }
      })
  }, [user, post])

  useEffect(() => {
    if (!user || !post?.location_lat) return
    supabase.from('sh_points')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', post.id)
      .eq('source', 'from_post')
      .maybeSingle()
      .then(({ data }) => { if (data) setSavedPointId(data.id) })
  }, [user, post])

  const savePoint = async () => {
    if (!user || savedPointId) return
    setSavingPoint(true)
    const { data } = await supabase.from('sh_points').insert({
      user_id: user.id,
      name: post.location_name || post.title,
      description: `게시글: ${post.title}`,
      location_type: 'pin',
      location_data: { lat: post.location_lat, lng: post.location_lng, address: post.location_name },
      source: 'from_post',
      post_id: post.id,
    }).select('id').single()
    setSavingPoint(false)
    if (data) setSavedPointId(data.id)
  }

  const submitComment = async () => {
    if (!commentText.trim() || !user) return
    const { data } = await supabase.from('sh_comments')
      .insert({ post_id: id, user_id: user.id, content: commentText.trim() })
      .select('*, profiles(display_name, avatar_url, is_admin)')
      .single()
    if (data) { setComments(c => [...c, data]); setCommentText('') }
  }

  const deleteComment = async (cid) => {
    await supabase.from('sh_comments').delete().eq('id', cid)
    setComments(c => c.filter(x => x.id !== cid))
  }

  const deletePost = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return
    await supabase.from('sh_posts').delete().eq('id', id)
    navigate('/posts')
  }

  const handleBlock = async () => {
    setMenuAnchor(null)
    if (!post || blockedByMe) return
    if (!window.confirm(`${post.profiles?.display_name || '이 사용자'}를 차단할까요?`)) return
    const { data } = await supabase.from('sh_chat_blocks')
      .upsert({ blocker_id: user.id, blocked_id: post.user_id })
      .select('id').single()
    setBlockedByMe(true)
    if (data) setBlockRecordId(data.id)
  }

  const handleUnblock = async () => {
    if (!blockRecordId) return
    await supabase.from('sh_chat_blocks').delete().eq('id', blockRecordId)
    setBlockedByMe(false)
    setBlockRecordId(null)
  }

  const submitReport = async () => {
    if (!reportReason || !post || !user) return
    await supabase.from('sh_post_reports').upsert({ reporter_id: user.id, post_id: post.id, reason: reportReason })
    setReportDone(true)
    setTimeout(() => { setReportDone(false); setReportOpen(false); setReportReason('') }, 1500)
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!post) return <Alert severity="error" sx={{ m: 2 }}>게시글을 찾을 수 없어요.</Alert>

  const isMe = user?.id === post.user_id
  const canEdit = user && isMe
  const canDelete = user && isMe
  const isPostAdmin = post.profiles?.is_admin
  const date = new Date(post.created_at).toLocaleString('ko-KR')

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/posts')}><ArrowBackIcon /></IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>게시글</Typography>
          {canEdit && <IconButton color="inherit" onClick={() => navigate(`/posts/${id}/edit`)}><EditIcon /></IconButton>}
          {canDelete && <IconButton color="error" onClick={deletePost}><DeleteIcon /></IconButton>}
          {user && !isMe && (
            <>
              <IconButton color="inherit" onClick={e => setMenuAnchor(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => { setMenuAnchor(null); setReportOpen(true) }}>
                  <FlagIcon sx={{ mr: 1, fontSize: 18 }} />신고
                </MenuItem>
                <MenuItem onClick={handleBlock} disabled={blockedByMe}>
                  <BlockIcon sx={{ mr: 1, fontSize: 18 }} />{blockedByMe ? '차단됨' : '차단'}
                </MenuItem>
              </Menu>
            </>
          )}
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, pb: 10 }}>
        {blockedByMe && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={<Button color="inherit" size="small" onClick={handleUnblock}>차단 해제</Button>}
          >
            이 게시글 작성자를 차단했어요.
          </Alert>
        )}

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h2" sx={{ mb: 1 }}>{post.title}</Typography>
            {post.rating && <Rating value={post.rating} readOnly sx={{ mb: 1 }} />}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">{post.profiles?.display_name ?? '익명'}</Typography>
              {isPostAdmin && <AdminBadge />}
              <Typography variant="caption" color="text.secondary">{date}</Typography>
              <Typography variant="caption" color="text.secondary">조회 {post.view_count}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{post.content}</Typography>
            <MediaGallery postId={post.id} />
            {post.location_lat && post.location_lng && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: 'primary.light' }} />
                    <Typography variant="body2" color="primary.light" sx={{ fontWeight: 600 }}>
                      {post.location_name || '위치 정보'}
                    </Typography>
                  </Box>
                  {user && (
                    <Button
                      size="small"
                      variant={savedPointId ? 'contained' : 'outlined'}
                      startIcon={savedPointId ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      onClick={savePoint}
                      disabled={savingPoint || !!savedPointId}
                      sx={{ minWidth: 110, whiteSpace: 'nowrap' }}
                    >
                      {savedPointId ? '저장됨' : savingPoint ? '저장 중...' : '포인트 저장'}
                    </Button>
                  )}
                </Box>
                <KakaoMapView lat={post.location_lat} lng={post.location_lng} />
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <ReactionBar targetType="post" targetId={post.id} />
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>댓글 {comments.length}개</Typography>
        {comments.map(c => (
          <Box key={c.id}>
            <CommentItem comment={c} postId={id} onDelete={deleteComment} />
            <Divider />
          </Box>
        ))}

        {user ? (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField size="small" fullWidth placeholder="댓글을 입력해주세요..." value={commentText} onChange={e => setCommentText(e.target.value)} multiline maxRows={4} />
            <Button variant="contained" onClick={submitComment} sx={{ minWidth: 60, whiteSpace: 'nowrap' }}>등록</Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>댓글을 작성하려면 로그인이 필요해요.</Alert>
        )}
      </Box>

      <Dialog open={reportOpen} onClose={() => { setReportOpen(false); setReportReason('') }} fullWidth>
        <DialogTitle>게시글 신고</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {reportDone ? (
            <Alert severity="success" sx={{ mt: 1 }}>신고가 접수됐어요.</Alert>
          ) : (
            <List>
              {REPORT_REASONS.map(r => (
                <ListItem key={r.value} button onClick={() => setReportReason(r.value)} selected={reportReason === r.value}>
                  <ListItemText primary={r.label} />
                  {reportReason === r.value && <CheckIcon color="primary" sx={{ fontSize: 18 }} />}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setReportOpen(false); setReportReason('') }}>취소</Button>
          <Button variant="contained" color="error" onClick={submitReport} disabled={!reportReason || reportDone}>신고</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}
