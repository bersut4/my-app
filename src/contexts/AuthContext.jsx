import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    return data
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, nickname, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname, phone } },
    })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithProvider = (provider, scopes) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/my-app/weather`,
        ...(scopes ? { scopes } : {}),
      },
    })
  }

  const signInWithGoogle = () => signInWithProvider('google')
  // 카카오 개인 개발자 앱은 이메일(account_email) 권한이 기본적으로 막혀있어(비즈니스 앱
  // 전환이 필요) 닉네임/프로필 사진만 요청한다. 이메일 없이도 가입되도록 트리거에서 처리해둠.
  const signInWithKakao = () => signInWithProvider('kakao', 'profile_nickname profile_image')

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = () => user && fetchProfile(user.id)

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithGoogle, signInWithKakao, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
