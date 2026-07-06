import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const state = location.state as { from?: string } | null
  const from = state?.from ?? '/'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login()
    navigate(from, { replace: true })
  }

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm rounded-panel border border-zinc-800 bg-zinc-900/40 p-8">
        <p className="text-sm font-semibold tracking-wide">
          <span className="text-brand">SENUS</span> <span className="font-normal text-zinc-500">PLC</span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">Board Report</p>

        <h1 className="mt-6 text-lg font-semibold text-zinc-100">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">Any credentials are accepted in this preview build.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
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
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
