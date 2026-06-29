import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import ChatIcon from '@mui/icons-material/Chat'
import ArticleIcon from '@mui/icons-material/Article'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import CommentIcon from '@mui/icons-material/Comment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AppLayout from '../components/layout/AppLayout'
import ChatSection from '../components/chat/ChatSection'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function PostCard({ post, onClick }) {
  const preview = post.content.length > 80 ? post.content.slice(0, 80) + '...' : post.content
  const date = new Date(post.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>{post.title}</Typography>
            {post.rating && <Rating value={post.rating} size="small" readOnly />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{preview}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary">{post.profiles?.display_name || '익명'}</Typography>
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
    </Card>
  )
}

function PostListTab() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('sh_posts')
      .select('*, profiles(display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false) })
  }, [])

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <ArticleIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">아직 게시글이 없어요.</Typography>
          {user && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>첫 번째 게시글을 작성해보세요!</Typography>}
        </Box>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onClick={() => navigate(`/posts/${post.id}`)} />
        ))
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
    </Box>
  )
}

export default function PostsPage() {
  const [tab, setTab] = useState(0)
  const { user } = useAuth()

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <ArticleIcon sx={{ mr: 1, color: 'primary.light' }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>게시물</Typography>
        </Toolbar>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" TabIndicatorProps={{ style: { backgroundColor: '#00B4D8' } }}>
          <Tab label="게시판" icon={<ArticleIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="실시간 채팅" icon={<ChatIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {tab === 0 && <PostListTab />}
      {tab === 1 && <ChatSection user={user} />}
    </AppLayout>
  )
}
