'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Dashboard from '../../components/Dashboard'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[DEBUG DASHBOARD] Starting auth check...')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('[DEBUG DASHBOARD] User:', user ? { id: user.id, email: user.email } : 'null')

      if (!user) {
        console.log('[DEBUG DASHBOARD] No user, redirecting to /login')
        router.push('/login')
        return
      }

      console.log('[DEBUG DASHBOARD] Fetching profile for user ID:', user.id)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', user.id)
        .maybeSingle()
      
      console.log('[DEBUG DASHBOARD] Profile fetch result:', { profile, profileError })

      if (profile?.role !== 'admin') {
        console.log('[DEBUG DASHBOARD] Role is not admin:', profile?.role, '- redirecting to /form')
        router.push('/form')
        return
      }

      console.log('[DEBUG DASHBOARD] Admin confirmed, loading dashboard')
      setUserName(profile.full_name || user.email || 'Admin')
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black mx-auto mb-4"></div>
          <p className="text-accent-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return <Dashboard userName={userName} onLogout={handleLogout} />
}
