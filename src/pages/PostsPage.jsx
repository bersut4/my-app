import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Fab from '@mui/material/Fab'
import CircularProgress from '@mui/material/CircularProgress'
import Rating from '@mui/material/Rating'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import ArticleIcon from '@mui/icons-material/Article'
import CommentIcon from '@mui/icons-material/Comment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FlagIcon from '@mui/icons-material/Flag'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import AppLayout from '../components/layout/AppLayout'
import PageHeaderTitle from '../components/layout/PageHeaderTitle'
import ChatSection from '../components/chat/ChatSection'
import AdminBadge from '../components/AdminBadge'
import ThemeToggleButton from '../components/ThemeToggleButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useIsDesktop } from '../hooks/useIsDesktop'
import { POSTS_SECTIONS } from '../lib/sideNavSections'

const REPORT_REASONS = [
  { value: 'spam', label: '도배' },
  { value: 'profanity', label: '욕설' },
  { value: 'obscene', label: '외설' },
  { value: 'harassment', label: '괴롭힘' },
  { value: 'impersonation', label: '사칭' },
  { value: 'other', label: '기타' },
]

function PostCard({ post, onClick, user, onReport, onBlock }) {
  const [menuAnchor, setMenuAnchor] = useState(null)
  const preview = post.content.length > 80 ? post.content.slice(0, 80) + '...' : post.content
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  const isAdmin = post.profiles?.is_admin
  const isOwn = user?.id === post.user_id

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <CardActionArea onClick={onClick}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, pr: user && !isOwn ? 4 : 1 }}>{post.title}</Typography>
              {post.rating && <Rating value={post.rating} size="small" readOnly />}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{preview}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">{post.profiles?.display_name || '익명'}</Typography>
              {isAdmin && <AdminBadge />}
              <Typography variant="caption" color="text.secondary">{date}</Typography>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <VisibilityIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{post.view_count}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <CommentIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{post.comment_count ?? 0}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>
        {user && !isOwn && (
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); setMenuAnchor(e.currentTarget) }}
            sx={{ position: 'absolute', top: 6, right: 6 }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onReport(post) }}>
          <FlagIcon sx={{ mr: 1, fontSize: 18 }} />신고
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onBlock(post.user_id, post.profiles?.display_name) }}>
          <BlockIcon sx={{ mr: 1, fontSize: 18 }} />차단
        </MenuItem>
      </Menu>
    </Card>
  )
}

function PostListTab() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [blockedIds, setBlockedIds] = useState([])
  const [reportTarget, setReportTarget] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const [reportDone, setReportDone] = useState(false)

  useEffect(() => {
    supabase
      .from('sh_posts')
      .select('*, profiles(display_name, avatar_url, is_admin)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('sh_chat_blocks').select('blocked_id').eq('blocker_id', user.id)
      .then(({ data }) => setBlockedIds((data ?? []).map(b => b.blocked_id)))
  }, [user])

  const handleBlock = async (targetUserId, displayName) => {
    if (!user || !window.confirm(`${displayName || '이 사용자'}를 차단할까요?`)) return
    await supabase.from('sh_chat_blocks').upsert({ blocker_id: user.id, blocked_id: targetUserId })
    setBlockedIds(ids => [...ids, targetUserId])
  }

  const submitReport = async () => {
    if (!reportReason || !reportTarget || !user) return
    await supabase.from('sh_post_reports').upsert({ reporter_id: user.id, post_id: reportTarget.id, reason: reportReason })
    setReportDone(true)
    setTimeout(() => { setReportDone(false); setReportTarget(null); setReportReason('') }, 1500)
  }

  const visiblePosts = posts.filter(p => !blockedIds.includes(p.user_id))

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {visiblePosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <ArticleIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">아직 게시글이 없어요.</Typography>
          {user && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>첫 번째 게시글을 작성해보세요!</Typography>}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {visiblePosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/posts/${post.id}`)}
              user={user}
              onReport={setReportTarget}
              onBlock={handleBlock}
            />
          ))}
        </Box>
      )}

      {user && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 80, right: 20 }}
          onClick={() => navigate('/posts/write')}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={!!reportTarget} onClose={() => { setReportTarget(null); setReportReason('') }} fullWidth>
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
          <Button onClick={() => { setReportTarget(null); setReportReason('') }}>취소</Button>
          <Button variant="contained" color="error" onClick={submitReport} disabled={!reportReason || reportDone}>신고</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default function PostsPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isDesktop = useIsDesktop()
  const tab = Math.max(0, POSTS_SECTIONS.findIndex(s => s.path === pathname))

  return (
    <AppLayout>
      {/* 데스크탑에서는 SideNav의 게시물 아코디언으로 하위 탭을 고르므로 이 상단바는 필요 없다. */}
      {!isDesktop && (
        <AppBar position="sticky">
          <Toolbar>
            <PageHeaderTitle icon={<ArticleIcon sx={{ color: 'primary.light' }} />} title="게시물" />
            <ThemeToggleButton />
          </Toolbar>
          <Tabs value={tab} onChange={(_, v) => navigate(POSTS_SECTIONS[v].path)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
            {POSTS_SECTIONS.map(({ path, label, icon: Icon }) => (
              <Tab key={path} label={label} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" />
            ))}
          </Tabs>
        </AppBar>
      )}

      {tab === 0 && <PostListTab />}
      {tab === 1 && <ChatSection user={user} profile={profile} />}
    </AppLayout>
  )
}
