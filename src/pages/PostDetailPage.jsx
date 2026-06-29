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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import DeleteIcon from '@mui/icons-material/Delete'
import RoomIcon from '@mui/icons-material/Room'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function ReactionBar({ targetType, targetId }) {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ like: 0, dislike: 0 })
  const [myReaction, setMyReaction] = useState(null)

  useEffect(() => {
    supabase.from('sh_reactions').select('reaction_type, user_id').eq('target_type', targetType).eq('target_id', targetId)
      .then(({ data }) => {
        const likes = data?.filter(r => r.reaction_type === 'like').length ?? 0
        const dislikes = data?.filter(r => r.reaction_type === 'dislike').length ?? 0
        setCounts({ like: likes, dislike: dislikes })
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

  useEffect(() => {
    supabase.from('sh_comments').select('*, profiles(display_name, avatar_url)').eq('parent_id', comment.id).order('created_at')
      .then(({ data }) => setReplies(data ?? []))
  }, [comment.id])

  const submitReply = async () => {
    if (!replyText.trim() || !user) return
    const { data } = await supabase.from('sh_comments').insert({ post_id: postId, parent_id: comment.id, user_id: user.id, content: replyText.trim() }).select('*, profiles(display_name, avatar_url)').single()
    if (data) { setReplies(r => [...r, data]); setReplyText(''); setReplyOpen(false) }
  }

  const canDelete = user && (user.id === comment.user_id || profile?.is_admin)
  const date = new Date(comment.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.8rem' }}>
          {comment.profiles?.display_name?.[0] ?? '?'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{comment.profiles?.display_name ?? '익명'}</Typography>
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

  useEffect(() => {
    Promise.all([
      supabase.from('sh_posts').select('*, profiles(display_name, avatar_url)').eq('id', id).single(),
      supabase.from('sh_comments').select('*, profiles(display_name, avatar_url)').eq('post_id', id).is('parent_id', null).order('created_at'),
    ]).then(([{ data: p }, { data: c }]) => {
      setPost(p)
      setComments(c ?? [])
      setLoading(false)
      supabase.from('sh_posts').update({ view_count: (p?.view_count ?? 0) + 1 }).eq('id', id)
    })
  }, [id])

  const submitComment = async () => {
    if (!commentText.trim() || !user) return
    const { data } = await supabase.from('sh_comments').insert({ post_id: id, user_id: user.id, content: commentText.trim() }).select('*, profiles(display_name, avatar_url)').single()
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  if (!post) return <Alert severity="error" sx={{ m: 2 }}>게시글을 찾을 수 없어요.</Alert>

  const canDelete = user && (user.id === post.user_id || profile?.is_admin)
  const date = new Date(post.created_at).toLocaleString('ko-KR')

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/posts')}><ArrowBackIcon /></IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>게시글</Typography>
          {canDelete && <IconButton color="error" onClick={deletePost}><DeleteIcon /></IconButton>}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, pb: 10 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h2" sx={{ mb: 1 }}>{post.title}</Typography>
            {post.rating && <Rating value={post.rating} readOnly sx={{ mb: 1 }} />}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">{post.profiles?.display_name ?? '익명'}</Typography>
              <Typography variant="caption" color="text.secondary">{date}</Typography>
              <Typography variant="caption" color="text.secondary">조회 {post.view_count}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{post.content}</Typography>
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
            <Button variant="contained" onClick={submitComment} sx={{ minWidth: 60 }}>등록</Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>댓글을 작성하려면 로그인이 필요해요.</Alert>
        )}
      </Box>
    </AppLayout>
  )
}
