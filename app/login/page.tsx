'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('[DEBUG LOGIN] User ID:', user?.id)
      console.log('[DEBUG LOGIN] User email:', user?.email)
      
      if (user) {
        console.log('[DEBUG LOGIN] Fetching profile for user ID:', user.id)
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .maybeSingle()

        console.log('[DEBUG LOGIN] Profile fetch result:', { profile, profileError })

        let userRole: 'admin' | 'surveyor' | null = null

        if (profile) {
          userRole = profile.role as 'admin' | 'surveyor'
          console.log('[DEBUG LOGIN] Profile found. Role:', userRole)
        } else {
          console.log('[DEBUG LOGIN] No profile found, creating fallback...')
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
          
          console.log('[DEBUG LOGIN] Insert profile result:', { insertError })
          
          if (!insertError) {
            userRole = 'surveyor'
            console.log('[DEBUG LOGIN] Created surveyor profile')
          } else {
            console.error('[DEBUG LOGIN] Failed to insert profile:', insertError)
          }
        }

        console.log('[DEBUG LOGIN] Final role decision:', userRole)
        console.log('[DEBUG LOGIN] Redirecting to:', userRole === 'admin' ? '/dashboard' : '/form')

        if (userRole === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/form')
        }
        router.refresh()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials'
      console.error('[DEBUG LOGIN] Error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-black to-secondary-black p-5">
      <div className="bg-pure-white p-12 md:p-14 rounded-sm shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Survey Admin Portal
          </h1>
          <p className="text-accent-gray text-sm">
            Traffic & Parking Survey Management System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 font-semibold text-sm text-primary-black">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="input-field"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-semibold text-sm text-primary-black">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-accent-gray">
              
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
