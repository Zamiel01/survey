'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'surveyor'>('surveyor')
  const [surveyorCode, setSurveyorCode] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('No user returned from signup')
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            role,
            surveyor_code: role === 'surveyor' ? surveyorCode : null,
          },
        ])

      if (profileError) throw profileError

      alert('Account created successfully! Please check your email to verify your account.')
      router.push('/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
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
            Create Account
          </h1>
          <p className="text-accent-gray text-sm">
            Register for the Survey System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="fullName" className="block mb-2 font-semibold text-sm text-primary-black">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="input-field"
            />
          </div>

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
              placeholder="Enter your password (min 6 characters)"
              required
              minLength={6}
              className="input-field"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block mb-2 font-semibold text-sm text-primary-black">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'surveyor')}
              className="input-field"
            >
              <option value="surveyor">Surveyor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === 'surveyor' && (
            <div className="mb-6">
              <label htmlFor="surveyorCode" className="block mb-2 font-semibold text-sm text-primary-black">
                Surveyor Code
              </label>
              <select
                id="surveyorCode"
                value={surveyorCode}
                onChange={(e) => setSurveyorCode(e.target.value)}
                required
                className="input-field"
              >
                <option value="">Select Code</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mb-4"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <p className="text-sm text-accent-gray">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary-black underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}