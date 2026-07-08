import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const DEMO_USERNAME = 'board@senus.com'
const DEMO_PASSWORD = 'senus2030'
const AUTH_DELAY_MS = 400

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const state = location.state as { from?: string } | null
  const from = state?.from ?? '/'

  function fail(message: string) {
    setError(message)
    setShake(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return

    if (!username.trim() || !password) {
      fail('Enter your credentials')
      return
    }

    setError(null)
    setLoading(true)
    setTimeout(() => {
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        login()
        navigate(from, { replace: true })
        return
      }
      setLoading(false)
      fail('Invalid credentials')
    }, AUTH_DELAY_MS)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm rounded-panel border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm font-semibold tracking-wide">
          <span className="text-brand">SENUS</span> <span className="font-normal text-zinc-500">PLC</span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">Board Report</p>

        <h1 className="mt-6 text-lg font-semibold text-zinc-100">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">Demo credentials required for this preview build.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div
            className={shake ? 'animate-shake space-y-4' : 'space-y-4'}
            onAnimationEnd={() => setShake(false)}
          >
            <div>
              <label htmlFor="username" className="text-xs text-zinc-500">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-brand focus:ring-brand'
                }`}
                placeholder="you@senus.ie"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs text-zinc-500">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 ${
                  error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-brand focus:ring-brand'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-xs text-zinc-600">
            Demo access: {DEMO_USERNAME} / {DEMO_PASSWORD}
          </p>
        </form>
      </div>
    </div>
  )
}
