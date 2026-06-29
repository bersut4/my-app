import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FontSizeProvider } from './contexts/FontSizeContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WeatherPage from './pages/WeatherPage'
import PostsPage from './pages/PostsPage'
import PostDetailPage from './pages/PostDetailPage'
import PostWritePage from './pages/PostWritePage'
import PostEditPage from './pages/PostEditPage'
import MyPointsPage from './pages/MyPointsPage'
import MyPage from './pages/MyPage'
import MyPostsPage from './pages/MyPostsPage'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
      <CircularProgress />
    </Box>
  )

  return (
    <FontSizeProvider userId={user?.id} initialFontSize={profile?.font_size ?? 'medium'}>
      <BrowserRouter basename="/my-app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/write" element={<PostWritePage />} />
          <Route path="/posts/:id/edit" element={<PostEditPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/mypoints" element={<MyPointsPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/my-posts" element={<MyPostsPage />} />
          <Route path="/" element={<Navigate to="/weather" replace />} />
          <Route path="*" element={<Navigate to="/weather" replace />} />
        </Routes>
      </BrowserRouter>
    </FontSizeProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
