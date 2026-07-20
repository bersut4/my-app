import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FontSizeProvider } from './contexts/FontSizeContext'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const WeatherPage = lazy(() => import('./pages/WeatherPage'))
const PostsPage = lazy(() => import('./pages/PostsPage'))
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'))
const PostWritePage = lazy(() => import('./pages/PostWritePage'))
const PostEditPage = lazy(() => import('./pages/PostEditPage'))
const MyPointsPage = lazy(() => import('./pages/MyPointsPage'))
const MyPage = lazy(() => import('./pages/MyPage'))
const MyPostsPage = lazy(() => import('./pages/MyPostsPage'))
const BlockedUsersPage = lazy(() => import('./pages/BlockedUsersPage'))

function PageLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
      <CircularProgress />
    </Box>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageLoading />

  return (
    <FontSizeProvider userId={user?.id} initialFontSize={profile?.font_size ?? 'medium'}>
      <BrowserRouter basename="/my-app">
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/weather/map" element={<WeatherPage />} />
            <Route path="/weather/cctv" element={<WeatherPage />} />
            <Route path="/weather/ocean" element={<WeatherPage />} />
            <Route path="/weather/tide" element={<WeatherPage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/posts/chat" element={<PostsPage />} />
            <Route path="/posts/write" element={<ProtectedRoute><PostWritePage /></ProtectedRoute>} />
            <Route path="/posts/:id/edit" element={<ProtectedRoute><PostEditPage /></ProtectedRoute>} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/mypoints" element={<ProtectedRoute><MyPointsPage /></ProtectedRoute>} />
            <Route path="/mypoints/saved" element={<ProtectedRoute><MyPointsPage /></ProtectedRoute>} />
            <Route path="/mypoints/admin" element={<ProtectedRoute><MyPointsPage /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
            <Route path="/blocked-users" element={<ProtectedRoute><BlockedUsersPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/weather" replace />} />
            <Route path="*" element={<Navigate to="/weather" replace />} />
          </Routes>
        </Suspense>
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
