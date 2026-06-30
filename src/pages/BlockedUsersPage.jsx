import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function BlockedUsersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    supabase
      .from('sh_chat_blocks')
      .select('id, blocked_id, blocked_user:profiles!blocked_id(display_name, avatar_url)')
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBlocked(data ?? []); setLoading(false) })
  }, [user, navigate])

  const unblock = async (blockId) => {
    await supabase.from('sh_chat_blocks').delete().eq('id', blockId)
    setBlocked(b => b.filter(x => x.id !== blockId))
  }

  return (
    <AppLayout>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/mypage')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3" sx={{ flex: 1, ml: 1 }}>차단 목록</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, pb: 10 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : blocked.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <BlockIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">차단한 사용자가 없어요.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {blocked.map((b, i) => (
              <Box key={b.id}>
                <ListItem
                  secondaryAction={
                    <Button size="small" variant="outlined" onClick={() => unblock(b.id)}>
                      차단 해제
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.dark' }}>
                      {b.blocked_user?.display_name?.[0] ?? '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={b.blocked_user?.display_name ?? '알 수 없음'} />
                </ListItem>
                {i < blocked.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Box>
    </AppLayout>
  )
}
