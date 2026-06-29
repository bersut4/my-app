import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import StarIcon from '@mui/icons-material/Star'
import ArticleIcon from '@mui/icons-material/Article'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AppLayout from '../components/layout/AppLayout'
import ThemeToggleButton from '../components/ThemeToggleButton'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function MyPostsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('sh_posts')
      .select('id, title, created_at, view_count, rating, location_name, location_lat')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false) })
  }, [user])

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/mypage')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3" sx={{ ml: 1, flex: 1 }}>내가 쓴 글</Typography>
          {!loading && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mr: 0.5 }}>총 {posts.length}개</Typography>
          )}
          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <ArticleIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">작성한 게시글이 없어요.</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ pb: 10 }}>
          {posts.map((post, i) => {
            const date = new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
            return (
              <Box key={post.id}>
                {i > 0 && <Divider />}
                <ListItem
                  onClick={() => navigate(`/posts/${post.id}`)}
                  sx={{ cursor: 'pointer', py: 1.5, px: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }, alignItems: 'flex-start' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.4 }} noWrap>
                      {post.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">{date}</Typography>
                      {post.location_lat && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <LocationOnIcon sx={{ fontSize: 12, color: 'primary.light' }} />
                          <Typography variant="caption" color="primary.light" noWrap sx={{ maxWidth: 100 }}>
                            {post.location_name || '위치 첨부'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1.5, flexShrink: 0, mt: 0.3 }}>
                    {post.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <StarIcon sx={{ fontSize: 13, color: '#FFB400' }} />
                        <Typography variant="caption" color="text.secondary">{post.rating}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <VisibilityIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">{post.view_count ?? 0}</Typography>
                    </Box>
                    <ChevronRightIcon sx={{ fontSize: 18, color: 'action.active' }} />
                  </Box>
                </ListItem>
              </Box>
            )
          })}
        </List>
      )}
    </AppLayout>
  )
}
