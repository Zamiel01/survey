'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FormPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

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

  return (
    <div className="min-h-screen bg-pure-white p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Survey Form</h1>
        <p className="text-accent-gray mb-8">
          This is where the public survey form will be displayed for data collection.
        </p>
        <div className="bg-hover-gray p-8 rounded-sm border-2 border-light-gray">
          <p className="text-center text-accent-gray">
            Survey form implementation coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}