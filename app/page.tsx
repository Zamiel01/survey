'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[DEBUG HOME] Starting auth check...')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('[DEBUG HOME] User:', user ? { id: user.id, email: user.email } : 'null')

      if (user) {
        console.log('[DEBUG HOME] Fetching profile for user ID:', user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .maybeSingle()
        
        console.log('[DEBUG HOME] Profile fetch result:', { profile, profileError })

        let userRole: 'admin' | 'surveyor' | null = null

        if (profile) {
          userRole = profile.role as 'admin' | 'surveyor'
          console.log('[DEBUG HOME] Profile found. Role:', userRole)
        } else {
          console.log('[DEBUG HOME] No profile found, creating fallback...')
          const { data: userMetadata } = await supabase.auth.getUser()
          const fullName = userMetadata.user?.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: fullName,
              role: 'surveyor',
              surveyor_code: null,
            }])
          
          console.log('[DEBUG HOME] Insert profile result:', { insertError })
          
          if (!insertError) {
            userRole = 'surveyor'
            console.log('[DEBUG HOME] Created surveyor profile')
          } else {
            console.error('[DEBUG HOME] Failed to insert profile:', insertError)
          }
        }

        console.log('[DEBUG HOME] Final role:', userRole)
        console.log('[DEBUG HOME] Redirecting to:', userRole === 'admin' ? '/dashboard' : userRole === 'surveyor' ? '/form' : '/login')

        if (userRole === 'admin') {
          router.push('/dashboard')
        } else if (userRole === 'surveyor') {
          router.push('/form')
        } else {
          router.push('/login')
        }
      } else {
        console.log('[DEBUG HOME] No user found, redirecting to /login')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-pure-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black mx-auto mb-4"></div>
        <p className="text-accent-gray">Loading...</p>
      </div>
    </div>
  )
}
