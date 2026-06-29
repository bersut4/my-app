import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import SendIcon from '@mui/icons-material/Send'
import { supabase } from '../../lib/supabase'

export default function ChatSection({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase.from('sh_chat_messages').select('*, profiles(display_name, avatar_url)').order('created_at').limit(100)
      .then(({ data }) => setMessages(data ?? []))

    const channel = supabase.channel('sh_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sh_chat_messages' }, async (payload) => {
        const { data } = await supabase.from('sh_chat_messages').select('*, profiles(display_name, avatar_url)').eq('id', payload.new.id).single()
        if (data) setMessages(m => [...m, data])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !user) return
    const text = input.trim()
    setInput('')
    await supabase.from('sh_chat_messages').insert({ user_id: user.id, content: text })
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  if (!user) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
      <Alert severity="info">채팅을 이용하려면 로그인이 필요해요.</Alert>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.map((msg) => {
          const isMe = msg.user_id === user?.id
          const time = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          return (
            <Box key={msg.id} sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 1, alignItems: 'flex-end' }}>
              {!isMe && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.dark', fontSize: '0.7rem' }}>
                  {msg.profiles?.display_name?.[0] ?? '?'}
                </Avatar>
              )}
              <Box sx={{ maxWidth: '70%' }}>
                {!isMe && <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{msg.profiles?.display_name ?? '익명'}</Typography>}
                <Box sx={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 0.5 }}>
                  <Box sx={{ bgcolor: isMe ? 'primary.dark' : 'background.paper', px: 1.5, py: 1, borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px', border: '1px solid rgba(0,180,216,0.2)' }}>
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{time}</Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
        <div ref={bottomRef} />
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(0,180,216,0.2)', display: 'flex', gap: 1 }}>
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
        <IconButton color="primary" onClick={send} disabled={!input.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
